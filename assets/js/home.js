/**
 * home.js — Logic สำหรับหน้าหลัก (index.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderTestGrid();
  initSupportModal();
});

function renderTestGrid() {
  const grid = document.getElementById('test-grid');
  if (!grid) return;

  TESTS_META.forEach(meta => {
    const card = createTestCard(meta);
    grid.appendChild(card);
  });
}

function createTestCard(meta) {
  const card = document.createElement('div');
  card.className = 'test-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `เริ่มสอบ ${meta.title}`);

  card.innerHTML = `
    <div class="test-card-number">ชุดข้อสอบ</div>
    <div class="test-card-title">${meta.title}</div>
    <div class="test-card-meta">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 4.5v4l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      ${meta.count} ข้อ
    </div>
    <button class="test-card-btn" data-test="${meta.number}" aria-label="เริ่มสอบชุดที่ ${meta.number}">
      เริ่มสอบ
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;

  // click on button
  card.querySelector('.test-card-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateToExam(meta.number);
  });

  // click / keyboard on card
  card.addEventListener('click', () => navigateToExam(meta.number));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToExam(meta.number);
    }
  });

  return card;
}

function navigateToExam(testNumber) {
  window.location.href = `exam.html?test=${testNumber}`;
}

function initSupportModal() {
  const openBtn = document.getElementById('support-open');
  const modal = document.getElementById('support-modal');
  if (!openBtn || !modal) return;

  const closeTargets = modal.querySelectorAll('[data-support-close]');

  openBtn.addEventListener('click', () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  });

  closeTargets.forEach((target) => {
    target.addEventListener('click', () => closeSupportModal(modal));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeSupportModal(modal);
    }
  });
}

function closeSupportModal(modal) {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}
