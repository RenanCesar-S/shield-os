export const getLoginTimestamp = () =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date());

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const parseBrDate = (dateString) => {
  const brDate = dateString;

  const [datePart, timePart] = brDate.split(", ");
  const [day, month, year] = datePart.split("/");
  const isoFormattedStr = `${year}-${month}-${day}T${timePart}`;

  return new Date(isoFormattedStr);
};
