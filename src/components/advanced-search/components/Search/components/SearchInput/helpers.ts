export const getDateQuerystring = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const startQuery = !startDate ? '*' : startDate;
  const endQuery = !endDate ? '*' : endDate;

  let term = '';
  if (!startDate && !endDate) {
    term = 'Any Dates';
  } else if (startDate && endDate) {
    term = `Between ${startDate} and ${endDate}`;
  } else if (!startDate) {
    term = `Before ${endDate}`;
  } else if (!endDate) {
    term = `After ${startDate}`;
  }

  return {
    term,
    querystring: `[${startQuery} TO ${endQuery}]`,
  };
};
