import { assertEquals } from "./assertEqualsFunc.js";

function startCountdown(durationInSeconds, element = null) {
  const timer = setInterval(() => {
    durationInSeconds--;

    // Só mexe no HTML se o elemento for passado
    if (element) {
      element.textContent = `Wait ${durationInSeconds}s.`;
    } else {
      console.log(`Testing: ${durationInSeconds}s`);
    }

    if (durationInSeconds <= 0) {
      clearInterval(timer);
      if (element) element.style.display = "none";
    }
  }, 1000);

  return timer;
}

// TESTE
const time = startCountdown(20);
// Usando !! para evitar a estrutura circular no JSON.stringify
assertEquals(!!time, true, "Should return a valid timer object/id");

// IMPORTANTE: Como o teste acaba, mas o setInterval continua rodando no fundo,
// é boa prática dar um clearInterval no final do seu arquivo de teste:
clearInterval(time);
