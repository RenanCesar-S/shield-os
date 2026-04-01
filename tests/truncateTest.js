import { assertEquals } from "./assertEqualsFunc.js";
import { truncateUsername } from "../components/utils.js";

console.log("Truncate Username Test.");

const userTruncateLong = truncateUsername("Cocadao1234");
assertEquals(userTruncateLong, "Cocadao123...", "Should truncate long name");

const userTruncateShort = truncateUsername("Madu");
assertEquals(userTruncateShort, "Madu", "Should keep short name intact");

const userTruncateNull = truncateUsername(null);
assertEquals(userTruncateNull, "Username not found", "Should handle null values");

const userTruncateExact = truncateUsername("1234567890");
assertEquals(userTruncateExact, "1234567890", "Should not truncate exactly 10 chars");

console.log("\n");
