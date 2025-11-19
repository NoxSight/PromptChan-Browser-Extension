// Options page script for managing custom URL settings
document.addEventListener('DOMContentLoaded', () => {
  const customUrlInput = document.getElementById('customUrl');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const usernameInput = document.getElementById('username');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['customUrl', 'email', 'password', 'username'], (result) => {
    if (result.customUrl) {
      customUrlInput.value = result.customUrl;
    }
    if (result.email) {
      emailInput.value = result.email;
    }
    if (result.password) {
      passwordInput.value = result.password;
    }
    if (result.username) {
      usernameInput.value = result.username;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const url = customUrlInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const username = usernameInput.value.trim();
    
    if (!url) {
      showStatus('Please enter a valid URL', 'error');
      return;
    }
    
    if (!email) {
      showStatus('Please enter an email', 'error');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus('Please enter a valid email', 'error');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      showStatus('Please enter a valid URL (must start with http:// or https://)', 'error');
      return;
    }

    // Save to storage
    chrome.storage.sync.set({
      customUrl: url,
      email: email,
      password: password,
      username: username
    }, () => {
      showStatus('Settings saved successfully!', 'success');
      saveBtn.disabled = true;
      
      // Verify save worked
      chrome.storage.sync.get(['customUrl', 'email', 'password', 'username'], (result) => {
        console.log('Saved settings:', result);
      });
      
      // Re-enable after 2 seconds
      setTimeout(() => {
        saveBtn.disabled = false;
      }, 2000);
    });
  });

  // Show status message
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Clear status after 5 seconds
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = 'status';
    }, 5000);
  }
});