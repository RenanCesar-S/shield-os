import { loadFromDatabase, postToDatabase } from "../databases/database.js";
import { delay, playSound, showToast } from "./utils.js";

import * as el from "./ui-elements.js";

let currentUser = null;

const tasks = [
  { id: 1, description: "Bio Master", rewardXP: 50, rewardPoints: 50 },
  { id: 2, description: "First Login", rewardXP: 20, rewardPoints: 12 },
  { id: 3, description: "Login 7 Days", rewardXP: 80, rewardPoints: 60 },
  { id: 4, description: "Curious", rewardXP: 112, rewardPoints: 112 },
];

const storeItems = [
  { id: "bg_colorfulMode", name: "Colorful Mode", price: 100, desc: "Unlock the ultimate colorful theme." },
  { id: "golden_name", name: "Golden Name", price: 250, desc: "Your name will shine in gold!" },
  { id: "high_xp", name: "XP Booster", price: 500, desc: "Earn 500 XP instantly." },
];

export async function initGame(loggedID) {
  el.container.classList.add("game-container");

  el.userBio.removeEventListener("keydown", handleUserBioEnter);
  el.userBio.removeEventListener("keydown", handleUserBioTyping);
  el.userBio.removeEventListener("paste", handleUserBioPaste);

  try {
    const userToken = localStorage.getItem("sessionToken");
    const response = await loadFromDatabase("users");
    if (!response || response.length === 0) throw new Error("Database is not responding...");

    currentUser = response.find((user) => user.id === loggedID && user.sessionToken === userToken);

    if (currentUser.inventory?.find((id) => id === "bg_colorfulMode")) {
      el.body.classList.add("game-active-bg");
    }

    if (!currentUser || (currentUser.sessionToken !== userToken && !userToken.includes("firstLogin"))) {
      logoutGame();
      throw new Error("User not found in database...");
    }

    localStorage.setItem("userID", currentUser.id);
    el.playerName.textContent = currentUser.username;
    el.userBio.textContent = currentUser.bio || "";
    el.userLevel.textContent = currentUser.level;
    el.currentXp.textContent = currentUser.xp;

    if (userToken.includes("firstLogin")) {
      const newToken = el.newToken;
      currentUser.sessionToken = newToken;
      localStorage.setItem("sessionToken", newToken);

      await postToDatabase(`users/${currentUser.id}`, currentUser, "PUT");

      await completeTask(2);
    }

    checkDailyLogin();
    checkStoreOwnership();
    updateXPUI();
    updateTasksUI();
  } catch (error) {
    console.log(error.message);
  }
}

export function toggleGamePointsVisibility() {
  let localPoints = currentUser.points;
  if (!localPoints) localPoints = "0"; // Se não houver pontos armazenados, não faz nada
  const isPointsType = el.userPoints.classList.contains("off");

  if (isPointsType) {
    el.gameEyeVisible.classList.remove("hiddenEye");
    el.gameNoEyeVisible.classList.add("hiddenEye");
    el.userPoints.classList.remove("off");
    el.userPoints.innerText = localPoints;
  } else {
    el.gameEyeVisible.classList.add("hiddenEye");
    el.gameNoEyeVisible.classList.remove("hiddenEye");
    el.userPoints.classList.add("off");
    el.userPoints.innerText = el.userPoints.innerText.replace(/\d/g, "*");
  }
}

export function logoutGame() {
  localStorage.removeItem("authenticated");
  localStorage.removeItem("userID");
  localStorage.removeItem("userName");
  localStorage.removeItem("userBio");
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("dailyLogin");
  window.location.reload(); // Recarrega para limpar o estado
}

const BIO_LIMIT = 90;

async function finalizedBio() {
  if (!currentUser) throw new Error("User not found");

  el.userBio.setAttribute("contenteditable", "false");
  el.editBio.classList.remove("hidden");
  el.saveBio.classList.add("hidden");

  try {
    const finishedBio = el.userBio.innerText.trim();

    if (!currentUser.bio || currentUser.bio?.trim() === "") {
      await completeTask(1);

      updateXPUI();
      updateTasksUI();
    } else {
      msgIsTaskComplete(tasks[0]);
    }

    currentUser.bio = finishedBio;

    await postToDatabase(`users/${currentUser.id}`, currentUser, "PUT");

    localStorage.setItem("userBio", finishedBio);
  } catch (error) {
    console.error("Error to change bio:", error);
  }
}

function handleUserBioEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  el.userBio.blur();

  verifyBioLength();
}

function handleUserBioTyping(event) {
  const allowKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Enter", "End", "Home", "Tab"];
  if (allowKeys.includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) return;

  if (el.userBio.innerText.length >= BIO_LIMIT) {
    event.preventDefault();
    console.warn("Limite de 90 caracteres atingido!"); // aviso para o usuário
  }
}

function handleUserBioPaste(event) {
  event.preventDefault();
  const text = event.clipboardData?.getData("text") || "";
  const allowed = Math.max(0, BIO_LIMIT - el.userBio.innerText.length);
  const cutText = text.slice(0, allowed);
  if (!cutText) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(cutText));
  range.collapse(false);

  selection.removeAllRanges();
  selection.addRange(range);
}

export function changeBio() {
  el.userBio.innerText = localStorage.getItem("userBio") || "";
  el.userBio.setAttribute("contenteditable", "true");
  el.editBio.classList.add("hidden");
  el.saveBio.classList.remove("hidden");
  el.userBio.focus();

  el.userBio.addEventListener("keydown", handleUserBioEnter);
  el.userBio.addEventListener("keydown", handleUserBioTyping);
  el.userBio.addEventListener("paste", handleUserBioPaste);

  el.saveBio.onclick = async function () {
    verifyBioLength();
  };
}

async function verifyBioLength() {
  if (el.userBio.innerText.trim().length > 0) {
    finalizedBio();
  } else {
    el.msgBioOk.classList.remove("hidden");
    el.msgBioOk.style.color = "red";
    el.msgBioOk.textContent = "Bio cannot be empty.";

    await delay(1500);
    el.msgBioOk.style.color = "#4caf50";
    el.msgBioOk.classList.add("hidden");
  }
}

async function completeTask(taskId) {
  if (!currentUser) throw new Error("User not found");
  try {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found");

    if (currentUser.completedTasks.includes(taskId)) {
      msgIsTaskComplete(task);
      return;
    }

    msgIsTaskComplete(task);

    currentUser.completedTasks.push(taskId);
    currentUser.addXP(task.rewardXP);
    currentUser.points += task.rewardPoints;

    await postToDatabase(`users/${currentUser.id}`, currentUser, "PUT");

    updateXPUI();
    updateTasksUI();

    el.userLevel.textContent = currentUser.level;
    el.userPoints.textContent = currentUser.points;
  } catch (error) {
    console.error("Error completing task:", error);
  }
}

function updateTasksUI() {
  if (!currentUser) return;

  // 1. Selecionamos todos os itens de tarefa que têm um data-task
  const taskElements = document.querySelectorAll(".task-item");

  taskElements.forEach((element, index) => {
    // Pegamos o ID da tarefa (Tarefa 01 = ID 1, etc)
    const taskId = index + 1;

    if (currentUser.completedTasks.includes(taskId)) {
      const dataTask = document.querySelector(`[data-task="${taskId}"]`);
      element.classList.add("completed");
      dataTask.classList.add("task-title");

      // Se houver um botão dentro, a gente desabilita ou esconde
      const btn = element.querySelector("button");
      if (btn) {
        btn.disabled = true;
        btn.style.display = "none";
      }
    }
  });
}

function updateXPUI() {
  if (!currentUser) return;

  // O limite é 100 (conforme seu HTML)
  const limit = 100;
  const percentage = Math.min((currentUser.xp / limit) * 100, 100);

  // Atualiza o texto e a largura da barra
  el.currentXp.textContent = currentUser.xp;
  el.xpBarFill.style.width = `${percentage}%`;

  el.userPoints.innerText = el.userPoints.innerText.replace(/\d/g, "**");
}

async function msgIsTaskComplete(infos) {
  if (!currentUser) return;

  el.msgBioOk.classList.remove("hidden");
  if (currentUser.completedTasks.includes(infos.id)) {
    el.msgBioOk.style.color = "orange";
    el.msgBioOk.textContent = `You have already completed the task "${infos.description}"!`;
  } else {
    el.msgBioOk.style.color = "#4caf50";
    el.msgBioOk.textContent = `🏅 Task "${infos.description}" completed! +${infos.rewardXP} XP, +${infos.rewardPoints} Points`;
  }

  await delay(3000);
  el.msgBioOk.classList.add("hidden");
}

async function checkDailyLogin() {
  if (!currentUser) return;
  const todayLogged = localStorage.getItem("dailyLogin");

  const today = new Date().toISOString().split("T")[0];

  const newLog = { type: "daily_login", date: today, xpReward: 20 };

  const alreadyLoggedToday = currentUser.logs?.some((log) => log.date === today);

  if (!alreadyLoggedToday) {
    if (!currentUser.logs) currentUser.logs = [];

    currentUser.logs.push(newLog);
    currentUser.addXP(newLog.xpReward);
    currentUser.points += 12;

    await delay(3000);
    el.msgBioOk.style.color = "#4caf50";
    el.msgBioOk.textContent = `Daily Login: +${newLog.xpReward} XP, +12 Points`;
    el.msgBioOk.classList.remove("hidden");

    await postToDatabase(`users/${currentUser.id}`, currentUser, "PUT");

    updateXPUI();

    await delay(3000);
    el.msgBioOk.classList.add("hidden");
  } else {
    if (todayLogged === today) return;

    if (currentUser.logs?.length >= 7) completeTask(3);

    el.msgBioOk.textContent = "✅ You've already claimed your XP for today, Chief!";
    el.msgBioOk.classList.remove("hidden");
    localStorage.setItem("dailyLogin", today);
    await delay(3000);
    el.msgBioOk.classList.add("hidden");
  }
}

export function curiousClick() {
  let countClick = Number(localStorage.getItem("curiousClick") || 0);
  let totalClicks = (countClick += 1);
  localStorage.setItem("curiousClick", totalClicks);

  if (countClick >= 7) {
    completeTask(4);
    localStorage.removeItem("curiousClick");
    return;
  }
}

// 1. Abre o Modal e atualiza os pontos na tela
export function openStore() {
  if (!currentUser) return;

  el.storeModal.classList.remove("hidden");
  document.querySelector("#storeUserPoints").textContent = currentUser.points;

  renderStoreItems();
}

export function closeStore() {
  el.storeModal.classList.add("hidden");
}

function renderStoreItems() {
  const container = document.querySelector("#storeItemsContainer");
  container.innerHTML = "";

  storeItems.forEach((item) => {
    const isOwned = currentUser.inventory?.includes(item.id);

    // Criamos o elemento div primeiro
    const itemDiv = document.createElement("div");
    itemDiv.className = "store-item";

    itemDiv.innerHTML = `
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
        <button 
          class="${isOwned ? "owned" : "buy-btn"}"
          ${isOwned ? "disabled" : ""}
        >
          ${isOwned ? "Owned" : item.price + " pts"}
        </button>
    `;

    // 2. AQUI A MÁGICA: Pegamos o botão e grudamos a função nele via JS
    const btn = itemDiv.querySelector("button");
    if (isOwned) {
      checkStoreOwnership();
    }

    if (!isOwned) {
      btn.addEventListener("click", () => buyItem(item.id));
    }

    container.appendChild(itemDiv);
  });
}

// 3. Processa a compra (O "Pulo do Gato")
async function buyItem(itemId) {
  const item = storeItems.find((i) => i.id === itemId);

  // Validação: Tem pontos?
  if (currentUser.points >= item.price) {
    currentUser.points -= item.price; // Tira os pontos

    // Inicializa o inventário se não existir e adiciona o item
    if (!currentUser.inventory) currentUser.inventory = [];
    currentUser.inventory.push(itemId);

    // Adicionar XP se for o booster
    if (itemId === "high_xp") {
      currentUser.addXP(500);
      el.userLevel.textContent = currentUser.level;
    }

    // Salva na API
    await postToDatabase(`users/${currentUser.id}`, currentUser, "PUT");

    // Atualiza a UI
    updateXPUI(); // Para atualizar os pontos no header
    openStore(); // Para atualizar o modal (botão virar "Owned")

    showToast(`Success! You bought ${item.name}!`, "success");
    playSound("success");
  } else {
    showToast("Not enough points, Boss!", "error");
    playSound("error");
  }
}

async function checkStoreOwnership() {
  if (!currentUser || !currentUser.inventory) return;

  if (currentUser.inventory.find((id) => id === "bg_colorfulMode")) {
    el.container.style.backgroundImage = "url('./imgs/game-bg.jpg')";
    el.container.style.backgroundSize = "cover";
    el.container.style.backgroundPosition = "center";
    el.container.style.backgroundRepeat = "no-repeat";
    el.body.classList.add("game-active-bg");
  }

  if (currentUser.inventory.find((id) => id === "golden_name")) {
    el.playerName.style.color = "gold";
    el.playerName.style.textShadow = "0 0 2px gold, 0 0 8px gold";
    el.playerName.style.letterSpacing = "1px";
    el.playerName.addEventListener("mouseover", () => {
      el.playerName.style.transform = "scale(1.4)";
      el.playerName.style.transition = "transform 0.3s ease";
    });
    el.playerName.addEventListener("mouseout", () => {
      el.playerName.style.transform = "scale(1)";
    });
  }
}
