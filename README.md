# TogetherStep: Interactive Prototype README

**TogetherStep (陪你走一步)** is a mobile app concept that helps an older adult navigate an unfamiliar phone screen with remote guidance from a family member, *without handing over control of the phone*. The older adult shares only the one app she chooses, the helper points at the next button and writes a plain-language explanation of what it will do, the older adult taps the button on her own phone, private notifications pause sharing automatically, and an optional step-by-step note helps her repeat the task next time.

This folder contains the interactive high-fidelity prototype built for CSC5056 / CSC4130 / AIR5064 *Introduction to Human-Computer Interaction* (CUHK-Shenzhen, Assignment 2) by Graduate Team 7: Ma Xinyu, Ma Xueyi, Su Shaozhi, Tang Shiyuan, and Zhang Shuo. All calls, screen sharing, notifications, and clinic booking states are simulated in the browser.

| Link | URL and description |
| --- | --- |
| Live prototype | [https://chernosu-tech.github.io/hci-assignment2-prototype/hi-fi/](https://chernosu-tech.github.io/hci-assignment2-prototype/hi-fi/) |
| Screen gallery and design spec | [https://chernosu-tech.github.io/hci-assignment2-prototype/screens/index.html](https://chernosu-tech.github.io/hci-assignment2-prototype/screens/index.html) (exported frames for all 26 states in [`screens/`](screens/) and the component/token specification in [`figma-build-spec.json`](figma-build-spec.json)) |
| Prototype versions | [`low-fi/`](low-fi/index.html) (clickable paper-style prototype used in Phase 1 testing), [`mid-fi/`](mid-fi/index.html) (accepted medium-fidelity prototype evaluated in Phase 3), and [`hi-fi/`](hi-fi/index.html) (final high-fidelity prototype) |

## 1. Access and setup

Online: open the live prototype link above in any current desktop browser (Chrome, Edge, Safari, or Firefox). No login, installation, or special permissions are needed.

Offline from local files:
1. Download or clone [github.com/chernosu-tech/hci-assignment2-prototype](https://github.com/chernosu-tech/hci-assignment2-prototype) (or open `assignment-2/prototype/` inside the project repository).
2. Double-click `hi-fi/index.html` to open it in a browser. Every script, stylesheet, and image is local, so no server or internet connection is required.
3. Use a browser window at least 1,000 px wide so both phone frames appear side by side.

What is shown on screen: two iPhone-sized frames side by side, with **Mom's phone** (the older adult, left) and **Xiaoyu's phone** (her daughter, the remote helper, right). You can click buttons on both phones directly to walk through both sides of the session. The thin bar across the very top of the page is a reviewer toolbar (not part of the app interface) that lets you jump directly to Task Flow 1, 2, or 3, trigger the incoming bank SMS, toggle auto-play for the other phone, or reset the state.

Optional query parameters:

| URL suffix | Behavior |
| --- | --- |
| `?view=elder&partner=auto` | Shows only Mom's phone while Xiaoyu's side responds automatically |
| `?view=helper&partner=auto` | Shows only Xiaoyu's phone while Mom's side responds automatically |
| `#flow=simple`, `#flow=moderate`, `#flow=complex` | Jumps directly to the start of the selected task flow |
| `?fresh=1` | Clears saved state in `localStorage` and starts from a clean home screen |

## 2. Target device

- Smartphone in portrait orientation, designed at **393 x 852 pt** (iPhone 15 / 16 dimensions) using standard iOS interface patterns: status bar with Dynamic Island, navigation bar, bottom tab bar, modal sheets, alerts, notification banners, and home indicator.
- Both users install the same app on their own phones, which presents the older-adult view for Mom and the helper view for Xiaoyu.
- In the desktop browser, 1 CSS pixel represents 1 iOS point. You can also open `?view=elder` or `?view=helper` on a mobile browser, though the dual-phone desktop layout is easiest for reviewing both sides together.

## 3. Context of use

Target users: older adults (roughly 60 to 75) who handle everyday mobile tasks on their own but stop when an app update changes a familiar flow, and their adult children who help remotely from another city while juggling work and family schedules. In our Assignment 1 interviews, helpers could not see what was on the parent's screen ("a blue one"), static screenshots fell behind after a tap, older adults worried about what a button would do (such as booking twice), and full-screen sharing exposed private messages or financial details.

Scenario: Mom is at home trying to confirm a follow-up appointment with Dr. Wang in the fictional *Community Clinic* app, where a redesigned confirmation screen makes her hesitate. Her daughter Xiaoyu helps remotely from another city.

Three user task flows supported in the prototype:
1. **Simple flow (ask for help and share one app):** Mom asks Xiaoyu for help and chooses to share only Community Clinic; Xiaoyu joins and sees only that app.
2. **Moderate flow (follow a marked and explained step):** Xiaoyu points at `Confirm booking` in her live mirror and sends a short explanation of what it does; Mom reads the note, taps the button on her own phone, and both phones show the booking confirmation.
3. **Complex flow (handle a private interruption and save a recap):** An incoming bank SMS automatically pauses screen sharing and mutes Mom's microphone; Mom checks the session steps, ends help, optionally edits and saves a step-by-step reminder to *My steps*, and reopens it later.

## 4. Operating instructions

Click any button inside either phone frame with the mouse.

### Flow 1: Simple (toolbar `1 Simple`, or a fresh page)

| Step | Phone | Action | Expected result |
| --- | --- | --- | --- |
| 1 | Mom | Tap `Ask Xiaoyu for help` | Opens `Which app do you need help with?` with no app pre-selected and a prompt to choose one app |
| 2 | Mom | Tap `Community Clinic`, then `Next` | Scope note updates to name `Community Clinic only`, then opens `Share Community Clinic with Xiaoyu?` listing what Xiaoyu can and cannot do and noting that a voice call starts |
| 3 | Mom | Optionally pick a reason chip (such as `Confirm or book a visit`), then tap `Call Xiaoyu and share` | Mom sees `Calling Xiaoyu...` (nothing shared yet); Xiaoyu's phone shows who is asking, which app, and the chosen reason |
| 4 | Xiaoyu | Tap `Join` | Xiaoyu sees `Live · you see: Community Clinic only` above the mirrored clinic app; Mom's phone shows a green sharing frame and top bar with `Call on`, `Pause`, and `End help` |

Additional paths to try in Flow 1: tapping `Next` before choosing an app; reading or tapping the locked `Banking apps` row (which explains money protection and suggests calling without screen sharing); tapping `Chat` or `Photos` (badged `Demo limit` right in the picker so unsupported choices are flagged before the consent step); tapping `Cancel request` while calling (which cancels pending partner timers cleanly); or tapping `Not now` on Xiaoyu's phone to go back, join instead, or send a quick reply (which updates Mom's home screen with Xiaoyu's message and `Busy right now`, and records the sent reply on Xiaoyu's home screen).

### Flow 2: Moderate (toolbar `2 Moderate`)

| Step | Phone | Action | Expected result |
| --- | --- | --- | --- |
| 1 | Mom | Tap `Continue` on the appointment card | Opens the updated `Confirm your booking` page on both Mom's screen and Xiaoyu's mirror |
| 2 | Xiaoyu | Tap `Point`, then tap `Confirm booking` inside the scrollable mirrored clinic screen | Opens `What will "Confirm booking" do?` noting that marking only places a highlight (draft stays on Xiaoyu's side until sent) |
| 3 | Xiaoyu | Select one or more target-specific phrases or type custom text, check the `Mom will see` preview, and tap `Send to Mom` (or `Cancel explanation`) | Xiaoyu sees `Sent. Mom can see your mark now.` |
| 4 | Mom | Read the 5 px dark-orange outline, `Xiaoyu marked this` tag, and Xiaoyu's explanation card docked above the page; optionally tap `Hear it again`, `Ask Xiaoyu`, or `Hide` | `Hear it again` speaks the explanation aloud; `Ask Xiaoyu` sends a question or request to Xiaoyu's phone where she can tap a reply |
| 5 | Mom | Tap `Confirm booking` on Mom's phone | Mom sees `Booking confirmed` (`A-0236`); Xiaoyu sees `Mom tapped "Confirm booking". The booking is confirmed (A-0236).` |

Additional paths to try in Flow 2: mark `Change time` on Xiaoyu's phone and then have Mom tap `Confirm booking` anyway (both phones persistently report that a different button was tapped and state the clinic-reception boundary); mark `Continue` on the first clinic page or `Back` on the confirmation page; or ask `Can I change it later?` (the preset reply states the actual scope boundary rather than promising an unimplemented cancel button).

### Flow 3: Complex (toolbar `3 Complex`; the bank SMS arrives after ~2.5 s, or click `Simulate bank SMS`)

| Step | Phone | Action | Expected result |
| --- | --- | --- | --- |
| 1 | Both | Wait for the SMS (or click `Simulate bank SMS`) | Mom sees the City Bank verification banner and pause sheet stating sharing is paused, `Xiaoyu did not see it`, her mic is muted, `Never read codes aloud`, and that resuming closes the banner and shares Community Clinic only; Xiaoyu sees `Sharing paused automatically` with no mirrored Clinic DOM in the accessibility tree |
| 2 | Mom | Optionally tap `Steps so far` and `Back` (or `Stay paused for now` to inspect the clinic page privately) | Opens the session log separating `Task steps in Community Clinic` (quoting Xiaoyu's explanation) from the `Sharing status log`; the inline SMS banner includes a `Dismiss` pill and never blocks `Back` |
| 3 | Mom | Tap `End help`, then confirm `End help` in the state-aware dialog (`Stay paused` is the default button while paused) | Mom sees the prominent green `Help ended` banner and optional `Keep a note for next time?` with the note title shown; Xiaoyu sees `Help ended` |
| 4 | Mom | Optionally tap `Change the words` to edit the title or any step in focused text boxes, then tap `Save to My steps` directly (or `Don't save`, which warns before discarding) | Saves the note locally and shows `Saved to My steps` with both `Open saved note` and `Back to home` |
| 5 | Mom | Tap `Open saved note` (or go via `Back to home` -> `My steps` tab) | Opens the saved five-step guide (separate from the `Last time` booking record) with `Edit` (title and steps), `Delete this note`, and `Ask Xiaoyu for help with this` (which skips to Step 2 with the note's title attached) |

Additional paths to try in Flow 3: tap `Resume sharing` after the pause to close the bank banner and restore Clinic-only sharing; toggle `Mic off` while paused (which updates Xiaoyu's paused screen to report Mom's and Xiaoyu's microphone states); tap `Wait for Mom` on Xiaoyu's phone (keeps manual sessions paused and shows `Xiaoyu is waiting for you` on Mom's side; in `?view=helper&partner=auto`, the scripted Mom resumes sharing after ~4 s without ending help or saving a note); or end help early from the appointment list or confirmation page (which generates an unfinished note starting from the actual next required tap, including `Continue` when still on the list).

Predefined scenario data: the appointment (`Follow-up visit`, General Medicine, Dr. Wang, Thu 14 Nov 09:30), booking number `A-0236`, the City Bank SMS (`482915`), and preset Q&A replies are hard-coded. If a reviewer types a custom free-text question while running in single-phone auto-play mode, the scripted helper responds with the fallback line "Let me check, and I'll tell you on the call."

## 5. Development approach

### How this prototype was built

- Iterative design across the four course phases: two design directions and ten annotated sketches -> selection of Design A -> three task-flow storyboards -> clickable paper-style prototype evaluated in initial and supplementary Think Aloud sessions (`P2-01`, `P2-02`) -> medium-fidelity prototype -> five independent heuristic evaluation perspectives (`H1` to `H12`, 83 source observations consolidated into 41 violations, including 7 major severity-3 issues) -> this high-fidelity prototype, which resolves 6 of the 7 major issues in full and 1 (`V13`, clinic booking cancellation) through bounded recovery guidance because appointment cancellation belongs to the simulated third-party clinic app, alongside 33 of 34 minor/cosmetic issues fully resolved and `V46` (secondary hint sizing) partly resolved (see `../evaluation/iteration-table.csv`).
- Implementation stack: plain HTML, CSS, and JavaScript (`index.html`, `app.css`, `app.js`) with no external framework or build step. Both phone views read and update a single shared state object, so an action on one phone immediately updates the other phone, and state persists in `localStorage`.
- Visual and accessibility system: 393 x 852 pt iOS layout, type scale using 17 CSS px for body, status, and privacy copy and 20-21 CSS px for primary guidance, WCAG-checked color tokens, primary and safety buttons at least 48-50 CSS px tall, and all other interactive controls at least 44-48 CSS px. Full screen and token tables are in [`screen-inventory.md`](screen-inventory.md) and [`figma-build-spec.json`](figma-build-spec.json).
- Verification scripts: Python + Playwright scripts in `../scripts/` run automated interaction and lifecycle checks (`test_hifi_paths.py`, `test_hifi_review_fixes.py`), export the 26 screen frames (`capture_screens.py`), run the 14-state DOM/contrast accessibility audit (`a11y_audit.py`), and record the demonstration video (`../video/build_video.py`).

### How a production version would be engineered

| Subsystem | Production architecture |
| --- | --- |
| Mobile clients | Native iOS (Swift / SwiftUI) and Android (Kotlin / Jetpack Compose) apps, or React Native with native screen-capture modules |
| Single-app screen sharing | Android: `MediaProjection` configured with `MediaProjectionConfig.createConfigForUserChoice()` (introduced in Android 14 / API 34), allowing the user to share a single app task rather than the full display. iOS: `ReplayKit` (`RPSystemBroadcastPickerView` + broadcast upload extension); because iOS broadcasts the system screen, the extension pauses frame transmission when the user leaves the target app or a notification transition occurs |
| Live view and marker sync | WebRTC video track for the shared app view, paired with a WebRTC data channel sending normalized target coordinates and screen-state identifiers so markers clear automatically when the page changes |
| Rendering markers on the older adult's phone | Android: system overlay window (`SYSTEM_ALERT_WINDOW`) or accessibility overlay. Because iOS blocks third-party apps from drawing overlays on top of other apps, an iOS build would display guidance in a floating Picture-in-Picture window or require partner clinic apps to bundle a lightweight TogetherStep SDK |
| Voice call and signaling | WebRTC audio channel with automatic local microphone mute on privacy pause; lightweight WebSocket signaling server with STUN/TURN relay and one-time QR family pairing |
| Local recaps | Built from the session event log, editable by the older adult, and stored locally on the device in encrypted storage |

### Key technical challenges

- Operating-system sandboxing on iOS restricts both single-app capture and drawing overlays over other apps, requiring broadcast-extension pause guards and a Picture-in-Picture fallback or partner SDK on iPhones.
- Network latency can cause a helper to tap an outdated frame; tying every marker to a screen-state identifier prevents stale markers from landing on the wrong button after a page transition.
- Different phone sizes and font-scale settings shift button positions, making accessibility-tree element anchoring preferable to raw `x, y` coordinates where supported.
- While single-app sharing hides other apps and notifications, it cannot automatically redact sensitive text rendered *inside* the shared app page itself.

## 6. Simulated components in the prototype

| Feature | How it is simulated in this prototype |
| --- | --- |
| Live screen sharing | Xiaoyu's phone renders a synchronized ~91%-scale copy of Mom's clinic view in the browser during active sharing, and omits that DOM completely while paused or ended |
| Voice call and microphone mute | Represented by the `Call on` / `Mic off` and `Mute` controls and status banners; no live microphone audio is captured |
| *Community Clinic* app | Fictional three-screen appointment booking flow built inside the prototype (appointment cancellation/rescheduling is out of scope and stated explicitly) |
| Incoming bank SMS | Fictional City Bank notification triggered by a timer in Flow 3 or the top toolbar button |
| Partner actions in single-phone views | Driven by a Wizard-of-Oz timer script when `partner=auto` is enabled, or operated manually in the default two-phone view |
| Saved recaps | Stored in browser `localStorage` on the local machine |
| `Hear it again` read-aloud | Uses the browser's Web Speech API (`speechSynthesis`) when available, with an on-screen speaking indicator |

## 7. Limitations and accessibility

Current prototype limitations:
- All networking, phone calls, OS screen-capture permissions, and third-party app states are simulated in the browser around a single clinic-booking scenario.
- Graphical-design-tool source file compliance (creating a native Figma file rather than a coded web prototype plus exported frames and `figma-build-spec.json`) remains deferred.
- The interface follows iOS visual conventions and is written in English for coursework evaluation; a production release for older adults in China would require Chinese localization and Android Material adaptations.
- Our iterative refinements were informed by Think Aloud sessions on the paper-style prototype and five heuristic evaluation perspectives on the medium-fidelity prototype; field testing with older adults and family helpers on physical phones is the next step.

Built-in accessibility measures:
- Body copy, privacy assurances, sharing-bar status, call/microphone pills, helper status cards, and tool labels are 17 CSS px (instructions and headings 20-32 CSS px); supporting hints, chips, and Clinic sublabels are 16 CSS px. Across the 14-state automated audit (`../scripts/a11y_audit.py`), there are **0** text contrast failures, **0** controls under 44 CSS px, **0** unnamed controls, **0** text nodes below 13 CSS px, and only **5** simulated status-bar/checkmark glyphs at 13-15 CSS px. Primary `Pause` / `End help` controls are 50 CSS px tall; only the two scaled links (`Change time`, `‹ Back`) inside Xiaoyu's ~0.91x mirror measure 44 CSS px high (below the 48 px team token, expanded via hit-area padding in Point mode).
- Semantic privacy on pause and end (`V53`): when sharing is paused or ended, the mirrored Clinic markup is removed from Xiaoyu's DOM rather than merely covered visually, and keyboard focus moves to the pause/end status heading so assistive technologies cannot read hidden Clinic content.
- System state never relies on color alone: active sharing pairs a green border with "Sharing with Xiaoyu", paused sharing pairs a slate border with a pause icon and "Paused", and the helper's marker pairs a stable 5 px dark-orange outline (`#B45309`, measured 4.81:1 against `#FAFAFA`) with a visible `Xiaoyu marked this` pill linked via `aria-describedby`.
- Destructive actions (ending help on either phone, discarding a recap, deleting a saved note) ask for confirmation with the safe option highlighted as default, and `Pause` / `End help` remain visible at the top of every shared screen.
- During an automatic privacy pause, Mom's microphone is muted by default and the screen warns her never to read verification codes aloud.
- Remaining accessibility gaps: browser DOM checks do not substitute for testing with native mobile screen readers (VoiceOver / TalkBack) or real voice-call audio, and the fixed 393 x 852 px frame does not dynamically reflow for OS-level Dynamic Type scaling (`../process-materials/04-interactive-high-fidelity-prototyping/accessibility-audit-high-fidelity.md`).
