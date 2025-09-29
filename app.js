const TASKS_PER_LEVEL = 8;
const LEVEL_KEYS = ["level1", "level2", "level3"];

const multiplicationData = (() => {
  const items = [];
  for (let a = 0; a <= 10; a += 1) {
    for (let b = 0; b <= 10; b += 1) {
      const product = a * b;
      const difficulty = product <= 30 ? "level1" : product <= 70 ? "level2" : "level3";
      items.push({
        question: `${a} × ${b}`,
        answer: product,
        difficulty,
      });
    }
  }
  return items;
})();

document.addEventListener("DOMContentLoaded", () => {
  const scoreValue = document.getElementById("scoreValue");
  const progressBar = document.querySelector(".progress-bar");
  const progressFill = document.getElementById("progressFill");
  const tabs = document.querySelectorAll(".level-tabs .tab");

  const levelConfig = {
    level1: document.getElementById("level1Tasks"),
    level2: document.getElementById("level2Tasks"),
    level3: document.getElementById("level3Tasks"),
  };

  let score = 0;
  let completed = 0;
  const totalTasks = TASKS_PER_LEVEL * LEVEL_KEYS.length;

  LEVEL_KEYS.forEach((key) => populateLevel(key, levelConfig[key]));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      if (!target) return;

      document.querySelectorAll(".level-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === target);
      });

      tabs.forEach((button) => button.classList.toggle("active", button === tab));
    });
  });

  function populateLevel(levelKey, container) {
    container.innerHTML = "";
    const filtered = multiplicationData.filter((item) => item.difficulty === levelKey);
    const tasks = shuffle(filtered).slice(0, TASKS_PER_LEVEL);

    tasks.forEach((task, index) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.dataset.answer = task.answer;

      const title = document.createElement("h3");
      title.textContent = `Zadanie ${index + 1}`;

      const question = document.createElement("p");
      question.textContent = `${task.question} = ?`;

      const input = document.createElement("input");
      input.type = "number";
      input.inputMode = "numeric";
      input.autocomplete = "off";
      input.placeholder = "Twoja odpowiedź";

      const checkButton = document.createElement("button");
      checkButton.type = "button";
      checkButton.textContent = "Sprawdź";

      checkButton.addEventListener("click", () => {
        const userAnswer = Number.parseInt(input.value, 10);
        const correctAnswer = Number(card.dataset.answer);

        if (Number.isNaN(userAnswer)) {
          card.classList.add("incorrect");
          card.classList.remove("correct");
          return;
        }

        if (userAnswer === correctAnswer) {
          if (!card.dataset.completed) {
            card.dataset.completed = "true";
            score += 10;
            completed += 1;
            updateScoreboard();
          }

          card.classList.add("correct");
          card.classList.remove("incorrect");
          checkButton.disabled = true;
          input.disabled = true;
        } else {
          card.classList.add("incorrect");
          card.classList.remove("correct");
        }
      });

      card.append(title, question, input, checkButton);
      container.appendChild(card);
    });
  }

  function updateScoreboard() {
    scoreValue.textContent = score;
    const percentage = Math.round((completed / totalTasks) * 100);
    progressFill.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", String(percentage));
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
});
