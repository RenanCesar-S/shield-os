import { saveToDatabase } from "../databases/database.js";
import { registerLog } from "../databases/logger.js";
import { changePassword } from "./userActions.js";

export async function userMenu(loginResult, users, promptSync, delay, getLoginTimestamp) {
  let userMenuRunning = true;

  const loggedUser = loginResult;

  console.log(`\nWelcome back, ${loggedUser.name}!  - |Session starts at: ${getLoginTimestamp()}|`);

  while (userMenuRunning) {
    console.log("\n --------------- User Menu ---------------");
    console.log("1. View My Profile");
    console.log("2. Change Password");
    console.log("3. Logout");
    console.log("------------------------------------------");

    const userChoice = promptSync("> ") || "";

    if (userChoice === "1") {
      console.log(" --Your informations: --");
      console.log(
        `Name: ${loggedUser.name} | Username: ${loggedUser.username} | Email: ${loggedUser.email} | Telephone: ${loggedUser.tel}\n`
      );

      promptSync("Press Enter to Back to Menu...");
    } else if (userChoice === "2") {
      let isChanged = await changePassword(loggedUser, promptSync, delay);
      if (isChanged) {
        await registerLog(loggedUser.username, "PASSWORD_UPDATED");
        await saveToDatabase(users);
        console.log("✅ Password updated successfully!");
      }
    } else if (userChoice === "3") {
      console.log("loggin out...");
      await registerLog(loggedUser.username, "LOGOUT");
      await delay(800);
      userMenuRunning = false;
    }
  }
}
