// Shared injector logic for all chat sites - Modal trigger version
(async function(config) {
  // Load all settings from storage - default API base URL
  const settings = await chrome.storage.sync.get(['customUrl', 'email', 'password', 'username', 'authToken', 'apiBaseUrl']);
  const apiBaseUrl = settings.apiBaseUrl || 'http://localhost:3000';
  const customUrl = settings.customUrl;
  let email = settings.email;
  let password = settings.password;
  let username = settings.username;
  let authToken = settings.authToken;
  
  console.log('Custom URL from settings:', customUrl);
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
        showSidebar();
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

  async function showSidebar() {
    if (modal) return; // Prevent duplicates
  
    // Check login status first
    if (!email || !password) {
      showLoginModal();
      return;
    }
    
    let selectedPrompt = null;
    let bakedPromptText = '';
  
    // Show login modal if no credentials
    function showLoginModal() {
      modal = document.createElement('div');
      modal.id = 'promptchan-sidebar';
      modal.className = 'active';
      modal.innerHTML = `
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <div class="sidebar-content">
          <div class="sidebar-header">
            <h3>🔐 Login Required</h3>
            <button class="sidebar-close" id="sidebar-close">&times;</button>
          </div>
          <div class="sidebar-body">
            <div style="padding: 20px;">
              <p style="margin-bottom: 20px; color: #666;">Enter your credentials to access prompts:</p>
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Email:</label>
                <input id="login-email" type="email" placeholder="your@email.com" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
              </div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Password:</label>
                <input id="login-password" type="password" placeholder="••••••••" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
              </div>
              <div style="display: flex; gap: 10px;">
                <button id="login-submit" class="primary-button" style="flex: 1; padding: 12px;">Login & Save</button>
                <button id="open-settings" class="secondary-button" style="flex: 1; padding: 12px; background: #f0f0f0; border: none;">Open Settings</button>
              </div>
              <p style="margin-top: 15px; font-size: 12px; color: #666; text-align: center;">
                Credentials will be saved securely to extension settings
              </p>
            </div>
          </div>
        </div>
      `;
  
      document.body.appendChild(modal);
  
      // Event listeners for login modal
      document.getElementById('sidebar-close').onclick = hideSidebar;
      document.getElementById('sidebar-overlay').onclick = hideSidebar;
      
      document.getElementById('open-settings').onclick = () => {
        chrome.runtime.openOptionsPage();
        hideSidebar();
      };
  
      document.getElementById('login-submit').onclick = async () => {
        const loginEmail = document.getElementById('login-email').value.trim();
        const loginPassword = document.getElementById('login-password').value;
        
        if (!loginEmail || !loginPassword) {
          alert('Please enter both email and password');
          return;
        }
  
        try {
          // Save credentials to extension storage
          await chrome.storage.sync.set({
            email: loginEmail,
            password: loginPassword
          });
  
          // Update local variables
          email = loginEmail;
          password = loginPassword;
  
          // Try auto-login with new credentials
          if (!window.isLoggingIn) {
            window.isLoggingIn = true;
            await autoLogin();
            window.isLoggingIn = false;
          }
  
          // Reload all settings including username
          const updatedSettings = await chrome.storage.sync.get(['authToken', 'username']);
          authToken = updatedSettings.authToken;
          username = updatedSettings.username;
  
          // Close login modal and show main sidebar
          hideSidebar();
          showSidebar();
        } catch (error) {
          console.error('Login save failed:', error);
          alert('Failed to save credentials. Please try again.');
        }
      };
    }
  
    modal = document.createElement('div');
    modal.id = 'promptchan-sidebar';
    modal.className = 'active';
    modal.innerHTML = `
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="sidebar-title-container">
            <div class="sidebar-logo"></div>
            <h3 id="sidebar-title">PromptChan</h3>
          </div>
          ${username ? `<span class="sidebar-username clickable-username" data-username="${username}">@${username}</span><div class="username-dropdown hidden"><button id="logout-button">Logout</button></div>` : ''}
          <button class="sidebar-close" id="sidebar-close">&times;</button>
        </div>
        <div class="sidebar-body">
          <div id="prompts-section" class="prompts-section">
            <div id="prompts-list" class="prompts-container"></div>
          </div>
          <div id="prompt-details" class="prompt-details hidden">
            <button id="back-to-prompts" class="back-button">← Back to Prompts</button>
            <div id="prompt-title" class="prompt-detail-title"></div>
            <div id="prompt-description" class="prompt-detail-description"></div>
            <div class="prompt-template-section">
              <div class="template-label">Template:</div>
              <div id="prompt-template" class="prompt-template"></div>
            </div>
            <div id="prompt-inputs"></div>
            <div class="sidebar-actions">
              <button id="bake-button" class="primary-button">Bake Prompt</button>
              <button id="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Username dropdown functionality
    const usernameEl = modal.querySelector('.clickable-username');
    const dropdown = modal.querySelector('.username-dropdown');
    if (usernameEl && dropdown) {
      usernameEl.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      };
      
      document.onclick = () => {
        dropdown.classList.add('hidden');
      };
      
      document.getElementById('logout-button').onclick = async () => {
        try {
          await chrome.storage.sync.clear();
          // Reset local variables
          email = null;
          password = null;
          username = null;
          authToken = null;
          hideSidebar();
          showSidebar(); // Show login modal
        } catch (error) {
          console.error('Logout failed:', error);
        }
      };
    }
    
    // Event listeners
    document.getElementById('sidebar-close').onclick = hideSidebar;
    document.getElementById('cancel-button').onclick = hideSidebar;
    document.getElementById('bake-button').onclick = () => bakePrompt();
    document.getElementById('back-to-prompts').onclick = () => {
      const promptsSection = document.getElementById('prompts-section');
      const promptDetails = document.getElementById('prompt-details');
      const sidebarTitle = document.getElementById('sidebar-title');
      
      if (promptsSection && promptDetails) {
        promptsSection.classList.remove('hidden');
        promptDetails.classList.add('hidden');
      }
      if (sidebarTitle) {
        sidebarTitle.textContent = 'PromptChan';
      }
    };

    // Auto-login if credentials available and not already logging in
    if (email && password && !authToken && !window.isLoggingIn) {
      window.isLoggingIn = true;
      await autoLogin();
      window.isLoggingIn = false;
      loginCompleted = true;
      
      // Reload all settings to get new authToken and username
      const updatedSettings = await chrome.storage.sync.get(['authToken', 'username']);
      authToken = updatedSettings.authToken;
      username = updatedSettings.username;
    }
    
    // Close on overlay click
    document.getElementById('sidebar-overlay').onclick = hideSidebar;
    
    // Load prompts after login/auth check
    await loadPrompts();
  }
  
  // Expose globally for context menu
  window.showPromptchanSidebar = showSidebar;
  
  // Check if on custom URL site
  if (customUrl && window.location.hostname.includes(new URL(customUrl).hostname)) {
    console.log(`Detected custom URL site: ${customUrl}`);
    // Optionally auto-show sidebar or modify behavior for custom sites
  }

  function hideSidebar() {
    if (modal) {
      modal.remove();
      modal = null;
    }
  }

  function bakePrompt() {
    if (!selectedPrompt) return;
    
    let finalText = selectedPrompt.template;
    
    try {
      const inputs = JSON.parse(selectedPrompt.inputs);
      inputs.forEach(input => {
        const inputValue = document.getElementById(`prompt-input-${input.name}`)?.value || '';
        const placeholder = `{{${input.name}}}`;
        finalText = finalText.replace(new RegExp(placeholder, 'g'), inputValue);
      });
      bakedPromptText = finalText;
      document.getElementById('prompt-template').innerHTML = `<pre class="prompt-template-text baked">${finalText}</pre>`;
      document.getElementById('bake-button').textContent = 'Baked!';
      document.getElementById('bake-button').disabled = true;
      setTimeout(() => {
        document.getElementById('bake-button').textContent = 'Bake Prompt';
        document.getElementById('bake-button').disabled = false;
      }, 2000);
      
      // Auto-inject after baking
      const targetInput = document.querySelector(config.targetSelector);
      if (targetInput && finalText.trim()) {
        if (config.isContentEditable) {
          const pElement = targetInput.querySelector('p');
          if (pElement) {
            pElement.textContent = finalText;
          } else {
            targetInput.innerHTML = `<p>${finalText}</p>`;
          }
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
          targetInput.focus();
        } else {
          targetInput.value = finalText;
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
          targetInput.focus();
        }
        hideSidebar();
        console.log(`Baked prompt auto-injected into ${config.siteName}`);
      }
    } catch (e) {
      console.log('Error baking prompt:', e);
    }
  }


  // Start watching input
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchInput);
  } else {
    watchInput();
  }

  // Listen for context menu trigger
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_SIDEBAR') {
      showSidebar();
    }
  });
  
  // Watch for dynamic input changes (SPAs)
  const observer = new MutationObserver(() => {
    watchInput();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Auto-login function
  async function autoLogin() {
    try {
      console.log('Attempting auto-login...');
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        const newUsername = data.user.username;
        
        // Save token and username
        await chrome.storage.sync.set({
          authToken: newToken,
          username: newUsername
        });
        
        console.log('Auto-login successful:', newUsername);
        // Don't refresh sidebar during login to prevent loops
      } else {
        console.log('Auto-login failed:', response.status);
      }
    } catch (error) {
      console.log('Auto-login error:', error);
    }
  }

  // Listen for manual token changes (avoid auto-refresh loops)
  let loginCompleted = false;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.authToken && !window.isLoggingIn && loginCompleted) {
      if (modal) {
        hideSidebar();
        showSidebar();
      }
    }
  });
  // Load prompts function
  async function loadPrompts() {
    try {
      const promptsList = document.getElementById('prompts-list');
      if (!promptsList) return;
      
      // Always reload latest authToken before checking
      const currentSettings = await chrome.storage.sync.get(['authToken']);
      const currentAuthToken = currentSettings.authToken;
      
      if (!currentAuthToken) {
        promptsList.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #666;">
            <h4>Authentication Required</h4>
            <p>Please set your email and password in extension settings to access prompts.</p>
            <button id="open-settings" class="primary-button" style="margin-top: 15px;">Open Settings</button>
          </div>
        `;
        const openSettingsBtn = document.getElementById('open-settings');
        if (openSettingsBtn) {
          openSettingsBtn.onclick = () => {
            if (chrome.runtime && chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            }
            hideSidebar();
          };
        }
        return;
      }
    
    // Update local authToken
    authToken = currentAuthToken;

    console.log('Loading prompts...');
    const response = await fetch(`${apiBaseUrl}/api/prompts`, {
      headers: {
        'Authorization': `Bearer ${currentAuthToken}`
      }
    });

      if (response.ok) {
        const data = await response.json();
        promptsList.innerHTML = '';
        
        data.prompts.forEach(prompt => {
          const card = document.createElement('div');
          card.className = 'prompt-card';
          card.innerHTML = `
            <div class="prompt-title">${prompt.title}</div>
            <div class="prompt-description">${prompt.short_description}</div>
          `;
          card.onclick = () => selectPrompt(prompt);
          promptsList.appendChild(card);
        });
      }
    } catch (error) {
      console.log('Failed to load prompts:', error);
    }
  }

  // Select prompt and show inputs
  function selectPrompt(prompt) {
    selectedPrompt = prompt;
    document.getElementById('prompts-section').classList.add('hidden');
    document.getElementById('prompt-details').classList.remove('hidden');
    
    const titleEl = document.getElementById('prompt-title');
    const descEl = document.getElementById('prompt-description');
    const templateContainer = document.getElementById('prompt-template');
    const inputsContainer = document.getElementById('prompt-inputs');
    
    if (titleEl) titleEl.textContent = prompt.title;
    if (descEl) descEl.textContent = prompt.long_description || '';
    inputsContainer.innerHTML = '';
    templateContainer.innerHTML = `<pre class="prompt-template-text">${prompt.template}</pre>`;
    
    try {
      const inputs = JSON.parse(prompt.inputs);
      inputs.forEach(input => {
        const inputEl = document.createElement('div');
        inputEl.className = 'prompt-input-group';
        inputEl.innerHTML = `
          <label>${input.label || input.name}</label>
          <input id="prompt-input-${input.name}"
                 type="${input.type}"
                 placeholder="${input.placeholder || ''}"
                 ${input.required ? 'required' : ''}>
          ${input.description ? `<small>${input.description}</small>` : ''}
        `;
        inputsContainer.appendChild(inputEl);
      });
    } catch (e) {
      console.log('Error parsing prompt inputs:', e);
      inputsContainer.innerHTML = '<p>Invalid input configuration</p>';
    }
  }
})(window.INJECTOR_CONFIG || {});