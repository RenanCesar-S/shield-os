import { assertEquals } from "./assertEqualsFunc.js";
import { getUniqueUseranes } from "../components/utils.js";

console.log("Unique Usernames Test.");

const mockLogs = [
  {
    username: "admin",
    date: "18/02/2026, 21:06:34",
    userAction: "ADMIN_LAST_LOGS",
  },
  {
    username: "admin",
    date: "18/02/2026, 21:06:50",
    userAction: "ADMIN_AUDIT_LOGS",
  },
  {
    username: "admin",
    date: "18/02/2026, 21:06:58",
    userAction: "ADMIN_FILTER_LOGS",
  },
  {
    username: "admin",
    date: "18/02/2026, 21:07:08",
    userAction: "ADMIN_AUDIT_LOGS",
  },
  {
    username: "test",
    date: "18/02/2026, 21:08:42",
    userAction: "LOGIN",
  },
  {
    username: "test",
    date: "18/02/2026, 21:09:09",
    userAction: "LOGOUT",
  },
  {
    username: "test",
    date: "18/02/2026, 21:10:37",
    userAction: "PASSWORD_RECOVERY_FAILED",
  },
  {
    username: "admin",
    date: "19/02/2026, 17:20:59",
    userAction: "ADMIN_LOGIN",
  },
  {
    username: "admin",
    date: "19/02/2026, 17:21:04",
    userAction: "ADMIN_LIST_USER",
  },
  {
    username: "admin",
    date: "19/02/2026, 17:21:09",
    userAction: "ADMIN_AUDIT_LOGS",
  },
  {
    username: "admin",
    date: "19/02/2026, 17:21:10",
    userAction: "ADMIN_LAST_LOGS",
  },
  {
    username: "admin",
    date: "19/02/2026, 17:21:22",
    userAction: "ADMIN_AUDIT_LOGS",
  },
  {
    username: "admin",
    date: "19/02/2026, 17:21:26",
    userAction: "ADMIN_FILTER_LOGS",
  },
  {
    username: "madu",
    date: "27/02/2026, 10:02:05",
    userAction: "LOGIN",
  },
  {
    username: "madu",
    date: "27/02/2026, 10:02:14",
    userAction: "LOGOUT",
  },
  {
    username: "admin",
    date: "27/02/2026, 10:02:17",
    userAction: "ADMIN_LOGIN",
  },
  {
    username: "admin",
    date: "27/02/2026, 10:02:20",
    userAction: "ADMIN_LIST_USER",
  },
  {
    username: "testaodouze",
    date: "27/02/2026, 10:03:44",
    userAction: "LOGIN",
  },
  {
    username: "testaodouze",
    date: "27/02/2026, 10:02:48",
    userAction: "LOGOUT",
  },
];

const uniqueNames = getUniqueUseranes(mockLogs);
assertEquals(uniqueNames.length, 4, "Should show 1 username per log");

console.log("\n");
