// Shared injector logic for all chat sites
(function(config) {
  console.log(`Injector loaded for: ${config.siteName} on ${window.location.hostname}`);
  
  // Site-specific hostname check
  if (window.location.hostname.indexOf(config.hostname) === -1) {
    console.log(`Not on ${config.siteName}, skipping`);
    return;
  }

  console.log(`Creating sidebar for ${config.siteName}`);

  // Wait for DOM to be ready
  function initSidebar() {
    // Remove existing sidebar if any
    const existing = document.getElementById('text-injector-sidebar');
    if (existing) existing.remove();

    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'text-injector-sidebar';
    
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3>${config.siteName} Injector</h3>
      </div>
      <div class="sidebar-content">
        <textarea id="inject-textarea" placeholder="Enter text to inject into ${config.siteName}..." rows="8"></textarea>
        <button id="inject-button">Inject Text</button>
      </div>
    `;
    
    // Insert sidebar into body
    document.body.appendChild(sidebar);
    console.log(`${config.siteName} sidebar created and appended`);
    
    // Setup event listeners
    setupEventListeners(config);
  }

  function setupEventListeners(config) {
    const injectBtn = document.getElementById('inject-button');
    const textarea = document.getElementById('inject-textarea');
    
    injectBtn.addEventListener('click', function() {
      injectText(config, textarea);
    });
    
    // Allow Enter + Shift to inject
    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && e.shiftKey) {
        injectBtn.click();
      }
    });
  }

  function injectText(config, textarea) {
    const targetInput = document.querySelector(config.targetSelector);
    console.log(`${config.siteName} inject clicked, targetInput:`, targetInput);
    
    if (targetInput && textarea.value.trim()) {
      if (config.isContentEditable) {
        // For ChatGPT contenteditable div - replace inner p content
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
        // Standard textarea/input
        targetInput.value = textarea.value;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        targetInput.focus();
      }
      textarea.value = ''; // Clear after inject
      console.log(`Text injected successfully into ${config.siteName}`);
    } else {
      console.log(`Target input not found: ${config.targetSelector}`);
    }
  }

  // Initialize immediately and on DOM changes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
  
  // Also try after short delay for SPA
  setTimeout(initSidebar, 1000);
  
  // Watch for DOM changes (for SPAs)
  const observer = new MutationObserver(function() {
    if (!document.getElementById('text-injector-sidebar')) {
      initSidebar();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})(window.INJECTOR_CONFIG || {});