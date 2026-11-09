# TogetherStep — Interactive Prototype README

**TogetherStep (陪你走一步)** is a mobile app concept that lets an older adult get help with an unfamiliar phone screen from a family member *without handing over control*. The older adult shares only the one app she chooses; the helper points at the next button and explains what it will do; the older adult taps it herself; private notifications pause sharing automatically; and a short, optional recap helps her do it alone next time.

This folder contains the interactive **high-fidelity prototype** built for CSC5056 / CSC4130 / AIR5064 *Introduction to Human-Computer Interaction* (CUHK-Shenzhen, Fall 2026), Assignment 2, by Graduate Team 7: Ma Xinyu, Ma Xueyi, Su Shaozhi, Tang Shiyuan and Zhang Shuo. It simulates the experience; there is no real screen sharing, calling or backend.

| | |
| --- | --- |
| **Live prototype** | [https://chernosu-tech.github.io/hci-assignment2-prototype/hi-fi/](https://chernosu-tech.github.io/hci-assignment2-prototype/hi-fi/) |
| **Design link** | [https://chernosu-tech.github.io/hci-assignment2-prototype/screens/index.html](https://chernosu-tech.github.io/hci-assignment2-prototype/screens/index.html) — exported screens of every key state ([`screens/`](screens/)) and the Figma build specification ([`figma-build-spec.json`](figma-build-spec.json)) |
| **Earlier versions** | [`low-fi/`](low-fi/index.html) (paper-style, tested with two simulated users) · [`mid-fi/`](mid-fi/index.html) (frozen for heuristic evaluation, commit `075fcc6`) · [`hi-fi/`](hi-fi/index.html) (final) |

---

## 1. Access and setup

**Online:** open the live prototype link above in a desktop browser (Chrome, Edge, Safari or Firefox, current versions). No account, installation or permission is needed.

**Offline / from the files:**

1. Download or clone the public repository [github.com/chernosu-tech/hci-assignment2-prototype](https://github.com/chernosu-tech/hci-assignment2-prototype) (or unzip the shared folder).
2. Open `hi-fi/index.html` (in the team repository: `assignment-2/prototype/hi-fi/index.html`) by double-clicking it. It runs entirely in the browser with no server and no internet connection; all assets are local.
3. Use a window at least about 1,000 px wide so both phones fit side by side.

**What you see:** two iPhone-sized screens side by side — **Mom's phone** (the older adult, left) and **Xiaoyu's phone** (her daughter, the remote helper, right). You operate *both* phones yourself, as if you were each person in turn. A thin control bar above the phones is **not part of the design**; it lets reviewers jump to a task flow, trigger the simulated bank SMS, auto-play the other phone, or reset.

**Other views (optional):**

| URL suffix | Effect |
| --- | --- |
| `?view=elder&partner=auto` | Only Mom's phone; Xiaoyu's actions happen automatically (good for testing the older adult's side alone) |
| `?view=helper&partner=auto` | Only Xiaoyu's phone; Mom's actions happen automatically |
| `#flow=simple`, `#flow=moderate`, `#flow=complex` | Start directly at the beginning of a task flow |
| `?fresh=1` | Clear the saved prototype state (state is otherwise kept in the browser's local storage) |

## 2. Target device

- **Smartphone, portrait, touch**, designed at **393 × 852 pt** (iPhone 15 / 16 class) following iOS conventions: status bar with Dynamic Island, navigation bar, tab bar, bottom sheets, alerts, notification banners and the home indicator.
- Both people use the same app on their own phones; the older adult's role and the helper's role have different screens.
- In the browser, one CSS pixel corresponds to one iOS point. On a real phone the prototype can be viewed with `?view=elder` or `?view=helper`, but it is optimised for the two-phone desktop view.
- Android conventions (back gesture, Material components) are not prototyped; see Limitations.

## 3. Context of use

**Who.** Older adults (about 60–75) who use a few familiar apps but get stuck when an app changes, often living alone; and their adult children, who help remotely from another city and are often short of time. In our Assignment 1 interviews, helpers could not see the screen ("a blue one"), screenshots were out of date, older adults feared the consequence of a tap (for example a double booking), and showing the phone exposed private details.

**When and where.** At home, in the middle of a familiar task — here, confirming a follow-up visit in the (fictional) *Community Clinic* app, whose new confirmation page has made Mom unsure. Xiaoyu is at work or at home in another city.

**What users can accomplish (the three task flows in this prototype):**

1. **Simple — ask for help and share one app.** Mom asks Xiaoyu for help and shares only Community Clinic; Xiaoyu joins and sees only that app.
2. **Moderate — follow a marked, explained step.** Xiaoyu points at "Confirm booking" and explains what it does; Mom taps it herself; both phones show the confirmed booking.
3. **Complex — handle a private interruption and keep a recap.** A text from Mom's bank arrives; sharing pauses automatically; Mom reviews the steps, ends help, edits and saves (or declines) a short recap, and can open it later from *My steps*.

## 4. Operating instructions

Tap with the mouse. Everything that looks like a button is interactive on the phone it belongs to.

### Flow 1 — Simple (start: control bar → **1 Simple**, or a fresh page)

| Step | Phone | Do this | You should see |
| --- | --- | --- | --- |
| 1 | Mom | Tap **Ask Xiaoyu for help** | "Which app do you need help with?" (nothing pre-selected) |
| 2 | Mom | Tap **Community Clinic**, then **Next** | "Share Community Clinic with Xiaoyu?" with what she can and cannot do, and that a voice call starts |
| 3 | Mom | Optionally tap a reason (for example **Confirm or book a visit**), then **Call Xiaoyu and share** | "Calling Xiaoyu…" (nothing is shared yet); Xiaoyu sees who is asking, which app and the reason |
| 4 | Xiaoyu | Tap **Join** | Xiaoyu sees "Live · you see: Community Clinic only" and a live copy of the clinic app; Mom's screen gets a green frame and a sharing bar with **Pause** and **End help** |

**End state:** both phones show the same clinic screen. Alternatives to try: **Next** without choosing an app, the locked **Banking apps** row, **Chat** (demo content is only available for Community Clinic, which the prototype says before anything is shared), **Cancel request** while calling, and **Not now** on Xiaoyu's phone (quick reply, decline without a message, or **Join now instead**); after a decline, Mom's home shows Xiaoyu's reply and "Busy right now".

### Flow 2 — Moderate (start: control bar → **2 Moderate**)

| Step | Phone | Do this | You should see |
| --- | --- | --- | --- |
| 1 | Mom | Tap **Continue** under the appointment | The new "Confirm your booking" page (also on Xiaoyu's phone) |
| 2 | Xiaoyu | Tap **Point**, then tap **Confirm booking** on the live copy (scroll inside the frame to reach lower controls) | "What will 'Confirm booking' do?" — marking never presses the button, and Mom sees nothing until it is sent |
| 3 | Xiaoyu | Tap one or more suggestions (they change with the marked button) or type your own, check "Mom will see", tap **Send to Mom** | "Sent. Mom can see your mark now." |
| 4 | Mom | Read the outlined button with its "Xiaoyu marked this" tag and Xiaoyu's words above the page; optionally tap **Hear it again** (read aloud), **Ask Xiaoyu**, or **Hide** | The words are spoken; a question appears on Xiaoyu's phone, where she can tap a reply |
| 5 | Mom | Tap **Confirm booking** | "Booking confirmed — A-0236" on Mom's phone; "Mom tapped 'Confirm booking'" on Xiaoyu's phone |

Try also: mark **Change time** and then let Mom tap **Confirm booking** — both phones point out that this was not the marked button. **Continue** (on the appointments page) and **Back** can be marked too: Mom sees Xiaoyu's words for whichever button is marked, tapping it counts as following the mark, and leaving the page removes the mark and tells Xiaoyu.

### Flow 3 — Complex (start: control bar → **3 Complex**; the bank SMS arrives after about 2.5 s, or press **Simulate bank SMS**)

| Step | Phone | Do this | You should see |
| --- | --- | --- | --- |
| 1 | — | Wait for the SMS | Mom sees the City Bank message and a sheet: sharing paused, "Xiaoyu did not see it", microphone off, "Never read codes aloud"; Xiaoyu sees "Sharing paused automatically" with the reason but no content |
| 2 | Mom | Optional: **Steps so far**, then **Back** (or **Stay paused for now** to keep using the phone privately) | A list of what happened, quoting Xiaoyu's words; the sharing bar shows "Paused" with **Resume** and **End help** |
| 3 | Mom | Tap **End help**, then confirm **End help** (the safe **Go back** is the default) | "Help ended" banner and "Keep a note for next time?"; Xiaoyu sees "Mom ended help" |
| 4 | Mom | Optional: **Change the words** (each step becomes a large text box), **Done editing**; then **Save to My steps** or **Don't save** (which asks first) | "Saved to My steps" |
| 5 | Mom | **Back to home** (a "Your saved steps" card appears), then the **My steps** tab, then the saved note | The steps, **Edit**, **Delete this note**, and **Ask Xiaoyu for help with this** (opens a request with the app and reason filled in) |

Alternatives: **Resume sharing** at step 1 continues the session; tapping **Mic off** while paused turns Mom's microphone back on, and Xiaoyu's phone then says she can hear Mom but still cannot see her screen; **Wait for Mom** on Xiaoyu's phone shows "Xiaoyu is waiting for you" on Mom's; Xiaoyu's **End help** asks for confirmation; ending before the booking is confirmed produces a note that says "Your booking is not finished yet".

**Predefined inputs and simulated behaviour:** the appointment (Follow-up visit, General Medicine, Dr Wang, Thu 14 Nov 09:30), the booking number A-0236, the bank SMS, Xiaoyu's availability, her replies to questions and the recap text are hard-coded. Xiaoyu's suggested answers to the three preset questions fit the marked button; the prototype cannot understand a typed question, so in auto-play it gets the neutral reply "Let me check, and I'll tell you on the call." "Change time" in the clinic app is intentionally not implemented and says so.

## 5. Development approach

### How the prototype was built

- **Design process:** two alternative directions with ten annotated sketches → selected design → three storyboards → clickable paper-style prototype tested with two AI-simulated users (Think Aloud) → medium-fidelity prototype → five independent heuristic-evaluation passes (H1–H12, 49 consolidated violations) → this high-fidelity prototype, which addresses all 16 major (severity 3–4) violations — 15 fully and one partly, because a booking-cancel function belongs to the third-party clinic app — and all minor ones (see `../evaluation/iteration-table.csv`).
- **Technology:** plain HTML, CSS and JavaScript in three files (`index.html`, `app.css`, `app.js`), no framework or build step. One state object drives both phones, so an action on one phone immediately updates the other, as in a real shared session. State is saved in `localStorage` so a review can be resumed.
- **Design system:** iOS-sized frame and type scale (body 17 pt, instructions 21 pt, titles 32 pt), colour tokens with measured WCAG contrast, primary and safety controls of at least 48 pt and all other controls of at least 44 pt (except two links in the scaled-down copy of Mom's screen on Xiaoyu's phone, 43 pt, which get a larger hit area in point mode), and consistent components (buttons, sheets, alerts, banners, sharing bar). Tokens and components are listed in [`screen-inventory.md`](screen-inventory.md) and [`figma-build-spec.json`](figma-build-spec.json).
- **Tooling:** Python + Playwright scripts drive the prototype for automated walkthroughs, screen exports (`../scripts/capture_screens.py`), the measured accessibility audit (`../scripts/a11y_audit.py`) and the demo video (`../video/build_video.py`). Illustrations and the initial sketches were generated with an AI image tool.

### How the real product would be developed

| Part | Plan |
| --- | --- |
| Apps | Native iOS (Swift / SwiftUI) and Android (Kotlin / Jetpack Compose) apps, or one React Native code base with native modules for capture and overlays |
| Sharing one app | Android: MediaProjection with **single-app capture** (Android 14 QPR2 and later), which excludes other apps and notifications. iOS: ReplayKit broadcast upload extension; because iOS captures the whole screen, the extension must pause capture when the user leaves the chosen app or a notification appears |
| Live view and marks | WebRTC video track for the screen, plus a data channel carrying marks as coordinates normalised to the shared screen and tied to a screen "state", so a mark disappears when the screen changes |
| Showing the mark on the older adult's phone | Android: overlay window (draw-over-apps permission) or accessibility overlay. iOS does not allow drawing over other apps, so the mark and explanation would appear in a Picture-in-Picture panel or require clinic apps to integrate a TogetherStep SDK |
| Calls and signalling | Voice over WebRTC; a small signalling server (for example Node.js or Go with WebSockets) and TURN/STUN servers; family pairing by invitation QR code |
| Privacy pause | Trigger on notification events and app switches; nothing is transmitted while paused; no recording is stored on servers |
| Recaps | Generated from the session's step log, edited by the older adult, stored only on her device (encrypted); she decides whether anything is kept |
| Accessibility | Dynamic Type, VoiceOver / TalkBack labels, haptic and spoken confirmations, high-contrast mode, Chinese localisation |

### Technical considerations and challenges

- **Platform limits:** iOS restricts both capturing other apps and drawing over them, so the iOS experience will differ from Android (Picture-in-Picture guidance instead of an overlay ring).
- **Latency and stale marks:** a mark made on an old frame must not point at the wrong control after the screen changes; marks are tied to a screen state and cleared on change.
- **Different screen sizes and orientations:** marks need normalised coordinates and, ideally, element-level anchoring through accessibility trees.
- **Detecting private content:** the system can detect notifications and app switches, but cannot reliably hide private values *inside* the shared app (for example an ID number on a clinic page).
- **Permissions and onboarding:** screen capture and overlay permissions are confusing for older adults; pairing must be done once with a helper present.
- **Network and battery:** video sharing uses data and battery; the app should fall back to lower frame rates and to still images on poor connections.

## 6. Simulated components

| Real-world component | How the prototype simulates it |
| --- | --- |
| Screen sharing / video stream | Xiaoyu's phone re-renders the same state at about 90% size in a scrollable frame; there is no video |
| Voice call | Indicated by "Call on" / "Mic off" controls and Mute; no audio is transmitted |
| Community Clinic (third-party app) | A fictional, hard-coded three-page booking app |
| Bank SMS notification | Hard-coded message triggered by a timer or the control bar |
| Xiaoyu's replies, availability and partner actions | Scripted (Wizard-of-Oz auto-play mode) or performed by the reviewer |
| Saving recaps | Browser `localStorage`; nothing leaves the computer |
| "Hear it again" | Uses the browser's built-in speech synthesis when available (otherwise a reading notice only) |
| Other apps (Chat, Photos) | Listed so the consent wording can be compared; only Community Clinic has demo content |

## 7. Limitations and accessibility

**Limitations**

- It is a simulation: no networking, real calls, screen capture, notifications or persistence beyond the browser.
- Only one scenario (confirming a clinic booking) and one helper are modelled; error cases such as a lost connection are not prototyped.
- iOS-style only; Android-specific patterns and the iOS overlay limitation described above are not shown.
- The interface is in English for the course; the target users in mainland China would need a Chinese version.
- Findings that shaped it come from AI-simulated participants and expert-style heuristic evaluation, not from tests with real older adults; real-user testing is the next step.

**Accessibility considerations built in**

- Large text (instructions and status 16–21 pt), measured contrast of at least 4.5:1 for all text, primary and safety controls of at least 48 pt (measured with `../scripts/a11y_audit.py`: no text below 13 px, no contrast failures).
- State is never shown by colour alone: green frame + "Sharing with Xiaoyu", slate frame + pause icon + "Paused"; the helper's mark is a dark-orange outline (about 4.8:1) with a "Xiaoyu marked this" tag.
- Destructive actions (ending help on either phone, discarding or deleting a note) ask first, with the safe choice as the default; Pause and End help are always visible while sharing.
- Audio is part of the privacy model: Mom's microphone is muted while paused and she is told not to read codes aloud.
- Plain language without technical terms; the helper must explain the *result* of a step, not only where to tap; the explanation can be read aloud.
- Buttons have text labels; decorative illustrations use empty `alt` text.

**Known accessibility gaps:** no real screen-reader testing was performed; the browser prototype does not support Dynamic Type scaling or system dark mode; the measured audit (`../process-materials/heuristic-evaluation/accessibility-audit.md`) lists remaining items.
