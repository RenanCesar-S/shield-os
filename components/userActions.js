import { isPasswordStrong } from "./passwordValidation.js";
import { saveToDatabase } from "../databases/database.js";
import { registerLog } from "../databases/logger.js";

export async function changePassword(loggedUser, promptSync, delay) {
  let validatingNewPassword = true;
  let newPassword = "";

  console.log(" --Change your password: --");
  const currentPassword = promptSync("Enter your current password: ", { echo: "*" });

  if (!loggedUser.checkPassword(currentPassword)) {
    console.log("❌ Authentication failed: Incorrect current password.");
    await delay(1000);
    return false;
  }

  while (validatingNewPassword) {
    console.log("(The password must contain uppercase letters, lowercase letters, numbers, and special characters.)");
    newPassword = promptSync("Enter new password: ", { echo: "*" });

    if (!isPasswordStrong(currentPassword, newPassword)) {
      console.log("Please, choose a stronger password.\n");
      continue;
    }

    const confirmPassword = promptSync("Confirm new password: ", { echo: "*" });

    if (newPassword !== confirmPassword) {
      console.log("❌ Error: Passwords do not match. Try again.\n");
      continue;
    }

    validatingNewPassword = false;
  }

  loggedUser.password = newPassword;
  console.log("🔄 Saving changes...");
  await delay(1000);
  return loggedUser;
}

export async function recoverPassword(users, promptSync, delay) {
  let validatingNewPassword = true;
  let newPassword = "";

  console.log("\n--- 🔑 Password Recovery ---");
  const usernameInput = promptSync("Username: ")?.toLowerCase().trim();
  const emailInput = promptSync("Registered Email: ")?.toLowerCase().trim();

  const userFound = users.find((u) => u.username === usernameInput && u.email === emailInput);

  if (userFound) {
    console.log(`✅ User identified: ${userFound.name}`);

    while (validatingNewPassword) {
      console.log("(The password must contain uppercase letters, lowercase letters, numbers, and special characters.)");
      newPassword = promptSync("Enter new password: ", { echo: "*" });

      if (!isPasswordStrong(null, newPassword)) {
        console.log("Please, choose a stronger password.\n");
        continue;
      }

      const confirmPassword = promptSync("Confirm new password: ", { echo: "*" });

      if (newPassword !== confirmPassword) {
        console.log("❌ Error: Passwords do not match. Try again.\n");
        continue;
      }

      validatingNewPassword = false;
    }

    userFound.password = newPassword;

    await saveToDatabase(users);
    await registerLog(userFound.username, "PASSWORD_RECOVERY_SUCCESS");
    console.log("Password Successfully changed!");
    await delay(1000);
  } else {
    console.log("❌ Error: Username and Email do not match our records.");
    if (users.find((u) => u.username === usernameInput)) {
      await registerLog(usernameInput, "PASSWORD_RECOVERY_FAILED");
    } else {
      await registerLog("unknown", "PASSWORD_RECOVERY_FAILED");
    }
    await delay(1500);
  }
}
