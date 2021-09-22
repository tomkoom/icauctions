import { icauctions } from "../../declarations/icauctions";

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  // Interact with icauctions actor, calling the greet method
  const greeting = await icauctions.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
