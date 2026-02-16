import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { delay, getLoginTimestamp } from "../components/utils.js";

class LogType {
  constructor(username, date, userAction) {
    (this.username = username), (this.date = date), (this.userAction = userAction);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATH_FILE = path.join(__dirname, "logs.json");

async function saveLog(log) {
  try {
    const logsToStringfy = JSON.stringify(log, null, 2);
    await fs.writeFile(PATH_FILE, logsToStringfy, "utf-8");
  } catch (error) {
    console.error("❌ [Error]: Failed to save logs:", error.message);
  }
}
export const loadLogList = async () => {
  try {
    const logText = await fs.readFile(PATH_FILE, "utf-8");
    const savedLog = JSON.parse(logText);

    return savedLog.map((u) => {
      const item = new LogType(u.username, u.date, u.userAction);
      return item;
    });
  } catch (error) {
    console.log("⚠️ [System]: No Logs found, starting fresh.");
    return [];
  }
};

export async function registerLog(username, action) {
  const logs = await loadLogList();

  const newLog = new LogType(username, getLoginTimestamp(), action);
  logs.push(newLog);
  await saveLog(logs);
}

export async function clearLog() {
  console.log("Clearing all Logs...");
  await delay(2000);
  const clearStringfy = JSON.stringify([], null, 2);
  await fs.writeFile(PATH_FILE, clearStringfy, "utf-8");
}
