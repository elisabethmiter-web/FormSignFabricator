// "Open in my email", "Text from my phone" and "Copy message": open the staff member's own app and log it on the packet.
(function () {
  const csrf = (document.querySelector('meta[name=csrf]') || {}).content || '';
  document.addEventListener('click', function (e) {
    const a = e.target.closest('.quick-send [data-via]');
    if (!a) return;
    const box = a.closest('.quick-send'), via = a.dataset.via;
    if (via === 'copy') {
      e.preventDefault();
      const done = () => { const t = a.textContent; a.textContent = 'Copied ✓'; setTimeout(() => (a.textContent = t), 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(a.dataset.text).then(done, () => window.prompt('Copy this message:', a.dataset.text));
      else window.prompt('Copy this message:', a.dataset.text);
    }
    if (a.dataset.app && box.dataset.setapp) {   // picked another email: remember it as the default
      const f2 = new FormData(); f2.append('csrf', csrf); f2.append('email_app', a.dataset.app); f2.append('quiet', '1');
      fetch(box.dataset.setapp, { method: 'POST', body: f2, keepalive: true });
      const d = a.closest('details'); if (d) d.open = false;
    }
    const fd = new FormData();
    fd.append('csrf', csrf); fd.append('via', via); fd.append('kind', box.dataset.kind || 'send'); fd.append('who', box.dataset.who || '');
    if (navigator.sendBeacon) navigator.sendBeacon(box.dataset.nudge, fd);
    else fetch(box.dataset.nudge, { method: 'POST', body: fd, keepalive: true });
  });

  // Arrived from "Create and open in my email": open it right away (webmail tabs need a click, so they get a banner).
  const params = new URLSearchParams(location.search);
  if (params.get('compose')) {
    params.delete('compose');
    history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash);
    const main = document.querySelector('#send-panel .quick-send a[data-main]');
    const banner = document.getElementById('compose-banner');
    if (main && main.getAttribute('href').startsWith('mailto:')) {
      setTimeout(() => main.click(), 300);
    } else if (main && banner) {
      banner.hidden = false;
      main.focus();
    }
  }
})();
