// Trip Handbook Vietnam — home search + currency converter
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('dest-search');
  if (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.dest-card'));
    var count = document.getElementById('search-count');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var hit = !q || (c.getAttribute('data-search') || '').toLowerCase().indexOf(q) !== -1;
        c.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      if (count) count.textContent = shown + ' of ' + cards.length + ' destinations';
    });
  }
  var form = document.getElementById('converter-form');
  if (form) {
    var FALLBACK = { VND: 26000 }; // 1 USD ~ 26,000 VND, November 2026 (from the guides)
    var rates = null, live = false;
    var status = document.getElementById('conv-status');
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(function (r) { return r.json(); })
      .then(function (d) { rates = d.rates; live = true;
        status.textContent = 'Live rates loaded (' + (d.date || 'today') + ').'; })
      .catch(function () {
        rates = FALLBACK; live = false;
        status.textContent = 'Live rates unavailable — using the November 2026 fallback (USD ↔ VND only).'; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = parseFloat(document.getElementById('conv-amount').value);
      var from = document.getElementById('conv-from').value;
      var to = document.getElementById('conv-to').value;
      var out = document.getElementById('conv-result');
      if (isNaN(amount)) { out.textContent = 'Enter an amount first.'; return; }
      if (!rates) { out.textContent = 'Rates are still loading — try again in a moment.'; return; }
      function toUSD(cur, amt) {
        if (cur === 'USD') return amt;
        if (cur === 'VND') return amt / rates.VND;
        if (!live || !rates[cur]) return null;
        return amt / rates[cur];
      }
      function fromUSD(cur, amt) {
        if (cur === 'USD') return amt;
        if (cur === 'VND') return amt * rates.VND;
        if (!live || !rates[cur]) return null;
        return amt * rates[cur];
      }
      var usd = toUSD(from, amount);
      if (usd === null) { out.textContent = 'That pair needs live rates — check the XE Currency app.'; return; }
      var result = fromUSD(to, usd);
      if (result === null) { out.textContent = 'That pair needs live rates — check the XE Currency app.'; return; }
      var fmt = function (n, cur) {
        return n.toLocaleString('en-US', { maximumFractionDigits: cur === 'VND' ? 0 : 2 });
      };
      out.textContent = fmt(amount, from) + ' ' + from + ' = ' + fmt(result, to) + ' ' + to +
        (live ? '' : ' (November 2026 fallback rate)');
    });
  }
});
