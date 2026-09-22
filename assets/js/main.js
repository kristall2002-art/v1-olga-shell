// Ольга Шевелева — визажист-стилист. Скрипты сайта (без внешних зависимостей).
// Каждый блок независим и обёрнут в try/catch: ошибка в одном виджете
// не должна ломать остальные (в т.ч. появление контента через .reveal).
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("in-view");
      });
    }
  }

  function initNavbar() {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;
    function onScrollNav() {
      navbar.classList.toggle("scrolled", window.pageYOffset > 60);
    }
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();
  }

  function initMobileMenu() {
    var menuToggle = document.getElementById("menuToggle");
    var mobileNav = document.getElementById("mobileNav");
    if (!menuToggle || !mobileNav) return;
    var mobileLinks = mobileNav.querySelectorAll("a");

    menuToggle.addEventListener("click", function () {
      var open = menuToggle.classList.toggle("active");
      mobileNav.classList.toggle("active", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        menuToggle.classList.remove("active");
        mobileNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  function initScrollSpy() {
    var navbar = document.getElementById("navbar");
    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
    if (!sections.length || !navLinks.length) return;

    function updateActiveLink() {
      var scrollY = window.pageYOffset;
      var navHeight = navbar ? navbar.offsetHeight : 0;
      var current = "";
      sections.forEach(function (section) {
        var top = section.offsetTop - navHeight - 20;
        if (scrollY >= top) {
          current = section.getAttribute("id");
        }
      });
      navLinks.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + current);
      });
    }
    window.addEventListener("scroll", updateActiveLink, { passive: true });
    updateActiveLink();
  }

  function initLightbox() {
    var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var lightbox = document.getElementById("lightbox");
    if (!galleryItems.length || !lightbox) return;

    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector("figcaption");
    var btnClose = lightbox.querySelector(".lightbox-close");
    var btnPrev = lightbox.querySelector(".lightbox-prev");
    var btnNext = lightbox.querySelector(".lightbox-next");
    var currentIndex = 0;
    var lastFocused = null;

    function openLightbox(index) {
      currentIndex = index;
      var item = galleryItems[index];
      var img = item.querySelector("img");
      lbImg.src = img.getAttribute("src");
      lbImg.alt = img.getAttribute("alt") || "";
      lbCaption.textContent = img.getAttribute("alt") || "";
      lastFocused = document.activeElement;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      btnClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lbImg.src = "";
      if (lastFocused) {
        lastFocused.focus();
      }
    }

    function showRelative(delta) {
      currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
      openLightbox(currentIndex);
    }

    galleryItems.forEach(function (item, index) {
      item.addEventListener("click", function () {
        openLightbox(index);
      });
    });

    btnClose.addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", function () {
      showRelative(-1);
    });
    btnNext.addEventListener("click", function () {
      showRelative(1);
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showRelative(-1);
      if (e.key === "ArrowRight") showRelative(1);
    });
  }

  function safe(fn, label) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.error) {
        console.error("[olga-shell]", label, err);
      }
    }
  }

  // Reveal runs first and on its own: if any other widget throws,
  // page content must still become visible.
  safe(initReveal, "reveal");
  safe(initNavbar, "navbar");
  safe(initMobileMenu, "mobile-menu");
  safe(initScrollSpy, "scroll-spy");
  safe(initLightbox, "lightbox");
})();
