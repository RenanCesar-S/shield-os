import { assertEquals } from "./assertEqualsFunc.js";
import { groupUsersByStatus } from "../components/utils.js";

console.log("Group Users by Status Test.");

const mockUsersStatus = [
  { Username: "Gui", Status: "ACTIVE" },
  { Username: "Madu", Status: "LOCKED" },
  { Username: "Admin", Status: "ACTIVE" },
];

const grouped = groupUsersByStatus(mockUsersStatus);

assertEquals(grouped["ACTIVE"].length, 2, "Should have 2 active users");
assertEquals(grouped["LOCKED"].length, 1, "Should have 1 locked user");
assertEquals(grouped["ACTIVE"][0].Username, "Gui", "First active user should be Gui");

console.log("\n");
