const state = {
  divisor: 4,
  dividend: 132,
  quotient: '',
  workNumber: 0,
  index: 0,
  currentChunk: 0,
  expectedDigit: 0,
  stepsDone: 0,
  guidance: 2,
  hintsUsed: 0,
  totalCorrect: 0,
  sheetRows: [],
  currentRow: 0,
};

const divisorEl = document.getElementById('divisor');
const dividendEl = document.getElementById('dividend');
const quotientEl = document.getElementById('quotient-right');
const promptEl = document.getElementById('step-prompt');
const feedbackEl = document.getElementById('feedback');
const progressEl = document.getElementById('progress');

const qDigitInput = document.getElementById('q-digit');
const productInput = document.getElementById('product');
const remainderStepInput = document.getElementById('remainder-step');
const bringDownInput = document.getElementById('bring-down');

const difficultyEl = document.getElementById('difficulty');
const guidanceEl = document.getElementById('guidance');
const divisionSheetEl = document.getElementById('division-sheet');


function buildClassicSteps(dividend, divisor) {
  const digits = String(dividend).split('').map(Number);
  let remainder = 0;
  let started = false;
  const steps = [];

  for (let i = 0; i < digits.length; i += 1) {
    const current = remainder * 10 + digits[i];
    const qDigit = Math.floor(current / divisor);

    if (qDigit > 0 || started || i === digits.length - 1) {
      started = true;
      const product = qDigit * divisor;
      steps.push({
        endIndex: i,
        current,
        product,
      });
      remainder = current - product;
    } else {
      remainder = current;
    }
  }

  return {
    digits,
    quotient: Math.floor(dividend / divisor).toString(),
    steps,
    remainder,
  };
}

function toWorkRow(value, endIndex, workCols) {
  const row = Array(workCols).fill('');
  String(value).split('').forEach((digit, idx, arr) => {
    row[endIndex - (arr.length - 1 - idx)] = digit;
  });
  return row;
}

function renderClassicDivision() {
  const model = buildClassicSteps(state.dividend, state.divisor);
  const quotientCols = Math.max(3, String(state.dividend).length + 1);
  const workCols = model.digits.length;
  const totalCols = 2 + workCols + 1 + quotientCols;

  const rows = [];
  const header = Array(totalCols).fill('');
  header[0] = String(state.divisor);
  header[1] = '/';
  model.digits.forEach((digit, idx) => {
    header[2 + idx] = String(digit);
  });
  header[2 + workCols] = '\\';
  const qStart = 3 + workCols;
  String(model.quotient).split('').forEach((digit, idx) => {
    header[qStart + idx] = digit;
  });
  rows.push({ cells: header, work: false });

  const expectedRows = [];
  const renderedWorkRows = [];

  model.steps.forEach((step, stepIndex) => {
    if (stepIndex > 0) {
      expectedRows.push(toWorkRow(step.current, step.endIndex, workCols));
    }
    expectedRows.push(toWorkRow(step.product, step.endIndex, workCols));
  });
  expectedRows.push(toWorkRow(model.remainder, model.digits.length - 1, workCols));

  expectedRows.forEach((workRow, idx) => {
    const row = Array(totalCols).fill('');
    workRow.forEach((digit, col) => {
      row[2 + col] = digit;
    });
    renderedWorkRows.push({ cells: row, work: true, rowIndex: idx });
    if (idx < expectedRows.length - 1) {
      renderedWorkRows.push({ cells: Array(totalCols).fill(''), work: true, separator: true });
    }
  });

  rows.push(...renderedWorkRows);
  state.sheetRows = expectedRows;

  divisionSheetEl.innerHTML = rows
    .map((row) => {
      const cells = row.cells
        .map((value, colIndex) => {
          const isWorkCell = row.work && colIndex >= 2 && colIndex < 2 + workCols;
          const className = isWorkCell ? 'work' : (value === '/' || value === '\\' ? 'symbol' : '');
          if (!isWorkCell) {
            return `<td class="${className}">${value}</td>`;
          }

          if (row.separator) {
            return `<td class="${className}"></td>`;
          }

          const col = colIndex - 2;
          const solved = row.rowIndex < state.currentRow;
          const active = row.rowIndex === state.currentRow;
          const userValue = solved ? state.sheetRows[row.rowIndex][col] : '';
          return `<td class="${className}"><input class="sheet-input" data-row="${row.rowIndex}" data-col="${col}" maxlength="1" value="${userValue}" ${active ? '' : 'disabled'} /></td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const firstActive = divisionSheetEl.querySelector('input.sheet-input:not([disabled])');
  if (firstActive) {
    firstActive.focus();
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(level) {
  if (level === 'easy') {
    return { divisor: randomInt(2, 9), dividend: randomInt(40, 399) };
  }
  if (level === 'hard') {
    return { divisor: randomInt(2, 9), dividend: randomInt(300, 1999) };
  }
  return { divisor: randomInt(2, 9), dividend: randomInt(100, 999) };
}

function resetStepFields() {
  qDigitInput.value = '';
  productInput.value = '';
  remainderStepInput.value = '';
  bringDownInput.value = '';
}

function setFeedback(text, type = 'warn') {
  feedbackEl.textContent = text;
  feedbackEl.className = `feedback ${type}`;
}

function updatePrompt() {
  if (state.currentRow >= state.sheetRows.length) {
    promptEl.textContent = 'Klaar! Alle rijen zijn correct ingevuld.';
    return;
  }

  promptEl.textContent = `Vul rij ${state.currentRow + 1} in en klik op “Controleer rij”.`;
}

function startProblem() {
  const generated = generateProblem(difficultyEl.value);
  Object.assign(state, {
    ...generated,
    quotient: '',
    workNumber: generated.dividend,
    index: 0,
    currentChunk: 0,
    expectedDigit: 0,
    stepsDone: 0,
    sheetRows: [],
    currentRow: 0,
  });

  divisorEl.textContent = String(state.divisor);
  dividendEl.textContent = String(state.dividend);
  quotientEl.textContent = '?';
  setFeedback('Nieuwe som gestart. Begin met de eerste stap!', 'ok');
  resetStepFields();
  updatePrompt();
  renderClassicDivision();
}

function checkStep() {
  if (state.currentRow >= state.sheetRows.length) {
    setFeedback('Alles is al ingevuld. Kies “Nieuwe som”.', 'ok');
    return;
  }

  const expectedRow = state.sheetRows[state.currentRow];
  const rowInputs = Array.from(divisionSheetEl.querySelectorAll(`input.sheet-input[data-row="${state.currentRow}"]`));

  if (!rowInputs.length) {
    setFeedback('Kon de actieve rij niet vinden. Start een nieuwe som.', 'warn');
    return;
  }

  const typedRow = rowInputs.map((input) => input.value.trim());
  const hasMissing = expectedRow.some((digit, idx) => digit && !typedRow[idx]);
  if (hasMissing) {
    setFeedback('Vul eerst alle benodigde vakjes in deze rij in.', 'warn');
    return;
  }

  const mismatchIndex = expectedRow.findIndex((digit, idx) => (digit || '') !== (typedRow[idx] || ''));
  if (mismatchIndex !== -1) {
    setFeedback(`Rij ${state.currentRow + 1} klopt nog niet. Controleer kolom ${mismatchIndex + 1}.`, 'warn');
    return;
  }

  state.currentRow += 1;
  if (state.currentRow >= state.sheetRows.length) {
    state.totalCorrect += 1;
    progressEl.textContent = `✅ Opgeloste sommen: ${state.totalCorrect} | Gebruikte hints: ${state.hintsUsed}`;
    setFeedback('Perfect! Alle rijen zijn correct.', 'ok');
  } else {
    setFeedback(`Top! Rij ${state.currentRow} is goed.`, 'ok');
  }

  updatePrompt();
  renderClassicDivision();
}

function showHint() {
  state.hintsUsed += 1;
  const level = state.guidance;

  if (level === 1) {
    setFeedback(`Hint: denk aan ${state.currentChunk} ÷ ${state.divisor}. Start met grootste veelvoud onder ${state.currentChunk}.`, 'ok');
    return;
  }

  if (level === 2) {
    setFeedback(`Hint: probeer tafels van ${state.divisor} rond ${state.currentChunk}.`, 'ok');
    return;
  }

  if (level === 3) {
    setFeedback('Hint: controleer je volgorde: delen, vermenigvuldigen, aftrekken, naar beneden halen.', 'ok');
    return;
  }

  setFeedback('Lichte hint: controleer of je quotiëntcijfer niet te groot is.', 'ok');
}

function setupSheetInputHandlers() {
  divisionSheetEl.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains('sheet-input')) {
      return;
    }

    target.value = target.value.replace(/\D/g, '').slice(0, 1);
    if (!target.value) return;

    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    const next = divisionSheetEl.querySelector(`input.sheet-input[data-row="${row}"][data-col="${col + 1}"]`);
    if (next && !next.disabled) {
      next.focus();
    }
  });
}

function setupKeypad() {
  const keys = document.getElementById('keys');
  const labels = ['1','2','3','4','5','6','7','8','9','⌫','0','➡️'];

  labels.forEach((label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      const active = document.activeElement;
      const editable = active && active.tagName === 'INPUT';
      if (!editable) return;

      if (label === '⌫') {
        active.value = active.value.slice(0, -1);
      } else if (label === '➡️') {
        const order = [qDigitInput, productInput, remainderStepInput, bringDownInput];
        const idx = order.indexOf(active);
        order[(idx + 1) % order.length].focus();
      } else if (active.value.length < Number(active.maxLength || 99)) {
        active.value += label;
      }
    });
    keys.appendChild(btn);
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // geen blokkade als SW niet kan registreren
    });
  });
}

document.getElementById('new-problem').addEventListener('click', startProblem);
document.getElementById('check-step').addEventListener('click', checkStep);
document.getElementById('hint').addEventListener('click', showHint);
guidanceEl.addEventListener('change', () => {
  state.guidance = Number(guidanceEl.value);
  updatePrompt();
  renderClassicDivision();
});

setupKeypad();
setupSheetInputHandlers();
startProblem();
