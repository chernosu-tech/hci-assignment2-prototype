# Screen Inventory and Design Tokens — TogetherStep

- **Stage:** 1 (planned) → 3/4 (built as mid-fi) — lane C, Prototype & Interaction
- **Prepared:** 2026-11-09
- **Target device:** smartphone, 393×852 pt (iPhone 15/16 class), iOS conventions ([`../process-materials/decision-log.md`](../process-materials/decision-log.md) D-04)
- **Prototypes:** [`low-fi/`](low-fi/index.html) (paper style, tested), [`mid-fi/`](mid-fi/index.html) (frozen for heuristic evaluation), [`hi-fi/`](hi-fi/index.html) (final)
- **Machine-readable version:** [`figma-build-spec.json`](figma-build-spec.json)

Screen IDs follow the Chinese guide (S = simple, M = moderate, C = complex; H = helper phone). The scenario data is fixed in [`../process-materials/design-brief.md`](../process-materials/design-brief.md) Section 9.

## 1. Screens and states

### Flow 1 — Simple: ask for help and share one app

| ID | Phone | Screen / state | Key elements | Transitions |
| --- | --- | --- | --- | --- |
| S01 | Older adult | TogetherStep home | Helper card with availability; primary "Ask family for help"; "My saved steps" | → S02 |
| S02 | Older adult | Choose one app to share | App list (Clinic, Chat, Photos; banking apps not shareable); statement of what the helper can and cannot do | → S03 · Cancel → S01 |
| S03 | Older adult | Confirm and connect | Summary "Xiaoyu will see: Clinic only"; Start / Cancel; connecting state with cancel | → S04 (helper joins) |
| S04 | Older adult | Sharing active | Clinic app inside a green frame; sharing bar (who, what, Pause, End); confirmation toast | → M03 |
| H01 | Helper | Incoming request | Who asks, which app, Join / Not now | → H02 · Not now → idle |
| H02 | Helper | Live view of the chosen app | Scope label "You see: Clinic only"; mirrored screen; Point / Explain tools; End | → M01 |

### Flow 2 — Moderate: follow a marked, explained step

| ID | Phone | Screen / state | Key elements | Transitions |
| --- | --- | --- | --- | --- |
| M01 | Helper | Point mode | Instruction "Tap the button Mom should press"; tappable targets on the mirror | → M02 |
| M02 | Helper | Explain the step | Marked target preview; suggested phrases; own text; Send | → M03 (elder) |
| M03 | Older adult | Marked step | Ring on the target; explanation card naming the action and its consequence; "You tap it yourself"; Repeat / Ask | Tap target → M04 |
| M04 | Both | Result | Booking confirmed + number on the older adult's phone; helper sees the result and who tapped | → C01 |

### Flow 3 — Complex: private interruption, pause and recap

| ID | Phone | Screen / state | Key elements | Transitions |
| --- | --- | --- | --- | --- |
| C01 | Older adult | Private notification → automatic pause | Bank SMS shown to the older adult only; sharing paused before the helper can see it | → C02 |
| C02 | Older adult | Paused choices | Why it paused; Resume sharing / See steps / End help | Resume → S04 · End → C04 |
| C03 | Helper | Paused placeholder | "Mom paused sharing to protect her privacy"; no view; wait / end | Resume → H02 · End → summary |
| C04 | Older adult | End and recap | End confirmation; recap of steps (edit / save / don't save); saved recap in "My saved steps" | → S01 |

## 2. Design tokens

| Token | Value | Use | Contrast on white |
| --- | --- | --- | --- |
| `color.primary` | `#1E56A0` | Primary buttons (white text 7.3:1), links, selected states | 7.3:1 |
| `color.accent` | `#F6993F` | Helper marker ring (decorative, never text; dark text on it 7.9:1) | 2.2:1 |
| `color.safe` | `#2E7D32` | "Sharing" frame and status | 5.1:1 |
| `color.pause` | border `#B45309`; text `#7C2D12` on fill `#FDE7C7` | Paused state (text on fill 7.8:1) | 5.0:1 (border) |
| `color.danger` | `#B91C1C` | End / destructive | 6.5:1 |
| `color.surface` | `#FAFAFA` / card `#FFFFFF` | Backgrounds | — |
| `color.text` | `#1A1A1A` / secondary `#4B5563` | Text | 17.4:1 / 7.6:1 |
| `type.body` | 17–18 pt regular, line height 1.4 | Body text (iOS Body 17 pt minimum) | |
| `type.instruction` | 20–24 pt semibold | Key instructions, explanation card | |
| `type.title` | 28–34 pt bold | Screen titles | |
| `size.target` | ≥ 48×48 pt; primary buttons 56–64 pt high | All tappable controls | |
| `space` | 4 / 8 / 16 / 24 pt | Layout grid | |

Contrast values are computed with the WCAG 2.x relative-luminance formula.

**High-fidelity revision (after the heuristic evaluation, violations V21 and V42):** "paused" moved from amber to slate so that orange means only "the helper marked this" — `color.paused` text/border `#334155` on fill `#E2E8F0` (8.4:1); `color.marker` `#B45309` as a 5 pt outline (4.8:1 against the `#FAFAFA` page; white tag text on it 5.0:1). Warning text `#78350F` on `#FEF3C7` (8.2:1); success text `#14532D` on `#DCF3E2` (7.8:1).

## 3. Components

Large button (primary / secondary / destructive), helper card, app-choice row, sharing bar, sharing frame, marker ring, explanation card, toast, paused card, recap card, iOS status bar, navigation bar, tab bar, home indicator.

## 4. Simulated components

All screen sharing, calls, notifications and the Community Clinic app are simulated with hard-coded data. The helper "sees" a re-rendering of the same state, not a video stream. See [`README.md`](README.md) for the full list and limitations.
