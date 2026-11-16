/* Raven cursor companion — 10-frame illustrated sprite, fixed slow speed. */
(function () {
  var SPEED = 170; /* px per second, constant */
  var STILL_MS = 300;
  var JUMP_MS = 160;
  var LAND_MS = 200;
  var IDLE_FRAME_MS = 480;
  var FLY_FRAME_MS = 90;
  var OFFSET = 64;
  var OFFSET_Y = 28;
  var CELL = 380;
  var AX = 209.27737051834148; /* shared ground / body-mapped anchor in the sheet cell */
  var AY = 316.71068931814284;
  var IDLE_SRC_W = 229; /* tight width of a perched bird in the sheet */
  var DESKTOP_BIRD = 100; /* on-screen perched width, px */
  var MOBILE_BIRD = 70;
  var SHEET = "/img/ui/raven-sheet.png";
  /* 0-2 idle, 3 jump, 4-8 flight, 9 landing */
  var IDLE = [0, 1, 2, 1];
  var FLY = [4, 5, 6, 7, 8];

  function birdWidth() {
    return window.innerWidth <= 700 ? MOBILE_BIRD : DESKTOP_BIRD;
  }
  function cellDisplay() {
    return birdWidth() * (CELL / IDLE_SRC_W);
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("raven-demo");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var img = new Image();
  img.src = SHEET;

  var dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  function resize() {
    dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  var pos = { x: 80, y: window.innerHeight - 80 };
  var mouse = { x: pos.x + OFFSET, y: pos.y - OFFSET_Y };
  var hasPointer = false;
  var lastMove = 0;
  var face = 1;
  var state = "idle"; /* idle | jump | fly | land */
  var stateUntil = 0;
  var lastTs = 0;

  function targetBeside() {
    var side = mouse.x >= pos.x ? -1 : 1;
    return { x: mouse.x + side * OFFSET, y: mouse.y + OFFSET_Y };
  }

  function setPointer(x, y, moving) {
    mouse.x = x;
    mouse.y = y;
    hasPointer = true;
    if (moving) lastMove = performance.now();
  }

  window.addEventListener("mousemove", function (e) {
    var moved = Math.abs(e.clientX - mouse.x) + Math.abs(e.clientY - mouse.y) > 1;
    setPointer(e.clientX, e.clientY, moved);
  }, { passive: true });

  window.addEventListener("touchstart", function (e) {
    if (!e.touches[0]) return;
    setPointer(e.touches[0].clientX, e.touches[0].clientY, true);
  }, { passive: true });

  window.addEventListener("touchmove", function (e) {
    if (!e.touches[0]) return;
    setPointer(e.touches[0].clientX, e.touches[0].clientY, true);
  }, { passive: true });

  function frameIndex(now) {
    if (state === "jump") return 3;
    if (state === "land") return 9;
    if (state === "fly") return FLY[Math.floor(now / FLY_FRAME_MS) % FLY.length];
    return IDLE[Math.floor(now / IDLE_FRAME_MS) % IDLE.length];
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    if (reduce) {
      draw(0, 1);
      return;
    }

    var tgt = hasPointer ? targetBeside() : { x: pos.x, y: pos.y };
    var dx = tgt.x - pos.x;
    var dy = tgt.y - pos.y;
    var dist = Math.hypot(dx, dy);
    var movingPointer = hasPointer && (ts - lastMove) < STILL_MS;

    if (dist > 3) {
      if (dx !== 0) face = dx > 0 ? 1 : -1;
      if (state === "idle" || state === "land") {
        state = "jump";
        stateUntil = ts + JUMP_MS;
      } else if (state === "jump" && ts >= stateUntil) {
        state = "fly";
      }
      var step = SPEED * dt;
      if (step >= dist) {
        pos.x = tgt.x;
        pos.y = tgt.y;
      } else {
        pos.x += (dx / dist) * step;
        pos.y += (dy / dist) * step;
      }
    } else {
      pos.x = tgt.x;
      pos.y = tgt.y;
      if (state === "fly" || state === "jump") {
        state = "land";
        stateUntil = ts + LAND_MS;
      } else if (state === "land" && ts >= stateUntil) {
        state = "idle";
      } else if (movingPointer && state === "idle") {
        /* pointer jitter but still close: stay idle */
      }
    }

    draw(frameIndex(ts), face);
    requestAnimationFrame(tick);
  }

  function draw(fi, facing) {
    var w = canvas.width, h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!img.complete || !img.naturalWidth) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
    var S = cellDisplay();
    var scale = S / CELL;
    var ax = AX * scale;
    var ay = AY * scale;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(facing, 1);
    ctx.drawImage(img, fi * CELL, 0, CELL, CELL, -ax, -ay, S, S);
    ctx.restore();
  }

  if (reduce) {
    img.onload = function () { draw(0, 1); };
    if (img.complete) draw(0, 1);
  } else {
    if (img.complete) requestAnimationFrame(tick);
    else img.onload = function () { requestAnimationFrame(tick); };
  }
})();
