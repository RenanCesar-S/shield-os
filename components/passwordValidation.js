export function isPasswordStrong(currentPassword, newPassword) {
  if (newPassword === currentPassword) {
    console.log("⚠️ The new password cannot be identical to the current password.\n");
    return false;
  }

  if (!newPassword || newPassword.length < 6) {
    console.log("❌ Error: Password must be at least 6 characters long.");
    return false;
  }

  const hasNumber = /[0-9]/.test(newPassword);
  if (!hasNumber) {
    console.log("❌ Error: Password must contain at least one number.");
    return false;
  }

  const hasUpper = /[A-Z]/.test(newPassword);
  if (!hasUpper) {
    console.log("❌ Error: Password must contain at least one uppercase letter.");
    return false;
  }

  const hasLower = /[a-z]/.test(newPassword);
  if (!hasLower) {
    console.log("❌ Error: Password must contain at least one lowercase letter.");
    return false;
  }

  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  if (!hasSpecial) {
    console.log("❌ Error: Password must contain at least one special character.");
    return false;
  }

  return true;
}
