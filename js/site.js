(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Hero slider: one slide visible, no peeking */
  var hero = document.querySelector(".hero");
  if (hero) {
    var track = hero.querySelector(".hero-track");
    var slides = hero.querySelectorAll(".hero-slide");
    var dots = hero.querySelectorAll(".hero-dot");
    var i = 0, n = slides.length, timer;
    function go(to) {
      i = (to + n) % n;
      track.style.transform = "translateX(" + (-i * (100 / n)) + "%)";
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    }
    function play() {
      stop();
      timer = setInterval(function () { go(i + 1); }, 6500);
    }
    function stop() { if (timer) clearInterval(timer); }
    hero.querySelectorAll(".hero-arrow").forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(i + (btn.classList.contains("prev") ? -1 : 1));
        play();
      });
    });
    dots.forEach(function (d, k) {
      d.addEventListener("click", function () { go(k); play(); });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", play);
    go(0);
    play();
  }

  /* Portfolio lightbox */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    document.querySelectorAll(".gallery-grid a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        lbImg.src = a.getAttribute("href");
        lbImg.alt = (a.querySelector("img") && a.querySelector("img").alt) || "";
        lb.classList.add("open");
      });
    });
    function close() { lb.classList.remove("open"); lbImg.src = ""; }
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest("button")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* Demo forms: do not send (guard also blocks). Show a short note. */
  document.querySelectorAll("form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = f.querySelector(".demo-note");
      if (note) { note.classList.add("show"); }
    }, true);
    var btn = f.querySelector("[type=submit]");
    if (btn) btn.addEventListener("click", function () {
      var note = f.querySelector(".demo-note");
      if (note) { note.classList.add("show"); }
    });
  });
})();
