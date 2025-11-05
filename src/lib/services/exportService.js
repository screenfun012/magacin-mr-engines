import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import ExcelJS from 'exceljs';

const APP_VERSION = '1.0.0';
const COMPANY_NAME = 'MR Engines d.o.o.';

/**
 * Helper: Load and return image as base64
 */
async function loadImageAsBase64(imagePath) {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Could not load image:', imagePath, error);
    return null;
  }
}

/**
 * Helper: Format date for display
 */
function formatDate(date) {
  if (!date) return new Date().toLocaleDateString('sr-RS');
  return new Date(date).toLocaleDateString('sr-RS');
}

/**
 * Helper: Format datetime for footer
 */
function formatDateTime() {
  return new Date().toLocaleString('sr-RS', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/**
 * Helper: Get month name in Serbian
 */
function getMonthName(monthYear) {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-');
  const months = [
    'Januar',
    'Februar',
    'Mart',
    'April',
    'Maj',
    'Jun',
    'Jul',
    'Avgust',
    'Septembar',
    'Oktobar',
    'Novembar',
    'Decembar',
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${months[monthIndex]} ${year}`;
}

/**
 * Helper: Save file using Tauri dialog or browser download
 */
async function saveFile(blob, filename, extension) {
  try {
    // Try Tauri first (when running as desktop app)
    try {
      const { save: saveDialog } = await import('@tauri-apps/plugin-dialog');
      const { writeBinaryFile } = await import('@tauri-apps/plugin-fs');

      const filePath = await saveDialog({
        defaultPath: filename,
        filters: [
          {
            name: extension.toUpperCase(),
            extensions: [extension === 'xlsx' ? 'xlsx' : extension],
          },
        ],
      });

      if (!filePath) return { success: false, error: 'Niste izabrali lokaciju za čuvanje' };

      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();
      await writeBinaryFile(filePath, arrayBuffer);

      return { success: true, filePath };
    } catch (tauriError) {
      // Fallback to browser download if Tauri fails
      console.log('Tauri not available, using browser download');

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filePath: 'Downloaded via browser' };
    }
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ============================================
 * DASHBOARD EXPORT - Mesečna zaduženja
 * ============================================
 */

/**
 * Export Dashboard to PDF
 */
export async function exportDashboardPDF(issues, month, user) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load and add header image (top of page, full width, like Memorandum blanko)
    const headerImage = await loadImageAsBase64('/logos/mr-engines-header.png');
    if (headerImage) {
      // Header should be at top, scale to fit width
      const imgWidth = 190; // Full page width minus margins
      const imgHeight = (imgWidth / 2516) * 200; // Maintain aspect ratio
      doc.addImage(headerImage, 'PNG', 10, 5, imgWidth, imgHeight);
    }

    // Load footer image (will be added at bottom)
    const footerImage = await loadImageAsBase64('/logos/mr-engines-footer.png');

    // Table data
    const tableData = issues.map((issue) => [
      `${issue.first_name} ${issue.last_name}`,
      issue.department_name,
      issue.item_name,
      issue.sku,
      `${issue.qty} ${issue.uom}`,
      formatDate(issue.issued_at),
    ]);

    // Add table with proper spacing for header/footer (after header image)
    const tableStartY = headerImage ? 35 : 30; // Start immediately after header
    autoTable(doc, {
      startY: tableStartY,
      head: [['Radnik', 'Odeljenje', 'Artikal', 'SKU', 'Količina', 'Datum']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: tableStartY, bottom: 30 }, // Bottom margin for footer
    });

    // Add footer image at bottom of page (centered, smaller size)
    if (footerImage) {
      const imgWidth = 150; // Smaller width
      const imgHeight = (imgWidth / 1824) * 508; // Maintain aspect ratio
      const xPos = (pageWidth - imgWidth) / 2; // Center horizontally
      const yPos = pageHeight - imgHeight - 10; // Bottom of page with margin
      doc.addImage(footerImage, 'PNG', xPos, yPos, imgWidth, imgHeight);
    }

    // Footer text (if no footer image, add text instead)
    if (!footerImage) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Kreirao:', 20, pageHeight - 30);
      doc.text(user?.username || 'Nepoznato', 55, pageHeight - 30);
      doc.text('Magacin App v' + APP_VERSION, pageWidth / 2, pageHeight - 30, { align: 'center' });
      doc.text(formatDateTime(), pageWidth - 60, pageHeight - 30, { align: 'right' });
    }

    // Generate filename
    const filename = `Izveztaj_Zadruzenja_${month || 'Pregled'}.pdf`;
    const blob = doc.output('blob');

    return await saveFile(blob, filename, 'pdf');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Export Dashboard to Word
 */
export async function exportDashboardWord(issues, month, user) {
  try {
    // Start with minimal spacing (like PDF - no header images in Word)
    const children = [
      new Paragraph({
        text: '', // Empty space
        spacing: { after: 100 },
      }),
    ];

    // Create table
    const tableRows = issues.map(
      (issue) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(`${issue.first_name} ${issue.last_name}`)] }),
            new TableCell({ children: [new Paragraph(issue.department_name)] }),
            new TableCell({ children: [new Paragraph(issue.item_name)] }),
            new TableCell({ children: [new Paragraph(issue.sku)] }),
            new TableCell({ children: [new Paragraph(`${issue.qty} ${issue.uom}`)] }),
            new TableCell({ children: [new Paragraph(formatDate(issue.issued_at))] }),
          ],
        })
    );

    // Header row
    const headerRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Radnik', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Odeljenje', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Artikal', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'SKU', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Količina', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Datum', bold: true }))] }),
      ],
    });

    // Just add the table, no footer text
    children.push(
      new Table({
        rows: [headerRow, ...tableRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      // Empty space at bottom (like PDF footer area)
      new Paragraph({
        text: '',
        spacing: { after: 600 },
      })
    );

    const doc = new Document({
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = `Izveztaj_Zadruzenja_${month || 'Pregled'}.docx`;

    return await saveFile(blob, filename, 'docx');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Export Dashboard to Excel with graphs
 */
export async function exportDashboardExcel(issues, month, user) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Zaduženja');

    // Headers
    worksheet.columns = [
      { header: 'Radnik', key: 'worker', width: 20 },
      { header: 'Odeljenje', key: 'dept', width: 15 },
      { header: 'Artikal', key: 'item', width: 25 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Količina', key: 'qty', width: 12 },
      { header: 'Datum', key: 'date', width: 15 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' },
    };

    // Add data
    issues.forEach((issue) => {
      worksheet.addRow({
        worker: `${issue.first_name} ${issue.last_name}`,
        dept: issue.department_name,
        item: issue.item_name,
        sku: issue.sku,
        qty: `${issue.qty} ${issue.uom}`,
        date: formatDate(issue.issued_at),
      });
    });

    // Add title
    worksheet.insertRow(1, {
      worker: `Izveštaj o zaduženjima - ${getMonthName(month)}`,
      dept: '',
      item: '',
      sku: '',
      qty: '',
      date: '',
    });
    worksheet.mergeCells('A1:F1');
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Statistics sheet with chart
    const statsSheet = workbook.addWorksheet('Statistika');

    // Group by department
    const deptStats = {};
    issues.forEach((issue) => {
      const dept = issue.department_name;
      deptStats[dept] = (deptStats[dept] || 0) + issue.qty;
    });

    // Prepare chart data
    const chartData = Object.entries(deptStats).map(([name, value]) => ({
      name,
      value,
    }));

    statsSheet.addTable({
      name: 'DepartmentStats',
      ref: 'A1',
      headerRow: true,
      columns: [
        { name: 'Odeljenje', filterButton: true },
        { name: 'Ukupno zaduženo', filterButton: true },
      ],
      rows: chartData.map((item) => [item.name, item.value]),
    });

    // Save file
    const blob = await workbook.xlsx.writeBuffer();
    const filename = `Izveztaj_Zadruzenja_${month || 'Pregled'}.xlsx`;

    return await saveFile(blob, filename, 'xlsx');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * ============================================
 * INVENTORY EXPORT - Stanje magacina
 * ============================================
 */

/**
 * Export Inventory to PDF
 */
export async function exportInventoryPDF(items, filters, user) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load and add header image (top of page, full width, like Memorandum blanko)
    const headerImage = await loadImageAsBase64('/logos/mr-engines-header.png');
    if (headerImage) {
      // Header should be at top, scale to fit width
      const imgWidth = 190; // Full page width minus margins
      const imgHeight = (imgWidth / 2516) * 200; // Maintain aspect ratio
      doc.addImage(headerImage, 'PNG', 10, 5, imgWidth, imgHeight);
    }

    // Load footer image (will be added at bottom)
    const footerImage = await loadImageAsBase64('/logos/mr-engines-footer.png');

    // Table data
    const tableData = items.map((item) => [
      item.name,
      item.sku,
      item.uom,
      item.qty_on_hand || 0,
      item.min_qty || 0,
      (item.qty_on_hand || 0) <= (item.min_qty || 0) ? 'Kritično' : 'OK',
    ]);

    // Add table with proper spacing for header/footer (after header image)
    const tableStartY = headerImage ? 35 : 30; // Start immediately after header
    autoTable(doc, {
      startY: tableStartY,
      head: [['Naziv', 'SKU', 'Jm', 'Stanje', 'Minimum', 'Status']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      margin: { top: tableStartY, bottom: 30 },
    });

    // Add footer image at bottom of page (centered, smaller size)
    if (footerImage) {
      const imgWidth = 150; // Smaller width
      const imgHeight = (imgWidth / 1824) * 508; // Maintain aspect ratio
      const xPos = (pageWidth - imgWidth) / 2; // Center horizontally
      const yPos = pageHeight - imgHeight - 10; // Bottom of page with margin
      doc.addImage(footerImage, 'PNG', xPos, yPos, imgWidth, imgHeight);
    }

    const filename = `Stanje_Magacina_${formatDateTime().replace(/[/:]/g, '_')}.pdf`;
    const blob = doc.output('blob');

    return await saveFile(blob, filename, 'pdf');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Export Inventory to Word
 */
export async function exportInventoryWord(items, filters, user) {
  try {
    // Start with minimal spacing (like PDF - no header images in Word)
    const children = [
      new Paragraph({
        text: '', // Empty space
        spacing: { after: 100 },
      }),
    ];

    const tableRows = items.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.name)] }),
            new TableCell({ children: [new Paragraph(item.sku)] }),
            new TableCell({ children: [new Paragraph(item.uom)] }),
            new TableCell({ children: [new Paragraph(String(item.qty_on_hand || 0))] }),
            new TableCell({ children: [new Paragraph(String(item.min_qty || 0))] }),
            new TableCell({
              children: [new Paragraph((item.qty_on_hand || 0) <= (item.min_qty || 0) ? 'Kritično' : 'OK')],
            }),
          ],
        })
    );

    const headerRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Naziv', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'SKU', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Jm', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Stanje', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Minimum', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Status', bold: true }))] }),
      ],
    });

    // Just add the table, no footer text
    children.push(
      new Table({
        rows: [headerRow, ...tableRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      // Empty space at bottom (like PDF footer area)
      new Paragraph({
        text: '',
        spacing: { after: 600 },
      })
    );

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const filename = `Stanje_Magacina_${formatDateTime().replace(/[/:]/g, '_')}.docx`;

    return await saveFile(blob, filename, 'docx');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Export Inventory to Excel
 */
export async function exportInventoryExcel(items, filters, user) {
  try {
    const workbook = new ExcelJS.Workbook();

    // Main sheet
    const worksheet = workbook.addWorksheet('Stanje');
    worksheet.columns = [
      { header: 'Naziv', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Jm', key: 'uom', width: 10 },
      { header: 'Stanje', key: 'qty', width: 12 },
      { header: 'Minimum', key: 'min', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' },
    };

    items.forEach((item) => {
      worksheet.addRow({
        name: item.name,
        sku: item.sku,
        uom: item.uom,
        qty: item.qty_on_hand || 0,
        min: item.min_qty || 0,
        status: (item.qty_on_hand || 0) <= (item.min_qty || 0) ? 'Kritično' : 'OK',
      });
    });

    // Low stock sheet
    const lowStock = items.filter((item) => (item.qty_on_hand || 0) <= (item.min_qty || 0));
    if (lowStock.length > 0) {
      const lowStockSheet = workbook.addWorksheet('Za poručivanje');
      lowStockSheet.columns = [
        { header: 'Naziv', key: 'name', width: 30 },
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Stanje', key: 'qty', width: 12 },
        { header: 'Minimum', key: 'min', width: 12 },
      ];

      lowStockSheet.getRow(1).font = { bold: true };
      lowStockSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE5C4' },
      };

      lowStock.forEach((item) => {
        lowStockSheet.addRow({
          name: item.name,
          sku: item.sku,
          qty: item.qty_on_hand || 0,
          min: item.min_qty || 0,
        });
      });
    }

    const blob = await workbook.xlsx.writeBuffer();
    const filename = `Stanje_Magacina_${formatDateTime().replace(/[/:]/g, '_')}.xlsx`;

    return await saveFile(blob, filename, 'xlsx');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * ============================================
 * AUDIT LOGS EXPORT
 * ============================================
 */

/**
 * Export Audit Logs to PDF
 */
export async function exportAuditLogsPDF(logs, filters, user) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(18);
    doc.text(COMPANY_NAME, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Audit logovi', pageWidth / 2, 30, { align: 'center' });
    doc.text(`Datum kreiranja: ${formatDate()}`, pageWidth / 2, 37, { align: 'center' });

    const tableData = logs.map((log) => [
      log.category,
      log.action,
      log.entity || '-',
      log.actor_user_id ? `User ${log.actor_user_id}` : '-',
      formatDate(log.created_at),
      log.payload ? 'Da' : 'Ne',
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Kategorija', 'Akcija', 'Entitet', 'Korisnik', 'Datum', 'Payload']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      margin: { top: 45 },
    });

    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Kreirao:', 20, pageHeight - 20);
    doc.text(user?.username || 'Nepoznato', 55, pageHeight - 20);
    doc.text('Magacin App v' + APP_VERSION, pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text(formatDateTime(), pageWidth - 60, pageHeight - 20, { align: 'right' });

    const filename = `Audit_Logovi_${formatDateTime().replace(/[/:]/g, '_')}.pdf`;
    const blob = doc.output('blob');

    return await saveFile(blob, filename, 'pdf');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Export Audit Logs to Word
 */
export async function exportAuditLogsWord(logs, filters, user) {
  try {
    const children = [
      new Paragraph({
        text: COMPANY_NAME,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: 'Audit logovi',
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Datum kreiranja: ${formatDate()}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];

    const tableRows = logs.map(
      (log) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(log.category)] }),
            new TableCell({ children: [new Paragraph(log.action)] }),
            new TableCell({ children: [new Paragraph(log.entity || '-')] }),
            new TableCell({ children: [new Paragraph(log.actor_user_id ? `User ${log.actor_user_id}` : '-')] }),
            new TableCell({ children: [new Paragraph(formatDate(log.created_at))] }),
            new TableCell({ children: [new Paragraph(log.payload ? 'Da' : 'Ne')] }),
          ],
        })
    );

    const headerRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Kategorija', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Akcija', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Entitet', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Korisnik', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Datum', bold: true }))] }),
        new TableCell({ children: [new Paragraph(new TextRun({ text: 'Payload', bold: true }))] }),
      ],
    });

    children.push(
      new Paragraph({
        text: '',
        spacing: { before: 200 },
      }),
      new Table({
        rows: [headerRow, ...tableRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `Kreirao: ${user?.username || 'Nepoznato'}`,
      }),
      new Paragraph({
        text: `Datum i vreme: ${formatDateTime()}`,
      }),
      new Paragraph({
        text: `Magacin App v${APP_VERSION}`,
        alignment: AlignmentType.CENTER,
      })
    );

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const filename = `Audit_Logovi_${formatDateTime().replace(/[/:]/g, '_')}.docx`;

    return await saveFile(blob, filename, 'docx');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Export Audit Logs to Excel
 */
export async function exportAuditLogsExcel(logs, filters, user) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Logovi');

    worksheet.columns = [
      { header: 'Kategorija', key: 'category', width: 15 },
      { header: 'Akcija', key: 'action', width: 20 },
      { header: 'Entitet', key: 'entity', width: 15 },
      { header: 'Korisnik', key: 'user', width: 15 },
      { header: 'Datum', key: 'date', width: 18 },
      { header: 'Payload', key: 'payload', width: 40 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' },
    };

    logs.forEach((log) => {
      worksheet.addRow({
        category: log.category,
        action: log.action,
        entity: log.entity || '-',
        user: log.actor_user_id ? `User ${log.actor_user_id}` : '-',
        date: formatDate(log.created_at),
        payload: log.payload || '-',
      });
    });

    const blob = await workbook.xlsx.writeBuffer();
    const filename = `Audit_Logovi_${formatDateTime().replace(/[/:]/g, '_')}.xlsx`;

    return await saveFile(blob, filename, 'xlsx');
  } catch (error) {
    return { success: false, error: error.message };
  }
}
