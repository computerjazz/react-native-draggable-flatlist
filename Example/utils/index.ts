export function getColor(i: number, numItems: number = 25) {
  const multiplier = 255 / (numItems - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

export const mapIndexToData = (_d: any, index: number, arr: any[]) => {
  const backgroundColor = getColor(index, arr.length);
  return {
    text: `${index}`,
    key: `key-${index}`,
    backgroundColor,
    height: 75,
    width: 100,
  };
};

export type Item = ReturnType<typeof mapIndexToData>;
