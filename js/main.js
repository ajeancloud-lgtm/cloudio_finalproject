/* Jean Cloud D. Alipa | Portfolio scripts (front end only) */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Header background + scroll progress ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.getElementById("progress");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 8);
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Highlight the current section in the nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          var active = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("is-active", active);
          if (active) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });

    /* Clear the highlight while the hero is on screen */
    var hero = document.getElementById("home");
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        links.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
      }
    }, { rootMargin: "-45% 0px -50% 0px" }).observe(hero);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 3) * 70) + "ms";
      reveal.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero stats: count from the real content ---------- */
  document.querySelectorAll("[data-count-of]").forEach(function (el) {
    var target = document.querySelectorAll(el.getAttribute("data-count-of")).length || Number(el.textContent);
    if (reduceMotion || !("IntersectionObserver" in window)) { el.textContent = target; return; }
    el.textContent = "0";
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.setTimeout(function () { window.requestAnimationFrame(step); }, 500);
  });

  /* ---------- Project filters ---------- */
  var filters = document.querySelectorAll(".filter");
  var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
  var emptyNote = document.getElementById("emptyNote");

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.getAttribute("data-filter");
      var visible = [];

      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });

      projects.forEach(function (p) {
        var match = group === "all" || p.getAttribute("data-category") === group;
        p.hidden = !match;
        p.classList.remove("featured", "wide");
        if (match) visible.push(p);
      });

      /* First visible card is the large one. If the rest don't pair up
         evenly, the last card goes full width so there is no empty gap. */
      if (visible.length) {
        visible[0].classList.add("featured");
        if ((visible.length - 1) % 2 === 1) visible[visible.length - 1].classList.add("wide");
      }
      emptyNote.hidden = visible.length !== 0;
    });
  });

  /* ---------- "Ask about this project" pre-fills the message ---------- */
  var form = document.getElementById("contactForm");
  var messageField = document.getElementById("message");

  document.querySelectorAll(".project-link").forEach(function (a) {
    a.addEventListener("click", function () {
      var title = a.closest(".project").getAttribute("data-title");
      if (!messageField.value.trim()) {
        messageField.value = "Hi Jean, I'd like to know more about " + title + ".";
      }
    });
  });

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  var status = document.getElementById("formStatus");
  var TO_EMAIL = "your.email@example.com"; // TODO: put your real email here

  function showError(id, message) {
    var input = document.getElementById(id);
    var error = document.getElementById(id + "Error");
    error.textContent = message;
    input.closest(".field").classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var message = messageField.value.trim();
    var valid = true;

    showError("name", name ? "" : "Please enter your name.");
    showError("email", "");
    showError("message", message ? "" : "Please write a short message.");

    if (!name) valid = false;
    if (!message) valid = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("email", "Please enter a valid email, like name@example.com.");
      valid = false;
    }

    if (!valid) {
      var firstError = form.querySelector(".has-error input, .has-error textarea");
      if (firstError) firstError.focus();
      return;
    }

    var subject = encodeURIComponent("Portfolio message from " + name);
    var body = encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ")");
    window.location.href = "mailto:" + TO_EMAIL + "?subject=" + subject + "&body=" + body;
    status.textContent = "Thanks, " + name + "! Your email app should open so you can send the message.";
    form.reset();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
