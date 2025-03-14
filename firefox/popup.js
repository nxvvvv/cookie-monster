class CookieManager {
  static async getAllCookies() {
    try {
      return await browser.cookies.getAll({});
    } catch (error) {
      console.error('Error getting cookies:', error);
      throw error;
    }
  }

  static async importCookies(cookies) {
    let successCount = 0;
    let failCount = 0;
    let failedCookies = [];

    for (const cookie of cookies) {
      try {
        const cookieUrl = `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain}${cookie.path}`;
        
        // Map sameSite values to Firefox-compatible values
        // Firefox accepts: "no_restriction", "lax", or "strict"
        let sameSite = cookie.sameSite || 'lax';
        if (sameSite === 'unspecified') {
          sameSite = 'lax';
        } else if (sameSite === 'none') {
          sameSite = 'no_restriction';
        }
        
        // Set the cookie with valid sameSite value
        await browser.cookies.set({
          url: cookieUrl,
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: sameSite,
          expirationDate: cookie.expirationDate || (Math.floor(Date.now() / 1000) + 86400)
        });
        
        successCount++;
      } catch (error) {
        console.error(`Failed to set cookie: ${cookie.name}`, error);
        failCount++;
        failedCookies.push({
          cookie,
          error: error.message || "Unknown error"
        });
      }
    }
    
    return { successCount, failCount, failedCookies };
  }
}

class UI {
  static showStatus(message, type, hasFailures = false) {
    const status = document.getElementById('status');
    const failedList = document.getElementById('failedImports');
    
    status.textContent = message;
    status.className = `status show ${type}`;
    status.setAttribute('data-has-failures', hasFailures);
    status.setAttribute('data-expanded', 'false');
    
    if (hasFailures) {
      status.style.cursor = 'pointer';
      status.onclick = () => {
        const isExpanded = status.getAttribute('data-expanded') === 'true';
        status.setAttribute('data-expanded', !isExpanded);
        failedList.classList.toggle('show');
      };
    } else {
      status.style.cursor = 'default';
      status.onclick = null;
      failedList.classList.remove('show');
    }
  }

  static async showPasswordDialog() {
    return new Promise((resolve) => {
      const dialog = document.getElementById('password-dialog');
      const passwordInput = document.getElementById('password');
      
      dialog.className = 'modal';
      passwordInput.value = '';
      passwordInput.focus();

      const handleConfirm = () => {
        const password = passwordInput.value;
        if (password) {
          cleanup();
          resolve(password);
        }
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      const handleKeydown = (event) => {
        if (event.key === 'Enter') {
          handleConfirm();
        } else if (event.key === 'Escape') {
          handleCancel();
        }
      };

      const cleanup = () => {
        dialog.className = 'modal hidden';
        passwordInput.removeEventListener('keydown', handleKeydown);
        document.getElementById('confirmPassword').removeEventListener('click', handleConfirm);
        document.getElementById('cancelPassword').removeEventListener('click', handleCancel);
      };

      passwordInput.addEventListener('keydown', handleKeydown);
      document.getElementById('confirmPassword').addEventListener('click', handleConfirm);
      document.getElementById('cancelPassword').addEventListener('click', handleCancel);
    });
  }

  static showExportOptions(encryptedData) {
    const dialog = document.getElementById('export-options');
    dialog.className = 'modal';

    const handleSaveFile = async () => {
      try {
        const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        await browser.downloads.download({
          url: url,
          filename: 'cookies-export.json',
          saveAs: true
        });
        
        URL.revokeObjectURL(url);
        dialog.className = 'modal hidden';
        UI.showStatus('File saved successfully!', 'success');
      } catch (error) {
        console.error('Save error:', error);
        UI.showStatus('Failed to save file', 'error');
      }
    };

    const handleCopyClipboard = async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(encryptedData));
        dialog.className = 'modal hidden';
        UI.showStatus('Copied to clipboard!', 'success');
      } catch (error) {
        console.error('Copy error:', error);
        UI.showStatus('Failed to copy to clipboard', 'error');
      }
    };

    document.getElementById('saveFileBtn').onclick = handleSaveFile;
    document.getElementById('copyClipboardBtn').onclick = handleCopyClipboard;
  }

  static async showImportDialog() {
    return new Promise((resolve) => {
      const dialog = document.getElementById('import-dialog');
      const textarea = document.getElementById('importData');
      
      dialog.className = 'modal';
      textarea.value = '';
      textarea.focus();

      const handleConfirm = () => {
        const data = textarea.value.trim();
        if (data) {
          cleanup();
          resolve(data);
        }
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      const handleKeydown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault(); // Prevent new line
          handleConfirm();
        } else if (event.key === 'Escape') {
          handleCancel();
        }
      };

      const cleanup = () => {
        dialog.className = 'modal hidden';
        textarea.removeEventListener('keydown', handleKeydown);
        document.getElementById('confirmImport').removeEventListener('click', handleConfirm);
        document.getElementById('cancelImport').removeEventListener('click', handleCancel);
      };

      textarea.addEventListener('keydown', handleKeydown);
      document.getElementById('confirmImport').addEventListener('click', handleConfirm);
      document.getElementById('cancelImport').addEventListener('click', handleCancel);
    });
  }

  static showFailedImports(failedCookies) {
    const dialog = document.getElementById('failed-imports');
    const list = document.getElementById('failedCookiesList');
    
    // Clear previous content
    list.innerHTML = '';
    
    // Add each failed cookie to the list
    failedCookies.forEach(({ cookie, error }) => {
      const item = document.createElement('div');
      item.className = 'failed-cookie-item';
      item.innerHTML = `
        <div class="domain">${cookie.domain}</div>
        <div>Name: ${cookie.name}</div>
        <div class="error">Error: ${error}</div>
      `;
      list.appendChild(item);
    });

    dialog.className = 'modal';

    // Add close button handler
    const closeButton = document.getElementById('closeFailedImports');
    const handleClose = () => {
      dialog.className = 'modal hidden';
      closeButton.removeEventListener('click', handleClose);
    };
    closeButton.addEventListener('click', handleClose);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');

  exportBtn.addEventListener('click', async () => {
    try {
      const password = await UI.showPasswordDialog();
      if (!password) return;

      const cookies = await CookieManager.getAllCookies();
      const encrypted = await CookieCrypto.encrypt(cookies, password);
      
      UI.showExportOptions(encrypted);
    } catch (error) {
      UI.showStatus('Failed to export cookies', 'error');
      console.error('Export error:', error);
    }
  });

  importBtn.addEventListener('click', async () => {
    try {
      // Show paste dialog first
      const importData = await UI.showImportDialog();
      if (!importData) return;

      // Then ask for password
      const password = await UI.showPasswordDialog();
      if (!password) return;

      try {
        // Parse the imported data
        const encrypted = JSON.parse(importData);
        
        // Better validation for required fields
        if (!encrypted.encrypted || !encrypted.iv || !encrypted.salt) {
          console.error('Missing required encryption fields');
          UI.showStatus('Invalid data format - Missing encryption fields', 'error');
          return;
        }
        
        // Attempt decryption
        const cookies = await CookieCrypto.decrypt(encrypted, password);
        
        // Validate cookie array
        if (!Array.isArray(cookies)) {
          console.error('Decrypted data is not an array');
          UI.showStatus('Invalid cookie format - Not an array', 'error');
          return;
        }

        // Import cookies
        const { successCount, failCount, failedCookies } = await CookieManager.importCookies(cookies);
        
        // Show success message
        UI.showStatus(`Imported ${successCount} cookies successfully`, 'success');
        
        // Show failed imports count if any with dropdown
        if (failCount > 0) {
          const statusContainer = document.querySelector('.status-container');
          
          // Create failed imports dropdown button
          const failedDropdownBtn = document.createElement('div');
          failedDropdownBtn.className = 'failed-dropdown-btn';
          failedDropdownBtn.innerHTML = `Failed to import ${failCount} cookies <span class="dropdown-arrow">▼</span>`;
          
          // Add the button to the container
          statusContainer.appendChild(failedDropdownBtn);
          
          // Clear previous content in the failed list
          const failedList = document.getElementById('failedCookiesList');
          failedList.innerHTML = '';
          
          // Add each failed cookie to the list
          failedCookies.forEach(({ cookie, error }) => {
            const item = document.createElement('div');
            item.className = 'failed-cookie-item';
            item.innerHTML = `
              <div class="domain">${cookie.domain}</div>
              <div class="name">Name: ${cookie.name}</div>
              <div class="error">Error: ${error}</div>
            `;
            failedList.appendChild(item);
          });
          
          // Add click event to toggle dropdown
          const failedImports = document.getElementById('failedImports');
          failedDropdownBtn.addEventListener('click', () => {
            failedImports.classList.toggle('show');
            const arrow = failedDropdownBtn.querySelector('.dropdown-arrow');
            arrow.textContent = failedImports.classList.contains('show') ? '▲' : '▼';
          });
        }
      } catch (error) {
        console.error('Import error:', error);
        UI.showStatus(`Import failed: ${error.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Import process error:', error);
      UI.showStatus('Failed to import cookies', 'error');
    }
  });
});