import { assertEquals } from "./assertEqualsFunc.js";
import { sanitizeUsernames } from "../components/utils.js";

console.log("Sanitize Users Test.");

const dirtyMocks = [
  { Username: "   Gui   ", Status: "ACTIVE" },
  { Username: "MADu  ", Status: "LOCKED" },
  { Username: "   Admin", Status: "ACTIVE" },
];

const sanitized = sanitizeUsernames(dirtyMocks);
assertEquals(sanitized[0].Username, "gui", "Should return username in lower case and no spaces");
console.log(sanitized);

console.log("\n");
