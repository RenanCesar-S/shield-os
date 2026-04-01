import { EMAILJS_CONFIG } from "../env.js";
import { delay } from "./utils.js";
import { validateEmail, validateTel, validateName, isFieldEmpty, isPasswordStrong } from "./dataValidation.js";
import { errorMsg } from "./error-msg.js";
import { User } from "./User.js";
import { initGame } from "./game.js";
import { loadFromDatabase, postToDatabase } from "../databases/database.js";

import * as el from "./ui-elements.js";

emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export async function checkAuthentication() {
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  const loggedID = localStorage.getItem("userID");
  const loggedUsername = localStorage.getItem("userName");
  const rememberedUser = localStorage.getItem("remember-username");
  const isLocked = Number(localStorage.getItem("lockUntil"));
  const isRemember = rememberedUser !== null;
  const isResetScreen = localStorage.getItem("reset-screen");
  const isEmailSent = localStorage.getItem("email-sent");
  const attempts = Number(localStorage.getItem("loginAttempts"));

  localStorage.removeItem("isFiltered"); // Limpa o estado do filtro a cada nova autenticação

  if (isAuthenticated) {
    if (loggedUsername === "admin") {
      initAdmin(loggedID);
    } else {
      await initGame(loggedID);

      el.loginSection.style.display = "none";
      el.gameSection.style.display = "flex"; // Tela de JOGO
    }
  }

  if (isRemember) {
    el.iptUser.value = rememberedUser;
    el.checkRemeberMe.checked = true;
  }

  if (isLocked && isLocked > Date.now()) {
    const secondsLeft = Math.ceil((isLocked - Date.now()) / 1000);
    startCountdown(secondsLeft);
  } else {
    localStorage.removeItem("lockUntil");
    el.btnLogin.disabled = false;

    if (attempts > 0 && attempts < 3) {
      // Use o seu maxLoginAttempts aqui
      el.errorLoginMsg.style.display = "block";
      el.errorLoginMsg.textContent = `Invalid login. (${attempts}/3)`;
    } else if (attempts >= 3 && lockUntil <= Date.now()) {
      // Se ele já estourou as 3 mas o tempo acabou, aí sim limpamos as tentativas
      localStorage.removeItem("loginAttempts");
      el.errorLoginMsg.style.display = "none";
    }
  }

  if (isResetScreen) {
    el.loginSection.style.display = "none";
    el.resetPassFinalSection.style.display = "flex";
  } else {
    localStorage.removeItem("reset-screen");
    el.resetPassFinalSection.style.display = "none";
  }

  if (isEmailSent) {
    el.emailSent.textContent = isEmailSent;
  } else {
    localStorage.removeItem("email-sent");
    el.emailSent.textContent = "";
  }
}

export function validateUsername(username, isRegistration = false) {
  const userRegex = /^[a-zA-Z\d]{3,10}$/;
  const adminRegex = /admin/i;

  if (!userRegex.test(username)) {
    return { isValid: false, message: "Use 3-10 characters (letters/numbers)." };
  }

  if (isRegistration && adminRegex.test(username)) {
    return { isValid: false, message: "The word 'admin' is reserved." };
  }

  return { isValid: true, message: "" };
}

export async function loginState() {
  const lockUntil = Number(localStorage.getItem("lockUntil"));
  const maxLoginAttempts = 3;
  const lockTime = 1000 * 30;

  if (lockUntil > 0) {
    if (Date.now() < lockUntil) {
      return;
    }
  }

  let iptUserValue = el.iptUser.value.trim();
  let iptPassValue = el.iptPass.value;
  const userStatus = validateUsername(iptUserValue, false);

  el.errorLoginMsg.style.display = "none";

  if (!userStatus.isValid) {
    el.errorLoginMsg.textContent = "Username must be 3-10 letters only!";
    el.errorLoginMsg.style.display = "block";
    return;
  }

  if (iptPassValue.length === 0) {
    el.errorLoginMsg.textContent = "Password can not be empty";
    el.errorLoginMsg.style.display = "block";
    return;
  }

  try {
    el.loaderLogin.classList.remove("hidden");
    await delay(500);

    const users = await loadFromDatabase("users");

    const foundUser = users.find((u) => u.username === iptUserValue);

    if (foundUser && foundUser.checkPassword(iptPassValue)) {
      if (foundUser.status === "blocked") {
        el.errorLoginMsg.textContent = "Your account is locked. Please contact support.";
        el.errorLoginMsg.style.display = "block";
        return;
      }

      const newToken = el.newToken;
      if (foundUser.sessionToken.length === 0 || foundUser.sessionToken === "") {
        localStorage.setItem("sessionToken", `firstLogin${newToken}`);
        await postToDatabase(`users/${foundUser.id}`, { sessionToken: `firstLogin${newToken}` }, "PUT");
      } else {
        await postToDatabase(`users/${foundUser.id}`, { sessionToken: newToken }, "PUT");
        localStorage.setItem("sessionToken", newToken);
      }

      localStorage.setItem("authenticated", true);
      localStorage.setItem("userID", foundUser.id);
      localStorage.setItem("userName", foundUser.username);
      localStorage.removeItem("lockUntil");
      localStorage.removeItem("loginAttempts");
      el.loginSection.style.display = "none";
      rememberMe();
      await checkAuthentication();

      if (foundUser.username === "admin") {
        initAdmin();
        return;
      }

      await initGame(foundUser.id);
      el.gameSection.style.display = "flex";
    } else {
      const loginAttempts = Number(localStorage.getItem("loginAttempts"));
      let newAttempts = loginAttempts + 1;
      localStorage.setItem("loginAttempts", newAttempts);

      if (newAttempts >= maxLoginAttempts) {
        localStorage.setItem("lockUntil", Date.now() + lockTime);
        const timeRemaining = Math.ceil((Date.now() + lockTime - Date.now()) / 1000);
        startCountdown(timeRemaining);
      } else {
        el.errorLoginMsg.textContent = `Invalid login. (${newAttempts}/${maxLoginAttempts})`;
      }
      el.errorLoginMsg.style.display = "block";
    }
  } catch (error) {
    el.errorLoginMsg.textContent = "Login failed, the server is not responding.";
    el.errorLoginMsg.style.display = "block";
    console.error("Critical Failure:", error);
  } finally {
    el.loaderLogin.classList.add("hidden");
  }
}

function initAdmin() {
  resetRegisterForm();
  navigateTo("dashboardAdminSection");
  el.container.classList.add("container-for-dashboard");
}

export function setupPasswordToggle(inputId, visibleEyeId, noVisibleEyeId) {
  const input = document.getElementById(inputId);
  const eyeVis = document.getElementById(visibleEyeId);
  const eyeNoVis = document.getElementById(noVisibleEyeId);

  const isPasswordType = input.type === "password";

  if (isPasswordType) {
    eyeVis.classList.add("hiddenEye");
    eyeNoVis.classList.remove("hiddenEye");
    input.type = "text";
  } else {
    eyeVis.classList.remove("hiddenEye");
    eyeNoVis.classList.add("hiddenEye");
    input.type = "password";
  }
}

export function navigateTo(targetId) {
  el.views.forEach((view) => (view.style.display = "none"));

  const target = document.getElementById(targetId);
  if (target) {
    target.style.display = "flex";
  }
}

export async function handleRegister() {
  const regPassSec = document.querySelector("#regPassSec");
  const regConfirmPassSec = document.querySelector("#regConfirmPassSec");
  document.querySelectorAll(".error-msg").forEach((msg) => msg.remove());

  const fullName = el.regFullName.value;
  const username = el.regUser.value.trim();
  const email = el.regEmail.value.trim();
  const telephone = el.regTel.value.replace(/\D/g, "");
  const password = el.regPass.value;
  const confirmPassword = el.regPassConfirm.value;

  const userStatus = validateUsername(username, true);

  if (isFieldEmpty([fullName, username, email, telephone, password, confirmPassword])) {
    errorMsg(el.btnBackToLogin, "Please complete the form before submitting.");
    return;
  } else if (!validateName(fullName)) {
    errorMsg(el.regFullName, "Please enter your full name.");
    return;
  } else if (!userStatus.isValid) {
    errorMsg(el.regUser, userStatus.message);
    return;
  } else if (!validateEmail(email)) {
    errorMsg(el.regEmail, "Please enter a valid email address.");
    return;
  } else if (!validateTel(telephone)) {
    errorMsg(el.regTel, "Please enter a valid phone number.");
    return;
  } else if (!isPasswordStrong(password, password)) {
    errorMsg(regPassSec, "Please choose a strong password with letters, numbers, and symbols");
    return;
  } else if (!isPasswordStrong(password, confirmPassword)) {
    errorMsg(regConfirmPassSec, "Passwords do not match");
    return;
  }

  try {
    el.loaderRegister.classList.remove("hidden");

    el.btnBackToLogin.style.display = "none";
    el.btnDoRegister.style.display = "none";

    const currentUsers = await loadFromDatabase("users");

    const duplicate = currentUsers.find(
      (u) => u.username === username || u.email === email || u.telephone === telephone,
    );

    if (duplicate) {
      resetUI();
      if (duplicate.username === username) return errorMsg(el.regUser, "Username taken.");
      if (duplicate.email === email) return errorMsg(el.regEmail, "Email registered.");
      if (duplicate.telephone === telephone) return errorMsg(el.regTel, "Phone in use.");
    }

    if (!currentUsers || currentUsers.length === 0) {
      errorMsg(el.btnBackToLogin, "Something went wrong. Please try again later.");
      resetUI();
      return;
    }
    el.regSuccessMsg.style.display = "block";
    el.errorLoginMsg.style.display = "none";

    const createdUser = new User({ fullName, username, password, email, telephone });
    await postToDatabase("users", createdUser);

    el.iptUser.value = username;
    await delay(1000);
    resetRegisterForm();
    navigateTo("loginSection");
  } catch (error) {
    resetUI();
    errorMsg(el.btnBackToLogin, "Error during registration.");
    console.log("Registration failed:", error);
  } finally {
    el.loaderRegister.classList.add("hidden");
  }
}

function resetUI() {
  el.btnBackToLogin.style.display = "block";
  el.btnDoRegister.style.display = "block";
  el.loaderRegister.classList.add("hidden");
}

function resetRegisterForm() {
  const inputs = [el.regFullName, el.regUser, el.regEmail, el.regTel, el.regPass, el.regPassConfirm];
  inputs.forEach((i) => (i.value = ""));
  const eyeIcons = [el.regEyeVisible, el.confirmEyeVisible];
  const eyeNoIcons = [el.regEyeNoVisible, el.confirmEyeNoVisible];
  const passInputs = [el.regPass, el.regPassConfirm];

  eyeIcons.forEach((eye) => eye.classList.remove("hiddenEye"));
  eyeNoIcons.forEach((noEye) => noEye.classList.add("hiddenEye"));
  passInputs.forEach((ipt) => (ipt.type = "password"));
  el.regPass.type = "password";
  el.regPassConfirm.type = "password";
  el.iptPass.value = "";
  el.regSuccessMsg.style.display = "none";
  el.btnBackToLogin.style.display = "block";
  el.btnDoRegister.style.display = "block";
}

export async function sendRecoveryInstructions() {
  const erroMsg = document.querySelector(".error-msg");
  if (erroMsg) erroMsg.remove();
  const iptForgotEmail = el.iptForgot.value.trim();

  if (!validateEmail(iptForgotEmail)) {
    errorMsg(el.btnEmailRecovery, "Please enter a valid email address.");
    return;
  }

  try {
    el.loaderReset.classList.remove("hidden");

    const users = await loadFromDatabase("users");

    if (!users || users.length === 0) {
      errorMsg(el.btnEmailRecovery, "Data service is temporarily unavailable");
      return;
    }

    const foundedUser = users.find((u) => u.email === iptForgotEmail);
    await delay(1000);

    if (!foundedUser) {
      errorMsg(el.btnEmailRecovery, "We couldn't find an account with that email");
      return;
    }

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    const templateParams = {
      from_name: "RCSLog Recovery",
      user_name: foundedUser.fullName,
      recovery_code: recoveryCode,
      email: foundedUser.email,
    };

    const response = await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);

    if (response.status === 200) {
      const recoveryData = {
        email: foundedUser.email,
        code: recoveryCode,
        userId: foundedUser.id,
        createdAt: Math.floor(Date.now() / 1000),
        used: false,
      };

      await postToDatabase("recoveries", recoveryData);
    } else {
      throw new Error("EmailJS failed to send message");
    }

    navigateTo("resetPassFinalSection");
    localStorage.setItem("reset-screen", true);
    localStorage.setItem("email-sent", iptForgotEmail);
    el.iptForgot.value = "";
    el.emailSent.textContent = iptForgotEmail;

    const generalError = el.btnEmailRecovery.nextElementSibling;
    if (generalError?.classList.contains("error-msg")) generalError.remove();
  } catch (error) {
    errorMsg(el.btnEmailRecovery, "Unable to connect to the server. Please try again later.");
    console.error("Critical Failure:", error);
  } finally {
    el.loaderReset.classList.add("hidden");
  }
}

export async function handleVerifyCode() {
  const erroMsg = document.querySelector(".error-msg");
  if (erroMsg) erroMsg.remove();

  const newPassSec = document.querySelector("#passwordResetSec");
  const confirmPassSec = document.querySelector("#passwordConfirmResetSec");

  const emailRecovery = localStorage.getItem("email-sent");
  const recoveries = await loadFromDatabase("recoveries");

  if (!recoveries || recoveries.length === 0) {
    errorMsg(el.btnFinishReset, "Data service is temporarily unavailable");
    return;
  }

  const userToRecovery = [...recoveries].reverse().find((u) => u.email === emailRecovery && !u.used);

  if (!userToRecovery) {
    errorMsg(el.btnFinishReset, "No valid recovery session found.");
    return;
  }

  const maxTimeRec = 15 * 60 * 1000;
  const timeNow = new Date().getTime();
  const createdAtMs = Number(userToRecovery.createdAt) * 1000;
  const emailTimer = timeNow - createdAtMs;

  if (emailTimer > maxTimeRec) {
    errorMsg(el.btnFinishReset, "Your password reset link has expired.");
    return;
  }

  try {
    el.loaderReset2.classList.remove("hidden");

    const iptCodeValue = el.iptResetCode.value.trim();
    const newPassValue = el.iptNewPass.value.trim();
    const confirmNewPassValue = el.iptConfirmNewPass.value.trim();
    const divEmailField = el.iptResetCode.closest(".email-field");

    if (iptCodeValue !== userToRecovery.code) {
      errorMsg(divEmailField, "Invalid verification code.");
      return;
    }

    if (!isPasswordStrong(newPassValue, newPassValue)) {
      errorMsg(newPassSec, "Please choose a strong password with letters, numbers, and symbols");
      return;
    } else if (!isPasswordStrong(newPassValue, confirmNewPassValue)) {
      errorMsg(confirmPassSec, "Passwords do not match");
      return;
    }

    const recoveryResponse = await postToDatabase(`recoveries/${userToRecovery.id}`, { used: true }, "PUT");

    if (!recoveryResponse) throw new Error("Failed to invalidate recovery code");

    const userResponse = await postToDatabase(`users/${userToRecovery.userId}`, { password: newPassValue }, "PUT");

    if (!userResponse) throw new Error("Failed to update password");

    el.iptResetCode.value = "";
    el.iptNewPass.value = "";
    el.iptConfirmNewPass.value = "";

    localStorage.removeItem("email-sent");
    localStorage.removeItem("reset-screen");

    navigateTo("loginSection");
  } catch (error) {
    errorMsg(el.btnFinishReset, "Unable to connect to the server. Please try again later.");
    console.error("Critical Failure:", error);
  } finally {
    el.loaderReset2.classList.add("hidden");
  }
}

export function rememberMe() {
  if (el.checkRemeberMe.checked && el.iptUser.value) {
    localStorage.setItem("remember-username", el.iptUser.value);
  } else {
    localStorage.removeItem("remember-username");
  }
}

export function startCountdown(durationInSeconds) {
  el.btnLogin.disabled = true;
  el.errorLoginMsg.style.display = "block";
  el.errorLoginMsg.textContent = `Security limit reached. Wait ${durationInSeconds}s.`;

  const timer = setInterval(() => {
    durationInSeconds--;
    el.errorLoginMsg.textContent = `Security limit reached. Wait ${durationInSeconds}s.`;

    if (durationInSeconds <= 0) {
      clearInterval(timer);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lockUntil");
      el.errorLoginMsg.style.display = "none";
      el.btnLogin.disabled = false;
    }
  }, 1000);
  return timer;
}
