const TABLE_SIZE = 10;
const BLANK_FIELDS = 15;

document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("multiplicationTable");
  const message = document.getElementById("tableMessage");

  if (!table || !message) {
    return;
  }

  const blanks = generateBlankPositions(BLANK_FIELDS, TABLE_SIZE);
  let solved = 0;

  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const cornerHeader = document.createElement("th");
  cornerHeader.scope = "col";
  cornerHeader.textContent = "×";
  headerRow.appendChild(cornerHeader);

  for (let col = 1; col <= TABLE_SIZE; col += 1) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = col;
    headerRow.appendChild(th);
  }

  tableHead.appendChild(headerRow);
  table.appendChild(tableHead);

  const tbody = document.createElement("tbody");

  for (let row = 1; row <= TABLE_SIZE; row += 1) {
    const tr = document.createElement("tr");

    const rowHeader = document.createElement("th");
    rowHeader.scope = "row";
    rowHeader.textContent = row;
    tr.appendChild(rowHeader);

    for (let col = 1; col <= TABLE_SIZE; col += 1) {
      const td = document.createElement("td");
      const result = row * col;
      const key = `${row}-${col}`;

      if (blanks.has(key)) {
        const input = document.createElement("input");
        input.type = "number";
        input.inputMode = "numeric";
        input.autocomplete = "off";
        input.placeholder = "?";
        input.setAttribute("aria-label", `${row} razy ${col}`);
        input.dataset.answer = String(result);

        input.addEventListener("input", () => {
          evaluateInput(input, result);
        });

        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            evaluateInput(input, result);
          }
        });

        td.appendChild(input);
      } else {
        td.textContent = String(result);
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);

  function evaluateInput(input, expected) {
    if (input.disabled) {
      return;
    }

    const rawValue = input.value.trim();

    if (rawValue === "") {
      input.classList.remove("correct", "incorrect");
      return;
    }

    const numericValue = Number.parseInt(rawValue, 10);

    if (Number.isNaN(numericValue)) {
      input.classList.add("incorrect");
      input.classList.remove("correct");
      return;
    }

    if (numericValue === expected) {
      input.value = String(expected);
      input.classList.add("correct");
      input.classList.remove("incorrect");
      input.disabled = true;

      solved += 1;
      if (solved === blanks.size) {
        message.textContent = "Brawo! Uzupełniłeś całą tabliczkę mnożenia.";
        message.classList.add("active");
      }
    } else {
      input.classList.add("incorrect");
      input.classList.remove("correct");
    }
  }
});

function generateBlankPositions(blankCount, size) {
  const positions = new Set();

  while (positions.size < blankCount) {
    const row = Math.floor(Math.random() * size) + 1;
    const col = Math.floor(Math.random() * size) + 1;
    positions.add(`${row}-${col}`);
  }

  return positions;
}
