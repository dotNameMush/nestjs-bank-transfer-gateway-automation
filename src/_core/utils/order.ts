export const formatOrderId = (id: number): string => {
  return `ORD-${id.toString().padStart(4, '0')}`;
};
export const extractOrderId = (text: string) => {
  const match = text.match(/ORD-\d+/); // Regex to match "ORD-" followed by digits
  return match ? match[0] : null; // Return the matched part or null if not found
};
