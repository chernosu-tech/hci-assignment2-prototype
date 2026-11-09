(function () {
  "use strict";
  const params = new URLSearchParams(location.search);
  const VIEW = params.get("view") || "both";
  const NS = "ts-lofi-" + (params.get("session") || "default");
  let partner = params.get("partner") === "auto";

  const initial = () => ({
    e: "home", app: null, clinic: "list", sharing: "off", pause: null,
    h: "idle", pointing: false, markTarget: null, mark: null, markDone: false,
    chips: [], custom: "", askOpen: false, ask: null, reply: null, notif: false,
    saved: [], savedOpen: null, steps: [], requested: false, helperWaited: false,
    endedBy: null, toast: null, toastRole: null, repeat: 0,
  });

  function load() {
    if (params.get("fresh") === "1") { localStorage.removeItem(NS); return null; }
    try { return JSON.parse(localStorage.getItem(NS)); } catch (e) { return null; }
  }
  let S = Object.assign(initial(), load() || {});
  S.toast = null;
  const save = () => localStorage.setItem(NS, JSON.stringify(S));

  const timers = {};
  function schedule(key, ms, fn) {
    if (timers[key]) return;
    timers[key] = setTimeout(() => { delete timers[key]; fn(); render(); }, ms);
  }
  function toast(role, text) {
    S.toast = text; S.toastRole = role;
    clearTimeout(timers.__toast);
    timers.__toast = setTimeout(() => { S.toast = null; render(); }, 2600);
  }
  const step = (t) => S.steps.push(t);

  const CHIPS = ["This confirms your booking.", "It won't book twice.", "Check the time first."];
  const APPS = [["clinic", "Clinic"], ["chat", "Chat"], ["photos", "Photos"]];

  /* ---------- shared state changes ---------- */
  function helperJoin() {
    S.sharing = "active"; S.e = "clinic"; S.h = "viewing";
    step("You shared Clinic with Xiaoyu");
    toast("elder", "Xiaoyu joined");
  }
  function tapConfirm() {
    S.clinic = "success"; S.markDone = true; S.mark = null; S.markTarget = null; S.askOpen = false;
    step("You tapped 'Confirm booking'");
    step("Booking confirmed: A-0236");
  }
  function endSession(by) {
    S.sharing = "ended"; S.e = "recap"; S.h = "ended"; S.mark = null; S.markTarget = null;
    S.pointing = false; S.endedBy = by;
  }
  function privateMessage() {
    S.notif = true;
    if (S.sharing === "active") {
      S.sharing = "paused"; S.pause = "private"; S.e = "paused"; S.h = "paused"; S.pointing = false;
      step("A private message arrived - sharing paused");
    }
  }

  /* ---------- actions ---------- */
  const A = {
    "ask-help": () => { S.e = "chooseApp"; },
    pick: (a) => { S.app = a; },
    "start-share": () => {
      if (!S.app) { toast("elder", "Choose an app first"); return; }
      S.e = "calling"; S.sharing = "calling"; S.h = "request";
    },
    cancel: () => { S.e = "home"; S.sharing = "off"; S.h = "idle"; },
    "clinic-continue": () => { S.clinic = "confirm"; },
    "clinic-back": () => { S.clinic = "list"; },
    "clinic-confirm": () => tapConfirm(),
    "clinic-done": () => { S.clinic = "done"; },
    pause: () => { S.sharing = "paused"; S.pause = "manual"; S.e = "paused"; S.h = "paused"; step("You paused sharing"); },
    end: () => endSession("elder"),
    resume: () => { S.sharing = "active"; S.pause = null; S.e = "clinic"; S.h = "viewing"; S.notif = false; S.helperWaited = false; step("You resumed sharing"); },
    "end-help": () => endSession("elder"),
    "see-steps": () => { S.e = "steps"; },
    "steps-back": () => { S.e = "paused"; },
    repeat: () => { S.repeat++; toast("elder", "Reading the explanation aloud..."); },
    ask: () => { S.askOpen = true; },
    "ask-send": (q) => { S.ask = q; S.reply = null; S.askOpen = false; },
    "ask-close": () => { S.askOpen = false; },
    "recap-save": () => { S.saved.push("Book a follow-up visit"); S.e = "recapDone"; },
    "recap-skip": () => { S.e = "home"; resetSession(); },
    home: () => { S.e = "home"; resetSession(); },
    "saved-open": () => { S.e = "savedList"; S.savedOpen = null; },
    "saved-view": (i) => { S.savedOpen = Number(i); },
    "saved-back": () => { if (S.savedOpen !== null) S.savedOpen = null; else S.e = "home"; },
    join: () => helperJoin(),
    "not-now": () => { S.h = "idle"; S.sharing = "off"; S.e = "home"; toast("elder", "Xiaoyu can't help right now"); },
    point: () => { S.pointing = !S.pointing; },
    target: (t) => { if (!S.pointing) return; S.markTarget = t; S.pointing = false; S.h = "explain"; },
    explain: () => { S.h = "explain"; },
    chip: (i) => { i = Number(i); S.chips = S.chips.includes(i) ? S.chips.filter((c) => c !== i) : S.chips.concat(i); },
    send: () => {
      const parts = S.chips.slice().sort().map((i) => CHIPS[i]);
      if (S.custom.trim()) parts.push(S.custom.trim());
      if (!parts.length) { toast("helper", "Choose or type an explanation"); return; }
      S.mark = { text: parts.join(" "), target: S.markTarget };
      S.h = "viewing"; S.chips = []; S.custom = "";
      step("Xiaoyu marked a step: " + S.mark.text);
      toast("helper", "Sent to Mom");
    },
    "explain-cancel": () => { S.h = "viewing"; },
    "h-end": () => endSession("helper"),
    wait: () => { S.helperWaited = true; toast("helper", "OK - waiting"); },
    "h-ok": () => { S.h = "idle"; },
  };
  function resetSession() {
    Object.assign(S, { app: null, clinic: "list", sharing: "off", pause: null, h: "idle", pointing: false,
      markTarget: null, mark: null, markDone: false, ask: null, reply: null, askOpen: false, notif: false,
      steps: [], requested: S.requested, helperWaited: false, endedBy: null });
  }

  /* ---------- scripted partner (Wizard-of-Oz) ---------- */
  function partnerTick() {
    if (!partner) return;
    if (VIEW === "elder") {
      if (S.sharing === "calling") schedule("join", 1800, helperJoin);
      if (S.sharing === "active" && S.clinic === "confirm" && !S.mark && !S.markDone) {
        schedule("mark", 2200, () => {
          if (S.clinic !== "confirm" || S.sharing !== "active") return;
          S.markTarget = "confirm";
          S.mark = { text: "This confirms your Thursday 9:30 visit. It won't book twice.", target: "confirm" };
          step("Xiaoyu marked a step");
        });
      }
      if (S.ask && !S.reply) schedule("reply", 1600, () => { S.reply = "Yes. It only confirms the time you already chose."; });
    }
    if (VIEW === "helper") {
      if (S.e === "home" && S.sharing === "off" && !S.requested) {
        schedule("request", 1200, () => { S.app = "clinic"; S.e = "calling"; S.sharing = "calling"; S.h = "request"; S.requested = true; });
      }
      if (S.sharing === "active" && S.clinic === "list" && !S.markDone) schedule("nav", 1800, () => { if (S.clinic === "list") S.clinic = "confirm"; });
      if (S.sharing === "active" && S.mark && S.clinic === "confirm") schedule("momtap", 2600, () => { if (S.mark) tapConfirm(); });
      if (S.sharing === "paused" && S.helperWaited) schedule("momend", 2400, () => { if (S.sharing === "paused") { endSession("elder"); S.saved.push("Book a follow-up visit"); } });
    }
  }

  /* ---------- views ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const status = '<div class="status"><span>9:41</span><span>&#9679;&#9679;&#9679; &#9645;</span></div><div class="homebar"></div>';
  const btn = (label, act, cls = "") => `<button class="btn ${cls}" data-act="${act}">${label}</button>`;
  const toastHtml = (role) => (S.toast && S.toastRole === role ? `<div class="toast">${esc(S.toast)}</div>` : "");

  function clinicView(where) {
    const mirror = where === "mirror";
    const confirmAct = mirror ? (S.pointing ? 'data-act="target:confirm"' : "") : 'data-act="clinic-confirm"';
    const ringed = S.markTarget === "confirm" && S.clinic === "confirm" ? "ring" : "";
    let h = '<div class="app-head">Community Clinic</div>';
    if (S.clinic === "list" || S.clinic === "done") {
      const done = S.clinic === "done";
      h += `<h2>My appointments</h2>
        <div class="card"><p><b>Follow-up visit</b></p><p>General Medicine · Dr Wang</p><p>Thu 14 Nov, 9:30</p>
        <p class="small">${done ? "Confirmed · No. A-0236" : "Not confirmed yet"}</p></div>
        ${done ? "" : `<button class="btn" ${mirror ? "" : 'data-act="clinic-continue"'}>Continue</button>`}`;
    } else if (S.clinic === "confirm") {
      h += `<p class="small">New: please check and confirm</p><h2>Confirm booking</h2>
        <div class="card"><p>Follow-up visit</p><p>Thu 14 Nov, 9:30</p><p>Dr Wang · General Medicine</p></div>
        <div class="${ringed}" data-target="confirm"><button class="btn" ${confirmAct}>Confirm booking</button></div>
        <button class="btn link" ${mirror ? "" : 'data-act="clinic-back"'}>Back</button>`;
    } else if (S.clinic === "success") {
      h += `<div class="center" style="font-size:54px">&#10003;</div><h2 class="center">Booking confirmed</h2>
        <p class="center">No. A-0236 · Thu 14 Nov, 9:30</p>${mirror ? "" : '<p class="center">You did it yourself</p>'}
        <button class="btn" ${mirror ? "" : 'data-act="clinic-done"'}>Done</button>`;
    }
    return h;
  }

  function elderView() {
    let body = "", overlay = "", sharingUi = "";
    const sharingShown = (S.sharing === "active") && S.e === "clinic";
    switch (S.e) {
      case "home":
        body = `<h1>TogetherStep</h1>
          <div class="card"><p><b>Xiaoyu (daughter)</b></p><p class="small"><span class="dot on"></span>Available</p></div>
          <div class="spacer"></div>${btn("Ask for help", "ask-help", "big")}<div class="spacer"></div>
          ${btn(`My saved steps (${S.saved.length})`, "saved-open", "link")}`;
        break;
      case "chooseApp":
        body = `<h1>Share which app?</h1>` +
          APPS.map(([k, n]) => `<div class="card tap ${S.app === k ? "sel" : ""}" data-act="pick:${k}"><p><span class="radio">${S.app === k ? "&#10003;" : ""}</span>${n}</p></div>`).join("") +
          `<p class="center">Only this app will be shared</p><div class="spacer"></div>${btn("Start sharing", "start-share", "big")}${btn("Cancel", "cancel", "link")}`;
        break;
      case "calling":
        body = `<div class="spacer"></div><h1 class="center">Calling Xiaoyu...</h1><p class="center">Clinic will be shared</p><div class="spacer"></div>${btn("Cancel", "cancel", "link")}`;
        break;
      case "clinic":
        body = clinicView("elder");
        if (S.clinic === "confirm" && S.mark) {
          body += `<div class="bubble ${S.repeat ? "flash" : ""}" data-r="${S.repeat}"><p>${esc(S.mark.text)}</p></div>
            <p class="small">Marked by Xiaoyu - you tap it</p>
            <div class="row">${btn("Repeat", "repeat", "small")}${btn("Ask", "ask", "small")}</div>`;
          if (S.ask) body += `<p class="small">You asked: "${esc(S.ask)}"</p>` + (S.reply ? `<div class="bubble"><p class="small">Xiaoyu: ${esc(S.reply)}</p></div>` : "");
        }
        if (S.askOpen) {
          overlay = `<div class="overlay"><h2>Ask Xiaoyu</h2>` +
            ["What does this do?", "Is it safe to tap?", "Can I go back?"].map((q) => btn(q, "ask-send:" + q)).join("") +
            btn("Close", "ask-close", "link") + "</div>";
        }
        if (sharingShown) {
          sharingUi = `<div class="share-frame"></div><div class="share-bar"><span class="lbl">Sharing with Xiaoyu</span><button data-act="pause">Pause</button><button data-act="end">End</button></div>`;
        }
        break;
      case "paused":
        body = (S.notif ? `<div class="notif"><b>City Bank</b> · now<br>Your verification code is 482915. Do not share it.</div>` : "") +
          `${S.pause === "private" ? '<p class="center">&#9993; Private message - hidden</p>' : ""}
          <h1 class="center">Sharing paused</h1><div class="spacer"></div>
          ${btn("Resume sharing", "resume")}${btn("End help", "end-help")}${btn("See steps", "see-steps")}<div class="spacer"></div>`;
        break;
      case "steps":
        body = `<h1>Steps so far</h1><ol>${S.steps.map((s) => `<li><p>${esc(s)}</p></li>`).join("")}</ol><div class="spacer"></div>${btn("Back", "steps-back")}`;
        break;
      case "recap":
        body = `${S.endedBy === "helper" ? '<p class="small">Xiaoyu ended the help session.</p>' : ""}<h1>Today's steps</h1>
          <div class="card"><p>1 Check the time</p><p>2 Tap Confirm once</p><p>3 See booking no.</p></div>
          <div class="spacer"></div><div class="row">${btn("Save", "recap-save")}${btn("Don't save", "recap-skip")}</div>`;
        break;
      case "recapDone":
        body = `<div class="spacer"></div><h1 class="center">Saved &#10003;</h1><p class="center">Find it in My saved steps</p><div class="spacer"></div>${btn("Home", "home")}`;
        break;
      case "savedList":
        if (S.savedOpen === null) {
          body = `<h1>My saved steps</h1>` + (S.saved.length ? S.saved.map((t, i) => `<div class="card tap" data-act="saved-view:${i}"><p>${esc(t)}</p><p class="small">3 steps</p></div>`).join("") : "<p>Nothing saved yet.</p>") +
            `<div class="spacer"></div>${btn("Back", "saved-back")}`;
        } else {
          body = `<h1>${esc(S.saved[S.savedOpen])}</h1><div class="card"><p>1 Check the time</p><p>2 Tap Confirm once</p><p>3 See booking no.</p></div><div class="spacer"></div>${btn("Back", "saved-back")}`;
        }
        break;
    }
    return `${status}<div class="screen ${sharingShown ? "with-bar" : ""}">${body}</div>${sharingUi}${overlay}${toastHtml("elder")}`;
  }

  function helperView() {
    let body = "", overlay = "";
    switch (S.h) {
      case "idle":
        body = `<h1>TogetherStep</h1><div class="card"><p><b>Mom</b></p></div><div class="spacer"></div><p class="center muted">No help requests right now</p><div class="spacer"></div>`;
        break;
      case "request":
        body = `<div class="spacer"></div><h1 class="center">Mom asks for help</h1><p class="center">App: Clinic</p><div class="spacer"></div>${btn("Join", "join", "big")}${btn("Not now", "not-now", "link")}`;
        break;
      case "viewing":
      case "explain":
      case "paused":
      case "ended": {
        const cover = S.h === "paused" ? '<div class="mirror-cover">Sharing paused</div>' : S.h === "ended" ? '<div class="mirror-cover">Help ended</div>' : "";
        body = `<div class="box" style="padding:8px 12px"><p class="small"><b>Sharing: Clinic only</b></p></div>
          <div class="mirror ${S.pointing ? "pointing" : ""}"><div class="mirror-inner">${clinicView("mirror")}</div>${cover}</div>`;
        if (S.h === "paused") {
          body += `<p class="center">Mom's sharing is paused. You cannot see her screen.</p><div class="row">${btn("Wait", "wait")}${btn("End", "h-end")}</div>`;
        } else if (S.h === "ended") {
          body += `<p class="center">Help session ended</p>${btn("OK", "h-ok")}`;
        } else {
          body += `<p class="small center">You see Mom's Clinic app only</p>`;
          if (S.pointing) body += `<p class="center"><b>Tap the place on Mom's screen to mark it</b></p>`;
          else if (S.mark) body += `<p class="center small">Sent. Waiting for Mom...</p>`;
          else if (S.markDone && S.clinic === "success") body += `<p class="center"><b>Mom tapped Confirm booking &#10003;</b></p>`;
          if (S.ask) body += `<p class="small">Mom asked: "${esc(S.ask)}"</p>`;
          body += `<div class="row">${btn(S.pointing ? "Stop pointing" : "Point", "point")}${btn("Explain", "explain")}</div>${btn("End", "h-end", "link")}`;
        }
        if (S.h === "explain") {
          overlay = `<div class="overlay" style="padding-top:90px"><h2>What will this do?</h2>
            <div>${CHIPS.map((c, i) => `<span class="chip ${S.chips.includes(i) ? "on" : ""}" data-act="chip:${i}">${c}</span>`).join("")}</div>
            <input class="field" id="custom" placeholder="Type your own..." value="${esc(S.custom)}">
            <div class="spacer"></div>${btn("Send", "send", "big")}${btn("Cancel", "explain-cancel", "link")}</div>`;
        }
        break;
      }
    }
    return `${status}<div class="screen">${body}</div>${overlay}${toastHtml("helper")}`;
  }

  /* ---------- render + events ---------- */
  const elderEl = document.getElementById("phone-elder");
  const helperEl = document.getElementById("phone-helper");
  function render() {
    elderEl.innerHTML = elderView();
    helperEl.innerHTML = helperView();
    save();
    partnerTick();
  }
  document.addEventListener("click", (ev) => {
    const f = ev.target.closest("[data-facil]");
    if (f) {
      const v = f.dataset.facil;
      if (v === "reset") { S = initial(); Object.keys(timers).forEach((k) => clearTimeout(timers[k])); }
      if (v.startsWith("event:")) TS.event(v.slice(6));
      render(); return;
    }
    const el = ev.target.closest("[data-act]");
    if (!el) return;
    const [name, arg] = el.dataset.act.split(/:(.*)/s);
    if (A[name]) { A[name](arg); render(); }
  });
  document.addEventListener("input", (ev) => { if (ev.target.id === "custom") { S.custom = ev.target.value; save(); } });

  const toggle = document.getElementById("partnerToggle");
  toggle.checked = partner;
  toggle.addEventListener("change", () => { partner = toggle.checked; render(); });
  if (VIEW !== "both") {
    document.body.classList.add("solo");
    document.querySelector(`.device[data-role="${VIEW}"]`).classList.add("active");
  }

  window.TS = {
    event(name) { if (name === "bank-sms") privateMessage(); render(); },
    state: () => JSON.parse(JSON.stringify(S)),
    reset() { S = initial(); render(); },
  };
  render();
})();
