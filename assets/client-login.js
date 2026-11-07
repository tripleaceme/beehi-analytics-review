(() => {
  const form = document.querySelector('form');
  const input = document.getElementById('password');
  const toggle = document.querySelector('.password-toggle');
  if (!form || !input || !toggle) return;
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    toggle.textContent = visible ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    toggle.setAttribute('aria-pressed', String(visible));
  });
  // The generated HTML review is deliberately disconnected from authentication.
  if (form.dataset.preview === 'true') form.addEventListener('submit', event => {
    event.preventDefault();
    const feedback = form.querySelector('.preview-feedback');
    feedback.textContent = 'Design preview only. No sign-in request has been sent.';
    feedback.hidden = false;
  });
})();
