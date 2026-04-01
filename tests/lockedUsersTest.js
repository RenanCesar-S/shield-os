import { filterLockedUsers } from "../components/utils.js";
import { assertEquals } from "./assertEqualsFunc.js";
console.log("Locked Users Test.");

const mockUsers = [
  {
    Username: "admin",
    Logins: 25,
    "Password Failures": 1,
    "Recovery Failures": 0,
    Updates: 1,
    Status: "✅ ACTIVE",
  },
  {
    Username: "madu",
    Logins: 4,
    "Password Failures": 1,
    "Recovery Failures": 0,
    Updates: 0,
    Status: "✅ LOCKED",
  },
  {
    Username: "test",
    Logins: 0,
    "Password Failures": 4,
    "Recovery Failures": 1,
    Updates: 0,
    Status: "🚨 LOCKED",
  },
];

const totalLocked = filterLockedUsers(mockUsers);
assertEquals(totalLocked.length, 2, "Should return 2 users LOCKED");

const totalLockedEmpty = filterLockedUsers([]);
assertEquals(totalLockedEmpty.length, 0, "Should return empty array or non-existent");

console.log("\n");
