/**
 * exam.js — Logic สำหรับหน้าทำข้อสอบ (exam.html)
 */

/* ── State ─────────────────────────────────────────────────── */
let testNumber   = 1;
let questions    = [];
let currentIndex = 0;
let answers      = {};   // { questionId: choiceIndex }

/* ── Bootstrap ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  testNumber = parseInt(params.get('test'), 10) || 1;

  if (testNumber < 1 || testNumber > 12) {
    window.location.href = 'index.html';
    return;
  }

  questions = getTestQuestions(testNumber);

  if (!questions.length) {
    window.location.href = 'index.html';
    return;
  }

  initUI();
  renderQuestion(0);
});

/* ── UI init ────────────────────────────────────────────────── */
function initUI() {
  // header labels
  document.getElementById('exam-label').textContent    = 'ชุดข้อสอบ';
  document.getElementById('exam-title').textContent    = `ชุดที่ ${testNumber}`;
  document.title = `DMV — ชุดที่ ${testNumber}`;

  // build question dots
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

  // nav buttons
  document.getElementById('btn-prev').addEventListener('click', prevQuestion);
  document.getElementById('btn-next').addEventListener('click', nextQuestion);
  document.getElementById('btn-submit').addEventListener('click', submitExam);
}

/* ── Render question ────────────────────────────────────────── */
function renderQuestion(index) {
  currentIndex = index;
  const q = questions[index];
  const total = questions.length;

  // progress bar & label
  const pct = Math.round(((index + 1) / total) * 100);
  document.getElementById('progress-fill').style.width  = pct + '%';
  document.getElementById('progress-label').textContent = `${index + 1} / ${total}`;

  // question heading
  document.getElementById('question-num-label').textContent =
    `คำถามที่ ${index + 1} จาก ${total}`;

  // question text
  document.getElementById('question-text').textContent = q.question;
  renderQuestionMedia(q);

  // choices
  const choicesEl = document.getElementById('choices-list');
  choicesEl.innerHTML = '';
  q.choices.forEach((text, ci) => {
    const item = document.createElement('label');
    item.className = 'choice-item' + (answers[q.id] === ci ? ' selected' : '');
    item.setAttribute('for', `choice-${ci}`);

    item.innerHTML = `
      <input type="radio" id="choice-${ci}" name="choice"
        value="${ci}" ${answers[q.id] === ci ? 'checked' : ''}>
      <span class="choice-radio"></span>
      <span class="choice-label">${text}</span>
    `;

    item.addEventListener('click', () => selectChoice(q.id, ci));
    choicesEl.appendChild(item);
  });

  // dots
  updateDots();

  // nav buttons
  document.getElementById('btn-prev').disabled = index === 0;
  updateNextButton();
}

function renderQuestionMedia(q) {
  const mediaEl = document.getElementById('question-media');
  mediaEl.innerHTML = '';
  mediaEl.classList.remove('has-media');

  if (!q.questionSign) return;

  mediaEl.appendChild(createTrafficSign(q.questionSign));
  mediaEl.classList.add('has-media');
}

function createTrafficSign(sign) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'traffic-sign');
  svg.setAttribute('viewBox', '0 0 220 160');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', sign.label || sign.text || 'traffic sign');

  const shape = sign.shape || 'rectangle';
  const fill = sign.fill || '#ffffff';
  const stroke = sign.stroke || '#111827';
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

  const lines = Array.isArray(sign.lines) ? sign.lines : String(sign.text || '').split('\n');
  const fontSize = sign.fontSize || (lines.length > 3 ? 19 : 23);
  const startY = 80 - ((lines.length - 1) * fontSize * .62);
  lines.forEach((line, i) => {
    appendText(svg, line, 110, startY + (i * fontSize * 1.18), fontSize, textColor);
  });

  return svg;
}

function appendRect(svg, x, y, width, height, radius, fill, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  el.setAttribute('width', width);
  el.setAttribute('height', height);
  el.setAttribute('rx', radius);
  el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(el);
}

function appendPolygon(svg, points, fill, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  el.setAttribute('points', points);
  el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(el);
}

function appendCircle(svg, cx, cy, r, fill, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttribute('cx', cx);
  el.setAttribute('cy', cy);
  el.setAttribute('r', r);
  el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(el);
}

function appendLine(svg, x1, y1, x2, y2, stroke, strokeWidth) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('x1', x1);
  el.setAttribute('y1', y1);
  el.setAttribute('x2', x2);
  el.setAttribute('y2', y2);
  el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', strokeWidth);
  el.setAttribute('stroke-linecap', 'round');
  svg.appendChild(el);
}

function appendText(svg, value, x, y, fontSize, fill) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  el.setAttribute('font-size', fontSize);
  el.setAttribute('fill', fill);
  el.textContent = value;
  svg.appendChild(el);
}

/* ── Choice selection ───────────────────────────────────────── */
function selectChoice(questionId, choiceIndex) {
  answers[questionId] = choiceIndex;

  // update UI of current choices
  document.querySelectorAll('.choice-item').forEach((item, i) => {
    item.classList.toggle('selected', i === choiceIndex);
    const radio = item.querySelector('input[type="radio"]');
    if (radio) radio.checked = (i === choiceIndex);
  });

  updateDots();
  updateNextButton();
}

/* ── Navigation ─────────────────────────────────────────────── */
function goToQuestion(index) {
  renderQuestion(index);
}

function prevQuestion() {
  if (currentIndex > 0) renderQuestion(currentIndex - 1);
}

function nextQuestion() {
  if (currentIndex < questions.length - 1) {
    renderQuestion(currentIndex + 1);
  }
}

function updateNextButton() {
  const nextBtn   = document.getElementById('btn-next');
  const submitBtn = document.getElementById('btn-submit');
  const isLast    = currentIndex === questions.length - 1;

  nextBtn.style.display   = isLast ? 'none'  : 'inline-flex';
  submitBtn.style.display = isLast ? 'inline-flex' : 'none';
}

/* ── Dots ────────────────────────────────────────────────────── */
function updateDots() {
  const dots = document.querySelectorAll('.q-dot');
  dots.forEach((dot, i) => {
    const q = questions[i];
    dot.classList.remove('active', 'answered');
    if (i === currentIndex)            dot.classList.add('active');
    else if (answers[q.id] !== undefined) dot.classList.add('answered');
  });
}

/* ── Submit ─────────────────────────────────────────────────── */
function submitExam() {
  const answeredCount = Object.keys(answers).length;
  const total         = questions.length;
  const unanswered    = total - answeredCount;

  if (unanswered > 0) {
    const confirmed = window.confirm(
      `ท่านยังไม่ได้ตอบ ${unanswered} ข้อ\nต้องการส่งข้อสอบหรือไม่?`
    );
    if (!confirmed) return;
  }

  showSummary();
}

/* ── Summary ────────────────────────────────────────────────── */
function showSummary() {
  // hide exam area
  document.getElementById('exam-area').style.display    = 'none';
  document.getElementById('summary-area').style.display = 'block';

  const total      = questions.length;
  const answered   = Object.keys(answers).length;
  const unanswered = total - answered;
  const score      = questions.reduce((sum, q) => {
    return sum + (answers[q.id] === q.answer ? 1 : 0);
  }, 0);

  document.getElementById('summary-test-title').textContent = `ชุดที่ ${testNumber}`;
  document.getElementById('summary-total').textContent      = total;
  document.getElementById('summary-total-score').textContent = total;
  document.getElementById('summary-score').textContent      = score;
  document.getElementById('summary-answered').textContent   = answered;
  document.getElementById('summary-unanswered').textContent = unanswered;

  // build detail table
  const tbody = document.getElementById('summary-tbody');
  tbody.innerHTML = '';
  questions.forEach((q, i) => {
    const tr = document.createElement('tr');
    const hasAnswer = answers[q.id] !== undefined;
    const isCorrect = hasAnswer && answers[q.id] === q.answer;
    const selectedText = hasAnswer ? q.choices[answers[q.id]] : 'ยังไม่ตอบ';
    const correctText = q.answerText || q.choices[q.answer];

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${truncate(q.question, 55)}</td>
      <td>
        ${hasAnswer
          ? `<span class="badge-answered">${selectedText}</span>`
          : '<span class="badge-skipped">ยังไม่ตอบ</span>'
        }
      </td>
      <td><span class="badge-answer">${correctText}</span></td>
      <td>
        <span class="${isCorrect ? 'badge-correct' : 'badge-incorrect'}">
          ${isCorrect ? 'ถูก' : 'ผิด'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ── Helpers ────────────────────────────────────────────────── */
function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/* ── Exposed to HTML buttons ────────────────────────────────── */
function goHome() {
  window.location.href = 'index.html';
}

function retakeExam() {
  answers      = {};
  currentIndex = 0;
  document.getElementById('summary-area').style.display = 'none';
  document.getElementById('exam-area').style.display    = 'block';
  renderQuestion(0);
}
