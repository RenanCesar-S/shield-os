import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { User } from "../components/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, "database.json");

export const saveToDatabase = async (data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(FILE_PATH, jsonString, "utf-8");
    console.log("💾 [System]: Database update successfully!");
  } catch (error) {
    console.error("❌ [Error]: Failed to save data:", error.message);
  }
};

export const loadFromDatabase = async () => {
  try {
    const dataText = await fs.readFile(FILE_PATH, "utf-8");
    const savedData = JSON.parse(dataText);

    return savedData.map((u) => {
      const item = new User(u.name, u.username, u.password, u.email, u.tel);
      item.createdAt = u.createdAt;
      return item;
    });
  } catch (error) {
    console.log("⚠️ [System]: No database found, starting fresh.");
    return [];
  }
};
