export const transformString2Hash = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, '')
    .split(' ')
    .join('-');
};
