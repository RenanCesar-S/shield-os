import { playSound, showToast } from "./utils.js";

export class User {
  constructor({
    fullName,
    username,
    password,
    email,
    telephone,
    id = null,
    xp = 0,
    level = 1,
    points = 0,
    sessionToken = "",
    bio = "",
    createdAt = new Date().toISOString(),
    completedTasks = [],
    logs = [],
    inventory = [],
    status = "active",
  }) {
    this.id = id;
    this.fullName = fullName;
    this.username = username;
    this.password = password;
    this.telephone = telephone;
    this.email = email;
    this.points = points;
    this.xp = xp;
    this.level = level;
    this.sessionToken = sessionToken;
    this.bio = bio;
    this.createdAt = createdAt;
    this.completedTasks = completedTasks || [];
    this.logs = logs || [];
    this.inventory = inventory || [];
    this.status = status || "active";
  }

  checkPassword(inputPass) {
    return this.password === inputPass;
  }

  addXP(amount) {
    const XP_PER_LEVEL = 100;
    this.xp += amount;

    while (this.xp >= XP_PER_LEVEL) {
      this.xp -= XP_PER_LEVEL;
      this.level++;
      this.points += 36;

      showToast(`✨ Level Up! Welcome to level ${this.level}, Boss!`, "success");
      playSound("levelUp");
    }
  }
}
