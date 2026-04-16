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
  currentStep: 0,
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
const sheetStepLabelEl = document.getElementById('sheet-step-label');


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
        qDigit,
        product,
        remainder: current - product,
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

function renderClassicDivision() {
  const model = buildClassicSteps(state.dividend, state.divisor);
  const dividendDisplay = model.digits.join(' · ');

  const quotientBoxes = model.steps
    .map((step, idx) => {
      if (idx < state.currentStep) {
        return `<span class="box filled">${step.qDigit}</span>`;
      }
      if (idx === state.currentStep) {
        return '<input class="sheet-input box active" data-type="quotient" maxlength="1" />';
      }
      return '<span class="box"></span>';
    })
    .join('');

  const workRows = model.steps
    .map((step, idx) => {
      const showStep = idx <= state.currentStep;
      const product = showStep ? String(step.product).split('').map((d) => `<span class="box filled">${d}</span>`).join('') : '<span class="box"></span><span class="box"></span>';

      let remainder;
      if (idx < state.currentStep) {
        remainder = String(step.remainder).split('').map((d) => `<span class="box filled">${d}</span>`).join('');
      } else if (idx === state.currentStep) {
        remainder = '<input class="sheet-input box active" data-type="remainder" maxlength="1" />';
      } else {
        remainder = '<span class="box"></span>';
      }

      return `
        <div class="work-step">
          <div class="work-row minus">- <div class="boxes">${product}</div></div>
          <div class="work-line"></div>
          <div class="work-row"><div class="boxes">${remainder}</div></div>
        </div>
      `;
    })
    .join('');

  divisionSheetEl.innerHTML = `
    <div class="division-visual">
      <div class="quotient-row">${quotientBoxes}</div>
      <div class="main-row">
        <span class="divisor-visual">${state.divisor}</span>
        <span class="bracket">)</span>
        <span class="dividend-visual">${dividendDisplay}</span>
      </div>
      <div class="top-line"></div>
      ${workRows}
    </div>
  `;

  const firstActive = divisionSheetEl.querySelector('input.sheet-input');
  if (firstActive) firstActive.focus();
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
  const model = buildClassicSteps(state.dividend, state.divisor);
  if (state.currentStep >= model.steps.length) {
    promptEl.textContent = 'Klaar! Alle stappen zijn correct ingevuld.';
    sheetStepLabelEl.textContent = `STEP ${model.steps.length}`;
    return;
  }

  promptEl.textContent = `Stap ${state.currentStep + 1}: vul het quotiëntcijfer en de rest in, daarna “Controleer rij”.`;
  sheetStepLabelEl.textContent = `STEP ${state.currentStep + 1}`;
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
    currentStep: 0,
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
  const model = buildClassicSteps(state.dividend, state.divisor);
  if (state.currentStep >= model.steps.length) {
    setFeedback('Alles is al ingevuld. Kies “Nieuwe som”.', 'ok');
    return;
  }

  const qInput = divisionSheetEl.querySelector('input.sheet-input[data-type="quotient"]');
  const rInput = divisionSheetEl.querySelector('input.sheet-input[data-type="remainder"]');

  if (!qInput || !rInput) {
    setFeedback('Kon de actieve velden niet vinden. Start een nieuwe som.', 'warn');
    return;
  }

  const typedQ = qInput.value.trim();
  const typedR = rInput.value.trim();
  if (!typedQ || !typedR) {
    setFeedback('Vul beide rode velden in voor deze stap.', 'warn');
    return;
  }

  const expected = model.steps[state.currentStep];
  if (Number(typedQ) !== expected.qDigit) {
    setFeedback(`Quotiëntcijfer klopt niet. Voor stap ${state.currentStep + 1} moet dit ${expected.qDigit} zijn.`, 'warn');
    return;
  }

  if (Number(typedR) !== expected.remainder) {
    setFeedback(`Rest klopt niet. Voor stap ${state.currentStep + 1} moet dit ${expected.remainder} zijn.`, 'warn');
    return;
  }

  state.currentStep += 1;
  if (state.currentStep >= model.steps.length) {
    state.totalCorrect += 1;
    progressEl.textContent = `✅ Opgeloste sommen: ${state.totalCorrect} | Gebruikte hints: ${state.hintsUsed}`;
    setFeedback('Perfect! Alle stappen zijn correct.', 'ok');
  } else {
    setFeedback(`Top! Stap ${state.currentStep} is goed.`, 'ok');
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

    if (target.dataset.type === 'quotient') {
      const remainderInput = divisionSheetEl.querySelector('input.sheet-input[data-type="remainder"]');
      if (remainderInput) remainderInput.focus();
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
