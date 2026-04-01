export const getLoginTimestamp = () =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date());

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const parseBrDate = (dateString) => {
  const brDate = dateString;

  const [datePart, timePart] = brDate.split(/,[ ]?/);
  const [day, month, year] = datePart.split("/");
  const isoFormattedStr = `${year}-${month}-${day}T${timePart}`;

  return new Date(isoFormattedStr);
};

export const sortLogsByDate = (logs, parseFn) => {
  const theLogs = [...logs];
  theLogs.sort((a, b) => parseFn(b.date) - parseFn(a.date));
  return theLogs;
};

export const filterLockedUsers = (usersList) => {
  if (!usersList || usersList.length === 0) return [];
  return usersList.filter((user) => user.Status?.includes("LOCKED"));
};

export const truncateUsername = (username) => {
  if (!username) return "Username not found";
  return username.length > 10 ? username.slice(0, 10) + "..." : username;
};

export const sortByFailures = (users) => {
  if (!users || users.length === 0) return [];
  return [...users].sort((a, b) => b["Password Failures"] - a["Password Failures"]);
};

export const calculateAverageLogins = (users) => {
  if (!users || users.length === 0) return 0;
  const totalLogins = users.reduce((acc, userLogin) => {
    acc += userLogin.Logins;
    return acc;
  }, 0);
  const averageLogins = totalLogins / users.length;
  return Number(averageLogins.toFixed(2));
};

export const sanitizeUsernames = (users) => {
  if (!users || users.length === 0) return [];

  return users.map((u) => ({
    ...u,
    Username: u.Username.trim().toLowerCase(),
  }));
};

export const findUserByUsername = (users, username) => {
  if (!users) return null;
  const userRegister = users.find((user) => user.Username === username);
  return userRegister;
};

export const hasLockedUser = (users) => {
  if (!users) return false;
  return users.some((user) => user.Status.includes("LOCKED"));
};

export const isDataComplete = (users) => {
  if (!users || users.length === 0) return false;
  return users.every((user) => user.Username && user.Username.trim() !== "");
};

export const getUniqueUseranes = (logs) => {
  if (!logs || logs.length === 0) return [];

  const allNames = logs.map((log) => log.username);

  const uniqueSet = new Set(allNames);
  return [...uniqueSet];
};

export const groupUsersByStatus = (users) => {
  if (!users) return {};

  return users.reduce((acc, user) => {
    const status = user.Status;

    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(user);
    return acc;
  }, {});
};

export function showToast(message, type = "success") {
  // 1. Garante que o container existe no HTML
  let container = document.querySelector("#notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
  }

  // 2. Cria o elemento do Toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✅" : "❌"}</span> ${message}`;

  container.appendChild(toast);

  // 3. Remove automaticamente após 3 segundos
  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

// Função para tocar sem travar
const sounds = {
  success: new Audio("./sounds/coin-sound.mp3"),
  levelUp: new Audio("./sounds/level-up-sound.mp3"),
};

export function playSound(name) {
  if (sounds[name]) {
    sounds[name].currentTime = 0; // Reinicia o som caso ele ainda esteja tocando
    sounds[name].play().catch((e) => console.warn("Interação do usuário necessária para áudio."));
  }
}
