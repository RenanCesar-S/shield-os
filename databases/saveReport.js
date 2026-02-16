import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getLoginTimestamp } from "../components/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_NAME = "daily-report.json";
const FILE_PATH = path.join(__dirname, FILE_NAME);

export async function saveReport(reportData) {
  const newEntry = {
    generatedAt: getLoginTimestamp(),
    data: reportData,
  };

  let history = [];

  try {
    const fileExists = await fs.access(FILE_PATH).then(() => true).catch(() => false)
    if (fileExists) {
        const content = await fs.readFile(FILE_PATH, "utf-8");
        history = JSON.parse(content);
    }
    history.push(newEntry);

    const jsonContent = JSON.stringify(history, null, 2);

    await fs.writeFile(FILE_PATH, jsonContent, "utf-8");
    console.log(`\n💾 Report successfully exported to ${FILE_NAME}!`);
  } catch (error) {
    console.error("❌ Error while saving the report:", error);
  }
}
