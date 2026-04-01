import { assertEquals } from "./assertEqualsFunc.js";
import { isDataComplete } from "../components/utils.js";

console.log("Data Integrity Test.");

const completeList = [
  { Username: "Gui", Logins: 10 },
  { Username: "Madu", Logins: 5 },
];

const incompleteList = [
  { Username: "Gui", Logins: 10 },
  { Username: "", Logins: 5 }, // Opa, aqui está o erro!
];

const checkComplete = isDataComplete(completeList);
assertEquals(checkComplete, true, "Should be true when all users have names");

const checkIncomplete = isDataComplete(incompleteList);
assertEquals(checkIncomplete, false, "Should be false when someone has an empty username");

console.log("\n");
