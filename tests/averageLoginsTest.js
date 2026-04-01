import { assertEquals } from "./assertEqualsFunc.js";
import { calculateAverageLogins } from "../components/utils.js";

console.log("Average Logins Test.");

const sampleUsers = [
  { Username: "A", Logins: 11 },
  { Username: "B", Logins: 23 },
  { Username: "C", Logins: 33 },
];

const avg = calculateAverageLogins(sampleUsers);
assertEquals(avg, 22.33, "Average should be 20 for these users");

assertEquals(calculateAverageLogins([]), 0, "Average of empty list should be 0");

console.log("\n");
