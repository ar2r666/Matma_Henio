const TASKS_PER_LEVEL = 10;
const TASK_LEVELS = ["level1", "level2"];

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
  const tabOrder = Array.from(tabs).map((tab) => tab.dataset.target);

  const levelConfig = {
    level1: document.getElementById("level1Tasks"),
    level2: document.getElementById("level2Tasks"),
  };

  const levelTaskCounts = {};

  const taskState = TASK_LEVELS.reduce((acc, key) => {
    acc[key] = { solved: 0 };
    return acc;
  }, {});

  let score = 0;
  let completed = 0;
  let totalTasks = 0;

  TASK_LEVELS.forEach((key) => {
    const count = populateLevel(key, levelConfig[key]);
    levelTaskCounts[key] = count;
    totalTasks += count;
  });
  updateScoreboard();

  setupEggGame();

  const initialHash = window.location.hash?.toLowerCase() ?? "";
  if (["#gra", "#game", "#gamelevel"].includes(initialHash)) {
    const gameTab = document.querySelector('.level-tabs .tab[data-target="gameLevel"]');
    if (gameTab) {
      gameTab.disabled = false;
      activateTab(gameTab);
    }
  }

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

    document.dispatchEvent(
      new CustomEvent("level-change", {
        detail: { target },
      })
    );
  }

  function populateLevel(levelKey, container) {
    if (!container) {
      return 0;
    }

    container.innerHTML = "";

    const filtered = multiplicationData.filter((item) => item.difficulty === levelKey);
    const availableTasks = Math.min(filtered.length, TASKS_PER_LEVEL);
    const tasks = shuffle(filtered).slice(0, availableTasks);

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

    return availableTasks;
  }

  function updateScoreboard() {
    scoreValue.textContent = score;
    const percentage = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);
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
      taskState[levelKey].solved += 1;
      updateScoreboard();
      handleLevelCompletion(levelKey);
    }
  }

  function handleLevelCompletion(levelKey) {
    if (taskState[levelKey].solved !== levelTaskCounts[levelKey]) {
      return;
    }

    const panel = document.getElementById(levelKey);
    const messageContainer = panel?.querySelector(".completion-area");
    if (!messageContainer) return;

    messageContainer.innerHTML = "";
    const message = document.createElement("p");

    const currentIndex = tabOrder.indexOf(levelKey);
    const nextLevelKey = currentIndex >= 0 ? tabOrder[currentIndex + 1] : undefined;
    const nextTab = nextLevelKey
      ? document.querySelector(`.level-tabs .tab[data-target="${nextLevelKey}"]`)
      : null;

    if (nextTab) {
      nextTab.disabled = false;
      const isGame = nextLevelKey === "gameLevel";
      message.textContent = isGame
        ? "Gratulacje! Wszystkie zadania wykonane. Czas na finałową grę."
        : "Gratulacje! Wszystkie zadania wykonane. Możesz przejść do kolejnego poziomu.";
      messageContainer.appendChild(message);

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      const nextLabel = nextTab.textContent?.trim() ?? "kolejnego poziomu";
      nextButton.textContent = isGame ? "Przejdź do gry" : `Przejdź do ${nextLabel}`;
      nextButton.addEventListener("click", () => {
        activateTab(nextTab);
        nextButton.blur();
      });
      messageContainer.appendChild(nextButton);
    } else {
      message.textContent = "Gratulacje! Ukończyłeś wszystkie zadania w grze.";
      messageContainer.appendChild(message);

      const tableChallengeLink = document.createElement("a");
      tableChallengeLink.href = "tabliczka.html";
      tableChallengeLink.className = "button-link";
      tableChallengeLink.textContent = "Spróbuj wyzwania z tabliczką mnożenia";
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

  function setupEggGame() {
    const gameArea = document.getElementById("gameArea");
    const catcher = document.getElementById("catcher");
    const actionLabel = document.getElementById("gameAction");
    const scoreLabel = document.getElementById("gameScore");
    const summary = document.getElementById("gameSummary");

    if (!gameArea || !catcher || !actionLabel || !scoreLabel || !summary) {
      return;
    }

    let animationFrame = 0;
    let movementDirection = 0;
    let catcherX = 0;
    let areaWidth = 0;
    let areaHeight = 0;
    let catcherWidth = 0;
    let catcherHeight = 0;
    let gameScore = 0;
    let roundFinished = false;
    let eggs = [];
    let isActive = false;
    let hasStarted = false;
    let roundTimer = 0;

    const MAX_SCORE = 10;
    const CATCHER_SPEED = 6;

    const keyDirections = new Map([
      ["ArrowLeft", -1],
      ["ArrowRight", 1],
      ["a", -1],
      ["A", -1],
      ["d", 1],
      ["D", 1],
    ]);

    syncDimensions();
    window.addEventListener("resize", syncDimensions);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("level-change", handleLevelChange);
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(syncDimensions) : null;
    resizeObserver?.observe(gameArea);
    animationFrame = requestAnimationFrame(update);

    function resetGame() {
      cancelAnimationFrame(animationFrame);
      removeEggs();
      clearTimeout(roundTimer);
      gameScore = 0;
      scoreLabel.textContent = String(gameScore);
      summary.classList.remove("active");
      summary.innerHTML = "";
      roundFinished = false;
      syncDimensions();
      actionLabel.textContent = "Start!";
      roundTimer = window.setTimeout(() => {
        if (isActive && document.body.contains(gameArea)) {
          startRound();
        }
      }, 400);
      animationFrame = requestAnimationFrame(update);
    }

    function syncDimensions() {
      areaWidth = gameArea.clientWidth;
      areaHeight = gameArea.clientHeight;
      catcherWidth = catcher.offsetWidth;
      catcherHeight = catcher.offsetHeight;
      catcherX = clamp((areaWidth - catcherWidth) / 2, 0, Math.max(areaWidth - catcherWidth, 0));
      updateCatcherPosition();
    }

    function startRound() {
      roundFinished = false;
      removeEggs();
      const { factorA, factorB, answer, options } = createChallenge();
      actionLabel.textContent = `${factorA} × ${factorB} = ?`;
      eggs = options.map((value, index) => createEgg(value, value === answer, index));
    }

    function createChallenge() {
      const factorA = Math.floor(Math.random() * 9) + 2;
      const factorB = Math.floor(Math.random() * 9) + 2;
      const answer = factorA * factorB;
      const options = new Set([answer]);

      while (options.size < 3) {
        const delta = Math.floor(Math.random() * 9) + 1;
        const sign = Math.random() < 0.5 ? -1 : 1;
        const proposal = answer + sign * delta;
        if (proposal > 0) {
          options.add(proposal);
        }
      }

      const shuffled = shuffle(Array.from(options));
      return { factorA, factorB, answer, options: shuffled };
    }

    function createEgg(value, isCorrect, slotIndex) {
      const egg = document.createElement("div");
      egg.className = "egg";
      egg.dataset.type = isCorrect ? "correct" : "incorrect";
      egg.textContent = value;
      gameArea.appendChild(egg);

      const spacing = areaWidth / 4;
      const positions = [spacing, spacing * 2, spacing * 3];
      const x = positions[slotIndex % positions.length];
      const y = -60;
      const speed = 2.5 + Math.random() * 1.8;

      egg.style.left = `${x}px`;
      egg.style.top = `${y}px`;

      return {
        element: egg,
        x,
        y,
        speed,
        value,
        isCorrect,
        caught: false,
      };
    }

    function removeEggs() {
      eggs.forEach((egg) => {
        egg.element.remove();
      });
      eggs = [];
    }

    function handleKeyDown(event) {
      if (!keyDirections.has(event.key)) return;
      movementDirection = keyDirections.get(event.key) ?? 0;
      event.preventDefault();
    }

    function handleKeyUp(event) {
      if (!keyDirections.has(event.key)) return;
      const releasedDirection = keyDirections.get(event.key) ?? 0;
      if (movementDirection === releasedDirection) {
        movementDirection = 0;
      }
    }

    function update() {
      catcherX = clamp(catcherX + movementDirection * CATCHER_SPEED, 0, Math.max(areaWidth - catcherWidth, 0));
      updateCatcherPosition();

      if (isActive && !roundFinished) {
        eggs.forEach((egg) => {
          if (egg.caught) return;
          egg.y += egg.speed;
          egg.element.style.top = `${egg.y}px`;

          const bottom = egg.y + egg.element.offsetHeight / 2;
          const catcherTop = areaHeight - catcherHeight;
          if (bottom >= catcherTop) {
            const eggLeft = egg.x - egg.element.offsetWidth / 2;
            const eggRight = egg.x + egg.element.offsetWidth / 2;
            const catcherLeft = catcherX;
            const catcherRight = catcherX + catcherWidth;

            if (eggRight >= catcherLeft && eggLeft <= catcherRight) {
              egg.caught = true;
              resolveCatch(egg.isCorrect);
            } else if (bottom >= areaHeight) {
              egg.caught = true;
              resolveMiss(egg.isCorrect);
            }
          }
        });
      }

      animationFrame = requestAnimationFrame(update);
    }

    function resolveCatch(isCorrect) {
      if (roundFinished) return;
      if (isCorrect) {
        gameScore = Math.min(MAX_SCORE, gameScore + 1);
      } else {
        gameScore -= 1;
      }
      scoreLabel.textContent = String(gameScore);
      endRound();
    }

    function resolveMiss(isCorrect) {
      if (roundFinished) return;
      if (isCorrect) {
        gameScore -= 1;
        scoreLabel.textContent = String(gameScore);
      }
      endRound();
    }

    function endRound() {
      roundFinished = true;
      if (gameScore >= MAX_SCORE) {
        finishGame();
      } else {
        clearTimeout(roundTimer);
        roundTimer = window.setTimeout(() => {
          if (isActive && document.body.contains(gameArea)) {
            startRound();
          }
        }, 700);
      }
    }

    function finishGame() {
      actionLabel.textContent = "Brawo!";
      summary.innerHTML = "";
      const text = document.createElement("p");
      text.textContent = "Zdobyłeś 10 punktów! Doskonała celność.";
      summary.appendChild(text);

      const restartButton = document.createElement("button");
      restartButton.type = "button";
      restartButton.textContent = "Zagraj ponownie";
      restartButton.addEventListener("click", resetGame);
      summary.appendChild(restartButton);

      const tableLink = document.createElement("a");
      tableLink.href = "tabliczka.html";
      tableLink.className = "button-link";
      tableLink.textContent = "Wróć do tabliczki mnożenia";
      summary.appendChild(tableLink);

      summary.classList.add("active");
      clearTimeout(roundTimer);
      removeEggs();
    }

    function updateCatcherPosition() {
      catcher.style.left = `${catcherX}px`;
    }

    function handleLevelChange(event) {
      const target = event.detail?.target;
      const active = target === "gameLevel";
      isActive = active;
      if (!active) {
        clearTimeout(roundTimer);
      }
      if (active && !hasStarted) {
        hasStarted = true;
        resetGame();
      }
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  }
});