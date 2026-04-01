import { sortLogsByDate } from "../components/utils.js";
import { assertEquals } from "./assertEqualsFunc.js";
import { parseBrDate } from "../components/utils.js";

console.log("SortLogs Test.");

const mockLogs = [{ date: "20/02/2026, 10:00:00" }, { date: "23/02/2026, 10:00:00" }, { date: "21/02/2026, 10:00:00" }];

const logs = sortLogsByDate(mockLogs, parseBrDate);

assertEquals(logs[0].date, "23/02/2026, 10:00:00", "The first item should be Feb 23rd");
assertEquals(logs[2].date, "20/02/2026, 10:00:00", "The last item should be Feb 20rd");

console.log("\n");
