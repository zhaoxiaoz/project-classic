// Simple prompt for iOS users to add the app to home screen
(function() {
  // Only show on iOS devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  // Only show if not already added to home screen
  const isStandalone = window.navigator.standalone;

  if (isIOS && !isStandalone) {
    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', () => {
      // Create the prompt element
      const promptContainer = document.createElement('div');
      promptContainer.id = 'ios-pwa-prompt';
      promptContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.85);
        color: #fff;
        padding: 15px;
        font-family: -apple-system, sans-serif;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      `;

      // Add content
      promptContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
          <strong>将此应用添加到主屏幕</strong>
        </div>
        <div>
          点击 <span style="display: inline-block; margin: 0 5px;"><svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align: middle;"><path fill="#FFF" d="M16,12V4H8V12H4L12,20L20,12H16Z" /></svg></span> 然后选择"添加到主屏幕"
        </div>
        <button id="close-ios-pwa-prompt" style="margin-top: 10px; padding: 8px 16px; background: #fff; color: #000; border: none; border-radius: 4px; font-weight: bold;">
          关闭
        </button>
      `;

      // Append to body
      document.body.appendChild(promptContainer);

      // Close button functionality
      document.getElementById('close-ios-pwa-prompt').addEventListener('click', () => {
        promptContainer.style.display = 'none';

        // Store in localStorage so we don't show again for some time
        localStorage.setItem('ios-pwa-prompt-closed', Date.now());
      });

      // Don't show if recently closed
      const lastClosed = localStorage.getItem('ios-pwa-prompt-closed');
      if (lastClosed && (Date.now() - parseInt(lastClosed) < 1000 * 60 * 60 * 24 * 7)) { // 7 days
        promptContainer.style.display = 'none';
      }
    });
  }
})();