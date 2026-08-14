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

  /* ---------------- Scroll reveals (text blocks + photos) ---------------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-photo');
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

  /* ---------------- Scroll progress bar ---------------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);
  var progressTicking = false;
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progressBar.style.transform = 'scaleX(' + pct + ')';
    progressTicking = false;
  }
  updateProgress();
  window.addEventListener('scroll', function () {
    if (!progressTicking) {
      window.requestAnimationFrame(updateProgress);
      progressTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);

  /* ---------------- Animated stat counters ---------------- */
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    var animateCount = function (el) {
      if (reduceMotion) return;
      var target = parseFloat(el.getAttribute('data-count-to'));
      var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      var suffix = el.getAttribute('data-count-suffix') || '';
      var duration = 1400;
      var start = null;
      function tick(ts) {
        if (!start) start = ts;
        var progress = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) window.requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      }
      window.requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countIo.observe(el); });
    } else {
      counters.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count-to'));
        var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
        el.textContent = target.toFixed(decimals) + (el.getAttribute('data-count-suffix') || '');
      });
    }
  }

  /* ---------------- Magnetic CTA (desktop pointer only) ---------------- */
  var supportsHoverFine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHoverFine && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------------- Reviews carousel ---------------- */
  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var cards = Array.prototype.slice.call(carousel.querySelectorAll('.review-card'));
    var dotsWrap = carousel.querySelector('.carousel-dots');
    var prevBtn = carousel.querySelector('[data-prev]');
    var nextBtn = carousel.querySelector('[data-next]');
    var progressBarEl = carousel.querySelector('.carousel-progress-bar');
    var index = 0;
    var autoplayMs = 6000;
    var timer = null;

    function restartProgressBar() {
      if (!progressBarEl) return;
      progressBarEl.classList.remove('is-animating');
      void progressBarEl.offsetWidth;
      progressBarEl.style.animationDuration = autoplayMs + 'ms';
      progressBarEl.classList.add('is-animating');
    }
    function stopProgressBar() {
      if (!progressBarEl) return;
      progressBarEl.classList.remove('is-animating');
    }

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
      restartProgressBar();
    }
    function pauseAutoplay() {
      if (timer) clearInterval(timer);
      stopProgressBar();
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAutoplay(); });

    carousel.addEventListener('mouseenter', pauseAutoplay);
    carousel.addEventListener('mouseleave', resetAutoplay);
    carousel.addEventListener('focusin', pauseAutoplay);
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
