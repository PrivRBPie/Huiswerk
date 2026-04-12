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
  qDigitInput.focus();
}

function setFeedback(text, type = 'warn') {
  feedbackEl.textContent = text;
  feedbackEl.className = `feedback ${type}`;
}

function updatePrompt() {
  const digits = String(state.dividend).split('').map(Number);
  while (state.currentChunk < state.divisor && state.index < digits.length) {
    state.currentChunk = state.currentChunk * 10 + digits[state.index];
    state.index += 1;
    if (state.quotient.length) {
      state.quotient += '0';
    }
  }

  if (state.index > digits.length && state.currentChunk < state.divisor) {
    promptEl.textContent = `Klaar! Rest = ${state.currentChunk}`;
    quotientEl.textContent = state.quotient || '0';
    state.totalCorrect += 1;
    progressEl.textContent = `✅ Opgeloste sommen: ${state.totalCorrect} | Gebruikte hints: ${state.hintsUsed}`;
    setFeedback('Netjes! Tik op “Nieuwe som” voor de volgende.', 'ok');
    return;
  }

  state.expectedDigit = Math.floor(state.currentChunk / state.divisor);
  const guidance = Number(guidanceEl.value);
  state.guidance = guidance;

  if (guidance <= 2) {
    promptEl.textContent = `Werk met ${state.currentChunk}. Hoe vaak past ${state.divisor} hierin?`;
  } else {
    promptEl.textContent = 'Vul de volgende stap van de staartdeling in.';
  }
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
  });

  divisorEl.textContent = String(state.divisor);
  dividendEl.textContent = String(state.dividend);
  quotientEl.textContent = '?';
  setFeedback('Nieuwe som gestart. Begin met de eerste stap!', 'ok');
  resetStepFields();
  updatePrompt();
}

function checkStep() {
  const qDigit = Number(qDigitInput.value);
  const product = Number(productInput.value);
  const remainderStep = Number(remainderStepInput.value);

  if (Number.isNaN(qDigit) || Number.isNaN(product) || Number.isNaN(remainderStep)) {
    setFeedback('Vul quotiëntcijfer, tussenproduct en aftrekking in.', 'warn');
    return;
  }

  if (qDigit !== state.expectedDigit) {
    setFeedback(`Let op: ${state.divisor} past ${state.expectedDigit} keer in ${state.currentChunk}.`, 'warn');
    return;
  }

  const expectedProduct = state.expectedDigit * state.divisor;
  if (product !== expectedProduct) {
    setFeedback(`Je quotiënt klopt, maar het tussenproduct moet ${expectedProduct} zijn.`, 'warn');
    return;
  }

  const expectedRemainder = state.currentChunk - expectedProduct;
  if (remainderStep !== expectedRemainder) {
    setFeedback(`Aftrekking opnieuw: ${state.currentChunk} - ${expectedProduct} = ${expectedRemainder}.`, 'warn');
    return;
  }

  const digits = String(state.dividend).split('').map(Number);
  let nextChunk = expectedRemainder;

  if (state.index < digits.length) {
    const expectedBringDown = digits[state.index];
    const typedBringDown = Number(bringDownInput.value);

    if (Number.isNaN(typedBringDown)) {
      setFeedback('Je bent een stap vergeten: haal het volgende cijfer naar beneden.', 'warn');
      return;
    }

    if (typedBringDown !== expectedBringDown) {
      setFeedback(`Je haalt het verkeerde cijfer naar beneden. Het moet ${expectedBringDown} zijn.`, 'warn');
      return;
    }

    nextChunk = expectedRemainder * 10 + expectedBringDown;
    state.index += 1;
  } else {
    state.index += 1;
  }

  state.quotient += String(qDigit);
  quotientEl.textContent = state.quotient;
  state.currentChunk = nextChunk;
  state.stepsDone += 1;
  setFeedback('Top! Deze stap klopt.', 'ok');
  resetStepFields();
  updatePrompt();
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
});

setupKeypad();
startProblem();
