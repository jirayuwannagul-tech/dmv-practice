/* ── State ──────────────────────────────────────────────────── */
let questions    = [];
let currentIndex = 0;
let answers      = {};  // { questionId: choiceIndex }
let correctCount = 0;
let wrongCount   = 0;

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  questions = shuffleArray([...DMV_TESTS]);
  initUI();
  renderQuestion(0);
});

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── UI init ────────────────────────────────────────────────── */
function initUI() {
  const dotsEl = document.getElementById('question-dots');
  dotsEl.innerHTML = '';
  questions.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'q-dot';
    dot.textContent = i + 1;
    dot.setAttribute('aria-label', `ข้อที่ ${i + 1}`);
    dot.addEventListener('click', () => goToQuestion(i));
    dotsEl.appendChild(dot);
  });
}

/* ── Render ─────────────────────────────────────────────────── */
function renderQuestion(index) {
  currentIndex = index;
  const q     = questions[index];
  const total = questions.length;
  const pct   = Math.round(((index + 1) / total) * 100);

  document.getElementById('progress-fill').style.width  = pct + '%';
  document.getElementById('progress-label').textContent = `${index + 1} / ${total}`;
  document.getElementById('question-num-label').textContent = `คำถามที่ ${index + 1} จาก ${total}`;
  document.getElementById('question-text').textContent  = q.question;
  document.getElementById('exam-title').textContent     = `190 ข้อ`;

  renderQuestionMedia(q);
  renderChoices(q);
  hideFeedback();

  const alreadyAnswered = answers[q.id] !== undefined;
  if (alreadyAnswered) {
    showFeedbackForAnswered(q);
    lockChoices(q);
    showNextOrFinish(index, total);
  } else {
    document.getElementById('btn-next').style.display   = 'none';
    document.getElementById('btn-finish').style.display = 'none';
  }

  updateDots();
  updateScoreLabel();
}

function renderQuestionMedia(q) {
  const mediaEl = document.getElementById('question-media');
  mediaEl.innerHTML = '';
  mediaEl.classList.remove('has-media');
  if (!q.questionSign) return;
  mediaEl.appendChild(createTrafficSign(q.questionSign));
  mediaEl.classList.add('has-media');
}

function renderChoices(q) {
  const choicesEl = document.getElementById('choices-list');
  choicesEl.innerHTML = '';
  q.choices.forEach((text, ci) => {
    const item = document.createElement('label');
    item.className = 'choice-item';
    item.setAttribute('for', `choice-${ci}`);
    item.innerHTML = `
      <input type="radio" id="choice-${ci}" name="choice" value="${ci}">
      <span class="choice-radio"></span>
      <span class="choice-label">${text}</span>
    `;
    item.addEventListener('click', () => selectChoice(q, ci));
    choicesEl.appendChild(item);
  });
}

/* ── Choice selection with immediate feedback ───────────────── */
function selectChoice(q, choiceIndex) {
  if (answers[q.id] !== undefined) return;  // already answered

  answers[q.id] = choiceIndex;
  const isCorrect = choiceIndex === q.answer;

  if (isCorrect) {
    correctCount++;
  } else {
    wrongCount++;
  }

  lockChoices(q);
  showFeedbackForAnswered(q);
  updateDots();
  updateScoreLabel();
  showNextOrFinish(currentIndex, questions.length);
}

function lockChoices(q) {
  const items = document.querySelectorAll('.choice-item');
  items.forEach((item, ci) => {
    item.style.pointerEvents = 'none';
    const radio = item.querySelector('input[type="radio"]');
    if (radio) radio.checked = (ci === answers[q.id]);

    if (ci === q.answer) {
      item.classList.add('choice-correct');
    } else if (ci === answers[q.id] && answers[q.id] !== q.answer) {
      item.classList.add('choice-wrong');
    }
  });
}

function showFeedbackForAnswered(q) {
  const isCorrect = answers[q.id] === q.answer;
  const box = document.getElementById('feedback-box');
  const correctText = q.answerText || q.choices[q.answer];

  if (isCorrect) {
    box.className = 'practice-feedback feedback-correct';
    box.innerHTML = `<strong>✓ ถูกต้อง!</strong>`;
  } else {
    box.className = 'practice-feedback feedback-wrong';
    box.innerHTML = `<strong>✗ ผิด</strong> — เฉลย: <span class="feedback-answer">${correctText}</span>`;
  }
  box.style.display = 'block';
}

function hideFeedback() {
  const box = document.getElementById('feedback-box');
  box.style.display = 'none';
  box.className = 'practice-feedback';
}

function showNextOrFinish(index, total) {
  const isLast = index === total - 1;
  document.getElementById('btn-next').style.display   = isLast ? 'none' : 'inline-flex';
  document.getElementById('btn-finish').style.display = isLast ? 'inline-flex' : 'none';
}

/* ── Navigation ─────────────────────────────────────────────── */
function goToQuestion(index) {
  renderQuestion(index);
}

function nextQuestion() {
  if (currentIndex < questions.length - 1) {
    renderQuestion(currentIndex + 1);
  }
}

/* ── Dots ────────────────────────────────────────────────────── */
function updateDots() {
  document.querySelectorAll('.q-dot').forEach((dot, i) => {
    const q = questions[i];
    dot.classList.remove('active', 'answered', 'dot-correct', 'dot-wrong');

    if (i === currentIndex) {
      dot.classList.add('active');
    } else if (answers[q.id] !== undefined) {
      dot.classList.add(answers[q.id] === q.answer ? 'dot-correct' : 'dot-wrong');
    }
  });
}

function updateScoreLabel() {
  document.getElementById('score-label').textContent = `ถูก ${correctCount} | ผิด ${wrongCount}`;
}

/* ── Summary ────────────────────────────────────────────────── */
function showSummary() {
  document.getElementById('exam-area').style.display    = 'none';
  document.getElementById('summary-area').style.display = 'block';

  const total    = questions.length;
  const answered = Object.keys(answers).length;
  const score    = correctCount;
  const skipped  = total - answered;

  document.getElementById('summary-score').textContent       = score;
  document.getElementById('summary-total-score').textContent = total;
  document.getElementById('summary-correct').textContent     = correctCount;
  document.getElementById('summary-wrong').textContent       = wrongCount;
  document.getElementById('summary-skipped').textContent     = skipped;

  const tbody = document.getElementById('summary-tbody');
  tbody.innerHTML = '';
  questions.forEach((q, i) => {
    const hasAnswer = answers[q.id] !== undefined;
    const isCorrect = hasAnswer && answers[q.id] === q.answer;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${truncate(q.question, 55)}</td>
      <td>
        ${hasAnswer
          ? `<span class="badge-answered">${q.choices[answers[q.id]]}</span>`
          : '<span class="badge-skipped">ยังไม่ตอบ</span>'
        }
      </td>
      <td><span class="badge-answer">${q.answerText || q.choices[q.answer]}</span></td>
      <td>
        <span class="${isCorrect ? 'badge-correct' : 'badge-incorrect'}">
          ${isCorrect ? 'ถูก' : 'ผิด'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ── Restart ─────────────────────────────────────────────────── */
function restartPractice() {
  questions    = shuffleArray([...DMV_TESTS]);
  currentIndex = 0;
  answers      = {};
  correctCount = 0;
  wrongCount   = 0;

  document.getElementById('summary-area').style.display = 'none';
  document.getElementById('exam-area').style.display    = 'block';
  initUI();
  renderQuestion(0);
}

/* ── Helpers ─────────────────────────────────────────────────── */
function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/* ── Traffic sign SVG ────────────────────────────────────────── */
function createTrafficSign(sign) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'traffic-sign');
  svg.setAttribute('viewBox', '0 0 220 160');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', sign.label || sign.text || 'traffic sign');

  const shape     = sign.shape     || 'rectangle';
  const fill      = sign.fill      || '#ffffff';
  const stroke    = sign.stroke    || '#111827';
  const textColor = sign.textColor || '#111827';

  if (shape === 'stop') {
    appendPolygon(svg, '110,12 158,32 178,80 158,128 110,148 62,128 42,80 62,32', fill, stroke, 5);
  } else if (shape === 'yield') {
    appendPolygon(svg, '110,140 28,24 192,24', fill, stroke, 5);
    appendPolygon(svg, '110,116 58,42 162,42', '#ffffff', '#ffffff', 0);
  } else if (shape === 'diamond') {
    appendPolygon(svg, '110,12 196,80 110,148 24,80', fill, stroke, 4);
  } else if (shape === 'pentagon') {
    appendPolygon(svg, '110,12 186,70 158,148 62,148 34,70', fill, stroke, 4);
  } else if (shape === 'circle-slash') {
    appendCircle(svg, 110, 80, 58, fill, stroke, 5);
    appendLine(svg, 72, 118, 148, 42, stroke, 8);
  } else if (shape === 'railroad') {
    appendCircle(svg, 110, 80, 62, fill, stroke, 5);
    appendLine(svg, 66, 124, 154, 36, stroke, 8);
    appendLine(svg, 66, 36, 154, 124, stroke, 8);
  } else {
    appendRect(svg, 36, 24, 148, 112, 8, fill, stroke, 4);
  }

  const lines    = Array.isArray(sign.lines) ? sign.lines : String(sign.text || '').split('\n');
  const fontSize = sign.fontSize || (lines.length > 3 ? 19 : 23);
  const startY   = 80 - ((lines.length - 1) * fontSize * 0.62);
  lines.forEach((line, i) => {
    appendText(svg, line, 110, startY + (i * fontSize * 1.18), fontSize, textColor);
  });

  return svg;
}

function appendRect(svg, x, y, width, height, radius, fill, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  el.setAttribute('x', x);           el.setAttribute('y', y);
  el.setAttribute('width', width);   el.setAttribute('height', height);
  el.setAttribute('rx', radius);     el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(el);
}
function appendPolygon(svg, points, fill, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  el.setAttribute('points', points); el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(el);
}
function appendCircle(svg, cx, cy, r, fill, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttribute('cx', cx); el.setAttribute('cy', cy); el.setAttribute('r', r);
  el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(el);
}
function appendLine(svg, x1, y1, x2, y2, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('x1', x1); el.setAttribute('y1', y1);
  el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', strokeWidth);
  el.setAttribute('stroke-linecap', 'round');
  svg.appendChild(el);
}
function appendText(svg, value, x, y, fontSize, fill) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x); el.setAttribute('y', y);
  el.setAttribute('font-size', fontSize); el.setAttribute('fill', fill);
  el.textContent = value;
  svg.appendChild(el);
}
