export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|br)+$/;
  return emailRegex.test(email);
};

export const validateTel = (tel) => {
  const telephoneRegex = /^(\d{2})+(\d{9})$/;
  return telephoneRegex.test(tel);
};

export const isFieldEmpty = (array) => {
  const hasContent = array.some((text) => {
    return text && text.trim().length > 0;
  });

  return !hasContent;
};

export const validateName = (name) => {
  const nameRegex = /^\p{L}+(?:\s\p{L}+)+$/u;
  return nameRegex.test(name);
};

export function isPasswordStrong(newPassword, confirmPassword) {
  // if (newPassword === currentPassword) {
  //   console.log("⚠️ The new password cannot be identical to the current password.\n");
  //   return false;
  // }

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(newPassword);
  if (!newPassword || !passRegex) {
    return false;
  }

  if (newPassword !== confirmPassword) return false;

  return true;
}
