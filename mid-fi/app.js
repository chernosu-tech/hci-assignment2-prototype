(function () {
  "use strict";
  const params = new URLSearchParams(location.search);
  const VIEW = params.get("view") || "both";
  const NS = "ts-midfi-" + (params.get("session") || "default");
  let partner = params.get("partner") === "auto";

  const RECAP = [
    "Open Community Clinic and go to My appointments.",
    "Check the date and time: Thu 14 Nov, 09:30.",
    "Tap 'Confirm booking' once. It does not book twice.",
    "Note the booking number (A-0236).",
  ];
  const CHIPS = [
    "This confirms your Thursday 9:30 visit.",
    "It will not book twice.",
    "Check the date and time first.",
    "Take your time.",
  ];
  const APPS = [
    { id: "clinic", name: "Community Clinic", color: "#0f766e", letter: "C" },
    { id: "chat", name: "Chat", color: "#16a34a", letter: "Ch" },
    { id: "photos", name: "Photos", color: "#d97706", letter: "P" },
  ];

  const initial = () => ({
    e: "home", tab: "help", app: null, clinic: "list", sharing: "off", pause: null,
    h: "home", pointing: false, markTarget: null, mark: null, markDone: false,
    chips: [], custom: "", askOpen: false, ask: null, reply: null, notif: false,
    endAlert: false, recapEdit: false, recap: RECAP.slice(), saved: [], openSaved: null,
    steps: [], requested: false, helperWaited: false, endedBy: null, talk: false,
    smsPending: false, repeat: 0, toast: null,
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
  function clearTimers() { Object.keys(timers).forEach((k) => { clearTimeout(timers[k]); delete timers[k]; }); }
  function toast(role, text) {
    S.toast = { role, text };
    clearTimeout(timers.__t);
    timers.__t = setTimeout(() => { S.toast = null; render(); }, 2800);
  }
  const step = (t) => S.steps.push(t);

  /* ---------- shared transitions ---------- */
  function helperJoin() {
    if (S.sharing !== "calling" || S.h !== "request") return;
    S.sharing = "active"; S.e = "clinic"; S.h = "view";
    step("You shared Community Clinic with Xiaoyu.");
    toast("elder", "Xiaoyu joined. She can see Community Clinic only.");
  }
  function setClinic(page) {
    if (S.clinic === "confirm" && page !== "confirm" && S.mark && !S.markDone) {
      S.mark = null; S.markTarget = null;
      toast("helper", "Mom left the page, so your mark was removed.");
    }
    S.clinic = page;
  }
  function tapConfirm() {
    S.clinic = "success"; S.markDone = true; S.mark = null; S.markTarget = null; S.askOpen = false;
    step("You tapped 'Confirm booking'.");
    step("The booking was confirmed: A-0236.");
  }
  function buildRecap() {
    if (S.markDone || S.clinic === "success" || S.clinic === "done") return RECAP.slice();
    return [
      "Your booking is not finished yet.",
      "Open Community Clinic and continue the appointment when you are ready.",
      "Ask Xiaoyu for help again if you need it.",
    ];
  }
  function captureRecapEdits() {
    const items = document.querySelectorAll("#phone-elder [data-recap]");
    if (items.length) S.recap = Array.from(items).map((el) => el.innerText.trim()).filter(Boolean);
  }
  function endSession(by) {
    clearTimers();
    S.sharing = "ended"; S.e = "recap"; S.h = "ended"; S.mark = null; S.markTarget = null;
    S.pointing = false; S.endedBy = by; S.endAlert = false; S.askOpen = false; S.recap = buildRecap();
    S.smsPending = false; S.notif = false; S.helperWaited = false; S.recapEdit = false; S.toast = null;
  }
  function privateMessage() {
    if (S.sharing !== "active" && S.sharing !== "paused") return;
    S.notif = true; S.notifAt = Date.now(); S.smsPending = false;
    if (S.sharing === "active") {
      S.sharing = "paused"; S.pause = "private"; S.e = "paused"; S.h = "paused"; S.pointing = false; S.askOpen = false;
      step("A private message arrived, so sharing paused.");
    }
  }
  function resetSession() {
    clearTimers();
    Object.assign(S, { app: null, clinic: "list", sharing: "off", pause: null, h: "home", pointing: false,
      markTarget: null, mark: null, markDone: false, ask: null, reply: null, askOpen: false, notif: false,
      endAlert: false, recapEdit: false, steps: [], helperWaited: false, endedBy: null, talk: false,
      smsPending: false, requested: false, chips: [], custom: "", repeat: 0, toast: null });
  }
  function startFlow(name) {
    clearTimers();
    const saved = S.saved;
    S = initial();
    S.saved = saved;
    if (name === "moderate" || name === "complex") {
      S.app = "clinic"; S.sharing = "active"; S.e = "clinic"; S.h = "view"; S.requested = true;
      step("You shared Community Clinic with Xiaoyu.");
    }
    if (name === "complex") {
      S.clinic = "success"; S.markDone = true; S.smsPending = true;
      step("Xiaoyu marked 'Confirm booking' and explained it.");
      step("You tapped 'Confirm booking'.");
      step("The booking was confirmed: A-0236.");
    }
  }

  /* ---------- actions ---------- */
  const A = {
    "ask-help": () => { resetSession(); S.e = "choose"; },
    pick: (a) => {
      if (a === "bank") { toast("elder", "Banking apps can't be shared. This protects your money."); return; }
      S.app = a;
    },
    "choose-next": () => { if (S.app) S.e = "confirm"; },
    "choose-cancel": () => { S.e = "home"; S.app = null; },
    "confirm-back": () => { S.e = "choose"; },
    "start-share": () => {
      if (S.app !== "clinic") { toast("elder", "Not in this prototype. Choose Community Clinic."); return; }
      S.e = "calling"; S.sharing = "calling"; S.h = "request"; S.requested = true;
    },
    "cancel-call": () => { clearTimers(); S.e = "home"; S.sharing = "off"; S.h = "home"; S.requested = false; toast("helper", "Mom cancelled the request."); },
    "clinic-continue": () => setClinic("confirm"),
    "clinic-back": () => setClinic("list"),
    "clinic-change": () => toast("elder", "Changing the time is not part of this prototype."),
    "clinic-confirm": () => tapConfirm(),
    "clinic-done": () => setClinic("done"),
    pause: () => { S.sharing = "paused"; S.pause = "manual"; S.e = "paused"; S.h = "paused"; S.askOpen = false; step("You paused sharing."); },
    end: () => { S.endAlert = true; },
    "end-cancel": () => { S.endAlert = false; },
    "end-confirm": () => endSession("elder"),
    resume: () => { S.sharing = "active"; S.pause = null; S.e = "clinic"; S.h = "view"; S.notif = false; S.helperWaited = false; step("You resumed sharing."); toast("elder", "Sharing again. Xiaoyu can see Community Clinic."); },
    "see-steps": () => { S.e = "steps"; },
    "steps-back": () => { S.e = "paused"; },
    "notif-dismiss": () => { S.notif = false; },
    repeat: () => { S.repeat++; toast("elder", "Showing Xiaoyu's explanation again."); },
    ask: () => { S.askOpen = true; },
    "ask-send": (q) => { S.ask = q; S.reply = null; S.askOpen = false; },
    "ask-close": () => { S.askOpen = false; },
    "recap-edit": () => {
      if (S.recapEdit) captureRecapEdits();
      S.recapEdit = !S.recapEdit;
    },
    "recap-save": () => {
      if (S.recapEdit) captureRecapEdits();
      S.saved.push({ title: "Book a follow-up visit", steps: S.recap.slice(), date: "Today" });
      S.e = "saved"; S.recapEdit = false;
    },
    "recap-skip": () => { S.e = "home"; S.tab = "help"; resetSession(); toast("elder", "Not saved. Nothing was kept."); },
    "go-home": () => { S.e = "home"; S.tab = "help"; resetSession(); },
    tab: (t) => { S.tab = t; S.e = t === "help" ? "home" : "mysteps"; S.openSaved = null; },
    "open-saved": (i) => { S.e = "mystep"; S.openSaved = Number(i); },
    "mystep-back": () => { S.e = "mysteps"; S.openSaved = null; },
    "mystep-help": () => { S.tab = "help"; S.e = "choose"; S.app = "clinic"; },
    join: () => helperJoin(),
    "not-now": () => { S.h = "declined"; },
    reply: (t) => { resetSession(); S.e = "home"; S.requested = true; toast("elder", "Xiaoyu: " + t); },
    point: () => { S.pointing = !S.pointing; },
    target: (t) => { if (!S.pointing) return; S.markTarget = t; S.pointing = false; S.h = "explain"; },
    explain: () => { S.h = "explain"; },
    chip: (i) => { i = Number(i); S.chips = S.chips.includes(i) ? S.chips.filter((c) => c !== i) : S.chips.concat(i); },
    send: () => {
      const parts = S.chips.slice().sort().map((i) => CHIPS[i]);
      if (S.custom.trim()) parts.push(S.custom.trim());
      if (!parts.length) { toast("helper", "Choose or type what the button does."); return; }
      S.mark = { text: parts.join(" "), target: S.markTarget };
      S.h = "view"; S.chips = []; S.custom = "";
      step("Xiaoyu marked a step and explained it.");
      toast("helper", "Sent. Mom can see your mark and explanation.");
    },
    unmark: () => { S.mark = null; S.markTarget = null; toast("helper", "Mark removed."); },
    "explain-cancel": () => { S.h = "view"; if (!S.mark) S.markTarget = null; },
    talk: () => { S.talk = !S.talk; toast("helper", S.talk ? "Muted. Mom can't hear you." : "Unmuted. Mom can hear you."); },
    leave: () => endSession("helper"),
    wait: () => { S.helperWaited = true; toast("helper", "Mom will see that you are still there."); },
    "h-done": () => { S.h = "home"; },
  };

  /* ---------- scripted partner ---------- */
  function partnerTick() {
    if (S.smsPending && S.sharing === "active") schedule("sms", 2500, privateMessage);
    if (S.notif) schedule("notifHide", Math.max(0, 5000 - (Date.now() - (S.notifAt || 0))), () => { S.notif = false; });
    if (!partner) return;
    const asHelper = VIEW === "elder" || VIEW === "both";
    if (asHelper) {
      if (S.sharing === "calling") schedule("join", 1800, helperJoin);
      if (S.sharing === "active" && S.clinic === "confirm" && !S.mark && !S.markDone) {
        schedule("mark", 2200, () => {
          if (S.clinic !== "confirm" || S.sharing !== "active" || S.mark) return;
          S.markTarget = "confirm";
          S.mark = { text: "This confirms your Thursday 9:30 visit. It will not book twice.", target: "confirm" };
          step("Xiaoyu marked 'Confirm booking' and explained it.");
        });
      }
      if (S.ask && !S.reply) schedule("reply", 1600, () => { S.reply = "Yes, it only confirms the time you already chose. Take your time."; });
    } else if (VIEW === "helper") {
      if (S.e === "home" && S.sharing === "off" && !S.requested) {
        schedule("request", 1200, () => { S.app = "clinic"; S.e = "calling"; S.sharing = "calling"; S.h = "request"; S.requested = true; });
      }
      if (S.sharing === "active" && S.clinic === "list" && !S.markDone) schedule("nav", 1800, () => { if (S.clinic === "list") setClinic("confirm"); });
      if (S.sharing === "active" && S.mark && S.clinic === "confirm") schedule("momtap", 2600, () => { if (S.mark) tapConfirm(); });
      if (S.sharing === "paused" && S.helperWaited) schedule("momresume", 4000, () => {
        if (S.sharing === "paused" && S.helperWaited) {
          S.sharing = "active"; S.pause = null; S.e = "clinic"; S.h = "view"; S.notif = false; S.helperWaited = false;
          step("Xiaoyu waited; Mom resumed sharing.");
        }
      });
    }
  }

  /* ---------- markup helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const chrome = () => '<div class="island"></div><div class="status"><span>9:41</span><span class="icons">&#9679;&#9679;&#9679;&#9679; <span>5G</span> <span class="batt"></span></span></div><div class="home-ind"></div>';
  const btn = (label, act, cls = "btn-primary", extra = "") => `<button class="btn ${cls}" data-act="${act}" ${extra}>${label}</button>`;
  const toastHtml = (role) => (S.toast && S.toast.role === role ? `<div class="toast" role="status">${esc(S.toast.text)}</div>` : "");
  const tabbar = () => `<nav class="tabbar"><button class="tab ${S.tab === "help" ? "on" : ""}" data-act="tab:help"><span class="ico">&#9673;</span>Get help</button><button class="tab ${S.tab === "mysteps" ? "on" : ""}" data-act="tab:mysteps"><span class="ico">&#9776;</span>My steps</button></nav>`;

  function clinicView(where) {
    const mirror = where === "mirror";
    const act = (a, target) => {
      if (mirror) return S.pointing && target ? `data-act="target:${target}" data-target="${target}"` : (target ? `data-target="${target}"` : "");
      return `data-act="${a}"`;
    };
    const marked = (t) => (S.markTarget === t && S.clinic === "confirm" ? "is-marked" : "");
    let body = "";
    if (S.clinic === "list" || S.clinic === "done") {
      const done = S.clinic === "done";
      body = `<p class="sub small">My appointments</p>
        <div class="clinic-card"><div class="k">Follow-up visit</div><div class="v">General Medicine · Dr Wang</div>
        <div class="k" style="margin-top:6px">Thu 14 Nov · 09:30</div>
        <div style="margin-top:8px"><span class="badge ${done ? "ok" : ""}">${done ? "Confirmed · A-0236" : "Waiting for your confirmation"}</span></div></div>
        ${done ? "" : `<button class="c-btn ${marked("continue")}" ${act("clinic-continue", "continue")}>Continue</button>`}`;
    } else if (S.clinic === "confirm") {
      body = `<div class="new-note">New step: please check and confirm your booking.</div>
        <h2 style="margin:0">Confirm your booking</h2>
        <div class="clinic-card"><div class="k">Visit</div><div class="v">Follow-up · General Medicine</div>
        <div class="k" style="margin-top:8px">Doctor</div><div class="v">Dr Wang</div>
        <div class="k" style="margin-top:8px">Date and time</div><div class="v">Thu 14 Nov · 09:30</div></div>
        <button class="c-btn ${marked("confirm")}" ${act("clinic-confirm", "confirm")}>Confirm booking</button>
        <button class="c-link ${marked("change")}" ${act("clinic-change", "change")}>Change time</button>
        <button class="c-link" ${mirror ? "" : 'data-act="clinic-back"'}>&lsaquo; Back</button>`;
    } else if (S.clinic === "success") {
      body = `<div class="big-tick">&#10003;</div><h2 class="center" style="margin:0">Booking confirmed</h2>
        <div class="clinic-card center"><div class="k">Booking number</div><div class="v" style="font-size:24px">A-0236</div>
        <div class="k" style="margin-top:6px">Thu 14 Nov · 09:30 · Dr Wang</div></div>
        <button class="c-btn outline" ${mirror ? "" : 'data-act="clinic-done"'}>Back to my appointments</button>`;
    }
    return `<div class="clinic-head"><div class="ttl">Community Clinic</div><div class="sub2">Appointments</div></div><div class="clinic-body">${body}</div>`;
  }

  /* ---------- older adult's phone ---------- */
  function elderView() {
    let view = "", over = "", frame = "";
    const notif = S.notif ? `<div class="notif" data-act="notif-dismiss"><div class="app-ico" style="background:#7c3aed">CB</div><div><b>City Bank</b> · now<br>Your verification code is 482915. Do not share it with anyone.</div></div>` : "";
    switch (S.e) {
      case "home":
        view = `<div class="view has-tabs"><div class="scroll"><div class="large-title">TogetherStep</div>
          <div class="card helper-card"><div class="avatar">X</div><div><p><b>Xiaoyu</b> (daughter)</p><p class="small sub"><span class="status-dot"></span>Available now</p></div></div>
          <div class="spacer"></div>
          ${btn("Ask Xiaoyu for help", "ask-help", "btn-primary btn-lg")}
          <p class="small sub center">She will see only the app you choose. You stay in control.</p>
          <div class="spacer"></div></div>${tabbar()}</div>`;
        break;
      case "choose":
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="choose-cancel">Cancel</button><span class="nav-title">Step 1 of 2</span><span style="width:48px"></span></div>
          <div class="scroll"><h2>Which app do you need help with?</h2>
          <div class="list">${APPS.map((a) => `<button class="list-row ${S.app === a.id ? "sel" : ""}" data-act="pick:${a.id}"><span class="app-ico" style="background:${a.color}">${a.letter}</span>${a.name}<span class="radio">${S.app === a.id ? "&#10003;" : ""}</span></button>`).join("")}
          <button class="list-row disabled" data-act="pick:bank"><span class="app-ico" style="background:#9aa5b4">&#128274;</span>Banking apps<span class="small" style="margin-left:auto">Never shared</span></button></div>
          <div class="info">Xiaoyu will see <b>only this app</b>. Notifications and other apps stay private.</div>
          <div class="spacer"></div>${btn("Next", "choose-next", "btn-primary btn-lg", S.app ? "" : "disabled")}</div></div>`;
        break;
      case "confirm": {
        const name = (APPS.find((a) => a.id === S.app) || APPS[0]).name;
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="confirm-back">&lsaquo; Back</button><span class="nav-title">Step 2 of 2</span><span style="width:48px"></span></div>
          <div class="scroll"><h2>Share ${esc(name)} with Xiaoyu?</h2>
          <div class="card facts">
            <div class="fact"><span class="mk yes">&#10003;</span><span>She sees <b>${esc(name)} only</b>.</span></div>
            <div class="fact"><span class="mk yes">&#10003;</span><span>She can <b>point and explain</b> the next step.</span></div>
            <div class="fact"><span class="mk no">&#10005;</span><span>She <b>cannot tap or type</b> for you, or see other apps and messages.</span></div>
            <div class="fact"><span class="mk yes">&#10003;</span><span>You can <b>pause or end</b> at any time.</span></div>
          </div><div class="spacer"></div>${btn("Start sharing", "start-share", "btn-primary btn-lg")}</div></div>`;
        break;
      }
      case "calling":
        view = `<div class="view"><div class="scroll"><div class="call-screen"><div class="pulse-ring">X</div><h2>Calling Xiaoyu...</h2>
          <p class="sub">Waiting for her to join. Nothing is shared until she joins.</p></div><div class="spacer"></div>${btn("Cancel request", "cancel-call", "btn-secondary")}</div></div>`;
        break;
      case "clinic": {
        const paused = S.sharing === "paused";
        const presence = S.pointing ? "Xiaoyu is choosing a button to show you..." : S.h === "explain" ? "Xiaoyu is writing an explanation..."
          : S.mark ? "Xiaoyu marked a step for you" : "On a call with Xiaoyu &middot; you can talk";
        const bar = S.sharing === "active" || paused
          ? `<div class="share-bar ${paused ? "paused" : ""}"><span class="lbl">${paused ? "Sharing paused" : "&#9679; Sharing Community Clinic with Xiaoyu"}<br><span class="presence">${presence}</span></span><button class="sb-btn" data-act="pause">Pause</button><button class="sb-btn end" data-act="end">End</button></div>` : "";
        frame = S.sharing === "active" ? '<div class="share-frame"></div>' : "";
        let card = "";
        if (S.clinic === "confirm" && S.mark) {
          card = `<div class="explain-card ${S.repeat ? "flash" : ""}" data-r="${S.repeat}">
            <div class="who"><span class="avatar sm">X</span>Xiaoyu marked a step for you</div>
            <div class="say">"${esc(S.mark.text)}"</div>
            <div class="hint">When you are ready, tap the circled button yourself.</div>
            ${S.ask ? `<div class="small"><b>You asked:</b> ${esc(S.ask)}</div>` + (S.reply ? `<div class="small"><b>Xiaoyu:</b> ${esc(S.reply)}</div>` : '<div class="small sub">Waiting for Xiaoyu...</div>') : ""}
            <div class="btn-row">${btn("Read it again", "repeat", "btn-secondary")}${btn("Ask Xiaoyu", "ask", "btn-secondary")}</div></div>`;
        }
        view = `<div class="view">${bar}<div class="scroll" style="padding:8px 0 0">${clinicView("elder")}</div>${card}</div>`;
        if (S.askOpen) {
          over = `<div class="scrim" data-act="ask-close"></div><div class="sheet"><div class="grab"></div><h2>Ask Xiaoyu</h2>` +
            ["What happens if I tap it?", "Can I undo it afterwards?", "Please wait, I am not ready."].map((q) => btn(esc(q), "ask-send:" + q, "btn-secondary")).join("") +
            btn("Close", "ask-close", "btn-ghost") + "</div>";
        }
        break;
      }
      case "paused":
        frame = '<div class="share-frame paused"></div>';
        view = `<div class="view"><div class="share-bar paused"><span class="lbl">Sharing paused</span></div><div class="scroll">
          <div style="font-size:44px;text-align:center;margin-top:70px">&#9208;</div>
          <h2 class="center">Sharing is paused</h2>
          <p class="center sub">${S.pause === "private" ? "A private message arrived, so we stopped sharing. Xiaoyu did not see it." : "You paused sharing. Xiaoyu cannot see your screen."}</p>
          <div class="spacer"></div>${btn("Resume sharing", "resume", "btn-primary btn-lg")}${btn("See steps so far", "see-steps", "btn-secondary")}${btn("End help", "end", "btn-danger")}</div></div>`;
        break;
      case "steps":
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="steps-back">&lsaquo; Back</button><span class="nav-title">Steps so far</span><span style="width:48px"></span></div>
          <div class="scroll"><ol class="step-list">${S.steps.map((s, i) => `<li><span class="n">${i + 1}</span><span>${esc(s)}</span></li>`).join("")}</ol>
          <div class="info">This is a record of this session. When you end help, you can keep a short reminder of the steps.</div></div></div>`;
        break;
      case "recap":
        view = `<div class="view"><div class="scroll">
          <p class="sub small">${S.endedBy === "helper" ? "Xiaoyu left at 9:52. She can no longer see your screen." : "You ended help at 9:52. Xiaoyu can no longer see your screen."}</p>
          <div class="large-title">Today's steps</div><p class="sub">A short reminder for next time. It stays on your phone only.</p>
          <div class="card"><ol class="step-list">${S.recap.map((s, i) => `<li><span class="n">${i + 1}</span><span data-recap contenteditable="${S.recapEdit}">${esc(s)}</span></li>`).join("")}</ol></div>
          ${btn(S.recapEdit ? "Done editing" : "Edit the words", "recap-edit", "btn-ghost")}
          <div class="spacer"></div>${btn("Save to My steps", "recap-save", "btn-primary btn-lg")}${btn("Don't save", "recap-skip", "btn-secondary")}</div></div>`;
        break;
      case "saved":
        view = `<div class="view"><div class="scroll"><div class="spacer"></div><div class="big-tick">&#10003;</div><h2 class="center">Saved to My steps</h2>
          <p class="center sub">You can open it any time, and ask for help again from there.</p><div class="spacer"></div>${btn("Back to home", "go-home", "btn-primary btn-lg")}</div></div>`;
        break;
      case "mysteps":
        view = `<div class="view has-tabs"><div class="scroll"><div class="large-title">My steps</div>` +
          (S.saved.length ? `<div class="list">${S.saved.map((r, i) => `<button class="list-row" data-act="open-saved:${i}"><span class="app-ico" style="background:#0f766e">C</span><span><b>${esc(r.title)}</b><br><span class="small sub">${r.steps.length} steps · ${esc(r.date)}</span></span><span style="margin-left:auto">&rsaquo;</span></button>`).join("")}</div>`
            : '<p class="sub">Nothing saved yet. After a help session you can keep a short reminder here.</p>') +
          `</div>${tabbar()}</div>`;
        break;
      case "mystep": {
        const r = S.saved[S.openSaved] || { title: "", steps: [] };
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="mystep-back">&lsaquo; My steps</button><span></span><span style="width:48px"></span></div>
          <div class="scroll"><div class="large-title">${esc(r.title)}</div><div class="card"><ol class="step-list">${r.steps.map((s, i) => `<li><span class="n">${i + 1}</span><span>${esc(s)}</span></li>`).join("")}</ol></div>
          <div class="spacer"></div>${btn("Ask Xiaoyu for help with this", "mystep-help", "btn-secondary")}</div></div>`;
        break;
      }
    }
    if (S.endAlert) {
      over += `<div class="scrim"></div><div class="alert"><h3>End help with Xiaoyu?</h3><p class="small sub">She will stop seeing your screen.</p>${btn("End help", "end-confirm", "btn-danger")}${btn("Keep going", "end-cancel", "btn-ghost")}</div>`;
    }
    return chrome() + view + frame + notif + over + toastHtml("elder");
  }

  /* ---------- helper's phone ---------- */
  function helperView() {
    let view = "", over = "";
    switch (S.h) {
      case "home":
        view = `<div class="view"><div class="scroll"><div class="large-title">TogetherStep</div>
          <div class="card helper-card"><div class="avatar">M</div><div><p><b>Mom</b></p><p class="small sub">Not asking for help right now</p></div></div>
          <div class="info">When Mom asks for help, her request appears here. You will only see the app she chooses.</div></div></div>`;
        break;
      case "request":
        view = `<div class="view"><div class="scroll"><div class="call-screen"><div class="pulse-ring">M</div><h2>Mom is asking for help</h2>
          <p class="sub">She wants to share: <b>Community Clinic</b></p></div>
          <div class="card facts"><div class="fact"><span class="mk yes">&#10003;</span><span>You will see Community Clinic only.</span></div>
          <div class="fact"><span class="mk yes">&#10003;</span><span>You can point and explain. Mom does the tapping.</span></div></div>
          <div class="spacer"></div>${btn("Join", "join", "btn-primary btn-lg")}${btn("Not now", "not-now", "btn-secondary")}</div></div>`;
        break;
      case "declined":
        view = `<div class="view"><div class="nav"><span></span><span class="nav-title">Reply to Mom</span><span></span></div><div class="scroll"><h2>Send Mom a quick reply</h2>` +
          ["I'll call you in 10 minutes.", "I'm in a meeting. Try again later.", "Call me now."].map((t) => btn(esc(t), "reply:" + t, "btn-secondary")).join("") + "</div></div>";
        break;
      default: {
        const cover = S.h === "paused"
          ? (S.pause === "private"
            ? `<div class="mirror-cover"><div class="big">&#128274;</div><h2>Sharing paused automatically</h2><p class="sub">A private notification arrived on Mom's phone, so sharing stopped to protect her privacy. You did not see it.</p><p class="sub small">The call is still on. You can wait or talk to her.</p></div>`
            : `<div class="mirror-cover"><div class="big">&#9208;</div><h2>Mom paused sharing</h2><p class="sub">You can't see her screen right now. The call is still on.</p></div>`)
          : S.h === "ended" ? `<div class="mirror-cover"><div class="big">&#10003;</div><h2>Help ended</h2><p class="sub">${S.endedBy === "helper" ? "You left at 9:52." : "Mom ended help at 9:52. Thanks for helping."}</p><p class="sub small">You can no longer see her screen.</p></div>` : "";
        let line = "";
        if (S.h === "view" || S.h === "explain") {
          if (S.pointing) line = '<div class="status-line">Tap the button Mom should press. <b>This only marks it</b> &mdash; nothing is pressed on Mom\'s phone. Dashed boxes show what you can mark.</div>';
          else if (S.mark) line = `<div class="status-line">Sent. <b>Mom can see your mark now.</b>${S.repeat ? " She is reading it again." : ""} Waiting for her to tap.</div>`;
          else if (S.markDone && S.clinic === "success") line = '<div class="status-line ok">&#10003; Mom tapped "Confirm booking". The booking is confirmed.</div>';
          else line = `<div class="status-line">You can see Mom's screen. Point at a button, then explain it.</div>`;
          if (S.ask) line += `<div class="status-line"><b>Mom asks:</b> ${esc(S.ask)}</div>`;
        }
        const tools = S.h === "paused"
          ? `<div class="btn-row">${btn("Wait for Mom", "wait", "btn-secondary")}${btn("Leave", "leave", "btn-danger")}</div>`
          : S.h === "ended" ? btn("Done", "h-done", "btn-primary btn-lg")
            : `<div class="tools"><button class="tool ${S.pointing ? "on" : ""}" data-act="point"><span class="ico">&#9757;</span>${S.pointing ? "Cancel" : "Point"}</button>
               <button class="tool" data-act="explain"><span class="ico">&#128172;</span>Explain</button>
               <button class="tool ${S.talk ? "on" : ""}" data-act="talk"><span class="ico">&#127908;</span>${S.talk ? "Muted" : "Mute"}</button></div>
               ${S.mark ? btn("Remove my mark", "unmark", "btn-ghost") : ""}${btn("Leave", "leave", "btn-ghost")}`;
        const scope = S.h === "paused" ? '<span class="scope-chip paused">&#9208; Paused &middot; you see nothing</span>'
          : S.h === "ended" ? '<span class="scope-chip ended">Ended &middot; sharing stopped</span>'
            : '<span class="scope-chip">&#9679; Live &middot; you see: Community Clinic only</span>';
        view = `<div class="view"><div class="nav"><span></span><span class="nav-title">Helping Mom</span><span></span></div><div class="scroll" style="gap:10px">
          ${scope}
          <div class="mirror-wrap ${S.pointing ? "pointing" : ""}"><div class="mirror">${clinicView("mirror")}</div>${cover}</div>
          ${line}${tools}</div></div>`;
        if (S.h === "explain") {
          const tgt = { confirm: "Confirm booking", change: "Change time", continue: "Continue" }[S.markTarget];
          const preview = S.chips.slice().sort().map((i) => CHIPS[i]).concat(S.custom.trim() ? [S.custom.trim()] : []).join(" ");
          over = `<div class="scrim"></div><div class="sheet"><div class="grab"></div><h2>What will ${tgt ? `"${esc(tgt)}"` : "this"} do?</h2>
            <p class="small sub">Explain the result, not only where to tap.</p>
            ${tgt ? `<div class="small sub">Marked: <b>${esc(tgt)}</b> (marked, not pressed)</div>` : ""}
            <div>${CHIPS.map((c, i) => `<button class="chip ${S.chips.includes(i) ? "on" : ""}" data-act="chip:${i}">${S.chips.includes(i) ? "&#10003; " : ""}${esc(c)}</button>`).join("")}</div>
            <input class="field" id="custom" placeholder="Or type your own words..." value="${esc(S.custom)}">
            <div class="preview"><span class="small sub">Mom will see:</span><br>${preview ? `"${esc(preview)}"` : "<span class='sub'>(nothing yet)</span>"}</div>
            ${btn("Send to Mom", "send", "btn-primary btn-lg")}${btn("Cancel", "explain-cancel", "btn-ghost")}</div>`;
        }
      }
    }
    return chrome() + view + over + toastHtml("helper");
  }

  /* ---------- render + events ---------- */
  const elderEl = document.getElementById("phone-elder");
  const helperEl = document.getElementById("phone-helper");
  function render() {
    const active = document.activeElement && document.activeElement.id === "custom";
    elderEl.innerHTML = elderView();
    helperEl.innerHTML = helperView();
    if (active) { const f = document.getElementById("custom"); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }
    save();
    partnerTick();
  }
  document.addEventListener("click", (ev) => {
    const f = ev.target.closest("[data-facil]");
    if (f) {
      const v = f.dataset.facil;
      if (v === "reset") { clearTimers(); S = initial(); }
      if (v.startsWith("flow:")) startFlow(v.slice(5));
      if (v.startsWith("event:")) privateMessage();
      render(); return;
    }
    const el = ev.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const [name, arg] = el.dataset.act.split(/:(.*)/s);
    if (A[name]) { A[name](arg); render(); }
  });
  document.addEventListener("input", (ev) => {
    if (ev.target.id === "custom") { S.custom = ev.target.value; save(); render(); }
    if (S.recapEdit && ev.target.matches("[data-recap]")) { captureRecapEdits(); save(); }
  });
  const toggle = document.getElementById("partnerToggle");
  toggle.checked = partner;
  toggle.addEventListener("change", () => { partner = toggle.checked; clearTimers(); S.toast = null; render(); });
  if (VIEW !== "both") {
    document.body.classList.add("solo");
    document.querySelector(`.device[data-role="${VIEW}"]`).classList.add("active");
  }
  const hashFlow = (location.hash.match(/flow=(simple|moderate|complex)/) || [])[1];
  if (hashFlow) { startFlow(hashFlow); history.replaceState(null, "", location.pathname + location.search); }

  window.TS = {
    event(name) { if (name === "bank-sms") privateMessage(); render(); },
    flow(name) { startFlow(name); render(); },
    state: () => JSON.parse(JSON.stringify(S)),
    reset() { clearTimers(); S = initial(); render(); },
  };
  render();
})();
