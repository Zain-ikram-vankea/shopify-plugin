import { togglePart, resetParts } from './modelHelpers.js';

export function createUI(parts) {
  const partsList = document.getElementById('parts-list');
  const partItems = partsList.querySelectorAll('.part-item');

  parts.forEach((part, index) => {
    const item = partItems[index];
    if (!item) return; // Agar zyada parts hain to ignore karo

    // Button ke andar img aur span ko select karo
    const btn = item.querySelector('button');
    const img = btn.querySelector('img');
    const span = btn.querySelector('span');

    img.src = part.thumbnail || '';
    img.alt = part.name;
    span.textContent = part.name;

    btn.onclick = () => togglePart(part);
  });

  // Reset button handler
  const resetBtn = document.getElementById('reset-btn');
  resetBtn.onclick = () => {
    resetParts();
    alert('Parts reset!');
  };
}
