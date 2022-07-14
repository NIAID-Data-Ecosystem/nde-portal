// Round the number to the nearest tenth
export const roundCount = (c: number) => {
  if (c <= 5) {
    return 1;
  } else {
    return Math.ceil(c / 10) * 10;
  }
};

// Returns a list of data where the count is higher or equal to the position given.
export const getMostPopularCount = (data: { count: number }[], pos: number) => {
  if (!Array.isArray(data)) {
    return [];
  }
  const maxCount = data.slice(0, pos)[pos - 1]?.count || 0;
  return data.filter(d => d.count >= maxCount);
};
