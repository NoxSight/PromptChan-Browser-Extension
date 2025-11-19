// Options page script for managing custom URL settings
document.addEventListener('DOMContentLoaded', () => {
  const apiBaseUrlInput = document.getElementById('apiBaseUrl');
  const customUrlInput = document.getElementById('customUrl');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['apiBaseUrl', 'customUrl'], (result) => {
    apiBaseUrlInput.value = result.apiBaseUrl || 'http://localhost:3000';
    if (result.customUrl) {
      customUrlInput.value = result.customUrl;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiBaseUrl = apiBaseUrlInput.value.trim();
    const customUrl = customUrlInput.value.trim();
    
    // Validate API Base URL
    try {
      new URL(apiBaseUrl);
    } catch {
      showStatus('Please enter a valid API Base URL (must start with http:// or https://)', 'error');
      return;
    }

    // Save to storage
    chrome.storage.sync.set({
      apiBaseUrl: apiBaseUrl,
      customUrl: customUrl || null
    }, () => {
      showStatus('Settings saved successfully!', 'success');
      saveBtn.disabled = true;
      
      // Verify save worked
      chrome.storage.sync.get(['apiBaseUrl', 'customUrl'], (result) => {
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