// Shareable compare URLs + copy-link button
// Reads ?compare=platform:id,platform:id from the URL on load,
// auto-opens the compare modal with those models pre-selected.
// Updates the URL whenever the user adds/removes models in the modal.
// Adds a "Copy link" button to the compare dialog header.

(function () {
  'use strict';

  const COMPARE_BUTTON_ID = 'globalCompareButton';
  const MODAL_ID = 'compareModal';
  const HEAD_SELECTOR = '#compareModal .compare-dialog-head';

  function readCompareIds() {
    try {
      const q = new URLSearchParams(location.search);
      return (q.get('compare') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function currentSelectedKeys() {
    return Array.from(document.querySelectorAll('#selectedModelList .selected-model-pill'))
      .map((el) => el.dataset.key)
      .filter(Boolean);
  }

  function updateUrlFromSelection() {
    const keys = currentSelectedKeys();
    const url = new URL(location.href);
    if (keys.length) url.searchParams.set('compare', keys.join(','));
    else url.searchParams.delete('compare');
    history.replaceState({}, '', url.toString());
  }

  function clickChipFor(key) {
    const chip = document.querySelector(`#modelFilters .model-chip[data-key="${CSS.escape(key)}"]`);
    if (chip && !chip.classList.contains('active')) chip.click();
  }

  function applyCompareFromUrl() {
    const ids = readCompareIds();
    if (!ids.length) return;
    const btn = document.getElementById(COMPARE_BUTTON_ID);
    if (!btn) return;
    btn.click(); // open modal so renderCompare runs and chips exist
    // Wait a tick for chips to render, then click each
    setTimeout(() => {
      ids.forEach(clickChipFor);
    }, 50);
  }

  function injectShareButton() {
    const head = document.querySelector(HEAD_SELECTOR);
    if (!head || head.querySelector('.share-compare-btn')) return;
    const close = head.querySelector('.close-button');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'share-compare-btn';
    btn.textContent = '🔗 Copy link';
    btn.title = 'Copy a shareable comparison URL';
    btn.onclick = async () => {
      updateUrlFromSelection();
      try {
        await navigator.clipboard.writeText(location.href);
        const old = btn.textContent;
        btn.classList.add('copied');
        btn.textContent = '✓ Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = old;
        }, 1600);
      } catch (_) {
        prompt('Copy this link:', location.href);
      }
    };
    if (close) head.insertBefore(btn, close);
    else head.appendChild(btn);
  }

  function watchSelectionChanges() {
    const list = document.getElementById('selectedModelList');
    if (!list) return;
    const obs = new MutationObserver(() => {
      const modal = document.getElementById(MODAL_ID);
      if (modal && modal.classList.contains('open')) updateUrlFromSelection();
    });
    obs.observe(list, { childList: true, subtree: true });
  }

  function watchModalOpen() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    const obs = new MutationObserver(() => {
      if (modal.classList.contains('open')) injectShareButton();
      else {
        // Clear ?compare from URL when modal closes empty (optional UX)
      }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  function setUpdatedDate() {
    const el = document.getElementById('trustUpdated');
    if (!el) return;
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    el.textContent = `${yyyy}-${mm}-${dd}`;
  }

  function init() {
    setUpdatedDate();
    watchModalOpen();
    watchSelectionChanges();
    // Apply ?compare= after app.js has rendered the platform list & data.
    setTimeout(applyCompareFromUrl, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
