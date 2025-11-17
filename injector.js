// Shared injector logic for all chat sites - Modal trigger version
(function(config) {
  console.log(`Injector loaded for: ${config.siteName} on ${window.location.hostname}`);
  
  // Site-specific hostname check
  if (window.location.hostname.indexOf(config.hostname) === -1) {
    console.log(`Not on ${config.siteName}, skipping`);
    return;
  }

  let modal = null;

  // Watch target input for /promptchan trigger
  function watchInput() {
    const targetInput = document.querySelector(config.targetSelector);
    if (!targetInput) return;

    const checkTrigger = () => {
      let inputValue = '';
      if (config.isContentEditable) {
        const p = targetInput.querySelector('p');
        inputValue = p ? p.textContent : targetInput.textContent;
      } else {
        inputValue = targetInput.value;
      }

      if (inputValue.includes('/promptchan')) {
        showModal();
        // Clear trigger from input
        clearTrigger(targetInput);
      }
    };

    // Check on input/change events
    targetInput.addEventListener('input', checkTrigger);
    targetInput.addEventListener('change', checkTrigger);
    targetInput.addEventListener('keyup', checkTrigger);

    // Initial check
    checkTrigger();
  }

  function clearTrigger(targetInput) {
    if (config.isContentEditable) {
      const p = targetInput.querySelector('p');
      if (p) {
        const text = p.textContent.replace('/promptchan', '').trim();
        p.textContent = text || '';
      }
    } else {
      targetInput.value = targetInput.value.replace('/promptchan', '').trim();
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    targetInput.focus();
  }

  function showModal() {
    if (modal) return; // Prevent duplicates

    modal = document.createElement('div');
    modal.id = 'promptchan-modal';
    modal.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${config.siteName} Injector</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <textarea id="inject-textarea" placeholder="Enter text to inject..." rows="8"></textarea>
            <div class="modal-actions">
              <button id="inject-button">Inject Text</button>
              <button id="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('modal-close').onclick = hideModal;
    document.getElementById('cancel-button').onclick = hideModal;
    document.getElementById('inject-button').onclick = () => injectText();
    document.getElementById('inject-textarea').onkeydown = (e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        injectText();
      }
    };

    // Close on overlay click
    document.getElementById('modal-overlay').onclick = (e) => {
      if (e.target.id === 'modal-overlay') hideModal();
    };
  }

  function hideModal() {
    if (modal) {
      modal.remove();
      modal = null;
    }
  }

  function injectText() {
    const textarea = document.getElementById('inject-textarea');
    const targetInput = document.querySelector(config.targetSelector);
    
    if (targetInput && textarea.value.trim()) {
      if (config.isContentEditable) {
        const pElement = targetInput.querySelector('p');
        if (pElement) {
          pElement.textContent = textarea.value;
        } else {
          targetInput.innerHTML = `<p>${textarea.value}</p>`;
        }
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        targetInput.focus();
      } else {
        targetInput.value = textarea.value;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        targetInput.focus();
      }
      hideModal();
      console.log(`Text injected successfully into ${config.siteName}`);
    }
  }

  // Start watching input
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchInput);
  } else {
    watchInput();
  }
  
  // Watch for dynamic input changes (SPAs)
  const observer = new MutationObserver(() => {
    watchInput();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})(window.INJECTOR_CONFIG || {});