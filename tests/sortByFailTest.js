import { assertEquals } from "./assertEqualsFunc.js";
import { sortByFailures } from "../components/utils.js";

console.log("Sort by Failures Test.");

const unsortedUsers = [
  { Username: "user1", "Password Failures": 2 },
  { Username: "user2", "Password Failures": 5 },
  { Username: "user3", "Password Failures": 0 },
];

const sorted = sortByFailures(unsortedUsers);
assertEquals(sorted[0].Username, "user2", "First user should be the one with most failures");

assertEquals(sorted[2].Username, "user3", "Last user should be the one with least failures");

console.log("\n");
