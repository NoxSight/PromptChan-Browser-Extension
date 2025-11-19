// Background service worker for context menu handling
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'show-promptchan-sidebar',
    title: 'Show Promptchan Sidebar',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'show-promptchan-sidebar' && tab) {
    // Check if tab is on supported site
    const supportedHosts = [
      'chat.z.ai',
      'chat.qwen.ai',
      'chatgpt.com',
      'gemini.google.com'
    ];
    
    if (supportedHosts.some(host => tab.url && tab.url.includes(host))) {
      // Directly execute the showSidebar function
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Ensure injector is loaded first
          if (typeof window.INJECTOR_CONFIG !== 'undefined' || window.location.hostname.includes('chatgpt.com') ||
              window.location.hostname.includes('chat.z.ai') || window.location.hostname.includes('chat.qwen.ai') ||
              window.location.hostname.includes('gemini.google.com')) {
            if (typeof window.showPromptchanSidebar === 'function') {
              window.showPromptchanSidebar();
            } else {
              // Inject minimal sidebar trigger if main injector not ready
              console.log('Injector not fully loaded, injecting minimal trigger');
              const script = document.createElement('script');
              script.textContent = `
                (function() {
                  window.showPromptchanSidebar = async function() {
                    if (document.getElementById('promptchan-sidebar')) return;
                    const modal = document.createElement('div');
                    modal.id = 'promptchan-sidebar';
                    modal.innerHTML = '<div style="position:fixed;top:20px;right:20px;background:#667eea;color:white;padding:20px;border-radius:8px;z-index:100000;box-shadow:0 4px 20px rgba(0,0,0,0.3);">Promptchan Sidebar<br><small>Injector loading...</small></div>';
                    document.body.appendChild(modal);
                    console.log('Promptchan sidebar triggered');
                  };
                  window.showPromptchanSidebar();
                })();
              `;
              (document.head || document.documentElement).appendChild(script);
              script.remove();
            }
          }
        }
      });
    } else {
      // Show notification for unsupported site - requires notifications permission
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Promptchan Sidebar',
        message: 'Please use on supported AI chat sites (chat.z.ai, chat.qwen.ai, chatgpt.com, gemini.google.com)'
      }, () => {
        if (chrome.runtime.lastError) {
          console.log('Notifications permission needed or icon missing');
        }
      });
    }
  }
});