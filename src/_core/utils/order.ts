export const formatOrderId = (id: number): string => {
  return `ORD-${id.toString().padStart(4, '0')}`;
};
export const extractOrderId = (text: string) => {
  const match = text.match(/ORD-\d+/); // Regex to match "ORD-" followed by digits
  return match ? match[0] : null; // Return the matched part or null if not found
};

export const extractAmountFromSnippet = (text: string) => {
  const match = text.match(/[\+\-]?\d{1,3}(,\d{3})*(\.\d+)?(?=MNT)/);
  if (match) {
    // Remove commas and convert to a number
    const numericValue = parseFloat(match[0].replace(/,/g, ''));
    return numericValue;
  }
  return null;
};
