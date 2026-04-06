// --- 🌐 GLOBAL & LAYOUT ---
export const container = document.querySelector("#container");
export const views = document.querySelectorAll(".view");
export const loader = document.querySelector("#loader");
export const body = document.querySelector("#body");

// --- 🔑 LOGIN SECTION ---
export const loginSection = document.querySelector("#loginSection");
export const formLogin = document.querySelector("#formLogin");
export const iptUser = document.querySelector("#iptUser");
export const iptPass = document.querySelector("#iptPass");
export const btnLogin = document.querySelector("#btnLogin");
export const eyeTogglePass = document.querySelector("#togglePass");
export const checkRemeberMe = document.querySelector("#checkRemeberMe");
export const errorLoginMsg = document.querySelector("#errorLogin");
export const loaderLogin = document.querySelector("#loaderLogin");
export const btnGoToRegister = document.querySelector("#btnGoToRegister");
export const btnForgotPass = document.querySelector("#btnForgotPass");

// --- 📝 REGISTER SECTION ---
export const registerSection = document.querySelector("#registerSection");
export const formRegister = document.querySelector("#formRegister");
export const regFullName = document.querySelector("#regFullName");
export const regUser = document.querySelector("#regUser");
export const regEmail = document.querySelector("#regEmail");
export const regTel = document.querySelector("#regTel");
export const regPass = document.querySelector("#regPass");
export const regPassConfirm = document.querySelector("#regPassConfirm");
export const regEyeVisible = document.querySelector("#regEyeVisible");
export const regEyeNoVisible = document.querySelector("#regEyeNoVisible");
export const confirmEyeVisible = document.querySelector("#confirmEyeVisible");
export const confirmEyeNoVisible = document.querySelector("#confirmEyeNoVisible");
export const btnDoRegister = document.querySelector("#btnDoRegister");
export const btnBackToLogin = document.querySelector("#btnBackToLogin");
export const regSuccessMsg = document.querySelector("#regSuccess");
export const loaderRegister = document.querySelector("#loaderRegister");
export const eyeTogglePassRegister = document.querySelector("#togglePassRegister");
export const eyeTogglePassConfirmRegister = document.querySelector("#togglePassConfirmRegister");

// --- 📊 DASHBOARD SECTION ---
export const dashboardAdminSection = document.querySelector("#dashboardAdminSection");
export const dashboardArea = document.querySelector("#dashboardArea");
export const welcomeMsg = document.querySelector("#welcomeMsg");
export const btnLogoutAdmin = document.querySelector("#btnLogoutAdmin");
export const btnLoadReport = document.querySelector("#btnLoadReport");
export const btnLoadLogs = document.querySelector("#btnLoadLogs");
export const btnOnlyLocked = document.querySelector("#btnFilterLocked");
export const iptSearch = document.querySelector("#iptSearch");
export const statsContainer = document.querySelector("#statsContainer");
export const totalUsers = document.querySelector("#statTotal");
export const totalLocked = document.querySelector("#statLocked");
export const alertBanner = document.querySelector("#alertBanner");
export const inventoryModal = document.querySelector("#inventoryModal");
export const Deletemodal = document.getElementById("deleteModal");
export const nameSpan = document.getElementById("deleteUserName");

// --- 🔓 FORGOT & RESET PASSWORD ---
export const formReset = document.querySelector("#formReset");
export const resetPassFinalSection = document.querySelector("#resetPassFinalSection");
export const btnEmailRecovery = document.querySelector("#btnEmailRecovery");
export const btnBackToLoginFromForgot = document.querySelector("#btnBackToLoginFromForgot");
export const btnBackToForgotFromReset = document.querySelector("#btnBackToForgotFromReset");
export const btnFinishReset = document.querySelector("#btnFinishReset");
export const iptForgot = document.querySelector("#emailForgot");
export const iptResetCode = document.querySelector("#iptResetCode");
export const iptNewPass = document.querySelector("#iptNewPass");
export const iptConfirmNewPass = document.querySelector("#iptConfirmNewPass");
export const forgotSection = document.querySelector("#forgotSection");
export const loaderReset = document.querySelector("#loaderReset");
export const loaderReset2 = document.querySelector("#loaderReset2");
export const eyeTogglePassReset = document.querySelector("#togglePassReset");
export const eyeTogglePassConfirmReset = document.querySelector("#togglePassConfirmReset");
export const emailSent = document.querySelector("#emailSent");

// --- 🎮 GAME SECTION ---
export const gameSection = document.querySelector("#dashboardGameSection");
export const playerName = document.querySelector("#playerName");
export const userLevel = document.querySelector("#userLevel");
export const eyeToggleGame = document.querySelector("#toggleGamePts");
export const userPoints = document.querySelector("#userPoints");
export const gameEyeVisible = document.querySelector("#gameEyeVisible");
export const gameNoEyeVisible = document.querySelector("#gameNoEyeVisible");
export const btnLogoutGame = document.querySelector("#btnLogoutGame");
export const userBio = document.querySelector("#userBio");
export const saveBio = document.querySelector("#saveBio");
export const editBio = document.querySelector("#editBio");
export const msgBioOk = document.querySelector("#msgBioOk");
export const currentXp = document.querySelector("#currentXp");
export const nextLevelXp = document.querySelector("#nextLevelXp");
export const xpBarFill = document.querySelector("#xpBarFill");
export const btnCurious = document.querySelector("#btnCurious");
export const storeModal = document.querySelector("#storeModal");
export const btnStore = document.querySelector("#btnStore");
export const btnCloseStore = document.querySelector("#btnCloseStore");

// -- Token --
export const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
