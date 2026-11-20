(function () {
  var root = document.documentElement, KEY = "portfolio-theme";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- theme toggle (saved theme is applied earlier by the inline script in <head>) ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function effective() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return mq.matches ? "dark" : "light";
  }
  function syncTheme() {
    var dark = effective() === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  themeBtn.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    syncTheme();
  });
  mq.addEventListener("change", syncTheme);
  syncTheme();

  /* ---------- nav: sits at 70px like the design, sticks to the top once you scroll past it ---------- */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("stuck", window.scrollY > 54); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
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

  /* ---------- prototype "Scroll to" links: ease-out scroll with the durations set in Figma ---------- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  document.querySelectorAll("a[data-scroll-ms]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").split("#")[1];
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var start = window.scrollY;
      var end = id === "home" ? 0 : target.getBoundingClientRect().top + start;
      var ms = reduceMotion.matches ? 0 : Number(a.getAttribute("data-scroll-ms")) || 300;
      history.pushState(null, "", "#" + id);
      if (!ms) { window.scrollTo(0, end); return; }
      var t0 = performance.now();
      root.style.scrollBehavior = "auto";
      (function step(now) {
        var p = Math.min(1, (now - t0) / ms);
        window.scrollTo(0, start + (end - start) * easeOut(p));
        if (p < 1) requestAnimationFrame(step); else root.style.scrollBehavior = "";
      })(t0);
    });
  });

  /* links without a destination yet (e.g. project Visit buttons) do nothing */
  document.querySelectorAll('a[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* ---------- star ratings ---------- */
  var STAR = '<path d="M5 .6l1.3 2.8 3 .3-2.3 2 .7 3L5 7.1 2.3 8.7l.7-3-2.3-2 3-.3z"/>';
  document.querySelectorAll(".stars[data-rating]").forEach(function (el) {
    var n = Math.max(0, Math.min(5, Number(el.getAttribute("data-rating")) || 0)), html = "";
    for (var i = 1; i <= 5; i++) html += '<svg viewBox="0 0 10 10" aria-hidden="true"' + (i > n ? ' class="off"' : "") + ">" + STAR + "</svg>";
    el.innerHTML = html;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", n + " out of 5");
  });

  /* ---------- experience "Show All" ---------- */
  var xpList = document.getElementById("xp-list"), showAll = document.getElementById("show-all");
  if (xpList && showAll) {
    if (xpList.children.length <= 3) showAll.hidden = true;
    showAll.addEventListener("click", function () {
      var expand = xpList.classList.contains("collapsed");
      xpList.classList.toggle("collapsed", !expand);
      showAll.setAttribute("aria-expanded", String(expand));
      showAll.firstChild.nodeValue = expand ? "Show Less " : "Show All ";
    });
  }

  /* ---------- FAQ: one answer open at a time ---------- */
  var faqs = document.querySelectorAll(".faq details");
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Let's Connect overlay (prototype: Let's Talk → overlay, move in from right, 70% scrim, close on outside click) ---------- */
  var EMAIL = "chedrickivansalazar@gmail.com";
  var dlg = document.createElement("dialog");
  dlg.className = "connect";
  dlg.setAttribute("aria-labelledby", "connect-title");
  dlg.innerHTML =
    '<button class="x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<h2 id="connect-title">Let’s Connect</h2>' +
    '<p class="sub">Interested in working together or hiring? Drop me a message below.</p>' +
    '<div class="who"><picture><source srcset="img/headshot.webp" type="image/webp"><img src="img/headshot.jpg" alt="" width="40" height="40"></picture>' +
    '<div><b>Chedrick Ivan Salazar</b><a href="mailto:' + EMAIL + '">' + EMAIL + "</a></div></div>" +
    '<form class="cform" novalidate>' +
    '<div><label for="c-name">Name</label><input id="c-name" name="name" autocomplete="name" placeholder="Enter your name" required></div>' +
    '<div class="email-f"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" placeholder="Enter your email" required></div>' +
    '<div class="full msg"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required></textarea></div>' +
    '<p class="err" role="alert" aria-live="polite"></p>' +
    '<button class="send" type="submit">Send Message</button>' +
    "</form>";
  document.body.appendChild(dlg);

  var form = dlg.querySelector("form"), err = dlg.querySelector(".err"), opener = null;
  function openConnect(e) {
    opener = e && e.currentTarget;
    setOpen(false);
    err.textContent = "";
    dlg.classList.remove("closing");
    dlg.showModal();
    document.body.classList.add("modal-open");
  }
  function closeConnect() {
    if (!dlg.open || dlg.classList.contains("closing")) return;
    if (reduceMotion.matches) { finish(); return; }
    dlg.classList.add("closing");
    dlg.addEventListener("animationend", finish, { once: true });
    function finish() {
      dlg.classList.remove("closing");
      dlg.close();
    }
  }
  dlg.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    if (opener) opener.focus();
  });
  dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeConnect(); });
  dlg.querySelector(".x").addEventListener("click", closeConnect);
  dlg.addEventListener("mousedown", function (e) {
    if (e.target !== dlg) return;
    var r = dlg.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) closeConnect();
  });
  document.querySelectorAll("[data-open-connect]").forEach(function (b) { b.addEventListener("click", openConnect); });

  /* No backend on a static site: Send Message opens the visitor's email app with the message filled in. */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
    var bad = !name ? form.name : !/^\S+@\S+\.\S+$/.test(email) ? form.email : !msg ? form.message : null;
    if (bad) {
      err.textContent = bad === form.email ? "Please enter a valid email address." : "Please fill in your " + (bad === form.name ? "name." : "message.");
      bad.focus();
      return;
    }
    err.textContent = "";
    var subject = "Portfolio inquiry from " + name;
    var body = msg + "\n\n" + name + "\n" + email;
    window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    form.reset();
    closeConnect();
  });
})();
