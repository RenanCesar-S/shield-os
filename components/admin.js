import { saveToDatabase } from "../databases/database.js";
import { delay, parseBrDate } from "./utils.js";
import { clearLog, loadLogList, registerLog } from "../databases/logger.js";
import { saveReport } from "../databases/saveReport.js";

async function updateUser(list, promptSync) {
  console.log("\n--- 🛠️  Edit User Management ---");
  const targetUsername = promptSync("Enter the Username you want to edit: ")?.toLowerCase();

  const userToEdit = list.find((u) => u.username === targetUsername);

  if (!userToEdit) {
    console.log("❌ Error: User not found in our database!");
    return;
  }

  console.log(`\nModifying profile for: ${userToEdit.username.toUpperCase()}`);
  console.log("1. Update Name");
  console.log("2. Update Email");
  console.log("3. Update Telephone");
  console.log("4. Cancel");

  const choice = promptSync("Select the field to change|> ");

  let userChanged = "";

  switch (choice) {
    case "1":
      userToEdit.name = promptSync("New name : ");
      userChanged = `ADMIN_UPDATED_${userToEdit.username}_NAME`;
      break;
    case "2":
      userToEdit.email = promptSync("New Email: ")?.toLowerCase();
      userChanged = `ADMIN_UPDATED_${userToEdit.username}_EMAIL`;
      break;
    case "3":
      userToEdit.tel = promptSync("New Telephone: ")?.toLowerCase();
      userChanged = `ADMIN_UPDATED_${userToEdit.username}_TEL`;
      break;
    case "4":
      console.log("Operation Cancelled.");
      return;
    default:
      console.log("Invalid selection.");
      return;
  }

  let confirmChange = "";
  while (confirmChange !== "yes" && confirmChange !== "no") {
    confirmChange = promptSync(" Do you really want to make that change ? (yes/no): ")?.toLowerCase();
    if (confirmChange !== "yes" && confirmChange !== "no") console.log("⚠️ Type only yes or no.");
  }

  if (confirmChange === "yes") {
    console.log("Saving...\n");
    await delay(1000);
    await registerLog("admin", userChanged);
    await saveToDatabase(list);
  } else {
    console.log("Ok. Returning to Admin Panel...");
    await delay(1000);
    return;
  }
}

async function viewSystemLogs(users, promptSync) {
  const allLogs = await loadLogList();
  await registerLog("admin", "ADMIN_AUDIT_LOGS");

  console.log("\n--- SYSTEM AUDIT LOGS ---");
  console.log("1. View Last 10 logs");
  console.log("2. Filter by Username");
  console.log("3. Clear ALL Logs");
  console.log("4. Back");

  const choice = promptSync("> ");

  if (choice === "1") {
    await registerLog("admin", "ADMIN_LAST_LOGS");
    console.table(allLogs.slice(-10));
  } else if (choice === "2") {
    const userToFind = promptSync("Enter username to filter: ")?.toLowerCase();
    const filteredLogs = allLogs.filter((log) => log.username === userToFind);

    if (filteredLogs.length > 0) {
      console.table(filteredLogs);
      await registerLog("admin", "ADMIN_FILTER_LOGS");
    } else {
      console.log("No logs found for this user");
    }
  } else if (choice === "3") {
    let confirmClearLogs = "";
    while (confirmClearLogs !== "yes" && confirmClearLogs !== "no") {
      confirmClearLogs = promptSync("Are you SURE? This will delete ALL System Logs. (yes/no): ")?.toLowerCase();
      if (confirmClearLogs !== "yes" && confirmClearLogs !== "no") console.log("⚠️ Type only yes or no.");
    }

    if (confirmClearLogs === "yes") {
      const adminUser = users.find((u) => u.username === "admin");
      const confirmPassword = promptSync("Enter you ADMIN Password to CONFIRM: ", { echo: "*" })?.trim();
      if (adminUser.checkPassword(confirmPassword)) {
        await clearLog();
        console.log("✅ All Logs Deleted.");
        await registerLog("admin", "ADMIN_DELETED_ALL_LOGS");
        await delay(1000);
      } else {
        console.log("❌ Invalid Credentials. Action cancelled.");
        await delay(1000);
        return;
      }
    } else if (confirmClearLogs === "no") {
      console.log("OK. Operation cancelled.");
      return;
    }
  } else if (choice === "4") {
    console.log("Back to Admin Panel...");
    await delay(1000);
    return;
  }
}

async function showDailyActiveUsers(users) {
  const logs = await loadLogList();

  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

  const recentLogs = logs.filter((log) => {
    const logDateObject = parseBrDate(log.date);
    const logTime = logDateObject.getTime();

    if (isNaN(logTime)) return false;

    return logTime > twentyFourHoursAgo;
  });

  const userActivityMap = recentLogs.reduce((acc, log) => {
    const user = log.username;

    if (!acc[user]) {
      acc[user] = {
        username: user,
        logins: 0,
        passwordFailures: 0,
        passwordRecFailures: 0,
        updates: 0,
      };
    }

    if (log.userAction.includes("LOGIN")) {
      acc[user].logins += 1;
    } else if (log.userAction === "WRONG_PASSWORD") {
      acc[user].passwordFailures += 1;
    } else if (log.userAction === "PASSWORD_RECOVERY_FAILED") {
      acc[user].passwordRecFailures += 1;
    } else if (log.userAction.includes("UPDATED")) {
      acc[user].updates += 1;
    }

    return acc;
  }, {});

  const activityTable = Object.values(userActivityMap)
    .sort((a, b) => b.logins - a.logins)
    .map((item) => ({
      Username: item.username,
      Logins: item.logins,
      "Password Failures": item.passwordFailures,
      "Recovery Failures": item.passwordRecFailures,
      Updates: item.updates,
      Status: item.passwordFailures >= 3 ? (item.logins === 0 ? "🚨 LOCKED" : "⚠️ SUSPICIOUS") : "✅ ACTIVE",
    }));

  const totalLogins = activityTable.reduce((total, user) => total + user.Logins, 0);
  console.log(`✅ Successful Logins: ${totalLogins}`);

  const mostActive = activityTable.length > 0 ? [activityTable[0].Username, activityTable[0].Logins] : ["None", 0];

  console.log(`🏆 The Most Active User is ${mostActive[0]} with ${mostActive[1]} actions!`);
  console.table(activityTable);

  return activityTable;
}

async function showSystemStats(users) {
  console.log("\n--- 📊 SYSTEM HEALTH DASHBOARD (LAST 24h) ---");
  console.log(`👥 Total Users: ${users.length}`);

  const reportData = await showDailyActiveUsers(users);
  await saveReport(reportData);
  await delay(1200);
}

export async function runAdminPanel(users, promptSync, delay) {
  let admRunning = true;

  while (admRunning) {
    console.log("\n--- 🛡️ ADMIN PANEL ---");
    console.log("1. List All Users");
    console.log("2. Delete a User");
    console.log("3. Edit a User");
    console.log("4. Audit Logs");
    console.log("5. System Overview");
    console.log("6. Logout to Main Menu");

    const admChoice = promptSync("> ");

    if (admChoice === "1") {
      console.log("⏳ [SYSTEM]: Loading directory...");
      await delay(1000);
      console.log("\n--- 🛡️ System User Directory ---");
      users.forEach((u) => {
        console.log(
          `${u.name} | Username: ${u.username} | Email: ${u.email} | Tel: ${u.tel} | Created at: ${u.createdAt}`,
        );
      });
      await registerLog("admin", "ADMIN_LIST_USER");
      await delay(1000);
    } else if (admChoice === "2") {
      let usersToDelete = [];
      let continueAdding = true;

      console.log("\n--- 🛡️ Delete User Menu ----\n");

      while (continueAdding) {
        const userDelete = promptSync(" - Username to DELETE: ")?.toLowerCase();
        const found = users.find((u) => u.username === userDelete);

        if (!found) {
          console.log("❌ User not found.");
        } else if (userDelete === "admin") {
          console.log("❌ Cannot delete the main Admin!");
        } else if (usersToDelete.includes(userDelete)) {
          console.log("⚠️ This user is already in the deletion queue.");
        } else {
          usersToDelete.push(userDelete);
          console.log(`✅ ${userDelete} added to deletion queue.`);
        }

        let answer = "";
        while (answer !== "yes" && answer !== "no") {
          answer = promptSync("Want to delete another? (yes/no): ")?.toLowerCase();
          if (answer !== "yes" && answer !== "no") console.log("⚠️ Type only yes or no.");
        }

        if (answer === "no") continueAdding = false;
      }

      if (usersToDelete.length > 0) {
        const confirm = promptSync(`Confirm deleting [${usersToDelete.join(", ")}]? (yes/no): `)?.toLowerCase();

        if (confirm === "yes") {
          users = users.filter((u) => !usersToDelete.includes(u.username));
          console.log("🗑️ Deleting users...!\n");
          await delay(1500);
          await registerLog("admin", `ADMIN_DELETED_${usersToDelete}_USER`);
          await saveToDatabase(users);
        } else {
          console.log("Operation aborted.");
        }
      }
    } else if (admChoice === "3") {
      await updateUser(users, promptSync);
    } else if (admChoice === "4") {
      await viewSystemLogs(users, promptSync);
    } else if (admChoice === "5") {
      await showSystemStats(users);
    } else if (admChoice === "6") {
      admRunning = false;
    }
  }
}
