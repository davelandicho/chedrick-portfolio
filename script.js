(function () {
  var root = document.documentElement, KEY = "portfolio-theme";

  /* theme toggle (saved theme is applied earlier by the inline script in <head>) */
  var btn = document.getElementById("theme-toggle");
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function effective() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return mq.matches ? "dark" : "light";
  }
  function sync() {
    var dark = effective() === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  btn.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    write(next);
    sync();
  });
  mq.addEventListener("change", sync);
  sync();

  /* mobile menu */
  var nav = document.getElementById("nav");
  var menu = document.getElementById("menu-toggle");
  function setOpen(open) {
    nav.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menu.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); menu.focus(); }
  });
  window.matchMedia("(min-width: 641px)").addEventListener("change", function (e) { if (e.matches) setOpen(false); });
})();
