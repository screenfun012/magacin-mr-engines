import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { selectQuery, executeQuery } from '../db/client';
import { logAction } from './authService';

/**
 * Map Excel row to item object (for ExcelJS rows)
 * Mapping:
 * - katbr → sku
 * - naziv → name
 * - stanje → qty_on_hand
 * - altjm → uom
 * - prodajnacena → prodajna_cena
 * - nabavnacena → nabavna_cena
 * - proizvodjac → proizvodjac
 */
function mapExcelRowToItem(row) {
  const item = {};

  // Map columns (case-insensitive)
  const rowData = {};
  row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = cell.worksheet.getRow(1).getCell(colNumber).value;
    if (header) {
      const key = String(header).toLowerCase().trim();
      rowData[key] = cell.value;
    }
  });

  return mapExcelRowToItemFromData(rowData);
}

/**
 * Map Excel row data object to item object
 */
function mapExcelRowToItemFromData(rowData) {
  const item = {};

  // Map to item fields (case-insensitive)
  const normalizedData = {};
  Object.keys(rowData).forEach((key) => {
    normalizedData[key.toLowerCase().trim()] = rowData[key];
  });

  if (normalizedData.katbr) item.sku = String(normalizedData.katbr).trim();
  if (normalizedData.naziv) item.name = String(normalizedData.naziv).trim();
  if (normalizedData.altjm) item.uom = String(normalizedData.altjm).trim();
  if (normalizedData.stanje !== undefined && normalizedData.stanje !== null && normalizedData.stanje !== '') {
    item.qty_on_hand = parseFloat(normalizedData.stanje) || 0;
  }
  if (normalizedData.prodajnacena !== undefined && normalizedData.prodajnacena !== null && normalizedData.prodajnacena !== '') {
    item.prodajna_cena = parseFloat(normalizedData.prodajnacena) || 0;
  }
  if (normalizedData.nabavnacena !== undefined && normalizedData.nabavnacena !== null && normalizedData.nabavnacena !== '') {
    item.nabavna_cena = parseFloat(normalizedData.nabavnacena) || 0;
  }
  if (normalizedData.proizvodjac) item.proizvodjac = String(normalizedData.proizvodjac).trim();

  // Optional fields (only if provided)
  if (normalizedData.min_qty !== undefined && normalizedData.min_qty !== null && normalizedData.min_qty !== '') {
    item.min_qty = parseFloat(normalizedData.min_qty) || 0;
  }

  return item;
}

/**
 * Import items from Excel file (supports both .xlsx and .xls)
 */
export async function importItemsFromExcel(file, userId) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    const isXls = fileName.endsWith('.xls') && !fileName.endsWith('.xlsx');
    
    let rows = [];
    
    if (isXls) {
      // Use xlsx library for .xls files
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON array
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      
      // Convert to row-like format
      rows = data.map((row, index) => ({
        index: index + 2, // Row number (starting from 2, header is 1)
        data: row,
        hasValues: Object.keys(row).length > 0,
      }));
    } else {
      // Use ExcelJS for .xlsx files
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet || worksheet.rowCount < 2) {
        return { success: false, error: 'Excel fajl je prazan ili nema podataka' };
      }

      // Convert ExcelJS rows to our format
      rows = [];
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        if (!row.hasValues) continue;
        
        const rowData = {};
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const header = worksheet.getRow(1).getCell(colNumber).value;
          if (header) {
            rowData[String(header).toLowerCase().trim()] = cell.value;
          }
        });
        
        rows.push({
          index: i,
          data: rowData,
          hasValues: true,
          rawRow: row, // Keep reference for mapExcelRowToItem
        });
      }
    }

    // Parse rows
    const items = [];
    const errors = [];
    
    for (const rowInfo of rows) {
      if (!rowInfo.hasValues) continue;
      
      try {
        let item;
        
        if (isXls) {
          // Map directly from JSON data
          const rowData = {};
          Object.keys(rowInfo.data).forEach((key) => {
            rowData[key.toLowerCase().trim()] = rowInfo.data[key];
          });
          
          item = mapExcelRowToItemFromData(rowData);
        } else {
          // Use existing mapping function
          item = mapExcelRowToItem(rowInfo.rawRow);
        }
        
        // Validate required fields
        if (!item.sku || !item.name || !item.uom) {
          errors.push({
            row: rowInfo.index,
            error: `Red ${rowInfo.index}: Nedostaju obavezna polja (katbr, naziv, altjm)`,
          });
          continue;
        }

        items.push(item);
      } catch (error) {
        errors.push({
          row: rowInfo.index,
          error: `Red ${rowInfo.index}: ${error.message}`,
        });
      }
    }

    if (items.length === 0) {
      return {
        success: false,
        error: errors.length > 0 ? errors[0].error : 'Nema validnih podataka za uvoz',
      };
    }

    // Import items
    const imported = [];
    const updated = [];
    const failed = [];

    for (const item of items) {
      try {
        // Check if item exists (by SKU)
        const existing = await selectQuery('SELECT id FROM items WHERE sku = ?', [item.sku]);

        if (existing.length > 0) {
          // Update existing item
          const itemId = existing[0].id;
          
          const updateFields = [];
          const updateValues = [];

          if (item.name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(item.name);
          }
          if (item.uom !== undefined) {
            updateFields.push('uom = ?');
            updateValues.push(item.uom);
          }
          if (item.prodajna_cena !== undefined) {
            updateFields.push('prodajna_cena = ?');
            updateValues.push(item.prodajna_cena);
          }
          if (item.nabavna_cena !== undefined) {
            updateFields.push('nabavna_cena = ?');
            updateValues.push(item.nabavna_cena);
          }
          if (item.proizvodjac !== undefined) {
            updateFields.push('proizvodjac = ?');
            updateValues.push(item.proizvodjac);
          }
          if (item.min_qty !== undefined) {
            updateFields.push('min_qty = ?');
            updateValues.push(item.min_qty);
          }

          if (updateFields.length > 0) {
            updateValues.push(itemId);
            await executeQuery(
              `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`,
              updateValues
            );
          }

          // Update stock balance
          if (item.qty_on_hand !== undefined) {
            // Get current stock balance
            const currentStock = await selectQuery('SELECT qty_on_hand FROM stock_balances WHERE item_id = ?', [itemId]);
            const currentQty = currentStock.length > 0 ? currentStock[0].qty_on_hand : 0;
            const deltaQty = item.qty_on_hand - currentQty;

            await executeQuery(
              'INSERT OR REPLACE INTO stock_balances (item_id, qty_on_hand) VALUES (?, ?)',
              [itemId, item.qty_on_hand]
            );

            // Log to stock ledger only if there's a change
            if (deltaQty !== 0) {
              await executeQuery(
                'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
                [
                  itemId,
                  deltaQty,
                  deltaQty > 0 ? 'ADD_STOCK' : 'ADJUSTMENT',
                  userId,
                  JSON.stringify({ note: 'Import iz Excel-a', source: 'excel_import', previous_qty: currentQty }),
                ]
              );
            }
          }

          updated.push(item.sku);
        } else {
          // Create new item
          await executeQuery(
            'INSERT INTO items (name, sku, uom, prodajna_cena, nabavna_cena, proizvodjac, min_qty) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              item.name,
              item.sku,
              item.uom,
              item.prodajna_cena || 0,
              item.nabavna_cena || 0,
              item.proizvodjac || null,
              item.min_qty || 0,
            ]
          );

          const newItem = await selectQuery('SELECT id FROM items WHERE sku = ?', [item.sku]);
          const itemId = newItem[0].id;

          // Initialize stock balance
          await executeQuery(
            'INSERT INTO stock_balances (item_id, qty_on_hand) VALUES (?, ?)',
            [itemId, item.qty_on_hand || 0]
          );

          // Log to stock ledger
          if (item.qty_on_hand && item.qty_on_hand > 0) {
            await executeQuery(
              'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
              [
                itemId,
                item.qty_on_hand,
                'ADD_STOCK',
                userId,
                JSON.stringify({ note: 'Import iz Excel-a', source: 'excel_import' }),
              ]
            );
          }

          // Log activity
          await logAction('inventory', 'create_item', 'item', itemId, { name: item.name, sku: item.sku }, userId);

          imported.push(item.sku);
        }
      } catch (error) {
        failed.push({ sku: item.sku || 'N/A', error: error.message });
      }
    }

    // Log import action
    await logAction(
      'import',
      'import_excel',
      'items',
      null,
      {
        imported: imported.length,
        updated: updated.length,
        failed: failed.length,
        errors: errors.length,
      },
      userId
    );

    return {
      success: true,
      imported: imported.length,
      updated: updated.length,
      failed: failed.length,
      errors: errors.length,
      details: {
        imported,
        updated,
        failed,
        errors,
      },
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error.message || 'Greška pri uvozu podataka',
    };
  }
}

/**
 * Preview Excel file before import (supports both .xlsx and .xls)
 */
export async function previewExcelFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    const isXls = fileName.endsWith('.xls') && !fileName.endsWith('.xlsx');
    
    let headers = [];
    let preview = [];
    let totalRows = 0;

    if (isXls) {
      // Use xlsx library for .xls files
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON array
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      
      if (data.length === 0) {
        return { success: false, error: 'Excel fajl je prazan' };
      }

      // Get headers from first row
      headers = Object.keys(data[0] || {}).map((key, index) => ({
        col: index + 1,
        header: key,
      }));

      // Get first 10 rows as preview
      preview = data.slice(0, 10);
      totalRows = data.length;
    } else {
      // Use ExcelJS for .xlsx files
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet || worksheet.rowCount < 2) {
        return { success: false, error: 'Excel fajl je prazan' };
      }

      // Get headers
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        headers.push({
          col: colNumber,
          header: cell.value,
        });
      });

      // Get first 10 rows as preview
      for (let i = 2; i <= Math.min(11, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        if (!row.hasValues) continue;

        const rowData = {};
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const header = headers.find((h) => h.col === colNumber);
          if (header) {
            rowData[header.header] = cell.value;
          }
        });

        preview.push(rowData);
      }

      totalRows = worksheet.rowCount - 1;
    }

    return {
      success: true,
      headers,
      preview,
      totalRows,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Greška pri čitanju Excel fajla',
    };
  }
}

