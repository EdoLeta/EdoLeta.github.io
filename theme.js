/* Light/dark toggle. The saved choice is applied in <head> before paint; this wires the button. */
(function () {
  var root = document.documentElement;
  document.querySelectorAll('.theme-toggle').forEach(function (b) {
    function label() { b.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); }
    label();
    b.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      label();
    });
  });
})();
