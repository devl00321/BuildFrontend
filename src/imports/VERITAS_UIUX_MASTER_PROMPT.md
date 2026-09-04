# VERITAS (CIAS) — Master UI/UX Design Prompt

> **How to use this:** Paste this entire document into Figma (First Draft / Figma
> Make) or Lovable as the initial project brief. It is written to be read start
> to finish by a design-generation AI — it defines the product, the existing
> visual system to extend (not replace), every screen needed, and the exact
> component behavior. Where a screen or component already exists in the live
> product, that is stated explicitly so the tool improves it rather than
> reinventing it from scratch.

---

## 1. What this product is

**VERITAS** (Criminal Intelligence Analysis System, SIH 2026 entry SIH26189) is
a desktop web tool for police investigators. It takes raw case documents
(FIRs, call detail records, financial transactions, surveillance reports),
automatically extracts people/phones/vehicles/locations/events from them,
resolves duplicate identities, builds a connected graph of the criminal
network, and lets an investigator explore that graph, review AI-flagged
ambiguities, inspect evidence, and (once analytics land) see who the key
players are and why.

**This is not a consumer app.** It's a professional investigation tool used by
people trained on it, used for hours at a time, where every visual decision
should reduce cognitive load and increase trust in what the system is telling
them — not delight them with flourish. Think Palantir Gotham, Bloomberg
Terminal, or a modern SIEM dashboard, not a startup landing page.

**Primary user:** an Investigator. Secondary users: Analyst (reviews evidence,
doesn't act on cases), Supervisor (assigns cases, sees everything), Forensic
Officer / Auditor (verifies evidence integrity, checks chain of custody),
System Admin (manages users/roles).

---

## 2. Design principles (apply these to every screen)

1. **Evidence over assertion.** Never show a bare score, a bare "suspicious"
   label, or a bare confidence percentage with nothing behind it. Every claim
   the system makes must have a one-click path to "why" — the source document,
   the matching signals, the calculation. This is the product's core promise
   (see the SIH doc's "Explainability" principle) and it must show up as a UI
   pattern everywhere risk/confidence appears, not just on one screen.
2. **Calm, not alarmist.** This tool flags anomalies and risk constantly by
   its nature. Avoid red-everywhere / siren aesthetics. Use color sparingly
   and meaningfully so that when something IS red, it actually means
   something. A screen where 40% of nodes are red teaches the investigator to
   ignore red.
3. **Density with hierarchy, not clutter.** Investigators want a lot of
   information on screen (this is a professional tool, not a mobile app), but
   it must be organized into clear visual layers — primary graph/data,
   secondary metadata panels, tertiary system chrome — so the eye always knows
   where to look first.
4. **The graph is the product.** Every other screen (case list, evidence,
   admin) is supporting cast. The graph canvas should always be the largest,
   most polished, most performant surface in the app.
5. **Reversible, auditable actions.** Merging two entities, resolving a
   review item, closing a case — these are consequential actions on real
   police data. Every one of them needs a confirmation step and shows up in an
   audit trail. Never a silent destructive action.
6. **Respect the existing decisions.** The team already chose (and this
   should NOT be relitigated by the design tool): a light theme (not dark), a
   direct HTML/CSS/D3 implementation philosophy (fast, no heavy framework
   bloat), and an amber + teal accent identity under the name VERITAS. Extend
   this system; don't propose a rebrand.

---

## 3. Design tokens — extend this exact system

The product already has a real, considered light-theme design system in
production. Use these exact tokens as your base palette (do not invert to dark
mode, do not swap the accent colors):

```
Background (app canvas):     #F3F4F6   (--ink)
Panel / card surface:        #FAFAFA   (--graphite)
Secondary surface:           #E5E7EB   (--graphite-2)
Hairline border:             rgba(0,0,0,0.15)
Strong border:                rgba(0,0,0,0.28)
Primary text:                 #030712   (near-black, high contrast)
Dimmed text:                  #1F2937
Faint / meta text:            #4B5563
Accent — amber (warnings, active/in-progress state, brand mark):
                               #B45309, dim wash rgba(180,83,9,0.15)
Accent — teal (success, completed, verified/trusted state):
                               #0F766E, dim wash rgba(15,118,110,0.15)
Neutral graph element (edges, inactive):  #6B7280   (--steel)
Corner radius:                14px (panels/cards), smaller (8-10px) for pills/buttons
Base font size:                16px root, 15px body
Body font:                     system UI stack (-apple-system, "SF Pro Text", "Segoe UI", sans-serif)
Data / IDs / hashes font:      monospace stack (ui-monospace, "SF Mono", "Menlo", "Cascadia Code")
Header treatment:              translucent white (rgba(255,255,255,0.75)) with backdrop blur — glass topbar
```

**Extend this palette with exactly one addition needed for risk semantics that
doesn't exist yet:** a third status color for high-severity/red-flag states
(distinct from amber="in progress/attention" and teal="verified/good"). Use a
desaturated brick/red, e.g. `#B91C1C` with a `rgba(185,28,28,0.15)` wash, kept
visually consistent in weight with the existing amber/teal treatment (same
dot-with-glow-ring pattern already used for pipeline step states). Do not
introduce any other new hue without a specific reason tied to a real status
meaning.

**Typography scale:** establish a clear, small scale — this app currently
under-differentiates heading sizes. Recommend:
- Panel section labels: 11px, uppercase, 0.12em letter-spacing, 600 weight, faint color (already established pattern — keep it)
- Body / data rows: 14–15px, 400 weight
- Primary numbers/metrics (case metrics, counts): 28–32px, 600–700 weight
- Node/entity labels on graph: 12–13px, medium weight, high contrast against node fill

---

## 4. Information architecture — full screen list

Screens marked **[EXISTS]** are already built and functioning — the brief for
those is "refine and extend," not "invent." Screens marked **[NEW]** need to
be designed from scratch, driven by backend work already underway (auth,
cases, evidence, and — once built — graph analytics).

1. **[NEW] Login** — username/password, role shown after login. Minimal,
   trustworthy, no marketing fluff. This gates everything else.
2. **[NEW] Case list / dashboard** — the landing screen after login. Lists
   cases the logged-in user is assigned to (or all cases, if Supervisor/Admin).
   Each case card shows: case ID, title, status (open/closed/archived),
   entity/document counts, last activity, assigned investigators (avatars or
   initials). A prominent "New Case" action for Supervisors. This did not
   exist before — today the app assumes a single hardcoded case; this screen
   is what turns it into a real multi-case tool.
3. **[EXISTS, refine] Investigator Console** — the current three-panel
   working screen for one case:
   - Left panel: source/document intake + upload + "Run pipeline" + processing log + pipeline stepper in the header (ingest → normalize → extract → resolve → graph — refine to visually match the full pipeline named in the architecture doc)
   - Center: the force-directed graph canvas (D3), pan/zoom, orphan-node toggle, entity count
   - Right panel: tabbed — "Details" (selected node/edge inspector) and "Review Queue" (badge-counted pending entity-resolution conflicts, with merge/reject/skip actions per item)
   Refine this screen's visual hierarchy (see §5) — do not change its
   fundamental three-panel structure, it works.
4. **[NEW] Key Players / Analytics panel** — a new tab or slide-out alongside
   the existing right panel (do not replace Details/Review Queue — add a
   third tab: "Analysis"), showing: top nodes by centrality (degree /
   betweenness / PageRank) with the actual numeric indicator table shown in
   the SIH doc's Explainability section, detected communities highlighted on
   the graph itself (color-coded clusters, not new node shapes), and — most
   important — a click-through "evidence path" view: click a flagged node,
   see the literal chain (Person → Phone → Called → Person → Account →
   Transaction → Person) as a simple vertical or horizontal linked list of
   evidence cards, each traceable back to a source document. This is the
   single highest-value screen for the "why is this person relevant" promise
   — treat it as a first-class feature, not a tooltip.
5. **[NEW] Evidence & Chain of Custody** — per-case list of uploaded evidence
   files (separate concept from the ML "documents you fed the pipeline" —
   this is the formal evidence record: who uploaded what, when, its integrity
   hash once the blockchain-hashing pipeline is live, and access history).
   Table view: filename, upload date, uploader, hash (mono font, truncated
   with copy-on-click), verified/pending badge. Clicking a row opens detail:
   full hash, Merkle root reference once available, full access log.
6. **[NEW] Review Queue as a standalone page** (in addition to the existing
   right-panel tab) — for Supervisors/Analysts who want to triage review
   items across ALL cases in one list, not just the currently-open case. Same
   card pattern as the existing in-console review cards, just aggregated.
7. **[NEW] Admin — Users & Roles** — Supervisor/Admin only. Table of users:
   username, full name, role (editable dropdown, one of the seven defined
   roles), active/inactive toggle, last login. Simple, no-frills, admin-panel
   conventions apply here (this is the one screen allowed to look "boring" —
   density and speed matter more than polish for an internal admin tool).
8. **[EXISTS, refine] Ingestion Audit Trail** — currently only an API
   endpoint (`/api/ingestion-audit`, `/api/filtered-edges`) with no dedicated
   UI. Design a simple chronological log view: timestamp, file, status,
   entities extracted, and — importantly — a visible list of any edges the
   system silently filtered out (self-loops, phone conflicts) so nothing is
   ever hidden from an auditor. This is a trust feature, not a debug feature —
   design it accordingly (clean table, not a raw JSON dump, even though today
   it literally reads a JSON file).

---

## 5. Screen-by-screen detail specs

### Login
- Centered card, max-width ~380px, on the existing app background gradient
  treatment (the subtle teal/amber radial washes already used behind the
  topbar — reuse them here as the full-page background).
- VERITAS wordmark + the existing small amber "mark" square, centered above
  the form.
- Two fields (username, password), one primary button ("Sign in"), inline
  error state below the button (not a toast) for bad credentials.
- No "remember me," no social login, no marketing copy — this is a
  professional tool with issued credentials, not a signup funnel.
- Loading state on the button itself (spinner replaces label text, button
  stays same size — no layout shift).

### Case list / dashboard
- Topbar: same glass-blur header pattern as the console, VERITAS mark on the
  left, logged-in user's name + role pill + logout on the right.
- Below: a lightweight page header — "Cases" + a search/filter bar (by
  status, by assigned investigator) + "New Case" button (role-gated,
  Supervisor/Admin only — hide entirely for other roles, don't just disable
  it).
- Grid or list of case cards (recommend a compact list/table hybrid, not big
  glossy cards — this is a working tool, information density beats visual
  flourish here). Each row: case ID (mono font), title, status badge (use the
  three-color system: teal=open/active work happening, steel/gray=archived,
  amber=needs attention e.g. unresolved review items pending), entity count,
  last activity relative time, assigned investigator initials.
- Clicking a row navigates into the Investigator Console for that case.
- Empty state (no cases yet / none assigned to this user): a calm centered
  message with an icon, not a blank white page.

### Investigator Console (refine existing)
- Keep the exact 3-column grid (272px / flexible / 340px) and the pipeline
  stepper in the header — these work well and match the product's actual
  pipeline stages.
- **Improve:** the stepper should show all real pipeline stages from the
  architecture (ingest → normalize → extract → resolve → graph → analyze →
  explain), not a shortened version, even if "analyze" and "explain" show as
  greyed-out/pending until those backend pieces exist — this sets accurate
  expectations and gives a visible slot for the analytics work to land into
  later without a redesign.
- **Improve:** current risk-color system (none/orange/red on nodes) should
  map to the refined 3-state palette from §3 (teal=verified/clean,
  amber=attention/review, red=high-severity flag) consistently between node
  fill, the right-panel Details badge, and the Review Queue card border —
  today these are close but should be made pixel-consistent.
- **Improve:** add a persistent small "N pending review" indicator visible
  even when the Review tab isn't active (the badge already exists on the tab
  itself — also surface a subtler indicator near the graph canvas itself so
  it's noticeable without requiring a click into the tab).
- Graph canvas interaction (already implemented — preserve): drag to pan,
  scroll to zoom, click a node to inspect, orphan-node visibility toggle.
  Add: a small persistent legend (bottom-left corner of the canvas, low-
  contrast, non-intrusive) explaining node color = risk level, edge
  thickness/opacity = confidence — investigators should never have to guess
  what a color means.

### Key Players / Analysis tab (new)
- Lives as a third tab alongside Details / Review Queue in the existing right
  panel, OR as a slide-out drawer triggered from the graph toolbar if the
  panel gets too cramped with three tabs — pick whichever preserves the
  existing panel's usability, don't force a fourth narrow column.
- Top section: a short ranked list (top 5–10) of nodes by the selected
  centrality metric (tab/segmented-control to switch between Degree /
  Betweenness / PageRank), each row clickable to select that node on the
  graph canvas (canvas should pan/highlight to it).
- Middle section: detected communities — a simple color key ("Community 1 —
  14 members," "Community 2 — 9 members," "Bridge: [Person X] connects
  Communities 1 & 2") with the graph canvas itself tinting node halos by
  community color when this view is active (toggle-able, off by default so
  it doesn't fight with the risk-color system).
- Bottom section, the most important one: **Evidence Path viewer.** When a
  flagged/selected node is inspected, show the literal traceable chain as a
  vertical stack of compact cards: `[Person icon] Ravi` → `[Phone icon]
  9876543210` → `CALLED` → `[Person icon] Ahmed` → `[Account icon] Account Y`
  → `TRANSFERRED ₹2.4L` → `[Person icon] Person B`. Each card shows a small
  source-document reference chip (e.g. "FIR-104") that opens the actual
  source document/snippet on click. This directly implements the SIH
  document's explainability example — build it exactly to that spec, it's a
  named differentiator in the pitch.
- Also show, above the evidence path, the flat indicator table style from the
  SIH doc: Betweenness Centrality, Connections, Communities connected,
  Transaction anomaly %, Communication spike %, Evidence sources count — as a
  simple two-column key/value table, not a chart (charts are for trends,
  this is a snapshot of "why this node matters" and a table reads faster).

### Evidence & Chain of Custody
- Standard data table, sortable columns: filename, uploaded by, uploaded at,
  hash status (badge: "Verified" teal / "Hash pending" amber / — never show a
  broken/error state as anything but the red status color), size.
- Upload action: drag-and-drop zone OR button, matching the existing
  file-intake pattern already on the Investigator Console's left panel
  (reuse that exact visual component, don't invent a second file-upload
  style).
- Row detail (side panel or modal, match the existing modal pattern already
  in the app): full SHA-256 hash (monospace, copy button), Merkle root
  reference once available, full access history as a simple timestamped list
  ("Viewed by Inspector Rao, 2026-09-04 14:02").

### Admin — Users & Roles
- Plain, dense table. Columns: username, full name, role (inline editable
  dropdown for Admin), status toggle, last login. No card-based redesign
  needed here — admin tables should look like admin tables.
- Role dropdown options match exactly: Investigator, Analyst, Supervisor,
  Forensic Officer, Prosecutor, System Admin, Auditor.
- Changing a role or deactivating a user should require a confirm step
  (small inline confirm, not a full modal, for a single-field change) — see
  Design Principle 5.

### Ingestion Audit Trail
- Reverse-chronological table: timestamp, filename, source label, status
  (success/error badge), entities extracted count, new nodes count.
- A visibly separate, clearly-labeled sub-section or secondary tab: "Filtered
  edges" — same table pattern, columns: timestamp, reason (self_loop /
  phone_conflict / etc., shown as a small readable tag not a raw code
  string), source document, the actual edge that was dropped. This exists
  specifically so nothing the system does is invisible to an auditor — treat
  visibility as the entire point of this screen.

---

## 6. Component library — reusable pieces to define once, use everywhere

- **Status/risk badge** — three-state pill (teal / amber / red) with label
  text, used identically across case status, evidence hash status, review
  queue urgency, and node risk indicators. One component, one visual
  language, many contexts.
- **Confidence indicator** — used anywhere a match/score appears (entity
  resolution confidence, anomaly confidence). Recommend a small horizontal
  bar or a numeric percentage + the 3-state color, always paired with a
  "why" affordance (tooltip minimum, click-through to detail ideally) — never
  bare.
- **Entity chip** — small inline element for referencing a person/phone/
  location/vehicle/account anywhere in text or lists (used in evidence paths,
  review cards, case summaries): icon by entity type + label, consistent
  regardless of where it appears.
- **Review card** — already exists for entity-conflict review items (has
  "conflict" and "ambiguity" variants) — keep this pattern, extend it to the
  standalone aggregated Review Queue page (§4.6) unchanged.
- **Data table** — one consistent table style (row hover, sortable header
  affordance, monospace for IDs/hashes/counts, sans-serif for names/labels)
  used across Case list, Evidence, Admin, and Audit Trail. Do not let each
  screen invent its own table style.
- **Modal** — the app already has a modal-layer pattern; reuse it for
  confirmations (merge/reject/deactivate-user) and detail drill-downs
  (evidence row detail) rather than introducing a second overlay pattern
  (e.g. a slide-out drawer) unless a screen genuinely needs persistent
  side-by-side context (Key Players is the one exception noted above, if the
  three-tab approach proves too cramped).
- **Empty & loading states** — every list/table screen needs both, designed
  intentionally (not a spinner-only or blank-page default): loading = subtle
  skeleton rows matching the real row height; empty = short message + icon,
  never just whitespace.

---

## 7. Motion & interaction principles

- Motion should communicate state change, not decorate. The existing pulsing
  dot for "active" pipeline steps is a good example — keep that pattern,
  extend it (same pulse language) to any other "in progress" indicator.
- Respect `prefers-reduced-motion` everywhere motion is added (the codebase
  already does this for the stepper — carry the same discipline into every
  new animated element).
- Panel/tab switches: fast, no more than ~150–200ms, no bouncy easing — this
  is a tool used all day, not a marketing site; snappy beats delightful.
- Graph canvas transitions (pan/zoom/node-select) should stay exactly as
  responsive as today — do not add transition delays to core graph
  interaction for the sake of polish.

---

## 8. Accessibility & responsiveness

- Desktop-first, minimum supported width ~1280px — this is a workstation
  tool used by trained staff at a desk, not a mobile-first product. Do not
  spend design effort on a phone layout; a graceful "best viewed on desktop"
  message for narrow viewports is acceptable.
- Maintain the existing high-contrast text tokens (`--text: #030712` on light
  surfaces) — do not lighten body text for aesthetic reasons; this is already
  tuned for long reading sessions.
- Every color-coded status (risk badges, confidence) must also carry a text
  label or icon, never color alone — colorblind investigators must be able to
  triage correctly.
- All interactive elements need visible keyboard focus states (currently
  under-specified in the live app — add this as a genuine improvement, not
  an afterthought).

---

## 9. Voice & content guidelines

- Labels are precise and technical, not friendly/casual. "Review Queue," not
  "Things to check." "REVIEW_REQUIRED," not "Uh oh!"
- Never use humor, emoji, or exclamation points anywhere in the product —
  this handles real criminal investigation data.
- Error messages state what happened and what to do, plainly: "Upload
  failed — file exceeds 50MB limit," not "Oops, something went wrong."
- Numbers and IDs are always monospace; names, labels, and body copy are
  always the sans-serif system font — never mix these for the same content
  type across screens.

---

## 10. Explicit constraints — do not do these things

- Do not propose a dark theme, even as an alternative/toggle, unless
  explicitly asked later — this was a deliberate, already-made decision.
- Do not rebrand away from "VERITAS" / the amber-mark + uppercase-tracked
  wordmark identity.
- Do not redesign the graph canvas interaction model (pan/zoom/click) — only
  add the legend and community-highlight toggle described above.
- Do not add gamification, streaks, notifications-as-engagement-loops, or any
  consumer-app growth pattern — this tool has zero engagement-optimization
  goals; a screen investigators use for 3 focused minutes and then don't need
  is a success.
- Do not scatter the same status meaning across different colors in different
  screens — the three-color risk system (teal/amber/red) is the only status
  vocabulary in the entire product.
- Do not design any screen or flow for roles/features not listed in §4 —
  no blockchain "coin"/crypto visual clichés for the evidence-hash feature;
  it should look like a plain integrity/verification record, not a crypto
  product.

---

## 11. What to actually generate

Produce, in this order:
1. A design-tokens/style guide frame (colors, type scale, spacing, the three
   core components: status badge, entity chip, confidence indicator).
2. Login screen.
3. Case list / dashboard screen (populated with realistic sample case data —
   3–5 cases, varied statuses).
4. Investigator Console — refined version of the existing three-panel layout,
   with the extended pipeline stepper and the new "Analysis" tab included in
   the right panel (populate with realistic sample graph + a populated
   Evidence Path example using the Ravi/Ahmed/Account example from §5).
5. Evidence & Chain of Custody screen.
6. Admin — Users & Roles screen.
7. Ingestion Audit Trail screen.

For each, deliver both a populated/realistic state and an empty state. Match
every color, spacing, and type value in §3 exactly — this brief intentionally
gives concrete hex values and pixel sizes specifically so there is no
ambiguity for the generation step to fill in incorrectly.
