/* All Property Repairs — shared site behaviour */
(function () {
  'use strict';

  /* ---------------- Mobile nav ---------------- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('is-open');
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('is-open');
        panel.classList.remove('is-open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ---------------- Condensed header on scroll ---------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-condensed', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Scroll reveals ---------------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Reviews carousel ---------------- */
  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var cards = Array.prototype.slice.call(carousel.querySelectorAll('.review-card'));
    var dotsWrap = carousel.querySelector('.carousel-dots');
    var prevBtn = carousel.querySelector('[data-prev]');
    var nextBtn = carousel.querySelector('[data-next]');
    var index = 0;
    var autoplayMs = 6000;
    var timer = null;

    function perView() {
      var w = window.innerWidth;
      if (w >= 1100) return 3;
      if (w >= 760) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, cards.length - perView());
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var count = maxIndex() + 1;
      for (var i = 0; i < count; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to review ' + (i + 1));
        if (i === index) b.setAttribute('aria-current', 'true');
        (function (i) {
          b.addEventListener('click', function () { goTo(i); resetAutoplay(); });
        })(i);
        dotsWrap.appendChild(b);
      }
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      var pct = (100 / perView()) * index;
      track.style.transform = 'translateX(-' + pct + '%)';
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (dot, di) {
          if (di === index) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
      }
    }

    function next() { goTo(index >= maxIndex() ? 0 : index + 1); }
    function prev() { goTo(index <= 0 ? maxIndex() : index - 1); }

    function resetAutoplay() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, autoplayMs);
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAutoplay(); });

    carousel.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    carousel.addEventListener('mouseleave', resetAutoplay);
    carousel.addEventListener('focusin', function () { if (timer) clearInterval(timer); });
    carousel.addEventListener('focusout', resetAutoplay);

    window.addEventListener('resize', function () {
      renderDots();
      goTo(Math.min(index, maxIndex()));
    });

    renderDots();
    goTo(0);
    resetAutoplay();
  }
})();
