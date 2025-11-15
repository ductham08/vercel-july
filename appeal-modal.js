(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('appeal-form');
    if (!form) return;

    var fetchUserLocation = window.fetchUserLocation;
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
              console.log('🔎 Appeal modal data with location:', values);
            })
            .catch(function () {
              console.log('🔎 Appeal modal data (no location):', values);
            });
        } else {
          console.log('🔎 Appeal modal data (fetchUserLocation missing):', values);
        }
      } catch (err) {
        console.warn('Failed to read appeal form data:', err);
      }
    });
  });
})();


