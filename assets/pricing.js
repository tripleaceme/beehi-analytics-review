let isYearly = false;
function toggleBilling() {
  isYearly = !isYearly;
  document.getElementById('billing-toggle').setAttribute('aria-checked', String(isYearly));
  document.querySelectorAll('.pricing-card a').forEach(link => {
    const url = new URL(link.href);
    if (isYearly) url.searchParams.set('billing', 'yearly');
    else url.searchParams.delete('billing');
    link.href = url.href;
  });
  document.querySelectorAll('.upfront-total').forEach(el => { el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly; });
  document.getElementById('billing-toggle').classList.toggle('on', isYearly);
  document.getElementById('lbl-monthly').classList.toggle('active', !isYearly);
  document.getElementById('lbl-yearly').classList.toggle('active', isYearly);

  document.querySelectorAll('.pricing-amount').forEach(el => {
    const val = isYearly ? el.dataset.yearly : el.dataset.monthly;
    el.querySelector('.price-value').textContent = val;
  });
  document.querySelectorAll('.pricing-period').forEach(el => {
    const minText = el.querySelector('.min-period');
    if (isYearly) {
      el.querySelector('.period-text').textContent = 'per year';
      if (minText) minText.style.display = 'none';
    } else {
      el.querySelector('.period-text').textContent = 'per month';
      if (minText) minText.style.display = '';
    }
  });
}

