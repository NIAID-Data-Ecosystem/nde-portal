export const setDateCreated = async (sourcePath: string) => {
  const url = `https://api.github.com/repos/NIAID-Data-Ecosystem/nde-crawlers/commits?path=${sourcePath}`;
  const response = await fetch(url);
  const jsonData = await response.json();
  const dates: string[] = [];
  jsonData.forEach((jsonObj: {commit: {author: {date: string}}}) => {
    dates.push(jsonObj.commit.author.date);
  });
  return dates[dates.length - 1];
};
