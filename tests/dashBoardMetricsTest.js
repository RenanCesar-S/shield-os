export function calculateDashboardMetrics(data) {
  return data.reduce(
    (acc, user) => {
      acc.total += 1;
      if (user.Status?.includes("LOCKED")) {
        acc.locked += 1;
      }

      return acc;
    },
    { total: 0, locked: 0 },
  );
}

console.log("dashBoardMetrics Test.");

// O nosso pequeno "Juiz"
import { assertEquals } from "./assertEqualsFunc.js";

// 1. MOCK DATA (Dados de mentirinha)
const dirtyData = [{ username: "hacker" }, { username: "cocada" }];
const emptyUsers = [];
const mockUsers = [
  { Username: "user1", Status: "ACTIVE" },
  { Username: "user2", Status: "LOCKED" },
  { Username: "user3", Status: "LOCKED" },
];

// 2. O TESTE (Red Stage - O teste vai falhar se a função não existir ou estiver errada)
// Importe ou cole sua função calculateDashboardMetrics aqui para testar
const resultNormal = calculateDashboardMetrics(mockUsers);
const emptyResult = calculateDashboardMetrics(emptyUsers);
const dirtyTest = calculateDashboardMetrics(dirtyData);

assertEquals(resultNormal, { total: 3, locked: 2 }, "Should count normal data correctly");
assertEquals(emptyResult, { total: 0, locked: 0 }, "Should handle empty array");
assertEquals(dirtyTest, { total: 2, locked: 0 }, "Should not crash with missing Status");

console.log("\n");
