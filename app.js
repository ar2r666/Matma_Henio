const TASKS_PER_LEVEL = 10;
const LEVEL_KEYS = ["level1", "level2", "level3"];

const multiplicationData = (() => {
  const items = [];
  for (let a = 1; a <= 10; a += 1) {
    for (let b = 1; b <= 10; b += 1) {
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

  const levelState = LEVEL_KEYS.reduce((acc, key) => {
    acc[key] = { solved: 0 };
    return acc;
  }, {});

  let score = 0;
  let completed = 0;
  const totalTasks = TASKS_PER_LEVEL * LEVEL_KEYS.length;

  LEVEL_KEYS.forEach((key) => populateLevel(key, levelConfig[key]));
  updateScoreboard();

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.disabled) return;
      activateTab(tab);
    });
  });

  function activateTab(tab) {
    const target = tab.dataset.target;
    if (!target) return;

    document.querySelectorAll(".level-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === target);
    });

    tabs.forEach((button) => button.classList.toggle("active", button === tab));
  }

  function populateLevel(levelKey, container) {
    container.innerHTML = "";
    const filtered = multiplicationData.filter((item) => item.difficulty === levelKey);
    const tasks = shuffle(filtered).slice(0, TASKS_PER_LEVEL);

    tasks.forEach((task, index) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.dataset.answer = task.answer;
      card.dataset.level = levelKey;

      const title = document.createElement("h3");
      title.textContent = `Zadanie ${index + 1}`;

      const question = document.createElement("p");
      question.textContent = `${task.question} = ?`;

      const input = document.createElement("input");
      input.type = "number";
      input.inputMode = "numeric";
      input.autocomplete = "off";
      input.placeholder = "Twoja odpowiedź";

      input.addEventListener("input", () => {
        evaluateAnswer(levelKey, card, input);
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          evaluateAnswer(levelKey, card, input);
        }
      });

      card.append(title, question, input);
      container.appendChild(card);
    });
  }

  function updateScoreboard() {
    scoreValue.textContent = score;
    const percentage = Math.round((completed / totalTasks) * 100);
    progressFill.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", String(percentage));
  }

  function evaluateAnswer(levelKey, card, input) {
    if (input.disabled) return;

    const rawValue = input.value.trim();
    if (rawValue === "") {
      card.classList.remove("correct", "incorrect");
      return;
    }

    const userAnswer = Number.parseInt(rawValue, 10);
    const correctAnswer = Number(card.dataset.answer);

    if (Number.isNaN(userAnswer)) {
      card.classList.add("incorrect");
      card.classList.remove("correct");
      return;
    }

    if (userAnswer === correctAnswer) {
      markTaskAsCompleted(levelKey, card, input, correctAnswer);
    } else {
      card.classList.add("incorrect");
      card.classList.remove("correct");
    }
  }

  function markTaskAsCompleted(levelKey, card, input, correctAnswer) {
    card.classList.add("correct");
    card.classList.remove("incorrect");
    input.value = String(correctAnswer);
    input.disabled = true;

    if (!card.dataset.completed) {
      card.dataset.completed = "true";
      score += 10;
      completed += 1;
      levelState[levelKey].solved += 1;
      updateScoreboard();
      handleLevelCompletion(levelKey);
    }
  }

  function handleLevelCompletion(levelKey) {
    if (levelState[levelKey].solved !== TASKS_PER_LEVEL) {
      return;
    }

    const panel = document.getElementById(levelKey);
    const messageContainer = panel?.querySelector(".completion-area");
    if (!messageContainer) return;

    messageContainer.innerHTML = "";
    const message = document.createElement("p");

    const nextIndex = LEVEL_KEYS.indexOf(levelKey) + 1;
    const nextLevelKey = LEVEL_KEYS[nextIndex];
    const nextTab = nextLevelKey
      ? document.querySelector(`.level-tabs .tab[data-target="${nextLevelKey}"]`)
      : null;

    if (nextTab) {
      nextTab.disabled = false;
      message.textContent = "Gratulacje! Wszystkie zadania wykonane. Możesz przejść do kolejnego poziomu.";
      messageContainer.appendChild(message);

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.textContent = `Przejdź do ${nextTab.textContent}`;
      nextButton.addEventListener("click", () => {
        activateTab(nextTab);
        nextButton.blur();
      });
      messageContainer.appendChild(nextButton);
    } else {
      message.textContent =
        "Gratulacje! Ukończyłeś Poziom trzeci i wszystkie zadania w grze.";
      messageContainer.appendChild(message);

      const nextStageInfo = document.createElement("p");
      nextStageInfo.textContent =
        "Możesz przejść do kolejnego etapu: Wyzwania z tabliczką mnożenia.";
      messageContainer.appendChild(nextStageInfo);

      const tableChallengeLink = document.createElement("a");
      tableChallengeLink.href = "tabliczka.html";
      tableChallengeLink.className = "button-link";
      tableChallengeLink.textContent = "Rozpocznij wyzwanie";
      messageContainer.appendChild(tableChallengeLink);
    }

    messageContainer.classList.add("active");
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
