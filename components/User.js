import { getLoginTimestamp } from "./utils.js";


export class User {
  constructor(name, username, userPass, email, tel) {
    this.name = name;
    this.username = username;
    this.password = userPass;
    this.email = email;
    this.tel = tel;
    this.createdAt = getLoginTimestamp();
  }

  checkPassword(inputPass) {
    return this.password === inputPass;
  }
}
