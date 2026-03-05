export function calculateProcessingFee(itemValue: number): number {
  if (itemValue <= 0) return 0;
  if (itemValue <= 150) return 15;
  if (itemValue <= 1000) return itemValue * 0.10;
  if (itemValue <= 5000) return itemValue * 0.08;
  if (itemValue <= 10000) return itemValue * 0.07;
  if (itemValue <= 1000000) return itemValue * 0.05;
  return itemValue * 0.05;
}
