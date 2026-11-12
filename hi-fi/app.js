(function () {
  "use strict";
  const params = new URLSearchParams(location.search);
  const VIEW = params.get("view") || "both";
  const NS = "ts-hifi-" + (params.get("session") || "default");
  let partner = params.get("partner") === "auto";

  const svg = (d) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    point: svg('<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4.4 15a1.6 1.6 0 0 1 2.4-2.1L9 15"/>'),
    chat: svg('<path d="M20 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    micOff: svg('<path d="M3 3l18 18M9 9v2a3 3 0 0 0 5 2.2M15 9.3V6a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.6 2.8M12 18v3"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    shield: svg('<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>'),
    pause: svg('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'),
    play: svg('<path d="M7 5l12 7-12 7z"/>'),
    stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    heart: svg('<path d="M12 20s-7-4.4-9.2-8.6A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.4C19 15.6 12 20 12 20z"/>'),
    list: svg('<path d="M10 6h10M10 12h10M10 18h10M4 6l1.2 1.2L7 5M4 12l1.2 1.2L7 11M4 18l1.2 1.2L7 17"/>'),
    chevR: svg('<path d="M9 5l7 7-7 7"/>'),
    chevUp: svg('<path d="M6 15l6-6 6 6"/>'),
    volume: svg('<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    question: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>'),
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>'),
    phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    cross: svg('<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" fill="currentColor" stroke="none"/>'),
    bubble: svg('<path d="M4 5h16v11H9l-5 4z" fill="currentColor" stroke="none"/>'),
    photo: svg('<rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" stroke="none"/><circle cx="9" cy="10" r="2" fill="#fff" stroke="none"/><path d="M5 17l5-5 4 4 2-2 3 3" stroke="#fff"/>'),
    bank: svg('<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>'),
    eye: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  };
  const APPS = [
    { id: "clinic", name: "Community Clinic", color: "#0f766e", icon: I.cross, supported: true, personal: null },
    { id: "chat", name: "Chat", color: "#15803d", icon: I.bubble, supported: false, personal: "your chats and messages in Chat" },
    { id: "photos", name: "Photos", color: "#b45309", icon: I.photo, supported: false, personal: "the photos you scroll past in Photos" },
  ];
  const REASONS = ["Confirm or book a visit", "Something looks different", "I'm not sure"];
  const CHIP_SETS = {
    confirm: ["This confirms your Thursday 9:30 visit.", "It books only once.", "Check the date and time first.", "Take your time."],
    change: ["This lets you pick a different day or time.", "Nothing is booked yet.", "Take your time."],
    continue: ["This opens the page where you confirm.", "Nothing is booked yet.", "Take your time."],
    back: ["This goes back to your appointments.", "Nothing changes.", "Take your time."],
  };
  const TARGET_LABEL = { confirm: "Confirm booking", change: "Change time", continue: "Continue", back: "Back" };
  const chipsFor = () => CHIP_SETS[S.markTarget] || CHIP_SETS.confirm;
  const QUESTIONS = [
    ["What happens if I tap it?", false],
    ["Can I change it later?", false],
    ["Please wait, I'm not ready.", true],
  ];
  const ANSWERS = {
    "What happens if I tap it?": {
      confirm: "It confirms your Thursday 9:30 visit with Dr Wang. It books only once.",
      change: "It lets you pick a different day or time. Nothing is booked yet.",
      continue: "It opens the page where you check and confirm. Nothing is booked yet.",
      back: "It goes back to your appointments. Nothing changes.",
    },
    "Can I change it later?": {
      confirm: "Confirming books Thu 14 Nov at 09:30. This Clinic demo has no cancel or reschedule button; in real use, call the clinic reception if you need to change a confirmed visit.",
      change: "Nothing is booked yet on this page (rescheduling is not simulated in this Clinic demo).",
      continue: "Opening the next page does not book anything yet; you can still go back before confirming.",
      back: "Going back leaves your visit unconfirmed; nothing is changed yet.",
      default: "Nothing is final on this step; check the details before confirming.",
    },
    "Please wait, I'm not ready.": { default: "No rush. I'll wait until you're ready." },
  };
  const TYPED_REPLY = "Let me check, and I'll tell you on the call.";
  const isStatement = (q) => (QUESTIONS.find(([x]) => x === q) || [])[1] === true;
  function answerFor(q) {
    const a = ANSWERS[q];
    if (!a) return null;
    const t = S.mark ? S.mark.target : "confirm";
    return a[t] || a.default || a.confirm;
  }
  const PAGE_OF = { continue: "list", confirm: "confirm", change: "confirm", back: "confirm" };
  const markOnPage = () => !!S.mark && PAGE_OF[S.mark.target] === S.clinic;

  const initial = () => ({
    e: "home", tab: "help", app: null, reason: null, chooseHint: false, bankInfo: false, demoInfo: null, demoAlert: false,
    clinic: "list", sharing: "off", pause: null, pauseSheet: false, momMuted: false,
    h: "home", pointing: false, markTarget: null, mark: null, markDone: false, tipHidden: false,
    chips: [], custom: "", askOpen: false, askText: "", ask: null, reply: null, notif: false, notifAt: 0,
    endAlert: false, skipAlert: false, leaveAlert: false, recapEdit: false, recapDirty: false, recap: null, recapTitle: "Book a follow-up visit",
    saved: [], openSaved: null, savedEdit: false, deleteAlert: false,
    steps: [], requested: false, helperWaited: false, endedBy: null, talk: false, smsPending: false, wrongTap: null,
    repeat: 0, speaking: false, toasts: { elder: null, helper: null }, declineMsg: null, lastReply: null,
  });
  function load() {
    if (params.get("fresh") === "1") { localStorage.removeItem(NS); return null; }
    try { return JSON.parse(localStorage.getItem(NS)); } catch (e) { return null; }
  }
  let S = Object.assign(initial(), load() || {});
  S.toasts = { elder: null, helper: null }; S.speaking = false;
  const save = () => localStorage.setItem(NS, JSON.stringify(S));

  const timers = {};
  function schedule(key, ms, fn) {
    if (timers[key]) return;
    timers[key] = setTimeout(() => { delete timers[key]; fn(); render(); }, ms);
  }
  function clearTimers() { Object.keys(timers).forEach((k) => { clearTimeout(timers[k]); delete timers[k]; }); }
  function toast(role, text) {
    S.toasts[role] = text;
    clearTimeout(timers["__t" + role]);
    timers["__t" + role] = setTimeout(() => { S.toasts[role] = null; render(); }, 2800);
  }
  function followMark(target) {
    if (!S.mark || S.mark.target !== target) return false;
    step(`You tapped the marked \u201c${TARGET_LABEL[target]}\u201d.`);
    toast("helper", `Mom tapped \u201c${TARGET_LABEL[target]}\u201d, the button you marked.`);
    S.mark = null; S.markTarget = null; S.askOpen = false;
    return true;
  }
  const step = (t, minor = false) => S.steps.push({ t, minor });
  const appName = () => (APPS.find((a) => a.id === S.app) || APPS[0]).name;

  /* ---------- recap built from what actually happened ---------- */
  function buildRecap() {
    if (S.markDone || S.clinic === "success" || S.clinic === "done") {
      return {
        done: true,
        steps: [
          "Open Community Clinic.",
          "On My appointments, tap Continue under your visit.",
          "On \u201cConfirm your booking\u201d, check the date and time.",
          "Tap Confirm booking once. It books only once.",
          "The booking number appears under \u201cBooking confirmed\u201d.",
        ],
        last: "Last time: Thu 14 Nov, 09:30, Dr Wang \u00b7 booking number A-0236",
      };
    }
    if (S.clinic === "list") {
      return {
        done: false,
        steps: [
          "Open Community Clinic.",
          "On My appointments, tap Continue under your visit.",
          "On \u201cConfirm your booking\u201d, check the date and time.",
          "Tap Confirm booking once to finish booking.",
        ],
        last: "Not finished yet. Next: on My appointments, tap Continue under your visit, then confirm on the next page.",
      };
    }
    return {
      done: false,
      steps: [
        "Open Community Clinic.",
        "On My appointments, tap Continue under your visit.",
        "On \u201cConfirm your booking\u201d, check the date and time.",
        "Tap Confirm booking once to finish booking.",
      ],
      last: "Not finished yet. Next: on \u201cConfirm your booking\u201d, check the details and tap Confirm booking.",
    };
  }

  /* ---------- shared transitions ---------- */
  function helperJoin() {
    if (S.sharing !== "calling" || S.h !== "request") return;
    S.sharing = "active"; S.e = "clinic"; S.h = "view";
    step(`You shared ${appName()} with Xiaoyu.`);
    toast("elder", `Xiaoyu joined. She can see ${appName()} only.`);
  }
  function setClinic(page) {
    if (S.mark && PAGE_OF[S.mark.target] === S.clinic && page !== S.clinic) {
      S.mark = null; S.markTarget = null;
      toast("helper", "Mom left the page, so your mark was removed.");
    }
    S.clinic = page;
  }
  function tapConfirm() {
    const other = S.mark && S.mark.target !== "confirm" && PAGE_OF[S.mark.target] === "confirm" ? TARGET_LABEL[S.mark.target] : null;
    S.clinic = "success"; S.markDone = true; S.mark = null; S.markTarget = null; S.askOpen = false; S.wrongTap = other;
    step(other ? `You tapped \u201cConfirm booking\u201d (Xiaoyu had marked \u201c${other}\u201d).` : "You tapped \u201cConfirm booking\u201d.");
    step("The booking was confirmed: A-0236.");
    if (other) toast("helper", `Mom tapped \u201cConfirm booking\u201d, not the marked \u201c${other}\u201d.`);
  }
  function endSession(by) {
    clearTimers();
    S.sharing = "ended"; S.e = "recap"; S.h = "ended"; S.mark = null; S.markTarget = null; S.pauseSheet = false;
    S.pointing = false; S.endedBy = by; S.endAlert = false; S.leaveAlert = false; S.askOpen = false;
    S.smsPending = false; S.notif = false; S.helperWaited = false;
    S.recap = buildRecap(); S.recapEdit = false; S.recapDirty = false; S.recapTitle = "Book a follow-up visit"; S.momMuted = false;
    S.toasts = { elder: null, helper: null };
  }
  function pauseSharing(reason) {
    S.sharing = "paused"; S.pause = reason; S.h = "paused"; S.pointing = false; S.askOpen = false; S.momMuted = true;
    S.pauseSheet = reason === "private";
    step(reason === "private" ? "A private message arrived, so sharing paused." : "You paused sharing.", true);
  }
  function privateMessage() {
    if (S.sharing !== "active" && S.sharing !== "paused") { S.smsPending = false; return; }
    S.notif = true; S.notifAt = Date.now(); S.smsPending = false;
    if (S.sharing === "active") pauseSharing("private");
  }
  function resetSession() {
    clearTimers();
    const helperStillOnSummary = S.h === "ended";
    Object.assign(S, { app: null, reason: null, chooseHint: false, bankInfo: false, demoInfo: null, demoAlert: false,
      clinic: "list", sharing: "off", pause: null, pauseSheet: false, momMuted: false,
      h: helperStillOnSummary ? "ended" : "home", pointing: false, markTarget: null, mark: null,
      markDone: false, tipHidden: false, chips: [], custom: "", ask: null, reply: null, askOpen: false, askText: "",
      notif: false, notifAt: 0, endAlert: false, skipAlert: false, leaveAlert: false, recapEdit: false, recapDirty: false,
      recap: null, steps: [], helperWaited: false, endedBy: null, talk: false, smsPending: false, wrongTap: null,
      requested: false, repeat: 0, toasts: { elder: null, helper: null } });
  }
  function startFlow(name) {
    clearTimers();
    const saved = S.saved;
    S = initial();
    S.saved = saved;
    if (name === "moderate" || name === "complex") {
      S.app = "clinic"; S.reason = REASONS[0]; S.sharing = "active"; S.e = "clinic"; S.h = "view"; S.requested = true;
      step("You shared Community Clinic with Xiaoyu.");
    }
    if (name === "complex") {
      S.clinic = "success"; S.markDone = true; S.smsPending = true;
      step("Xiaoyu marked \u201cConfirm booking\u201d and said: \u201cThis confirms your Thursday 9:30 visit. It books only once.\u201d");
      step("You tapped \u201cConfirm booking\u201d.");
      step("The booking was confirmed: A-0236.");
    }
  }
  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.onend = () => { S.speaking = false; render(); };
      S.speaking = true;
      window.speechSynthesis.speak(u);
    } catch (e) { S.speaking = false; }
  }
  function readRecapEdits() {
    if (!S.recap) return;
    const items = document.querySelectorAll("#phone-elder [data-recap]");
    if (items.length) {
      const next = Array.from(items).map((el) => el.value.trim()).filter(Boolean);
      if (next.length) S.recap.steps = next;
    }
    const t = document.querySelector("#phone-elder [data-recap-title]");
    if (t) S.recapTitle = t.value.trim() || S.recapTitle;
  }
  function readSavedEdits() {
    const r = S.saved[S.openSaved];
    if (!r) return;
    const items = document.querySelectorAll("#phone-elder [data-saved]");
    if (items.length) {
      const next = Array.from(items).map((el) => el.value.trim()).filter(Boolean);
      if (next.length) r.steps = next;
    }
    const t = document.querySelector("#phone-elder [data-saved-title]");
    if (t) r.title = t.value.trim() || r.title;
  }

  /* ---------- actions ---------- */
  const A = {
    "ask-help": () => {
      resetSession();
      S.e = "choose"; S.declineMsg = null;
    },
    pick: (a) => {
      if (a === "bank") { S.bankInfo = true; return; }
      const meta = APPS.find((x) => x.id === a);
      if (meta && !meta.supported) { S.demoInfo = meta.name; return; }
      S.app = a; S.chooseHint = false; S.demoInfo = null;
    },
    "choose-next": () => { if (S.app) S.e = "confirm"; else S.chooseHint = true; },
    "choose-cancel": () => { S.e = "home"; S.app = null; S.chooseHint = false; S.demoInfo = null; S.bankInfo = false; },
    "confirm-back": () => { S.e = "choose"; },
    reason: (r) => { S.reason = S.reason === r ? null : r; },
    "start-share": () => {
      if (S.app !== "clinic") { S.demoAlert = true; return; }
      clearTimers();
      S.e = "calling"; S.sharing = "calling"; S.h = "request"; S.requested = true; S.lastReply = null; S.declineMsg = null;
    },
    "demo-ok": () => { S.demoAlert = false; S.e = "choose"; S.app = null; },
    "cancel-call": () => {
      clearTimers();
      S.e = "home"; S.sharing = "off"; S.h = "home"; S.requested = false;
      toast("helper", "Mom cancelled her request.");
    },
    "clinic-continue": () => { followMark("continue"); setClinic("confirm"); },
    "clinic-back": () => { followMark("back"); setClinic("list"); },
    "clinic-change": () => { followMark("change"); toast("elder", "Changing the time is not part of this prototype."); },
    "clinic-confirm": () => tapConfirm(),
    "clinic-done": () => setClinic("done"),
    pause: () => { pauseSharing("manual"); toast("elder", "Paused. Xiaoyu can't see your screen or hear you."); },
    resume: () => {
      S.sharing = "active"; S.pause = null; S.pauseSheet = false; S.h = "view"; S.notif = false; S.helperWaited = false; S.momMuted = false;
      if (S.e !== "clinic") S.e = "clinic";
      step("You resumed sharing.", true);
      toast("elder", `Sharing again. Xiaoyu can see ${appName()} only and hear you.`);
    },
    "stay-paused": () => { S.pauseSheet = false; },
    "mic-toggle": () => { S.momMuted = !S.momMuted; toast("elder", S.momMuted ? "Your microphone is off." : "Your microphone is on. Xiaoyu can hear you."); },
    end: () => { S.endAlert = true; },
    "end-cancel": () => { S.endAlert = false; },
    "end-confirm": () => endSession("elder"),
    "see-steps": () => { S.e = "steps"; S.pauseSheet = false; },
    "steps-back": () => { S.e = "clinic"; },
    "notif-dismiss": () => { S.notif = false; },
    repeat: () => { S.repeat++; if (S.mark) speak("Xiaoyu says: " + S.mark.text); toast("elder", "Reading Xiaoyu's words aloud..."); },
    "tip-hide": () => { S.tipHidden = true; },
    "tip-show": () => { S.tipHidden = false; },
    ask: () => { S.askOpen = true; S.askText = ""; },
    "ask-send": (q) => { S.ask = q; S.reply = null; S.askOpen = false; S.tipHidden = false; toast("elder", "Sent to Xiaoyu."); },
    "ask-type": () => { const q = (S.askText || "").trim(); if (!q) { toast("elder", "Type your question first."); return; } A["ask-send"](q); },
    "ask-close": () => { S.askOpen = false; },
    "recap-edit": () => { if (S.recapEdit) readRecapEdits(); S.recapEdit = !S.recapEdit; },
    "recap-restore": () => { S.recap = buildRecap(); S.recapTitle = "Book a follow-up visit"; S.recapDirty = false; toast("elder", "Original words restored."); },
    "recap-save": () => {
      if (S.recapEdit) readRecapEdits();
      S.saved.push({ title: S.recapTitle, steps: S.recap.steps.slice(), last: S.recap.last, done: S.recap.done, date: "Today" });
      S.e = "saved"; S.recapEdit = false; S.recapDirty = false;
    },
    "recap-skip": () => { if (S.recapEdit) readRecapEdits(); S.skipAlert = true; },
    "skip-cancel": () => { S.skipAlert = false; },
    "skip-confirm": () => { S.skipAlert = false; S.e = "home"; S.tab = "help"; resetSession(); toast("elder", "Not saved. Earlier notes in My steps stay untouched."); },
    "go-home": () => { S.e = "home"; S.tab = "help"; resetSession(); },
    "open-just-saved": () => {
      const idx = Math.max(0, S.saved.length - 1);
      resetSession();
      S.tab = "mysteps"; S.e = "mystep"; S.openSaved = idx; S.savedEdit = false;
    },
    tab: (t) => { S.tab = t; S.e = t === "help" ? "home" : "mysteps"; S.openSaved = null; S.savedEdit = false; },
    "open-saved": (i) => { S.e = "mystep"; S.openSaved = Number(i); S.savedEdit = false; S.tab = "mysteps"; },
    "mystep-back": () => { if (S.savedEdit) readSavedEdits(); S.e = "mysteps"; S.openSaved = null; S.savedEdit = false; },
    "mystep-edit": () => {
      if (S.savedEdit) {
        readSavedEdits();
        toast("elder", "Changes saved.");
      }
      S.savedEdit = !S.savedEdit;
    },
    "mystep-delete": () => { S.deleteAlert = true; },
    "delete-cancel": () => { S.deleteAlert = false; },
    "delete-confirm": () => { S.saved.splice(S.openSaved, 1); S.deleteAlert = false; S.e = "mysteps"; S.openSaved = null; toast("elder", "Deleted from your phone."); },
    "mystep-help": () => {
      const r = S.saved[S.openSaved];
      const title = r && r.title ? r.title : "Book a follow-up visit";
      resetSession();
      S.tab = "help"; S.app = "clinic"; S.reason = `${title} (from My steps)`; S.e = "confirm";
    },
    join: () => helperJoin(),
    "not-now": () => { S.h = "declined"; },
    "declined-back": () => { S.h = "request"; },
    reply: (t) => {
      clearTimers();
      S.h = "home"; S.sharing = "off"; S.e = "home"; S.requested = true;
      S.lastReply = t || null; S.declineMsg = t || "Xiaoyu can't help right now.";
      toast("elder", t ? "Xiaoyu: " + t : "Xiaoyu can't help right now.");
      toast("helper", t ? "Reply sent to Mom." : "Mom was told you can't help right now.");
    },
    point: () => { S.pointing = !S.pointing; },
    target: (t) => { if (!S.pointing) return; S.markTarget = t; S.pointing = false; S.h = "explain"; },
    explain: () => { if (!S.markTarget) { toast("helper", "Point at a button first."); return; } S.h = "explain"; },
    chip: (i) => { i = Number(i); S.chips = S.chips.includes(i) ? S.chips.filter((c) => c !== i) : S.chips.concat(i); },
    send: () => {
      if (!S.markTarget) { toast("helper", "Point at a button first."); return; }
      const parts = S.chips.slice().sort().map((i) => chipsFor()[i]);
      if (S.custom.trim()) parts.push(S.custom.trim());
      if (!parts.length) { toast("helper", "Choose or type what the button does."); return; }
      S.mark = { text: parts.join(" "), target: S.markTarget };
      S.h = "view"; S.chips = []; S.custom = ""; S.tipHidden = false; S.repeat = 0; S.ask = null; S.reply = null;
      const label = TARGET_LABEL[S.markTarget] || "a button";
      step(`Xiaoyu marked \u201c${label}\u201d and said: \u201c${S.mark.text}\u201d`);
      toast("helper", "Sent. Mom can see your mark and words.");
    },
    unmark: () => { S.mark = null; S.markTarget = null; toast("helper", "Mark removed from Mom's screen."); },
    "explain-cancel": () => { S.h = "view"; S.chips = []; if (!S.mark) S.markTarget = null; },
    "h-reply": (t) => { S.reply = t; toast("helper", "Reply sent to Mom."); },
    talk: () => { S.talk = !S.talk; toast("helper", S.talk ? "Muted. Mom can't hear you." : "Unmuted. Mom can hear you."); },
    leave: () => { S.leaveAlert = true; },
    "leave-cancel": () => { S.leaveAlert = false; },
    "leave-confirm": () => endSession("helper"),
    wait: () => { S.helperWaited = true; toast("helper", "Mom now sees that you are waiting."); },
    "h-done": () => { S.h = "home"; },
  };

  /* ---------- scripted partner (Wizard-of-Oz) ---------- */
  function partnerTick() {
    if (S.smsPending && S.sharing === "active") schedule("sms", 2500, privateMessage);
    if (S.notif) schedule("notifHide", Math.max(0, 5000 - (Date.now() - (S.notifAt || 0))), () => { S.notif = false; });
    if (!partner) return;
    if (VIEW === "elder" || VIEW === "both") {
      if (S.sharing === "calling" && S.h === "request") schedule("join", 1800, helperJoin);
      if (S.sharing === "active" && S.clinic === "confirm" && !S.mark && !S.markDone) {
        schedule("mark", 2200, () => {
          if (S.clinic !== "confirm" || S.sharing !== "active" || S.mark) return;
          S.markTarget = "confirm"; S.tipHidden = false;
          S.mark = { text: "This confirms your Thursday 9:30 visit. It books only once.", target: "confirm" };
          step("Xiaoyu marked \u201cConfirm booking\u201d and said: \u201cThis confirms your Thursday 9:30 visit. It books only once.\u201d");
        });
      }
      if (S.ask && !S.reply && S.sharing === "active") schedule("reply", 1600, () => {
        if (S.ask && S.sharing === "active") S.reply = answerFor(S.ask) || TYPED_REPLY;
      });
    } else if (VIEW === "helper") {
      if (S.e === "home" && S.sharing === "off" && !S.requested) {
        schedule("request", 1200, () => {
          if (S.e !== "home" || S.sharing !== "off" || S.requested) return;
          S.app = "clinic"; S.reason = REASONS[1]; S.e = "calling"; S.sharing = "calling"; S.h = "request"; S.requested = true;
        });
      }
      if (S.sharing === "active" && S.clinic === "list" && !S.markDone && !S.mark) {
        schedule("nav", 1800, () => { if (S.sharing === "active" && S.clinic === "list" && !S.mark) A["clinic-continue"](); });
      }
      if (S.sharing === "active" && markOnPage()) {
        schedule("momtap", 2600, () => {
          if (S.sharing !== "active" || !markOnPage()) return;
          const t = S.mark.target;
          if (t === "confirm") tapConfirm();
          else if (t === "continue") A["clinic-continue"]();
          else if (t === "back") A["clinic-back"]();
          else if (t === "change") A["clinic-change"]();
        });
      }
      if (S.sharing === "paused" && S.helperWaited) {
        schedule("momresume", 4000, () => {
          if (S.sharing === "paused" && S.helperWaited) {
            S.sharing = "active"; S.pause = null; S.pauseSheet = false; S.e = "clinic"; S.h = "view";
            S.notif = false; S.helperWaited = false; S.momMuted = false;
            step("Xiaoyu waited; Mom resumed sharing.", true);
            toast("helper", "Mom resumed sharing Community Clinic.");
          }
        });
      }
    }
  }

  /* ---------- markup helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const chrome = () => '<div class="island"></div><div class="status"><span>9:41</span><span class="icons">&#9679;&#9679;&#9679;&#9679; <span>5G</span> <span class="batt"></span></span></div><div class="home-ind"></div>';
  const btn = (label, act, cls = "btn-primary", extra = "") => `<button class="btn ${cls}" data-act="${act}" ${extra}>${label}</button>`;
  const toastHtml = (role) => (S.toasts[role] ? `<div class="toast" role="status">${esc(S.toasts[role])}</div>` : "");
  const tabbar = () => `<nav class="tabbar" aria-label="Tabs"><button class="tab ${S.tab === "help" ? "on" : ""}" data-act="tab:help">${I.chat}Get help</button><button class="tab ${S.tab === "mysteps" ? "on" : ""}" data-act="tab:mysteps">${I.list}My steps</button></nav>`;
  const alertBox = (title, msg, primary, secondary) => `<div class="scrim"></div><div class="alert" role="alertdialog" aria-label="${esc(title)}"><h3>${title}</h3><p class="small sub">${msg}</p>${primary}${secondary}</div>`;
  const stepItems = (arr) => arr.map((s, i) => `<li><span class="n">${i + 1}</span><span>${esc(s)}</span></li>`).join("");

  function clinicView(where) {
    const mirror = where === "mirror";
    const act = (a, target) => {
      const desc = !mirror && S.mark && S.mark.target === target ? ' aria-describedby="marked-tag"' : "";
      if (mirror) return S.pointing && target ? `data-act="target:${target}" data-target="${target}"` : (target ? `data-target="${target}"` : "");
      return `data-act="${a}"${desc}`;
    };
    const marked = (t) => {
      if (mirror) return S.markTarget === t && (S.clinic === "confirm" || t === "continue") ? "is-marked" : "";
      return S.mark && S.mark.target === t ? "is-marked" : "";
    };
    const tag = (t) => (!mirror && S.mark && S.mark.target === t ? `<span class="mark-tag" id="marked-tag">${I.point}Xiaoyu marked this</span>` : "");
    let body = "";
    if (S.clinic === "list" || S.clinic === "done") {
      const done = S.clinic === "done";
      body = `<p class="sub small">My appointments</p>
        <div class="clinic-card"><div class="k">Follow-up visit</div><div class="v">General Medicine · Dr Wang</div>
        <div class="k" style="margin-top:6px">Thu 14 Nov · 09:30</div>
        <div style="margin-top:8px"><span class="badge ${done ? "ok" : ""}">${done ? "Confirmed · A-0236" : "Waiting for your confirmation"}</span></div></div>
        ${done ? "" : `<button class="c-btn ${marked("continue")}" ${act("clinic-continue", "continue")}>Continue</button>${tag("continue")}`}`;
    } else if (S.clinic === "confirm") {
      body = `<div class="new-note">New step: please check and confirm your booking.</div>
        <h2 style="margin:0">Confirm your booking</h2>
        <div class="clinic-card"><div class="k">Visit</div><div class="v">Follow-up · General Medicine</div>
        <div class="k" style="margin-top:8px">Doctor</div><div class="v">Dr Wang</div>
        <div class="k" style="margin-top:8px">Date and time</div><div class="v">Thu 14 Nov · 09:30</div></div>
        <button class="c-btn ${marked("confirm")}" ${act("clinic-confirm", "confirm")}>Confirm booking</button>${tag("confirm")}
        <button class="c-link ${marked("change")}" ${act("clinic-change", "change")}>Change time</button>${tag("change")}
        <button class="c-link ${marked("back")}" ${act("clinic-back", "back")}>&lsaquo; Back</button>${tag("back")}`;
    } else if (S.clinic === "success") {
      body = `<div class="big-tick">${I.check}</div><h2 class="center" style="margin:0">Booking confirmed</h2>
        <div class="clinic-card center"><div class="k">Booking number</div><div class="v" style="font-size:24px">A-0236</div>
        <div class="k" style="margin-top:6px">Thu 14 Nov · 09:30 · Dr Wang</div></div>
        ${S.wrongTap && !mirror ? `<div class="hint-inline">This was not the button Xiaoyu marked (\u201c${esc(S.wrongTap)}\u201d). This Clinic demo has no cancel button; in real use, call the clinic reception or ask Xiaoyu to check together.</div>` : ""}
        <button class="c-btn outline" ${mirror ? "" : 'data-act="clinic-done"'}>Back to my appointments</button>`;
    }
    return `<div class="clinic-head"><div class="ttl">Community Clinic</div><div class="sub2">Appointments</div></div><div class="clinic-body">${body}</div>`;
  }

  /* ---------- older adult's phone ---------- */
  function elderView() {
    let view = "", over = "", frame = "";
    const showNotif = S.notif && (S.sharing === "active" || S.sharing === "paused");
    const notifBtn = (topOverlay) => showNotif
      ? `<button class="notif ${topOverlay ? "notif-top" : ""}" data-act="notif-dismiss" role="status" aria-label="City Bank message: your verification code arrived. Tap to dismiss."><span class="app-ico" style="background:#6d28d9">${I.bank}</span><span style="text-align:left;flex:1"><b>City Bank</b> · now<br>Your verification code is 482915. Do not share it with anyone.</span><span class="notif-dismiss-pill">Dismiss</span></button>`
      : "";
    const topNotif = showNotif && S.pauseSheet && S.e === "clinic" ? notifBtn(true) : "";
    const inlineNotif = showNotif && !(S.pauseSheet && S.e === "clinic") ? notifBtn(false) : "";

    switch (S.e) {
      case "home":
        view = `<div class="view has-tabs"><div class="scroll"><div class="large-title">TogetherStep</div>
          <img class="illus" src="assets/home-illustration.jpg" alt="">
          <div class="card helper-card"><div class="avatar">X</div><div><p><b>Xiaoyu</b> (daughter)</p><p class="small sub">${S.declineMsg ? '<span class="status-dot" style="background:#b45309"></span>Busy right now' : '<span class="status-dot"></span>Available now'}</p></div></div>
          ${S.declineMsg ? `<div class="status-line"><b>Xiaoyu replied:</b> ${esc(S.declineMsg)}</div>` : ""}
          ${btn("Ask Xiaoyu for help", "ask-help", "btn-primary btn-lg")}
          <p class="privacy-note center">She will see only the app you choose. You stay in control.</p>
          ${S.saved.length ? `<button class="card saved-card" data-act="open-saved:${S.saved.length - 1}"><span class="app-ico" style="background:#0f766e">${I.cross}</span><span><b>Your saved steps</b><br><span class="small sub">${esc(S.saved[S.saved.length - 1].title)} · ${S.saved[S.saved.length - 1].steps.length} steps</span></span><span class="chev">${I.chevR}</span></button>` : ""}
          </div>${tabbar()}</div>`;
        break;
      case "choose":
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="choose-cancel">Cancel</button><span class="nav-title">Step 1 of 2</span><span style="width:48px"></span></div>
          <div class="scroll"><h2>Which app do you need help with?</h2>
          <div class="list">${APPS.map((a) => a.supported
            ? `<button class="list-row ${S.app === a.id ? "sel" : ""}" data-act="pick:${a.id}" aria-pressed="${S.app === a.id}"><span class="app-ico" style="background:${a.color}">${a.icon}</span><span><b>${a.name}</b></span><span class="radio">${S.app === a.id ? "&#10003;" : ""}</span></button>`
            : `<button class="list-row disabled" data-act="pick:${a.id}"><span class="app-ico" style="background:${a.color}">${a.icon}</span><span>${a.name}<br><span class="small">Not simulated in this demo</span></span><span class="app-tag">Demo limit</span></button>`).join("")}
          <button class="list-row disabled" data-act="pick:bank"><span class="app-ico" style="background:#4b5563">${I.lock}</span><span><b>Banking apps</b> · Never shared<br><span class="small">Keeps your money private. Call Xiaoyu directly to talk banking questions through without screen sharing.</span></span></button></div>
          ${S.demoInfo ? `<div class="hint-inline"><b>${esc(S.demoInfo)}</b> is not simulated in this prototype. Choose <b>Community Clinic</b> to start a session.</div>` : ""}
          ${S.bankInfo ? '<div class="hint-inline">To keep your money safe, banking apps are never shared. You can still call Xiaoyu and talk it through without sharing your screen.</div>' : ""}
          <div class="info">${S.app ? `Xiaoyu will see <b>${esc(appName())} only</b>.` : "Xiaoyu will see <b>only the app you choose</b>."} Your notifications and other apps stay private.</div>
          ${S.chooseHint ? '<div class="hint-inline">Please choose Community Clinic above to continue.</div>' : (!S.app ? '<p class="small sub center">Choose one app above to continue.</p>' : "")}
          <div class="spacer"></div>${btn("Next", "choose-next", "btn-primary btn-lg")}</div></div>`;
        break;
      case "confirm": {
        const a = APPS.find((x) => x.id === S.app) || APPS[0];
        const fact = (cls, icon, text) => `<div class="fact"><span class="mk ${cls}">${icon}</span><span>${text}</span></div>`;
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="confirm-back">&lsaquo; Back</button><span class="nav-title">Step 2 of 2</span><span style="width:48px"></span></div>
          <div class="scroll"><h2>Share ${esc(a.name)} with Xiaoyu?</h2>
          <div class="card facts">
            ${fact("yes", I.check, `She sees <b>${esc(a.name)} only</b>.`)}
            ${a.personal ? fact("no", "!", `This includes <b>${esc(a.personal)}</b>. Open only what you need help with.`) : ""}
            ${fact("yes", I.check, "She can <b>point and explain</b> the next step.")}
            ${fact("shield", I.shield, "<b>You do all the tapping.</b> Your other apps and notifications stay private.")}
            ${fact("yes", I.phone, "<b>A voice call starts</b> so you can talk.")}
            ${fact("yes", I.pause, "You can <b>pause or end help</b> at any time.")}
          </div>
          <p class="chips-label">What do you need help with? (optional)</p>
          <div>${(S.reason && !REASONS.includes(S.reason) ? [S.reason] : []).concat(REASONS).map((r) => `<button class="chip ${S.reason === r ? "on" : ""}" data-act="reason:${esc(r)}" aria-pressed="${S.reason === r}">${S.reason === r ? "&#10003; " : ""}${esc(r)}</button>`).join("")}</div>
          <div class="spacer"></div>${btn(`${I.phone} Call Xiaoyu and share`, "start-share", "btn-primary btn-lg")}</div></div>`;
        break;
      }
      case "calling":
        view = `<div class="view"><div class="scroll"><div class="call-screen"><div class="pulse-ring">X</div><h2>Calling Xiaoyu...</h2>
          <p class="sub">Nothing is shared until she joins.</p></div><div class="spacer"></div>${btn("Cancel request", "cancel-call", "btn-secondary")}</div></div>`;
        break;
      case "clinic": {
        const paused = S.sharing === "paused";
        const waitSuffix = S.helperWaited ? " Xiaoyu is waiting for you." : "";
        const presence = paused
          ? (showNotif
              ? `Xiaoyu can't see this message.${waitSuffix} Resume closes the banner and shares ${appName()} only.`
              : (S.helperWaited ? `Xiaoyu is waiting for you. Take your time. Resume shares ${appName()} only.` : `Xiaoyu can't see your screen. Resume shares ${appName()} only.`))
          : S.pointing ? "Xiaoyu is choosing a button to show you..."
          : S.h === "explain" ? "Xiaoyu is writing what the button does..."
          : `Xiaoyu sees ${appName()} only.${S.talk ? " (Xiaoyu muted her mic.)" : ""}`;
        const mic = S.momMuted ? `${I.micOff} Mic off` : `${I.phone} Call on`;
        const bar = (S.sharing === "active" || paused)
          ? `<div class="share-bar ${paused ? "paused" : ""}" role="region" aria-label="Sharing status">
              <div class="sb-top">${paused ? I.pause : '<span class="status-dot"></span>'}<span>${paused ? "Paused" : "Sharing with Xiaoyu"}</span><button class="callpill" data-act="mic-toggle" aria-label="${S.momMuted ? "Microphone off, tap to turn on" : "Call on, tap to mute"}">${mic}</button></div>
              <div class="presence2">${esc(presence)}</div>
              <div class="sb-row">${paused ? `<button class="sb-btn resume" data-act="resume">${I.play} Resume</button>` : `<button class="sb-btn" data-act="pause">${I.pause} Pause</button>`}<button class="sb-btn end" data-act="end">${I.stop} End help</button></div></div>` : "";
        frame = S.sharing === "active" ? '<div class="share-frame"></div>' : paused ? '<div class="share-frame paused"></div>' : "";
        let tip = "";
        if (markOnPage() && !paused) {
          tip = S.tipHidden
            ? `<div class="tip-mini">${I.point}<span>Xiaoyu marked a button</span>${btn("Show", "tip-show", "btn-secondary")}</div>`
            : `<div class="tip ${S.speaking ? "speaking" : ""}" data-r="${S.repeat}"><div class="who"><span class="avatar sm">X</span><span class="grow">Xiaoyu says:</span><button class="btn btn-ghost" style="width:auto;min-height:48px;font-size:16px" data-act="tip-hide" aria-label="Hide Xiaoyu's message">${I.chevUp} Hide</button></div>
               <div class="say">\u201c${esc(S.mark.text)}\u201d</div>
               ${S.ask ? `<div class="qa"><b>${isStatement(S.ask) ? "You said" : "You asked"}:</b> ${esc(S.ask)}<br>${S.reply ? `<b>Xiaoyu:</b> ${esc(S.reply)}` : "<span class='sub'>Sent to Xiaoyu. Waiting for her answer here or on the call...</span>"}</div>` : '<div class="small sub">When you are ready, tap the marked button yourself.</div>'}
               <div class="tip-row">${btn(`${I.volume} Hear it again`, "repeat", "btn-secondary")}${btn(`${I.question} Ask Xiaoyu`, "ask", "btn-secondary")}</div></div>`;
        }
        view = `<div class="view">${bar}${inlineNotif}${tip}<div class="scroll" id="elder-scroll" style="padding:8px 0 0">${clinicView("elder")}</div></div>`;
        if (S.askOpen) {
          over = `<div class="scrim" data-act="ask-close"></div><div class="sheet" role="dialog" aria-label="Ask Xiaoyu"><div class="grab"></div><h2>Ask Xiaoyu</h2>
            <p class="small sub">Pick a question or request, type your own, or say it on the call.</p>` +
            QUESTIONS.map(([q, stmt]) => btn(esc(q) + (stmt ? " (request)" : ""), "ask-send:" + q, "btn-secondary")).join("") +
            `<input class="field" id="askText" placeholder="Type your own question..." value="${esc(S.askText)}">${btn("Send my question", "ask-type", "btn-primary")}${btn("Close", "ask-close", "btn-ghost")}</div>`;
        }
        if (S.pauseSheet && paused) {
          over = `<div class="scrim"></div><div class="sheet" role="dialog" aria-label="Sharing paused"><div class="grab"></div>
            <img class="illus sm" src="assets/privacy-illustration.jpg" alt="" style="width:120px;margin-top:4px">
            <h2 class="center">Sharing is paused</h2>
            <p class="center">TogetherStep paused sharing because a <b>private message</b> from your bank arrived. <b>Xiaoyu did not see it.</b></p>
            <div class="warn-banner">Your microphone is off while paused, so Xiaoyu can't hear you read it. Never read codes aloud, not even to family.</div>
            ${S.helperWaited ? '<p class="center small">Xiaoyu is waiting for you. Take your time.</p>' : ""}
            ${btn("Stay paused for now", "stay-paused", "btn-primary btn-lg")}
            <p class="small sub center">When you tap Resume sharing, the private banner closes and Xiaoyu sees Community Clinic only, never the message.</p>
            <div class="btn-row">${btn("Resume sharing", "resume", "btn-secondary")}${btn("Steps so far", "see-steps", "btn-secondary")}</div>
            ${btn("End help", "end", "btn-ghost danger-text")}</div>`;
        }
        break;
      }
      case "steps": {
        const mainSteps = S.steps.filter((s) => !s.minor);
        const sessionEvents = S.steps.filter((s) => s.minor);
        let next = "";
        if (!S.markDone) {
          next = S.clinic === "list"
            ? `<div class="warn-banner"><b>Next step when you resume:</b> on My appointments, tap Continue under your visit.</div>`
            : `<div class="warn-banner"><b>Next step when you resume:</b> on \u201cConfirm your booking\u201d, tap ${esc(S.mark ? TARGET_LABEL[S.mark.target] : "Confirm booking")}.</div>`;
        }
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="steps-back">&lsaquo; Back</button><span class="nav-title">Steps so far</span><span style="width:48px"></span></div>
          ${inlineNotif}
          <div class="scroll"><p class="field-label">Task steps in Community Clinic</p>
          <ol class="step-list">${mainSteps.map((s, i) => `<li><span class="n">${i + 1}</span><span>${esc(s.t)}</span></li>`).join("")}</ol>
          ${sessionEvents.length ? `<div class="minor-step"><b>Sharing status log:</b> ${sessionEvents.map((s) => esc(s.t)).join(" ")}</div>` : ""}
          ${next}<div class="info">This is what happened in this session. When you end help, you can keep a short note of the steps in My steps.</div></div></div>`;
        break;
      }
      case "recap": {
        const r = S.recap || buildRecap();
        view = `<div class="view"><div class="scroll">
          <div class="ended-banner">${I.check}<div><b>Help ended</b><br>${S.endedBy === "helper" ? "Xiaoyu ended help." : "You ended help."} Xiaoyu can no longer see your screen, and the voice call has ended.</div></div>
          ${r.done ? "" : '<div class="warn-banner"><b>Your booking is not finished yet.</b> The note below starts from your next step.</div>'}
          <h2>Keep a note for next time?</h2><p class="sub small">Optional — it stays on your phone only. You decide whether to save it.</p>
          <div class="card">${S.recapEdit
            ? `<label class="field-label" for="recapTitleInput">Save as</label><input class="field" id="recapTitleInput" data-recap-title value="${esc(S.recapTitle)}"><div style="height:10px"></div>` + r.steps.map((s, i) => `<div class="step-edit"><span class="n" style="width:30px;height:30px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex:none">${i + 1}</span><textarea class="textarea" data-recap aria-label="Step ${i + 1}">${esc(s)}</textarea></div>`).join("<div style='height:8px'></div>")
            : `<p class="field-label">Title: ${esc(S.recapTitle)}</p><ol class="step-list" style="margin-top:8px">${stepItems(r.steps)}</ol><div class="last-time">${esc(r.last)}</div>`}</div>
          <div class="btn-row">${btn(S.recapEdit ? `${I.check} Done editing` : `${I.edit} Change the words`, "recap-edit", "btn-ghost")}${S.recapEdit ? btn("Restore original", "recap-restore", "btn-ghost") : ""}</div>
          <div class="spacer"></div><div class="btn-row">${btn("Save to My steps", "recap-save", "btn-secondary btn-lg")}${btn("Don't save", "recap-skip", "btn-secondary btn-lg")}</div></div></div>`;
        if (S.skipAlert) {
          over = alertBox(
            S.recapDirty ? "Discard your edited note?" : "Don't keep this note?",
            S.recapDirty
              ? "Your edited wording for this session won't be saved. Any earlier notes in My steps stay untouched."
              : "This session's note won't be saved. Any earlier notes in My steps stay untouched.",
            btn("Keep it", "skip-cancel", "btn-primary"),
            btn("Don't keep it", "skip-confirm", "btn-danger")
          );
        }
        break;
      }
      case "saved": {
        const latest = S.saved[S.saved.length - 1];
        const savedTitle = latest ? latest.title : S.recapTitle;
        view = `<div class="view"><div class="scroll"><div class="spacer"></div><img class="illus sm" src="assets/recap-illustration.jpg" alt=""><h2 class="center">Saved to My steps</h2>
          <p class="center"><b>\u201c${esc(savedTitle)}\u201d</b> is saved on your phone.</p>
          <p class="center sub">Open it now to check it, or find it any time under <b>My steps</b> on the home screen.</p>
          <div class="spacer"></div>${btn("Open saved note", "open-just-saved", "btn-secondary btn-lg")}${btn("Back to home", "go-home", "btn-primary btn-lg")}</div></div>`;
        break;
      }
      case "mysteps":
        view = `<div class="view has-tabs"><div class="scroll"><div class="large-title">My steps</div>` +
          (S.saved.length ? `<div class="list">${S.saved.map((r, i) => `<button class="list-row" data-act="open-saved:${i}"><span class="app-ico" style="background:#0f766e">${I.cross}</span><span><b>${esc(r.title)}</b><br><span class="small sub">${r.steps.length} steps · ${esc(r.date)}</span></span><span class="chev">${I.chevR}</span></button>`).join("")}</div>`
            : '<p class="sub">Nothing saved yet. After a help session you can keep a short note of the steps here.</p>') +
          `</div>${tabbar()}</div>`;
        break;
      case "mystep": {
        const r = S.saved[S.openSaved] || { title: "", steps: [], last: "" };
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="mystep-back">&lsaquo; My steps</button><span></span><button class="nav-btn" data-act="mystep-edit">${S.savedEdit ? "Done" : "Edit"}</button></div>
          <div class="scroll"><div class="large-title">${esc(r.title)}</div>
          <div class="card">${S.savedEdit
            ? `<label class="field-label" for="savedTitleInput">Note title</label><input class="field" id="savedTitleInput" data-saved-title value="${esc(r.title)}"><div style="height:10px"></div>` + r.steps.map((s, i) => `<div class="step-edit"><span class="n" style="width:30px;height:30px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex:none">${i + 1}</span><textarea class="textarea" data-saved aria-label="Step ${i + 1}">${esc(s)}</textarea></div>`).join("<div style='height:8px'></div>")
            : `<ol class="step-list">${stepItems(r.steps)}</ol><div class="last-time">${esc(r.last || "")}</div>`}</div>
          <div class="spacer"></div>${btn(`${I.heart} Ask Xiaoyu for help with this`, "mystep-help", "btn-primary")}${btn(`${I.trash} Delete this note`, "mystep-delete", "btn-ghost danger-text")}</div></div>`;
        if (S.deleteAlert) over = alertBox("Delete this note?", "It will be removed from your phone.", btn("Keep it", "delete-cancel", "btn-primary"), btn("Delete", "delete-confirm", "btn-danger"));
        break;
      }
    }
    if (S.endAlert) {
      const whilePaused = S.sharing === "paused";
      over += alertBox(
        "End help?",
        whilePaused
          ? "Ending closes the voice call and finishes this session (your screen is already paused and hidden from Xiaoyu). Next, you can keep a short note of the steps."
          : "Ending stops screen sharing and closes the voice call with Xiaoyu. Next, you can keep a short note of the steps.",
        btn(whilePaused ? "Stay paused" : "Keep sharing", "end-cancel", "btn-primary"),
        btn("End help", "end-confirm", "btn-danger")
      );
    }
    if (S.demoAlert) {
      over += alertBox("Not in this prototype", "Only Community Clinic has demo content in this prototype. Please choose Community Clinic to continue.",
        btn("Choose again", "demo-ok", "btn-primary"), "");
    }
    return chrome() + view + frame + topNotif + over + toastHtml("elder");
  }

  /* ---------- helper's phone ---------- */
  function helperView() {
    let view = "", over = "";
    switch (S.h) {
      case "home":
        view = `<div class="view"><div class="scroll"><div class="large-title">TogetherStep</div>
          <div class="card helper-card"><div class="avatar">M</div><div><p><b>Mom</b></p><p class="small sub">Not asking for help right now</p></div></div>
          ${S.lastReply ? `<div class="status-line">You told Mom: \u201c${esc(S.lastReply)}\u201d</div>` : ""}
          <div class="info">When Mom asks for help, her request appears here. You will only see the app she chooses, and she does all the tapping.</div></div></div>`;
        break;
      case "request":
        view = `<div class="view"><div class="scroll"><div class="call-screen" style="padding-top:20px"><div class="pulse-ring">M</div><h2>Mom is asking for help</h2>
          <p class="sub">She wants to share: <b>${esc(appName())}</b></p>${S.reason ? `<p class="small">Mom says: <b>${esc(S.reason)}</b></p>` : ""}</div>
          <div class="card facts"><div class="fact"><span class="mk yes">${I.eye}</span><span>You will see <b>${esc(appName())} only</b>, never her other apps or notifications.</span></div>
          <div class="fact"><span class="mk yes">${I.point}</span><span>You can point and explain. <b>Mom does the tapping.</b></span></div>
          <div class="fact"><span class="mk yes">${I.phone}</span><span>A voice call starts when you join.</span></div></div>
          <div class="spacer"></div>${btn("Join", "join", "btn-primary btn-lg")}${btn("Not now", "not-now", "btn-secondary")}</div></div>`;
        break;
      case "declined":
        view = `<div class="view"><div class="nav"><button class="nav-btn" data-act="declined-back">&lsaquo; Back</button><span class="nav-title">Reply to Mom</span><span style="width:48px"></span></div><div class="scroll"><h2>Can't help right now?</h2><p class="sub">Send Mom a quick reply, or go back if you tapped by mistake.</p>` +
          ["I'll call you in 10 minutes.", "I'm in a meeting. Try again later."].map((t) => btn(esc(t), "reply:" + t, "btn-secondary")).join("") +
          btn("Decline without a message", "reply:", "btn-ghost") + '<div class="spacer"></div>' + btn("Join now instead", "join", "btn-primary btn-lg") + "</div></div>";
        break;
      default: {
        const helperMuteNote = S.talk ? " Your microphone is muted." : " Your microphone is on.";
        const micLine = (S.momMuted
          ? "Her microphone is off while paused. The call stays connected."
          : "Mom turned her microphone on: you can hear her, but you still cannot see her screen.") + helperMuteNote;
        const cover = S.h === "paused"
          ? (S.pause === "private"
            ? `<div class="mirror-cover" role="region" aria-label="Sharing paused"><div class="big-icon amber">${I.lock}</div><h2 id="helper-pause-heading" tabindex="-1">Sharing paused automatically</h2><p class="sub">A private message arrived on Mom's phone, so TogetherStep paused sharing to protect her privacy. You did not see it.</p><p class="sub small">${micLine}</p></div>`
            : `<div class="mirror-cover" role="region" aria-label="Sharing paused"><div class="big-icon amber">${I.pause}</div><h2 id="helper-pause-heading" tabindex="-1">Mom paused sharing</h2><p class="sub">You can't see her screen right now.</p><p class="sub small">${micLine}</p></div>`)
          : S.h === "ended" ? `<div class="mirror-cover" role="region" aria-label="Help ended"><div class="big-icon">${I.check}</div><h2 id="helper-end-heading" tabindex="-1">Help ended</h2><p class="sub">${S.endedBy === "helper" ? "You ended help." : "Mom ended help. Thanks for helping."}</p><p class="sub small">The call has ended. You can no longer see her screen.</p></div>` : "";
        let line = "";
        if (S.h === "view" || S.h === "explain") {
          if (S.pointing) line = '<div class="status-line">Tap the button Mom should press. <b>This only marks it</b> &mdash; nothing is pressed on Mom\'s phone. Dashed boxes show what you can mark. <a href="#" data-act="point">Cancel pointing</a></div>';
          else if (S.mark) line = `<div class="status-line">Sent. <b>Mom can see your mark now.</b>${S.repeat ? " She is listening to it again." : ""} Waiting for her to tap.</div>`;
          else if (S.markDone && (S.clinic === "success" || S.clinic === "done")) {
            line = S.wrongTap
              ? `<div class="status-line" style="background:#fff4e6;color:#7c2d12"><b>Different button tapped:</b> Mom tapped \u201cConfirm booking\u201d instead of the marked \u201c${esc(S.wrongTap)}\u201d. Booking A-0236 is confirmed; contact the clinic reception if she needs to reschedule.</div>`
              : '<div class="status-line ok">&#10003; Mom tapped \u201cConfirm booking\u201d. The booking is confirmed (A-0236).</div>';
          }
          else line = `<div class="status-line">You can see Mom's screen. Point at a button, then explain what it does.</div>`;
          if (S.ask) {
            const said = isStatement(S.ask) ? "Mom said" : "Mom asks";
            line += S.reply ? `<div class="status-line"><b>${said}:</b> ${esc(S.ask)}<br><b>You replied:</b> ${esc(S.reply)}</div>`
              : `<div class="status-line"><b>${said}:</b> ${esc(S.ask)}<div class="small sub" style="margin:4px 0">Tap a quick reply, or answer on the voice call:</div><div class="reply-chips">${[answerFor(S.ask) || TYPED_REPLY, "Take your time, I'm here."].map((t) => `<button class="chip" data-act="h-reply:${esc(t)}">${esc(t)}</button>`).join("")}</div></div>`;
          }
        }
        const tools = S.h === "paused"
          ? `<div class="btn-row">${btn(S.helperWaited ? `${I.check} Waiting for Mom` : "Wait for Mom", "wait", "btn-primary")}${btn(S.talk ? `${I.micOff} Muted` : `${I.mic} Mute`, "talk", "btn-secondary")}</div><div style="height:6px"></div>${btn("End help", "leave", "btn-danger")}`
          : S.h === "ended" ? btn("Done", "h-done", "btn-primary btn-lg")
            : `<div class="tools"><button class="tool ${S.pointing ? "on" : ""}" data-act="point" aria-pressed="${S.pointing}">${I.point}Point</button>
               <button class="tool" data-act="explain" ${S.markTarget ? "" : "disabled"} title="${S.markTarget ? "" : "Point at a button first"}">${I.chat}Explain</button>
               <button class="tool ${S.talk ? "on" : ""}" data-act="talk" aria-pressed="${S.talk}">${S.talk ? I.micOff : I.mic}${S.talk ? "Muted" : "Mute"}</button></div>
               ${S.mark ? btn("Remove my mark", "unmark", "btn-ghost") : ""}<div style="height:4px"></div>${btn("End help", "leave", "btn-ghost danger-text")}`;
        const scope = S.h === "paused" ? `<span class="scope-chip paused">${I.pause} Paused &middot; you see nothing</span>`
          : S.h === "ended" ? '<span class="scope-chip ended">Ended &middot; sharing stopped</span>'
            : `<span class="scope-chip">&#9679; Live &middot; you see: ${esc(appName())} only</span>`;
        const showLiveMirror = S.h === "view" || S.h === "explain";
        view = `<div class="view"><div class="nav"><span></span><span class="nav-title">Helping Mom</span><span></span></div><div class="scroll" style="gap:10px">
          ${scope}
          <div class="mirror-wrap ${S.pointing ? "pointing" : ""}">${showLiveMirror ? `<div class="mirror">${clinicView("mirror")}</div>` : ""}${cover}</div>
          ${showLiveMirror ? '<div class="mirror-hint">Scroll in the frame to see Mom\'s screen.</div>' : ""}
          ${line}${tools}</div></div>`;
        if (S.h === "explain") {
          const tgt = TARGET_LABEL[S.markTarget];
          const preview = S.chips.slice().sort().map((i) => chipsFor()[i]).concat(S.custom.trim() ? [S.custom.trim()] : []).join(" ");
          over = `<div class="scrim"></div><div class="sheet" role="dialog" aria-label="Explain the marked button"><div class="grab"></div><h2>What will \u201c${esc(tgt || "this button")}\u201d do?</h2>
            <div class="small sub">Marked, not pressed. Explain the result, not only where to tap.</div>
            <p class="chips-label">Suggestions &mdash; only send what you have checked on Mom's screen:</p>
            <div>${chipsFor().map((c, i) => `<button class="chip ${S.chips.includes(i) ? "on" : ""}" data-act="chip:${i}" aria-pressed="${S.chips.includes(i)}">${S.chips.includes(i) ? "&#10003; " : ""}${esc(c)}</button>`).join("")}</div>
            <input class="field" id="custom" placeholder="Or type your own words..." value="${esc(S.custom)}">
            <div class="preview"><span class="small sub">Mom will see:</span><br>${preview ? `\u201c${esc(preview)}\u201d` : "<span class='sub'>(nothing yet)</span>"}</div>
            ${btn("Send to Mom", "send", "btn-primary btn-lg")}${btn("Cancel explanation", "explain-cancel", "btn-ghost")}</div>`;
        }
        if (S.leaveAlert) {
          const helperPaused = S.h === "paused";
          over = alertBox(
            "End help for both of you?",
            "Mom will see that you ended help and the call will close. She can ask again any time.",
            btn(helperPaused ? "Keep waiting" : "Stay", "leave-cancel", "btn-primary"),
            btn("End help", "leave-confirm", "btn-danger")
          );
        }
      }
    }
    return chrome() + view + over + toastHtml("helper");
  }

  /* ---------- render + events ---------- */
  const elderEl = document.getElementById("phone-elder");
  const helperEl = document.getElementById("phone-helper");
  let lastMarkKey = "";
  let lastHelperState = S.h;
  const SCROLLERS = ["#phone-elder .scroll", "#phone-helper .scroll", "#phone-helper .mirror-wrap"];
  let lastScreens = "";
  function render() {
    const activeEl = document.activeElement;
    const focusId = activeEl && activeEl.id;
    const helperHadFocus = activeEl && helperEl.contains(activeEl);
    const screens = `${S.e}|${S.clinic}|${S.h}`;
    const kept = screens === lastScreens ? SCROLLERS.map((sel) => { const el = document.querySelector(sel); return el ? el.scrollTop : 0; }) : null;
    elderEl.innerHTML = elderView();
    helperEl.innerHTML = helperView();
    if (kept) SCROLLERS.forEach((sel, i) => { const el = document.querySelector(sel); if (el) el.scrollTop = kept[i]; });
    lastScreens = screens;
    if (focusId === "custom" || focusId === "askText") {
      const f = document.getElementById(focusId);
      if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
    } else if (helperHadFocus && S.h !== lastHelperState && (S.h === "paused" || S.h === "ended")) {
      const hdg = document.getElementById(S.h === "paused" ? "helper-pause-heading" : "helper-end-heading");
      if (hdg) hdg.focus();
    }
    lastHelperState = S.h;
    const key = S.mark ? S.mark.text + S.markTarget : "";
    if (key && key !== lastMarkKey) {
      const m = elderEl.querySelector(".is-marked");
      if (m) m.scrollIntoView({ block: "center" });
    }
    lastMarkKey = key;
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
    if (!el || el.disabled) {
      if (el && el.disabled && el.dataset.act === "explain") { toast("helper", "Point at a button first."); render(); }
      return;
    }
    ev.preventDefault();
    const [name, arg] = el.dataset.act.split(/:(.*)/s);
    if (A[name]) { A[name](arg); render(); }
  });
  document.addEventListener("input", (ev) => {
    if (ev.target.id === "custom") { S.custom = ev.target.value; save(); render(); return; }
    if (ev.target.id === "askText") { S.askText = ev.target.value; save(); return; }
    if (S.recapEdit && (ev.target.matches("[data-recap]") || ev.target.matches("[data-recap-title]"))) {
      readRecapEdits(); S.recapDirty = true; save(); return;
    }
    if (S.savedEdit && (ev.target.matches("[data-saved]") || ev.target.matches("[data-saved-title]"))) {
      readSavedEdits(); save();
    }
  });
  const toggle = document.getElementById("partnerToggle");
  toggle.checked = partner;
  toggle.addEventListener("change", () => { partner = toggle.checked; clearTimers(); S.toasts = { elder: null, helper: null }; render(); });
  if (VIEW !== "both") {
    document.body.classList.add("solo");
    document.querySelector(`.device[data-role="${VIEW}"]`).classList.add("active");
  }
  const hashFlow = (location.hash.match(/flow=(simple|moderate|complex)/) || [])[1];
  if (hashFlow) { startFlow(hashFlow); history.replaceState(null, "", location.pathname + location.search); }

  if (params.get("present") === "1") {
    document.body.classList.add("present");
    document.addEventListener("pointerdown", (ev) => {
      const r = document.createElement("div");
      r.className = "ripple";
      r.style.left = ev.clientX + "px";
      r.style.top = ev.clientY + "px";
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 800);
    }, true);
  }

  window.TS = {
    event(name) { if (name === "bank-sms") privateMessage(); render(); },
    flow(name) { startFlow(name); render(); },
    state: () => JSON.parse(JSON.stringify(S)),
    reset() { clearTimers(); S = initial(); render(); },
    title(main, sub) { document.getElementById("presTitle").innerHTML = main ? `${esc(main)}${sub ? `<small>${esc(sub)}</small>` : ""}` : ""; },
    caption(text) { document.getElementById("presCaption").textContent = text || ""; },
    card(html) { const c = document.getElementById("presCard"); c.innerHTML = html || ""; c.classList.toggle("on", !!html); },
  };
  render();
})();
