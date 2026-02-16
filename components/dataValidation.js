export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|br)+$/;
  return emailRegex.test(email);
};

export const validateTel = (tel) => {
  const telephoneRegex = /^(\d{2})+(\d{9})$/;
  return telephoneRegex.test(tel);
};

// export const isFieldEmpty = (text) => {
//   if (!text || text.trim().length === 0) {
//     console.log(`❌ Error: fieldName cannot be empty!`);
//     return true;
//   }
//   return false;
// };

export const validatename = (name) => {
  const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
  return nameRegex.test(name);
};
