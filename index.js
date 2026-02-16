import PromptSync from "prompt-sync";
import { loadFromDatabase, saveToDatabase } from "./databases/database.js";
import { getLoginTimestamp, delay } from "./components/utils.js";
import { userMenu } from "./components/userMenu.js";
import { runAdminPanel } from "./components/admin.js";
import { User } from "./components/User.js";
import { loadLogList, registerLog } from "./databases/logger.js";
import { isPasswordStrong } from "./components/passwordValidation.js";
import { validateEmail, validatename, validateTel } from "./components/dataValidation.js";
import { recoverPassword } from "./components/userActions.js";

const promptSync = PromptSync();
let users = await loadFromDatabase();
let logs = await loadLogList();

// --- System Config ---
const systemConfig = {
  maxAttempts: 3,
};

const { maxAttempts } = systemConfig;

async function validateLogin(userInput, passInput, list) {
  try {
    console.log("Checking credentials...");
    await delay(1000);

    if (!list || list.length === 0) {
      throw new Error("DATABASE_ERROR");
    }

    if (!userInput.trim() || !passInput.trim()) {
      throw new Error("EMPTY_FIELD");
    }

    const foundUser = list.find((u) => u.username === userInput);

    if (foundUser && !foundUser.checkPassword(passInput)) {
      return "WRONG_PASSWORD";
    }

    if (foundUser && foundUser.checkPassword(passInput)) {
      if (foundUser.username === "admin") return "ADMIN";

      return foundUser;
    }
    return null;
  } catch (error) {
    if (error.message === "DATABASE_ERROR") {
      console.log("🛠️ System under maintenance, please try again later.");
      return "CRITICAL_FAILURE";
    }

    if (error.message === "EMPTY_FIELD") {
      console.log("⚠️ Username or Password cannot be empty!");
      return "RETRY";
    }

    console.log(`[UNKNOWN ERROR]: ${error.message}`);
    return null;
  }
}

async function createNewUser(list) {
  let hasUsername = true;
  let hasName = true;
  let hasPassword = true;
  let hasEmail = true;
  let hasTel = true;

  console.log("\n--- 📝 Register New User ---");
  let name = "";
  let username = "";
  let password = "";
  let email = "";
  let tel = "";

  while (hasName) {
    name = promptSync("Full Name: ");
    const insNameOk = validatename(name);
    if (!insNameOk) {
      console.log("Name can't be empty or have numbers. Type your full name.");
    } else {
      hasName = false;
    }
  }

  while (hasUsername) {
    username = promptSync("Username: ")?.toLowerCase();
    if (list.some((u) => u.username === username || username === "admin" || !username.trim())) {
      console.log("❌ Error: Username already exists or invalid!");
    } else {
      hasUsername = false;
    }
  }

  console.log("\n(The password must contain uppercase letters, lowercase letters, numbers, and special characters.)");
  while (hasPassword) {
    password = promptSync("Password: ", { echo: "*" });

    if (!isPasswordStrong(null, password)) {
      console.log("Please, choose a stronger password.\n");
      continue;
    }

    const confirmPassword = promptSync("Confirm your password: ", { echo: "*" });

    if (password !== confirmPassword) {
      console.log("❌ Error: Passwords do not match. Try again.\n");
      continue;
    }

    hasPassword = false;
  }

  while (hasEmail) {
    email = promptSync("Email: ")?.toLowerCase();
    const isEmailOk = validateEmail(email);
    if (!isEmailOk) {
      console.log("Invalid Email. Try again.");
      continue;
    } else {
      hasEmail = false;
    }
  }

  while (hasTel) {
    tel = promptSync("Telephone: ")?.toLowerCase();
    const isTelOk = validateTel(tel);
    if (!isTelOk) {
      console.log("Invalid Telephone. Try again.");
      continue;
    } else {
      hasTel = false;
    }
  }

  const newUser = new User(name, username, password, email, tel);

  list.push(newUser);

  await saveToDatabase(list);
  console.log(`✅ User registered successfully!`);
}

// --- Execution ---
let attempts = 0,
  appRunning = true;

while (appRunning) {
  users = await loadFromDatabase();
  logs = await loadLogList();

  let success = false,
    admOn = false,
    loggedInUser;

  console.log("\n ==== WELCOME TO MENU ====");
  console.log("1. Login");
  console.log("2. Create Account");
  console.log("3. Forgot Password");
  console.log("4. Exit");

  const initialChoice = promptSync("> ") || "";

  if (initialChoice === "1") {
    if (attempts >= maxAttempts) {
      console.log(`\n⏳ [SECURITY]: Too many attempts. Please wait 10 seconds...`);
      await delay(10000);
      attempts = 0;
      console.log("🔓 [SECURITY]: Access restored. You can try again.");
    }

    while (attempts < maxAttempts) {
      const userTyped = promptSync("Username: ")?.toLowerCase().trim();
      const passTyped = promptSync("Password: ", { echo: "*" });

      const loginResult = await validateLogin(userTyped, passTyped, users);
      if (loginResult === "CRITICAL_FAILURE") break;
      if (loginResult === "RETRY") continue;

      if (loginResult === "WRONG_PASSWORD") {
        console.log("Wrong password.");
        await registerLog(userTyped, "WRONG_PASSWORD");
      }

      if (loginResult === "ADMIN") {
        success = true;
        admOn = true;
        await registerLog("admin", "ADMIN_LOGIN");
        await runAdminPanel(users, promptSync, delay);
        break;
      } else if (loginResult && loginResult !== "WRONG_PASSWORD") {
        success = true;
        await registerLog(loginResult.username, "LOGIN");
        await userMenu(loginResult, users, promptSync, delay, getLoginTimestamp);
        break;
      } else {
        attempts++;
        console.log(`Access Denied. Attempt ${attempts} of ${maxAttempts}`);
      }
    }

    if (success) {
      attempts = 0;
    } else if (attempts >= maxAttempts) {
      console.log("System Locked. Returning to main menu...");
    }
  } else if (initialChoice === "2") {
    await createNewUser(users);
  } else if (initialChoice === "3") {
    await recoverPassword(users, promptSync, delay);
  } else if (initialChoice === "4") {
    console.log("Goodbye");
    appRunning = false;
  } else {
    console.log("Invalid option!");
  }
}
