# Screen Inventory and Design Tokens: TogetherStep (High-Fidelity)

> **Version scope:** This file describes the final high-fidelity prototype (`prototype/hi-fi/`) and its design system. For the accepted medium-fidelity prototype evaluated in Phase 3, see [`02-screen-inventory-and-design-decisions.md`](../process-materials/02-interactive-medium-fidelity-prototyping/02-screen-inventory-and-design-decisions.md).

Target device: smartphone, 393 x 852 pt (iPhone 15 / 16 dimensions), following iOS interface conventions (`../process-materials/05-process-record/decision-log.md` D-04).
Prototype versions: [`low-fi/`](low-fi/index.html) (clickable paper-style prototype), [`mid-fi/`](mid-fi/index.html) (accepted medium-fidelity prototype), and [`hi-fi/`](hi-fi/index.html) (final high-fidelity prototype).
Figma recreation specification: [`figma-build-spec.json`](figma-build-spec.json).

Screen IDs use `S` for the simple flow, `M` for the moderate flow, `C` for the complex flow, and `H` for the helper's phone. Scenario data is documented in `../process-materials/01-sketching-and-low-fidelity-prototyping/05-construct-low-fidelity-paper-prototype/scenario-data.md`.

## 1. Screens and states

### Flow 1: Simple (ask for help and share one app)

| ID | Phone | Screen / state | Key elements | Transitions |
| --- | --- | --- | --- | --- |
| S01 | Older adult | TogetherStep home | Helper card with availability (or `Busy right now` + latest decline reply), primary `Ask Xiaoyu for help` button, 17 px privacy assurance, optional `Your saved steps` card, and `Get help` / `My steps` tabs | -> S02 |
| S02 | Older adult | Choose one app to share | App list (`Community Clinic` selectable; `Chat` and `Photos` badged `Demo limit` in picker; locked `Banking apps` with inline money-privacy reason and voice-only suggestion), dynamic scope box, and selection cue | -> S03; Cancel -> S01 |
| S03 | Older adult | Confirm sharing scope | Checklist of what Xiaoyu can and cannot do (shield icon for protections, voice call noted), optional task reason chips, and `Call Xiaoyu and share` | -> S03b -> S04 |
| S03b | Older adult | Calling | `Calling Xiaoyu...` ("Nothing is shared until she joins") and `Cancel request` (clears pending partner timers) | Helper Join -> S04; Cancel -> S01 |
| S04 | Older adult | Sharing active | Clinic appointment list inside a green sharing frame; top bar with `Sharing with Xiaoyu`, 48 px `Call on` / `Mic off` pill, 17 px presence line, and 50 px `Pause` / `End help` buttons | Tap `Continue` -> M00 |
| H00 | Helper | Helper home | Mom status card, latest sent decline reply (`You told Mom: ...`) if any, and privacy summary | Incoming request -> H01 |
| H01 | Helper | Incoming request | Shows who is asking, `Community Clinic`, Mom's optional reason, scope checklist, `Join`, and `Not now` (opens `Reply to Mom` with `< Back`, preset replies, decline without message, and `Join now instead`) | Join -> H02; Not now -> declined sheet |
| H02 | Helper | Live view of the chosen app | `Live · you see: Community Clinic only` badge, scrollable ~0.91x mirror, `Point` / `Explain` (disabled until a target is picked) / `Mute` tools, and `End help` (with confirmation) | Tap `Point` -> M01 |

### Flow 2: Moderate (follow a marked and explained step)

| ID | Phone | Screen / state | Key elements | Transitions |
| --- | --- | --- | --- | --- |
| M00 | Older adult | Clinic confirmation page | Redesigned appointment confirmation page (`Confirm booking`, `Change time`, `‹ Back`) shared live | -> M01 (helper) |
| M01 | Helper | Point mode | Status prompt (`Tap the button Mom should press. This only marks it...` + `Cancel pointing`) and dashed outlines on all markable targets (`Confirm booking`, `Change time`, `‹ Back`, and `Continue` on list) | Tap target -> M02 (draft stays on helper side) |
| M02 | Helper | Explain the step | Target-specific phrase chips, custom text field, `Mom will see` preview, `Send to Mom`, and `Cancel explanation` | Send -> M03 / M03h |
| M03 / M03h | Both | Marked step and waiting | Mom sees a stable 5 px `#B45309` outline (4.81:1) + `Xiaoyu marked this` tag (`aria-describedby`) and a docked, collapsible explanation card (`Hide`, `Hear it again`, `Ask Xiaoyu`). Xiaoyu sees delivery status, `Remove my mark`, and one-tap reply chips when Mom asks a question (`M03a`) | Mom taps target -> M04 / M04h |
| M04 / M04h | Both | Booking confirmed | Confirmation `A-0236` on Mom's phone; Xiaoyu's mirror and status card confirm `Mom tapped "Confirm booking"` (or persistently flag a mismatch if Mom tapped a different button than marked) | -> C01 |

### Flow 3: Complex (private interruption, pause, and recap)

| ID | Phone | Screen / state | Key elements | Transitions |
| --- | --- | --- | --- | --- |
| C01 | Older adult | Automatic privacy pause | City Bank SMS with `Dismiss` pill shown only on Mom's phone; pause sheet stating `Xiaoyu did not see it`, mic auto-muted, `Never read codes aloud`, pre-Resume Clinic-only assurance, `Stay paused for now` (keeps Clinic usable under slate `Paused` bar), `Resume sharing`, `Steps so far`, and `End help` | Resume -> S04/M04; Steps -> C02; End -> C04a |
| C02 | Older adult | Steps so far | Separates `Task steps in Community Clinic` (quoting Xiaoyu's target and words) from `Sharing status log`, shows state-accurate `Next step when you resume`, and renders any active SMS inline below `< Back` | Back -> paused Clinic |
| C03 | Helper | Paused placeholder | Mirrored Clinic DOM removed from accessibility tree; `Sharing paused automatically` heading, Mom + helper mic status, `Wait for Mom` (updates Mom's bar/sheet), `Mute`, and confirmed `End help` | Wait -> C03; End -> C05h |
| C04a | Older adult | End help confirmation | State-aware dialog (`Stay paused` when paused, `Keep sharing` when active) explaining that both sharing and the voice call close | Confirm -> C04 / C05h |
| C04 / C04e / C05h | Both | Help ended and recap | Prominent green `Help ended` banner first, optional `Keep a note for next time?` showing `Title: Book a follow-up visit`, ordered reusable steps (5 steps when completed; next-action sequence including `Continue` when unfinished), separate `Last time` footer, focused `Change the words` fields (`C04e`), and equal-weight `Save to My steps` / confirmed `Don't save` | Save -> C05; Don't save -> S01 |
| C05 -> C06 -> C07 | Older adult | Saved confirmation and My steps | `Saved to My steps` names the saved title and offers both `Open saved note` (`C07`) and `Back to home`; `My steps` (`C06`) lists saved notes; detail view (`C07`) supports editing title + steps, confirmed deletion, and `Ask Xiaoyu for help with this` (carries note title to Step 2) | Shortcut -> S03 |

## 2. Design tokens

| Token | Value | Usage | Contrast on `#FAFAFA` / fill |
| --- | --- | --- | --- |
| `color.primary` | `#1E56A0` | Primary buttons (white text 7.3:1), focus rings, selected states | 7.3:1 (white on primary) |
| `color.marker` | `#B45309` | Stable 5 px target outline and `Xiaoyu marked this` pill | 4.81:1 on `#FAFAFA`; 5.02:1 white text on pill |
| `color.safe` | `#2E7D32` / `#14532D` on `#DCF3E2` | Active `Sharing` frame, live chip, `Help ended` banner | 5.1:1 border; 9.1:1 banner text |
| `color.paused` | `#334155` on `#E2E8F0` | `Paused` bar, dashed/solid frame, and helper paused chip | 8.4:1 text on fill |
| `color.danger` | `#B91C1C` | `End help` and destructive confirmation actions | 6.5:1 on white |
| `color.surface` | `#FAFAFA` / `#FFFFFF` | Page and card backgrounds | - |
| `color.text` | `#1A1A1A` / `#374151` | Primary and secondary copy | 17.4:1 / 10.3:1 |
| `type.body` | 17-18 CSS px regular (1.45 line height) | Body copy, privacy notes, sharing presence, helper status | - |
| `type.secondary` | 16 CSS px | Supporting hints, chips, tab labels, Clinic sublabels | - |
| `type.instruction` | 20-21 CSS px semibold | Marked explanation quote and primary button labels | - |
| `type.title` | 22-32 CSS px bold | Section and large navigation titles | - |
| `size.target` | >= 48 x 48 CSS px (primary buttons 56-66 px; sharing safety buttons 50 px) | Interactive controls (two links inside ~0.91x helper mirror are 44 px, expanded in Point mode) | - |
| `space` | 4 / 8 / 12 / 16 / 20 / 24 px | Layout spacing grid | - |

## 3. Core UI components

Primary/secondary/destructive buttons, family helper status card, app-selection row with demo/privacy badges, persistent sharing bar with 48 px Call/Mic pill, sharing border frame, stable 5 px target marker outline + `aria-describedby` tag, docked collapsible explanation card, non-blocking toast banner, inline/overlay notification banner with `Dismiss` pill, privacy-pause sheet, editable recap card with title input, iOS status bar, navigation bar, tab bar, and home indicator.

## 4. Simulated elements

Screen sharing, voice calls, SMS notifications, and the Community Clinic app are simulated in the browser with hard-coded scenario data; Xiaoyu's mirror renders a synchronized view of Mom's clinic state during active sharing and removes that DOM while paused or ended (see [`README.md`](README.md)).
