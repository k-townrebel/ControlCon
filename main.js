const navToggle = document.querySelector('.nav-toggle');
const navPanel = document.querySelector('.nav-panel');
const navLinks = document.querySelectorAll('[data-nav]');

if (navToggle && navPanel) {
  navToggle.addEventListener('click', () => {
    const isOpen = navPanel.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navPanel.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  });
}

const sections = document.querySelectorAll('[data-section]');
const navMap = new Map();
navLinks.forEach((link) => {
  const target = link.getAttribute('href');
  if (target && target.startsWith('#')) {
    navMap.set(target.slice(1), link);
  }
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeLink = navMap.get(entry.target.id);
        if (activeLink) {
          navLinks.forEach((link) => link.classList.remove('is-active'));
          activeLink.classList.add('is-active');
        }
      }
    });
  },
  { rootMargin: '-45% 0px -45% 0px', threshold: 0.1 }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const tabGroups = document.querySelectorAll('[data-tabs]');

tabGroups.forEach((group) => {
  const tabs = group.querySelectorAll('[role="tab"]');
  const panels = group.querySelectorAll('[role="tabpanel"]');

  const activateTab = (selectedTab) => {
    tabs.forEach((tab) => {
      const isActive = tab === selectedTab;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.id === selectedTab.getAttribute('aria-controls');
      panel.classList.toggle('is-active', isActive);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab));
  });
});

const forms = document.querySelectorAll('.js-form');
const sheetEndpoint = document.body.dataset.sheetEndpoint || '';
const isSheetEndpointReady =
  sheetEndpoint &&
  !sheetEndpoint.includes('REPLACE_ME') &&
  sheetEndpoint.startsWith('https://script.google.com/macros/s/');

forms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';

    if (!isSheetEndpointReady) {
      if (status) {
        status.textContent = 'Sheet endpoint not configured.';
      }
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const payload = new URLSearchParams();
    payload.append('sheet', form.dataset.sheet || 'Waitlist');
    payload.append('timestamp', new Date().toISOString());
    Object.entries(data).forEach(([key, value]) => {
      payload.append(key, value);
    });

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
      if (status) {
        status.textContent = 'Sending...';
      }

      console.info('Submitting form to sheet', form.dataset.sheet || 'Waitlist');
      await fetch(sheetEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: payload,
      });

      form.reset();
      if (status) {
        status.innerHTML = "Thanks &mdash; we'll be in touch. If you don't see your entry, refresh the sheet.";
      }
    } catch (error) {
      if (status) {
        status.textContent = 'Something went wrong. Please try again.';
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});
