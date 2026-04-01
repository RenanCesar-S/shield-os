import {
  checkAuthentication,
  loginState,
  handleRegister,
  navigateTo,
  setupPasswordToggle,
  sendRecoveryInstructions,
  handleVerifyCode,
} from "./auth.js";
import { loadDashboardReport, searchUser, logoutAdmin, toggleLockedFilter } from "./dashboardAdmin.js";
import { changeBio, closeStore, curiousClick, logoutGame, openStore, toggleGamePointsVisibility } from "./game.js";

import * as el from "./ui-elements.js";

// --- EVENTOS DE AUTENTICAÇÃO ---
await checkAuthentication();

el.formLogin.addEventListener("submit", (e) => {
  e.preventDefault();
  loginState();
});
el.formRegister.addEventListener("submit", (e) => {
  e.preventDefault();
  handleRegister();
});

el.btnLogoutAdmin.addEventListener("click", logoutAdmin);
el.btnLogoutGame.addEventListener("click", logoutGame);
el.btnEmailRecovery.addEventListener("click", sendRecoveryInstructions);
el.btnFinishReset.addEventListener("click", (e) => {
  e.preventDefault();
  handleVerifyCode();
});

// --- EVENTOS DE GAME ---
el.editBio.addEventListener("click", changeBio);
el.btnCurious.addEventListener("click", curiousClick);
el.btnStore.addEventListener("click", openStore);
el.btnCloseStore.addEventListener("click", closeStore);

// --- EVENTOS DE DASHBOARD ---
el.btnOnlyLocked.addEventListener("click", toggleLockedFilter);

// Navegação entre telas
el.btnBackToLogin.addEventListener("click", () => {
  checkAuthentication();
  navigateTo("loginSection");
});
el.btnGoToRegister.addEventListener("click", () => {
  navigateTo("registerSection");
  el.errorLoginMsg.style.display = "none";
});
el.btnForgotPass.addEventListener("click", () => navigateTo("forgotSection"));
el.btnBackToLoginFromForgot.addEventListener("click", () => navigateTo("loginSection"));
el.btnBackToForgotFromReset.addEventListener("click", () => {
  localStorage.removeItem("reset-screen");
  localStorage.removeItem("email-sent");
  navigateTo("forgotSection");
});

// Tecla Enter nos campos
// el.iptPass.addEventListener("keydown", (e) => {
//   if (e.key === "Enter") loginState();
// });
// [el.regPass, el.regPassConfirm].forEach((iptPass) => {
//   iptPass.addEventListener("keydown", (e) => {
//     if (e.key === "Enter") handleRegister();
//   });
// });
// [el.iptNewPass, el.iptConfirmNewPass].forEach((iptPass) => {
//   iptPass.addEventListener("keydown", (e) => {
//     if (e.key === "Enter") handleVerifyCode();
//   });
// });

// --- EVENTOS DO DASHBOARD ---
el.btnLoadReport.addEventListener("click", loadDashboardReport);
el.iptSearch.addEventListener("input", searchUser);

// --- UTILITÁRIOS E UI ---

// Toggles de visibilidade de senha
el.eyeTogglePass.addEventListener("click", () => setupPasswordToggle("iptPass", "eyeVisible", "eyeNoVisible"));
el.eyeTogglePassRegister.addEventListener("click", () =>
  setupPasswordToggle("regPass", "regEyeVisible", "regEyeNoVisible"),
);
el.eyeTogglePassConfirmRegister.addEventListener("click", () =>
  setupPasswordToggle("regPassConfirm", "confirmEyeVisible", "confirmEyeNoVisible"),
);
el.eyeTogglePassReset.addEventListener("click", () =>
  setupPasswordToggle("iptNewPass", "resetEyeVisible", "resetNoEyeVisible"),
);
el.eyeTogglePassConfirmReset.addEventListener("click", () =>
  setupPasswordToggle("iptConfirmNewPass", "resetConfirmEyeVisible", "resetConfirmNoEyeVisible"),
);
el.eyeToggleGame.addEventListener("click", toggleGamePointsVisibility);

// Máscara de Telefone
el.regTel.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  value = value.substring(0, 11);
  if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  else if (value.length > 6) value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
  else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,4})$/, "($1) $2");
  else if (value.length > 0) value = value.replace(/^(\d{0,2})$/, "($1");
  e.target.value = value;
});

// Limpeza de erros ao digitar no registro
el.registerSection.addEventListener("input", (e) => {
  const field = e.target;
  if (field.tagName !== "INPUT") return;

  // Remove erro geral
  const generalError = el.btnBackToLogin.nextElementSibling;
  if (generalError?.classList.contains("error-msg")) generalError.remove();

  // Remove erro específico do campo
  let error = field.type === "password" ? field.closest(".passwordSec")?.nextElementSibling : field.nextElementSibling;

  if (error?.classList.contains("error-msg")) error.remove();
});
el.resetPassFinalSection.addEventListener("input", (e) => {
  const field = e.target;
  if (field.tagName !== "INPUT") return;

  // Remove erro específico do campo
  let error = field.type === "password" ? field.closest(".passwordSec")?.nextElementSibling : field.nextElementSibling;

  if (field.type === "text") error = field.closest(".email-field")?.nextElementSibling;

  if (error?.classList.contains("error-msg")) error.remove();
});
