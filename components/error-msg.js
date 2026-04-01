export function errorMsg(elementRef, txtMsg) {
  const existingMsg = elementRef.nextElementSibling;
  if (existingMsg && existingMsg.classList.contains("error-msg")) {
    existingMsg.remove();
  }

  const msgP = document.createElement("p");
  msgP.classList.add("error-msg");
  msgP.style.display = "block";
  msgP.textContent = txtMsg;

  elementRef.after(msgP);
  return msgP;
}
