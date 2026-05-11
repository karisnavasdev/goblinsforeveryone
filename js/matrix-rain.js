/* Matrix digital-rain background.
   Mounts a fixed full-viewport <canvas id="matrixCanvas"> and animates
   columns of falling glyphs. Respects prefers-reduced-motion. */
(function () {
  var canvas = document.getElementById("matrixCanvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "matrixCanvas";
    document.body.insertBefore(canvas, document.body.firstChild);
  }
  var ctx = canvas.getContext("2d");

  var GLYPHS =
    "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ" +
    "0123456789" +
    "ABCDEFGHJKLMNPQRSTUVWXYZ" +
    "<>[]{}/\\|=+-*&^%$#@!?";

  var FONT_SIZE = 16;
  var columns = 0;
  var drops = [];
  var dpr = Math.max(1, window.devicePixelRatio || 1);
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.ceil(w / FONT_SIZE);
    drops = new Array(columns);
    for (var i = 0; i < columns; i++) {
      drops[i] = Math.random() * -50;
    }
  }

  function frame() {
    var w = window.innerWidth;
    var h = window.innerHeight;

    // Trailing fade — paints a translucent black layer each frame
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, w, h);

    ctx.font = "bold " + FONT_SIZE + "px 'Share Tech Mono', 'Courier New', monospace";
    ctx.textBaseline = "top";

    for (var i = 0; i < columns; i++) {
      var x = i * FONT_SIZE;
      var y = drops[i] * FONT_SIZE;
      var ch = GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);

      // Lead character is bright/white-green, trail is darker green
      if (Math.random() < 0.015) {
        ctx.fillStyle = "#d6ffd9";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 8;
      } else if (drops[i] > 0 && Math.random() < 0.08) {
        ctx.fillStyle = "#00ff41";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = "#00b32d";
        ctx.shadowBlur = 0;
      }
      ctx.fillText(ch, x, y);

      drops[i] += 1;
      if (y > h && Math.random() > 0.975) {
        drops[i] = Math.random() * -20;
      }
    }
    ctx.shadowBlur = 0;
  }

  var rafId = null;
  function loop() {
    frame();
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();

  if (reduceMotion) {
    // Single static pass for users who opted out of motion
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    frame();
  } else {
    loop();
  }

  // Pause when tab is hidden — saves cycles
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId && !reduceMotion) {
      loop();
    }
  });
})();
