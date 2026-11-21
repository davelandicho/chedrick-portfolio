(function () {
  var root = document.documentElement, KEY = "portfolio-theme";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* theme toggle */
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

  /* nav */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("stuck", window.scrollY > 54); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile menu */
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

  /* smooth scroll links */
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

  document.querySelectorAll('a[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* star ratings */
  var STAR = '<path d="M5 .6l1.3 2.8 3 .3-2.3 2 .7 3L5 7.1 2.3 8.7l.7-3-2.3-2 3-.3z"/>';
  document.querySelectorAll(".stars[data-rating]").forEach(function (el) {
    var n = Math.max(0, Math.min(5, Number(el.getAttribute("data-rating")) || 0)), html = "";
    for (var i = 1; i <= 5; i++) html += '<svg viewBox="0 0 10 10" aria-hidden="true"' + (i > n ? ' class="off"' : "") + ">" + STAR + "</svg>";
    el.innerHTML = html;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", n + " out of 5");
  });

  /* carousel */
  var phone = window.matchMedia("(max-width: 640px)");
  document.querySelectorAll(".carousel-nav[data-carousel-for]").forEach(function (nav) {
    var track = document.getElementById(nav.getAttribute("data-carousel-for"));
    if (!track) return;
    var real = Array.prototype.slice.call(track.children);
    var n = real.length, CLONES = 2;
    var dotsBox = nav.querySelector(".carousel-dots"), prev = nav.querySelector(".prev"), next = nav.querySelector(".next");
    var all = real, on = false, raf = 0, settleTimer = 0;

    var dots = real.map(function (slide, i) {
      var name = slide.querySelector(".tool b");
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Show skill " + (i + 1) + (name ? ": " + name.textContent : ""));
      d.addEventListener("click", function () { goTo(i + CLONES, true); });
      dotsBox.appendChild(d);
      return d;
    });

    function makeClone(el) {
      var c = el.cloneNode(true);
      c.classList.add("is-clone");
      c.setAttribute("aria-hidden", "true");
      return c;
    }
    function centerOf(i) { var el = all[i]; return el.offsetLeft - track.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2; }
    function nearest() {
      var x = track.scrollLeft, best = 0, bestD = Infinity;
      all.forEach(function (_, i) { var d = Math.abs(centerOf(i) - x); if (d < bestD) { bestD = d; best = i; } });
      return best;
    }
    function realIndex(i) { return ((i - CLONES) % n + n) % n; }
    function goTo(i, smooth) {
      track.scrollTo({ left: centerOf(i), behavior: smooth && !reduceMotion.matches ? "smooth" : "auto" });
    }
    function paint() {
      var i = nearest(), r = realIndex(i);
      all.forEach(function (el, j) { el.classList.toggle("is-active", j === i); });
      dots.forEach(function (d, j) { d.setAttribute("aria-current", String(j === r)); });
    }
    function settle() {
      var i = nearest();
      if (i < CLONES || i >= CLONES + n) {
        var target = realIndex(i) + CLONES;
        track.style.scrollSnapType = "none";
        goTo(target, false);
        track.offsetHeight;
        track.style.scrollSnapType = "";
      }
      paint();
    }
    function onScroll() {
      cancelAnimationFrame(raf); raf = requestAnimationFrame(paint);
      clearTimeout(settleTimer); settleTimer = setTimeout(settle, 140);
    }

    function enable() {
      if (on) return;
      on = true;
      var head = real.slice(-CLONES).map(makeClone), tail = real.slice(0, CLONES).map(makeClone);
      head.forEach(function (c) { track.insertBefore(c, real[0]); });
      tail.forEach(function (c) { track.appendChild(c); });
      all = Array.prototype.slice.call(track.children);
      track.classList.add("is-carousel");
      goTo(CLONES, false);
      paint();
      track.addEventListener("scroll", onScroll, { passive: true });
    }
    function disable() {
      if (!on) return;
      on = false;
      track.removeEventListener("scroll", onScroll);
      track.querySelectorAll(".is-clone").forEach(function (c) { c.remove(); });
      all = real;
      real.forEach(function (el) { el.classList.remove("is-active"); });
      track.classList.remove("is-carousel");
      track.scrollLeft = 0;
    }

    prev.addEventListener("click", function () { goTo(nearest() - 1, true); });
    next.addEventListener("click", function () { goTo(nearest() + 1, true); });
    track.addEventListener("click", function (e) {
      var card = e.target.closest(".skill");
      if (on && card && !card.classList.contains("is-active")) goTo(all.indexOf(card), true);
    });
    window.addEventListener("resize", function () { if (on) { goTo(nearest(), false); paint(); } });
    phone.addEventListener("change", function (e) { if (e.matches) enable(); else disable(); });
    if (phone.matches) enable();
  });

  /* experience show all */
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

  /* faq */
  var faqs = document.querySelectorAll(".faq details");
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* let's connect */
  var EMAIL = "chedrickivansalazar@gmail.com";
  var WEB3FORMS_KEY = "ffebf8e6-5803-41ab-9c22-24f1eaf612f5";
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
    '<input class="hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<p class="err" role="alert" aria-live="polite"></p>' +
    '<button class="send" type="submit">Send Message</button>' +
    "</form>" +
    '<div class="sent" hidden tabindex="-1">' +
    '<span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
    "<h3>Message sent</h3>" +
    "<p>Thanks for reaching out. I’ll get back to you at the email you entered as soon as I can.</p>" +
    '<button class="send again" type="button">Close</button>' +
    "</div>";
  document.body.appendChild(dlg);

  var form = dlg.querySelector("form"), err = dlg.querySelector(".err"), opener = null;
  var sent = dlg.querySelector(".sent"), sendBtn = form.querySelector(".send");
  function openConnect(e) {
    opener = e && e.currentTarget;
    setOpen(false);
    err.textContent = "";
    form.hidden = false;
    sent.hidden = true;
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

  sent.querySelector(".again").addEventListener("click", closeConnect);

  function mailtoHref(name, email, msg) {
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Portfolio inquiry from " + name) +
      "&body=" + encodeURIComponent(msg + "\n\n" + name + "\n" + email);
  }
  function showError(text, name, email, msg) {
    err.innerHTML = "";
    err.appendChild(document.createTextNode(text + " "));
    var a = document.createElement("a");
    a.href = mailtoHref(name, email, msg);
    a.textContent = "Email me directly instead.";
    err.appendChild(a);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sendBtn.disabled) return;
    var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
    var bad = !name ? form.name : !/^\S+@\S+\.\S+$/.test(email) ? form.email : !msg ? form.message : null;
    if (bad) {
      err.textContent = bad === form.email ? "Please enter a valid email address." : "Please fill in your " + (bad === form.name ? "name." : "message.");
      bad.focus();
      return;
    }
    err.textContent = "";

    if (!WEB3FORMS_KEY) {
      window.location.href = mailtoHref(name, email, msg);
      form.reset();
      closeConnect();
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: "Portfolio inquiry from " + name,
        from_name: "Chedrick Salazar Portfolio",
        name: name,
        email: email,
        message: msg,
        botcheck: form.botcheck.checked
      })
    })
      .then(function (res) { return res.json().catch(function () { return { success: false }; }); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || "send failed");
        form.reset();
        form.hidden = true;
        sent.hidden = false;
        sent.focus();
      })
      .catch(function () {
        showError("Sorry, your message couldn’t be sent.", name, email, msg);
      })
      .then(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send Message";
      });
  });
})();
