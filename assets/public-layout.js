/* One interaction layer for every public marketing page. Partner login stays separate. */
(() => {
  const menu = document.getElementById('site-nav-links');
  const toggle = document.getElementById('site-menu-toggle');
  // Mark exact pages, or their parent menu for articles and customer stories.
  const homeLink = document.querySelector('.site-nav .nav-logo');
  const siteRoot = new URL('.', homeLink.href).pathname;
  const routeOf = url => {
    const relative = url.pathname.startsWith(siteRoot) ? url.pathname.slice(siteRoot.length) : url.pathname;
    return '/' + relative.replace(/^\//, '').replace(/\.html$/, '').replace(/^index$/, '').replace(/\/$/, '');
  };
  const updateCurrentMenu = () => {
    const path = routeOf(location);
    homeLink.removeAttribute('aria-current');
    if (path === '/' && !location.hash) homeLink.setAttribute('aria-current', 'page');
    menu.querySelectorAll('a').forEach(link => {
      const url = new URL(link.href, location.href);
      const target = routeOf(url);
      const exact = path === target;
      const child = target !== '/' && path.startsWith(target + '/');
      const active = url.origin === location.origin && (url.hash
        ? exact && location.hash === url.hash
        : (exact && (target !== '/' || !location.hash)) || child);
      link.removeAttribute('aria-current');
      if (active) link.setAttribute('aria-current', exact && !url.hash ? 'page' : 'location');
    });
    const referral = menu.querySelector('.nav-dropdown');
    referral.classList.toggle('is-current', path === '/partners' || path === '/partner-signup');
  };
  updateCurrentMenu();
  window.addEventListener('hashchange', updateCurrentMenu);

  const dialog = document.getElementById('client-signin');
  const closeMenu = () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.querySelectorAll('[data-client-signin]').forEach(button => {
    button.addEventListener('click', () => {
      closeMenu();
      dialog.showModal();
      document.getElementById('client-dashboard-name').focus();
    });
  });
  dialog.addEventListener('close', () => {
    if (toggle.getClientRects().length) toggle.focus();
  });
  dialog.querySelector('.client-signin-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  document.getElementById('client-signin-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('client-dashboard-name');
    const name = input.value.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 63) {
      input.setCustomValidity('Enter only your dashboard name, using letters, numbers and single hyphens.');
      input.reportValidity();
      return;
    }
    if (document.body.dataset.loginPreview) {
      if (name !== 'feedzone') {
        input.setCustomValidity('For this design preview, use feedzone. Other businesses are checked on the live service.');
        input.reportValidity(); return;
      }
      window.location.assign(document.body.dataset.loginPreview); return;
    }
    window.location.assign(`https://${name}.bianalytics.africa/backend/login.php`);
  });
  document.getElementById('client-dashboard-name').addEventListener('input', event => event.target.setCustomValidity(''));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      document.querySelectorAll('.site-nav details[open]').forEach(details => details.removeAttribute('open'));
    }
  });
})();
