import { assertEquals } from "./assertEqualsFunc.js";

console.log("parseBrDate Test.");

const parseBrDate = (dateString) => {
  const brDate = dateString;

  const [datePart, timePart] = brDate.split(/,[ ]?/);
  const [day, month, year] = datePart.split("/");
  const isoFormattedStr = `${year}-${month}-${day}T${timePart}`;

  return new Date(isoFormattedStr);
};

const dateStr = "23/02/2026, 11:25:53";
const parsedDate = parseBrDate(dateStr);
assertEquals(parsedDate.getFullYear(), 2026, "Year should be 2026");

const noSpaceDate = "23/02/2026,11:25:53";
const res3 = parseBrDate(noSpaceDate);
assertEquals(res3.toString().includes("Invalid"), false, "Case 3: Should not be Invalid Date");

console.log("\n");
