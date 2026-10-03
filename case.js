/* Case study navigation: builds an "On this page" list from the section headings and highlights where you are. */
(function () {
  var body = document.querySelector('.cs-body');
  if (!body) return;
  var heads = Array.prototype.slice.call(body.querySelectorAll('.cs-section > h2, .cs-learned > h2')).filter(function (h) { return !h.parentElement.classList.contains('no-toc'); });
  if (heads.length < 3) return;
  var nav = document.createElement('nav');
  nav.className = 'cs-toc';
  nav.setAttribute('aria-label', 'On this page');
  var list = document.createElement('ul');
  var links = [];
  heads.forEach(function (h, i) {
    var sec = h.parentElement;
    if (!sec.id) sec.id = 's' + (i + 1);
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + sec.id;
    a.textContent = h.getAttribute('data-toc') || h.textContent;
    li.appendChild(a);
    list.appendChild(li);
    links.push({ a: a, sec: sec });
  });
  nav.appendChild(list);
  body.insertBefore(nav, body.firstChild);
  body.classList.add('has-toc');

  function setActive(sec) {
    links.forEach(function (l) {
      var on = l.sec === sec;
      l.a.classList.toggle('on', on);
      if (on) l.a.setAttribute('aria-current', 'true'); else l.a.removeAttribute('aria-current');
    });
    var cur = nav.querySelector('a.on');
    if (cur && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: cur.offsetLeft - 24, behavior: 'smooth' });
    }
  }
  setActive(links[0].sec);
  if (!('IntersectionObserver' in window)) return;
  var visible = {};
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
    for (var i = 0; i < links.length; i++) {
      if (visible[links[i].sec.id]) { setActive(links[i].sec); return; }
    }
  }, { rootMargin: '-96px 0px -55% 0px' });
  links.forEach(function (l) { io.observe(l.sec); });
  window.addEventListener('scroll', function () {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive(links[links.length - 1].sec);
  }, { passive: true });
})();
