import { assertEquals } from "./assertEqualsFunc.js";
import { findUserByUsername, hasLockedUser } from "../components/utils.js";

console.log("Find Register by Username and has Locked Test.");

const mockUser = [
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
    Status: "✅ ACTIVE",
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

const neddedUser = findUserByUsername(mockUser, "madu");
assertEquals(neddedUser.Logins, 4, "Found the user and show his last logins");

const isSomeLocked = hasLockedUser(mockUser);
assertEquals(isSomeLocked, true, "Should detect if there is at least one locked user");

console.log("\n");
