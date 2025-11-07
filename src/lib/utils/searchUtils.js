/**
 * Normalize text for search - removes diacritics and converts to lowercase
 * Converts č,ć,ž,š,đ to c,c,z,s,d for better search experience
 */
export function normalizeForSearch(text) {
  if (!text) return '';
  
  const normalized = text
    .toLowerCase()
    // Serbian/Croatian cyrillic and latin characters
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/ž/g, 'z')
    .replace(/š/g, 's')
    .replace(/đ/g, 'd')
    .replace(/Č/g, 'c')
    .replace(/Ć/g, 'c')
    .replace(/Ž/g, 'z')
    .replace(/Š/g, 's')
    .replace(/Đ/g, 'd')
    // Also handle numbers and special chars
    .trim();
  
  return normalized;
}

/**
 * Search items by multiple fields with support for Serbian characters
 * Searches: name, sku, manufacturer_sku, proizvodjac
 */
export function searchItems(items, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }
  
  const normalizedSearch = normalizeForSearch(searchTerm);
  
  return items.filter((item) => {
    // Normalize all searchable fields
    const normalizedName = normalizeForSearch(item.name);
    const normalizedSku = normalizeForSearch(item.sku);
    const normalizedManufacturerSku = normalizeForSearch(item.manufacturer_sku);
    const normalizedProizvodjac = normalizeForSearch(item.proizvodjac);
    
    // Check if search term is in any field
    return (
      normalizedName.includes(normalizedSearch) ||
      normalizedSku.includes(normalizedSearch) ||
      normalizedManufacturerSku.includes(normalizedSearch) ||
      normalizedProizvodjac.includes(normalizedSearch)
    );
  });
}

/**
 * Highlight search term in text (for display purposes)
 */
export function highlightSearchTerm(text, searchTerm) {
  if (!text || !searchTerm) return text;
  
  const normalizedText = normalizeForSearch(text);
  const normalizedSearch = normalizeForSearch(searchTerm);
  
  if (!normalizedText.includes(normalizedSearch)) return text;
  
  // Simple highlight - can be enhanced with HTML/React components
  return text;
}

