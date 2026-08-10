# Screen reader findings

Accessibility defects found by the real-VoiceOver suite in
[`e2e/screen-reader/`](./) that **every axe scan passes**.

This file, not the test suite, is the durable output of this work. If screen
reader automation is not adopted, the tests get deleted and these remain real
bugs worth fixing.

## How to read this

Each finding has a stable ID (`SR-001`…) referenced from the `FIXME(a11y)`
comment on the test that guards it, so the code and this document stay tied
without duplicating detail.

Every finding was confirmed the same way: the test asserts the **correct**
behaviour, was temporarily un-`fixme`-d, run against the real screen reader, and
observed to fail for the stated reason. Nothing here is inferred from markup
alone.

**"Why axe missed it" is the important column.** These are not axe bugs. They
are the boundary of what static analysis can see: axe inspects the DOM and its
ARIA attributes, so it can check that a control _has_ an accessible name, but
not whether that name is _useful_, not whether two controls share one, and not
whether anything is announced when state changes. Those only surface when
something actually drives a screen reader.

## Summary

| ID                | Surface            | Defect                                                        | WCAG         | Reach                |
| ----------------- | ------------------ | ------------------------------------------------------------- | ------------ | -------------------- |
| [SR-001](#sr-001) | Search suggestions | Dropdown announces nothing at all                             | 4.1.2, 1.3.1 | 8 files / 4 routes   |
| [SR-002](#sr-002) | Table sorting      | Activating a sort control announces nothing                   | 4.1.2, 1.4.1 | 16 files / 4 routes  |
| [SR-003](#sr-003) | Table sorting      | 8 sort controls share 2 generic labels                        | 2.4.6, 4.1.2 | 16 files / 4 routes  |
| [SR-004](#sr-004) | Table cells        | Every cell announcement padded with a control label           | 1.3.1        | 16 files / 4 routes  |
| [SR-005](#sr-005) | Table headers      | First column header announces as empty                        | 1.3.1        | 16 files / 4 routes  |
| [SR-006](#sr-006) | News carousel      | Heading outline jumps `h3` → `h2`                             | 1.3.1        | 2 files / 2 routes   |
| [SR-007](#sr-007) | Page shell         | No banner landmark — the nav sits inside `main`               | 1.3.1        | 31 files / 21 routes |
| [SR-008](#sr-008) | Page shell         | No contentinfo landmark — the footer sits inside `main`       | 1.3.1        | 31 files / 21 routes |
| [SR-009](#sr-009) | Page shell         | No skip link; 16 announcements before the page title          | 2.4.1        | 31 files / 21 routes |
| [SR-010](#sr-010) | Navigation         | The active nav item never announces "current page"            | 4.1.2, 1.4.1 | 31 files / 21 routes |
| [SR-011](#sr-011) | Table search       | Searching announces nothing — no live region on the route     | 4.1.3        | 6 files / 5 routes   |
| [SR-012](#sr-012) | Table search       | A search matching nothing empties the table in silence        | 4.1.3        | 6 files / 5 routes   |
| [SR-013](#sr-013) | Table filters      | Applying a filter announces nothing at all                    | 4.1.3        | 3 files / 3 routes   |
| [SR-014](#sr-014) | Table filters      | Every filter chip's remove button is named just "close"       | 2.4.6, 4.1.2 | 1 file / 1 route     |
| [SR-015](#sr-015) | News carousel      | The carousel never identifies itself as one                   | 1.3.1        | 2 files / 2 routes   |
| [SR-016](#sr-016) | News carousel      | Every slide is announced, including the ones off screen       | 1.3.2, 2.4.3 | 2 files / 2 routes   |
| [SR-017](#sr-017) | News carousel      | Changing slide announces nothing                              | 4.1.3        | 2 files / 2 routes   |
| [SR-018](#sr-018) | News carousel      | Six card links share the name "(view full release)"           | 2.4.4        | 2 files / 2 routes   |
| [SR-019](#sr-019) | Table loading      | Nothing says the table is loading; no `aria-busy` in the repo | 4.1.3        | 1 file / 1 route     |
| [SR-020](#sr-020) | Table loading      | 30 skeleton cells announce "-" as the cell's value            | 1.3.1        | 1 file / 1 route     |
| [SR-021](#sr-021) | Table loading      | Data replacing the skeleton rows announces nothing            | 4.1.3        | 1 file / 1 route     |

**Reach** counts files importing the affected shared component. None of these is
page-specific markup — each is one fix that lands everywhere the component is
used.

| Component                             | Consumer files | Routes                                           |
| ------------------------------------- | -------------- | ------------------------------------------------ |
| `src/components/page-container/`      | 31             | **every route** — it renders the nav and footer  |
| `src/components/table/`               | 16             | home, search, saved, resource detail             |
| `src/components/input-with-dropdown/` | 8              | home, search, ontology-browser, knowledge-center |
| `src/components/search-input/`        | 6              | home, search, saved, repository-matcher          |
| `src/components/checkbox-list/`       | 3              | home, search                                     |
| `src/components/carousel/`            | 2              | home, search                                     |

SR-007 through SR-010 have the widest reach in this document: `PageContainer`
wraps all 21 routes, and SR-007, SR-008 and SR-009 share a single root cause —
one `<main>` element that opens above the navigation and closes below the
footer.

SR-011, SR-012, SR-013, SR-017, SR-019 and SR-021 also share one root cause, and
largely one fix: **there is no live region anywhere in the application.**
`grep -o 'aria-live'` across the built page returns zero matches, and
`role="status"` appears exactly once in `src/`
([chart-wrapper.tsx:35](../../src/views/diseases/disease/layouts/chart-wrapper.tsx#L35),
on a loading skeleton — so the fix has an in-repo precedent). **`aria-busy` does
not appear in `src/` at all.** All six are WCAG **4.1.3 Status Messages**, a
Level AA criterion that is invisible to static analysis by construction — see
SR-011.

That makes 4.1.3 the single largest cluster in this document: six of twenty-one
findings, one missing primitive.

Three findings — SR-003, SR-014 and SR-018 — are the same defect in three
components: several controls sharing one generic accessible name. axe's
`button-name` and `link-name` rules are satisfied by any name at all, so
duplicate and uninformative names are never violations.

## What the suite also _disproved_

Worth recording, because a testing method that only ever confirms suspicions
isn't measuring anything.

The resources table is virtualised with `react-window` and declares
`aria-rowcount={rows.length}` — the full count — while keeping only a window of
rows in the DOM, with **no `aria-rowindex` on any row**. That is the textbook
recipe for broken row position, and it was the prediction that motivated writing
`table.spec.ts` at all.

It is wrong. VoiceOver announces `row 2 of 42`, `row 3 of 42` … correctly, and
all 40 rows stay reachable and in order across recycling. Both facts are now
guarded by passing tests. Reading the markup produced a confident, plausible,
incorrect hypothesis; only running a screen reader settled it.

### The carousel does not hijack VoiceOver's navigation keys

The second overturned prediction, and a sharper one.

[`Track.tsx:79-100`](../../src/components/carousel/components/Track.tsx#L79)
registers a `keydown` handler on **`document`** that calls `preventDefault()` on
ArrowLeft/Right/Up/Down whenever `trackIsActive` — **with no modifier check of
any kind**. `trackIsActive` is set by focusing any card or control and is
essentially never cleared (only by Tab-ing out of the very last item, or a
mousedown outside the track).

VoiceOver navigates with **Ctrl+Option+Arrow**, which reaches the DOM as a
keydown with `key === 'ArrowRight'`. So on paper, once a user has so much as
focused a card, reading anywhere on the page should scroll the carousel and
suppress arrow-key page scrolling site-wide. That is a serious bug, and the code
plainly describes it.

It does not happen. The test proves the handler is live and modifier-blind first
— a plain ArrowRight with a card focused moves the slide from
`carousel indicator 1 of 3 (current)` to `2 of 3 (current)` — and then shows
that VoiceOver's own navigation leaves the carousel untouched. VoiceOver
consumes the keystroke before the page sees it.

The bug is real for anyone pressing unmodified arrow keys; it is **not** the
screen-reader catastrophe the code implies. Guarded by a passing test in
`carousel.spec.ts` → _moving the VoiceOver cursor does not scroll the carousel_,
with the arming oracle built in, so if a future browser or VoiceOver version
stops swallowing the key the suite will say so.

**Why this one matters for judging the method.** It is the clearest case in this
document of code review producing a confident, specific, wrong answer. Anyone —
human or AI — reading `Track.tsx` would file this as a defect. Only running a
real screen reader distinguishes "the handler is wrong" from "the handler is
wrong and it reaches users".

---

<a id="sr-001"></a>

## SR-001 — The search suggestion dropdown announces nothing

**Severity: high.** The primary entry point to the entire portal.

|                        |                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Sighted user**       | Types "asthma", sees a suggestion list appear, arrows down through highlighted options                                          |
| **Screen reader user** | Hears `You are currently in a text area. To enter text in this area, type.` — and nothing else. Pressing Down announces nothing |

Not that a list opened. Not how many results. Not which option is current. Not
that anything is selectable.

**Where** —
[`src/components/input-with-dropdown/components/DropdownInput.tsx`](../../src/components/input-with-dropdown/components/DropdownInput.tsx)

The component renders a `<Textarea>` with **no combobox semantics at all**: no
`role="combobox"`, `aria-expanded`, `aria-autocomplete`, `aria-controls`, or
`aria-activedescendant`. Suggestions are bare `<li id="li-N">` with no
`role="option"` or `aria-selected`. There is no live region anywhere on the
route.

The state machine already exists — `DropdownListItem` tracks
`isSelected = cursor === index` — it is simply never exposed to assistive tech.

**Why axe missed it** — every element present is individually valid. axe has no
rule requiring that a text input with a popup _be_ a combobox; it cannot know
the `<li>`s are meant to be options, and it does not evaluate what happens on
keypress.

**Fix** — give the input combobox semantics and the list `role="listbox"` /
`role="option"`, wiring `aria-activedescendant` to the existing `cursor`.

**Guarded by** — `home.spec.ts` → _arrowing through search suggestions announces
each option_

**Note on sequencing** — 8 consumer files across four routes, so this needs a
full axe re-run. Deliberately deferred until after the adoption decision.

---

<a id="sr-002"></a>

## SR-002 — Sorting a table column announces nothing

**Severity: high.** Sorting silently reorders everything below it.

|                        |                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Sighted user**       | Clicks the caret; it changes colour; rows reorder                                                           |
| **Screen reader user** | Total silence. Re-reading the control still says `sort table column ascending button` — identical to before |

The user has no way to learn the table re-sorted, in which direction, or which
column is currently the sort key.

**Where** —
[`src/components/table/components/sort-toggle.tsx`](../../src/components/table/components/sort-toggle.tsx)

Active state is conveyed **purely by colour** (line 27:
`color={isSelected && sortBy === 'ASC' ? 'inherit' : 'gray.200'}`). There is no
`aria-pressed` on the buttons and no `aria-sort` on the `role="columnheader"`
anywhere in `src/components/table/`.

**WCAG** — 4.1.2 (Name, Role, Value); also **1.4.1 (Use of Color)**, since
colour is the only channel carrying sort state — which affects low-vision and
colour-blind sighted users too, not only screen reader users.

**Why axe missed it** — `aria-sort` is optional in ARIA, so its absence is not a
violation. axe also never activates controls, so it cannot observe that nothing
is announced in response.

**Fix** — set `aria-sort="ascending" | "descending" | "none"` on the
columnheader, and add a non-colour visual indicator.

**Guarded by** — `table.spec.ts` → _activating a sort control announces the new
sort state_

### How this one was proven, and a near-miss worth recording

The first version of this finding was **unsound**, and the process caught it.

It rested on an empty spoken log after activating a sort control — but that
control was the first _ascending_ one, belonging to TYPE, on data already
ordered with the 40 repositories ahead of the single catalog. That sort is a
no-op. "Nothing was announced" was therefore indistinguishable from "nothing
happened", and the finding could have been an artefact of the harness failing to
click.

Re-proven with a sort that must reorder if it fires — TYPE **descending**, which
has to lift the lone catalog to the top:

```
first row before act(): Fixture Repository 001
first row after  act(): Fixture Resource Catalog     ← the sort demonstrably fired
spoken after act():     [""]                          ← and nothing was said
```

The test now carries that oracle: it asserts the first row changed _before_
asserting the silence, so it can never again pass off an inert click as a
finding. Playwright is used there purely to observe app state — it never moves
the VoiceOver cursor.

Generalisable lesson for any absence-of-announcement claim: **prove the state
change happened before concluding it went unannounced.** A silent screen reader
and a control that did not fire look identical from the transcript alone.

---

<a id="sr-003"></a>

## SR-003 — Sort controls never name the column they sort

|                        |                                                                                |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Sighted user**       | Sees carets sitting directly under the "TYPE" heading — context is obvious     |
| **Screen reader user** | Hears `sort table column ascending button`, with no indication of which column |

The home table has 4 sortable columns × 2 controls = **8 buttons sharing 2
accessible names**. Navigating by control — a normal way to use a screen reader
— makes them indistinguishable.

**Where** —
[`sort-toggle.tsx:22`](../../src/components/table/components/sort-toggle.tsx#L22)
and [`:32`](../../src/components/table/components/sort-toggle.tsx#L32) — the
`aria-label`s are static strings.

**Why axe missed it** — the `button-name` rule is satisfied: every button _has_
an accessible name. Duplicate names are not a violation.

**Fix** — interpolate the column: `aria-label={`sort ${columnLabel}
ascending`}`.

**Guarded by** — `table.spec.ts` → _sort controls name the column they sort_

---

<a id="sr-004"></a>

## SR-004 — Every table cell announcement is padded with a control label

**Severity: high for usability**, even though each individual announcement is
technically correct.

Observed on every cell:

```
row 2 of 42 NAME and sort table column ascending link Fixture Repository 001 column 1 of 5
TYPE and sort table column ascending Dataset Repository column 3 of 5
RESEARCH DOMAIN and sort table column ascending IID column 4 of 5
ACCESS and sort table column ascending Open Access column 5 of 5
```

`and sort table column ascending` is repeated in **four of every five cells**.
On a 41-row table that is ~164 repetitions of a phrase carrying no information
about the cell.

Compare the one unpolluted column, whose header has no sort control:

```
DESCRIPTION A deterministic repository fixture for a11y scanning. column 2 of 5
```

**Where** —
[`src/components/table/components/cell.tsx:148`](../../src/components/table/components/cell.tsx#L148)
renders `TableSortToggle` _inside_ the `role="columnheader"`. A screen reader
repeats the column header's accessible name as context for each cell, and that
name is computed from the header's contents — including the nested buttons'
`aria-label`s.

**Why axe missed it** — the header has an accessible name and the association is
correct. axe measures presence, not verbosity. This defect only exists as an
experience: reading a transcript understates it, and hearing it is the only way
to appreciate the cost.

**Fix** — give the columnheader an explicit `aria-label` of just the column
name, so its accessible name stops being derived from its children.

**Guarded by** — `table.spec.ts` → _cell announcements are not padded with
control labels_

---

<a id="sr-005"></a>

## SR-005 — The first column header announces as empty

|                        |                                                                      |
| ---------------------- | -------------------------------------------------------------------- |
| **Sighted user**       | Sees a "NAME" column heading                                         |
| **Screen reader user** | Lands on it and hears nothing — empty item text, empty spoken phrase |

Every other header announces normally (`DESCRIPTION DESCRIPTION column 2 of 5`).
Cells in column 1 still pick up `NAME` as their context, so the association
exists — but a user reading the header row itself is told nothing about the
first column.

**Why axe missed it** — the accessible name exists in the tree (cells inherit
it); it is the header cell's own announcement that comes back empty. That is a
computed-name subtlety static analysis does not surface.

**Guarded by** — `table.spec.ts` → _the first column header announces its label_

**Status** — cause not yet isolated; needs a focused look at how the first
`columnheader` is composed relative to the others.

---

<a id="sr-006"></a>

## SR-006 — Carousel card headings break the outline

Heading-jump navigation is how most screen reader users skim a page, so the
outline is a primary navigation structure, not decoration.

Observed heading walk:

```
7. Explore All Included Resources   heading level 2
8. Updates                          heading level 3
9. Mock News Report                 heading level 2   ← should be level 4
```

The cards read as siblings of "Explore All Included Resources" rather than as
children of "Updates", so skimming by heading suggests the page has a new
top-level section where it has a list of cards.

**Where** —
[`src/views/home/components/NewsCarousel.tsx:180`](../../src/views/home/components/NewsCarousel.tsx#L180)
— `<Heading size='h5'>` sets only the _visual_ size; Chakra's `Heading` defaults
to `as='h2'`.

**Why axe missed it** — axe _does_ have a `heading-order` rule and flags this,
but classifies it **moderate**. This project's suite fails only on
`serious`/`critical`, so it is reported and passed over. Included here as an
honest boundary case: axe saw it, the severity threshold filtered it, and the
screen reader made the consequence concrete.

**Fix** — add `as='h4'`. One line.

**Guarded by** — `home.spec.ts` → _carousel card headings sit below the section
heading that introduces them_

---

<a id="sr-007"></a>

## SR-007 — There is no banner landmark; the navigation is inside `main`

**Severity: medium.** Landmark navigation is one of the three ways screen reader
users skim an unfamiliar page, alongside headings and links.

|                        |                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **Sighted user**       | Sees a header bar, visually distinct from the page body, and ignores it after the first page       |
| **Screen reader user** | Asks for the page's landmarks and is told the header is simply the first thing inside main content |

Observed at the top of web content — the first landmark entered is the
navigation itself, with no header region around it:

```
1. Main navigation navigation
2. NDE Desktop Logo link
3. Home link
4. Search dialog pop up collapsed button
```

**Where** —
[`src/components/page-container/components/container.tsx:76`](../../src/components/page-container/components/container.tsx#L76)
opens `<Flex as='main'>` and renders `<Navigation />` inside it at
[line 82](../../src/components/page-container/components/container.tsx#L82).
`grep` for `<header` or `role='banner'` across `src/` returns nothing — there is
no banner on any route.

**Why axe missed it** — `landmark-banner-is-top-level` and
`landmark-no-duplicate-banner` inspect banner landmarks that **exist**, so a
page with no banner at all makes them _inapplicable_ rather than failing. No axe
rule requires a page to have one, and `region` passes because every element is
inside `<main>`.

**Fix** — move `<Navigation />` out of `<main>` and wrap it in a `<header>`. One
element, and it resolves SR-008 at the same time.

**Guarded by** — `page-shell.spec.ts` → _the navigation sits in a banner
landmark, outside the main content_

**Caveat recorded in the spec** — `navigateToWebContent()` parks the VoiceOver
cursor inside `<main>`, so no "main" boundary is announced at the _start_ of a
walk, only "end of main" at the finish. If a `<header>` is added above `<main>`
and this test still fails, check whether the entry point is landing inside the
banner and skipping its boundary announcement the same way, before concluding
the fix was wrong.

---

<a id="sr-008"></a>

## SR-008 — There is no content information landmark; the footer is inside `main`

|                        |                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **Sighted user**       | Scrolls to the bottom and finds policies, contact links and government links             |
| **Screen reader user** | Has no footer landmark to jump to, and must walk the entire page to reach the same links |

`<footer>` maps to `contentinfo` **only when it is not a descendant of `main`**.
Here it is, so it maps to a plain generic container. Walking out of the footer,
the last link is followed directly by the end of `main`:

```
11. Changelog link
12. Data harvested: 00-00-0000 link
13. main                              (spoken: "end of main")
14. Notifications-top empty region
```

No content information boundary is announced anywhere on the page. Note what
comes _after_ `main`: only two empty toast containers. The footer is the last
thing inside the main content region.

**Where** —
[`src/components/page-container/components/container.tsx:133`](../../src/components/page-container/components/container.tsx#L133)
renders `<Footer />` inside the `<main>` opened at
[line 76](../../src/components/page-container/components/container.tsx#L76).

**Why axe missed it** — same shape as SR-007.
`landmark-contentinfo-is-top-level` inspects contentinfo landmarks that exist,
and there isn't one, so the rule is inapplicable. **The absence of a landmark
cannot violate a rule that only examines landmarks which are present.** That is
a structural blind spot in static analysis, not an oversight in axe's rule set.

**Fix** — close `<main>` before `<Footer />`. The same one-element change as
SR-007.

**Guarded by** — `page-shell.spec.ts` → _the footer is announced as a content
information landmark_

---

<a id="sr-009"></a>

## SR-009 — No skip link, and axe's own bypass rule certifies one that doesn't exist

**Severity: high.** WCAG 2.4.1 (Bypass Blocks) is a **Level A** criterion, and
this affects every route on every visit.

|                        |                                                                           |
| ---------------------- | ------------------------------------------------------------------------- |
| **Sighted user**       | Glances past the header to the page title in well under a second          |
| **Screen reader user** | Sits through **16 announcements** before being told what page they are on |

The full transcript, captured by the test as `chrome-before-h1`:

```
 1. Main navigation navigation
 2. NDE Desktop Logo link
 3. Home link
 4. Search dialog pop up collapsed button
 5. About dialog pop up collapsed button
 6. Resources dialog pop up collapsed button
 7. Log In button
 8. Main navigation navigation
 9. image
10. This is the alpha version of the NIAID Data Ecosystem Discovery Portal.
11. Read Less button
12. Currently using the:
13. Staging API link
14. A complex network of interconnected lines and nodes, resembling a molecular
    or neural network structure. The image features various shades of blue and
    white, with nodes of different sizes connected by thin lines, creating a
    web-like pattern. image
15. An abstract graphic featuring three hexagons. The top-right hexagon shows a
    person typing on a keyboard with a microscope in the background, symbolizing
    a blend of technology and science. image
16. Discovery Portal heading level 1
```

Items 9–13 are the non-production environment banner, so a production visitor
hears 11 rather than 16 — still with no way to skip any of them. Items 14 and 15
are decorative artwork carrying ~60 words of alt text; that is a separate
defect, observed here but not yet filed.

**Where** — there is no skip link anywhere in the app. The only trace of one is
a dead `SkipLink` key in
[`src/theme/theme.types.ts:665`](../../src/theme/theme.types.ts#L665),
referenced by nothing.

**Why axe missed it — the sharpest example in this document.** axe _does_ have a
rule for 2.4.1: `bypass`, tagged `wcag2a`, impact **serious**. It passes when
the page has a skip link **or** a heading **or** a main landmark. This page has
a `<main>` — the one that starts above the navigation (SR-007) — so the rule is
satisfied and reports a pass. A static check confirmed conformance with the
letter of a criterion that the page fails completely in practice.

**Fix** — a visually-hidden-until-focused "Skip to main content" link as the
first focusable element, pointing at a container **below** the nav. It needs
SR-007's fix first, to have somewhere meaningful to point.

**Guarded by** — `page-shell.spec.ts` → _a skip link lets a screen reader user
bypass the navigation_

---

<a id="sr-010"></a>

## SR-010 — The active navigation item never announces that it is the current page

|                        |                                                                  |
| ---------------------- | ---------------------------------------------------------------- |
| **Sighted user**       | Sees a white underline under "Home" and knows where they are     |
| **Screen reader user** | Hears `Home link` — identical to every other item in the nav bar |

Observed on `/`, where "Home" _is_ the current page:

```
1. NDE Desktop Logo link
2. Home link
```

**Where** — `aria-current` appears **nowhere in `src/`**. The active state is a
white underline `<Box>` in
[`nav-desktop-top-level-link.tsx:28`](../../src/components/navigation-bar/components/nav-desktop-top-level-link.tsx#L28).
The component already computes the active state in order to render that
underline; it simply never exposes it.

**WCAG** — 4.1.2 (Name, Role, Value); also **1.4.1 (Use of Color)**, since
colour and shape are the only channel, which affects low-vision and colour-blind
sighted users too.

**Why axe missed it** — `aria-current` is optional in ARIA, so its absence is
never a violation, and axe has no way to associate a nav item with the current
URL.

**Fix** — `aria-current='page'` on the active link, alongside the existing
underline. The breadcrumb trail has the same gap
([`breadcrumbs.tsx:89`](../../src/components/page-container/components/breadcrumbs.tsx#L89)
renders the current page as a live link) on routes other than this one, which
renders no breadcrumbs.

**Guarded by** — `page-shell.spec.ts` → _the active navigation link announces
that it is the current page_

---

<a id="sr-011"></a>

## SR-011 — Searching the table announces nothing about the outcome

**Severity: high.** The search box is the primary way to use a table of every
repository in the ecosystem.

|                        |                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Sighted user**       | Types, watches rows disappear, reads "1 results" update beside the box              |
| **Screen reader user** | Hears the seven characters they typed. Nothing else. The table has silently changed |

Observed — the oracle confirms the row set really changed, and the **entire**
spoken log for the interaction is the character echo:

```
count: 2 results -> 1 results
--- spoken ---
C  a  t  a  l  o  g
```

**Where** —
[`TableWithSearch/index.tsx:124`](../../src/views/home/components/TableWithSearch/index.tsx#L124)

```tsx
<Text fontSize='sm' fontWeight='semibold' lineHeight='normal'>
  {filteredData.length} results
</Text>
```

A plain `<p>`. No `role="status"`, no `aria-live`, no `aria-atomic`, and no
association with either the input or the table. There is **no live region
anywhere on the route** — `grep -o 'aria-live' out/index.html` returns zero
matches, and `role="status"` appears nowhere in `src/`.

**WCAG** — **4.1.3 Status Messages (Level AA)**. A change of content that
conveys the result of an action must be programmatically determinable through
role or properties, so it can be announced without moving focus.

**Why axe missed it — a categorical blind spot, not a gap.** axe has no rule for
4.1.3 and cannot have one. Detecting a _missing_ status message requires knowing
that a number on the page was **supposed** to update in response to a user
action. That is a claim about intent and causality, which static inspection of a
DOM snapshot cannot make. The only way to find it is to perform the action and
listen — which is the entire argument for this suite in one finding.

**Fix** — `role="status"` on the results count. One attribute, and it resolves
SR-012 and SR-013 at the same time.

**Guarded by** — `table-search.spec.ts` → _typing in the table search announces
how many results remain_

---

<a id="sr-012"></a>

## SR-012 — A search that matches nothing empties the table in silence

The worst case of SR-011, and worth its own entry because the consequence is
different in kind: not "the user misses an update" but "the user is left with
nothing and is not told why".

|                        |                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Sighted user**       | Sees "0 results" and a panel reading _No items match — try clearing some filters_ |
| **Screen reader user** | Hears the characters typed. The table is now empty and they have not been told    |

Observed:

```
count: 0 results
--- spoken ---
z    z
```

(VoiceOver echoed only two of the four characters; the point stands either way.)

**Where** — the recovery advice is passed as `emptyState` from
[`src/pages/index.tsx:299`](../../src/pages/index.tsx#L299) and rendered by the
Table **inside a table cell**
([`table/index.tsx:653`](../../src/components/table/index.tsx#L653)). So the one
piece of guidance the app offers a stuck user sits in a cell they have no reason
to navigate to, having received no signal that anything changed.

Note also that the two empty states disagree: this one says `No items match`,
while a table with no source data at all says `No results found.`
([`TableWithSearch/index.tsx:94`](../../src/views/home/components/TableWithSearch/index.tsx#L94)).

**WCAG** — 4.1.3 Status Messages (AA).

**Why axe missed it** — as SR-011. The empty state is valid, well-formed markup;
it is the silence around its arrival that is the defect.

**Fix** — the same `role="status"` as SR-011.

**Guarded by** — `table-search.spec.ts` → _a search that matches nothing
announces the empty state_

---

<a id="sr-013"></a>

## SR-013 — Applying a filter announces nothing at all

**The starkest transcript in this document.** Ticking a Research Domain checkbox
halved the table, and VoiceOver said **nothing whatsoever** — not a word, not a
checkbox state change, not a count:

```
count: 2 results -> 1 results
--- spoken ---
                       ← the log is empty
```

Filters apply instantly: `handleFilterChange` calls `setFilters` on every
checkbox change
([`filters/index.tsx:53`](../../src/views/home/components/TableWithSearch/filters/index.tsx#L53))
and there is no Apply button. So the table reorders under the user with no event
of any kind reaching them.

**Where** — same missing live region as SR-011.

**Why axe missed it** — as SR-011; and note the axe suite has a test
specifically covering this popover, _filter popover is keyboard operable and
restores focus_, which passes. It proves the control can be reached, opened and
dismissed by keyboard with correct focus return. It cannot prove the user learns
what the control **did**.

**Fix** — the same `role="status"` as SR-011.

**Guarded by** — `table-search.spec.ts` → _applying a filter announces how many
results remain_

**Method note** — the checkbox is ticked with Playwright, not VoiceOver, because
the VO cursor cannot enter the popover (see the Coverage caveat). This does not
weaken the claim: a live region announces regardless of what triggered the
change, and the oracle proves the change occurred. It does mean the popover's
own contents are **not** proven reachable by this test.

---

<a id="sr-014"></a>

## SR-014 — Filter chips never say which filter they remove

|                        |                                                                            |
| ---------------------- | -------------------------------------------------------------------------- |
| **Sighted user**       | Sees an "IID ✕" chip and a "Clear all ✕" chip, and knows which ✕ does what |
| **Screen reader user** | Hears `close button, group` for both, with nothing to tell them apart      |

Observed walking the toolbar with one filter applied:

```
12. 1 results
13. Showing results filtered by:
14. Clear all
15. close button, group
16. IID
17. close button, group
```

With N filters applied there are N+1 buttons all named `close`. One of them
discards every filter at once; the rest discard one each. Navigating by control
— a normal way to use a screen reader — they are indistinguishable.

**Where** —
[`TableWithSearch/index.tsx:149`](../../src/views/home/components/TableWithSearch/index.tsx#L149)
and [`:163`](../../src/views/home/components/TableWithSearch/index.tsx#L163) use
Chakra's `<TagCloseButton />` with no label, and Chakra's default is the bare
word `close`.

**Why axe missed it** — the `button-name` rule is satisfied: every button _has_
an accessible name. Duplicate and uninformative names are not violations. The
same blind spot as SR-003.

**Fix** — `aria-label={`Remove ${name} filter`}` on the chip's close button, and
something like `Clear all filters` for the clear-all chip.

**Guarded by** — `table-search.spec.ts` → _filter chips name the filter they
remove_

---

<a id="sr-015"></a>

## SR-015 — The carousel never identifies itself as a carousel

|                        |                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **Sighted user**       | Sees a row of cards with arrows and dots, and recognises a carousel instantly            |
| **Screen reader user** | Walks from the "Updates" heading straight into a card image. No widget is ever mentioned |

Observed entering the carousel:

```
1. News Thumbnail Image image
2. Update Card 001 heading level 2
3. 2026-06-28 —Deterministic update card 001.
4. ( view full release ) (view full release) link
```

No region, no group, no name, nothing to say a widget exists — and therefore no
hint that most of its content is off screen (SR-016) or that there are controls
further on to reveal it.

**Where** —
[`src/components/carousel/index.tsx:82-104`](../../src/components/carousel/index.tsx#L82)
renders only styled `<div>`s: no `role="region"`, no `aria-roledescription`, no
`aria-label`. `aria-roledescription` appears **zero** times in the built page.

**Why axe missed it** — there is no rule requiring a composite widget to declare
itself, and no way for a scanner to infer that a `<div>` containing a horizontal
track _is_ a carousel. Recognising the pattern is the hard part, and it is
exactly what static analysis cannot do.

**Fix** — `role="region"` (or `group`) + `aria-roledescription="carousel"` + an
accessible name, per the APG carousel pattern.

**Guarded by** — `carousel.spec.ts` → _the carousel identifies itself as a
carousel_

**Near-miss worth recording.** This test passed on its first confirmation run,
wrongly. The fixture cards were named `Carousel Card 00N`, so the assertion's
search for the token "carousel" matched the card heading — **the test data was
supplying the very word the test looked for.** Renaming them to
`Update Card 00N` made it fail as it should. Generalisable: a screen reader
assertion is a substring search over a transcript, so any fixture text
containing the token under test can manufacture a pass. Reading the attached
transcript is what catches it.

---

<a id="sr-016"></a>

## SR-016 — Every slide is announced, including the ones off screen

**Severity: high**, and the most screen-reader-specific finding in this
document.

|                        |                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Sighted user**       | Sees two cards, and arrows to see more                                                 |
| **Screen reader user** | Is read all six, in full — 24 announcements for content five-sixths of which is hidden |

Observed with six cards at 1280px, where the carousel presents two
(`Update Card 001`, `Update Card 002`). Hopping link-to-link:

```
1. ( view full release ) (view full release) link
2. ( view full release ) (view full release) link
3. ( view full release ) (view full release) link
4. ( view full release ) (view full release) link
5. ( view full release ) (view full release) link
6. ( view full release ) (view full release) link
7. All updates link
```

Six reachable, two presented.

**Where** — off-screen slides are moved by a framer-motion `translateX`
([`Track.tsx:176`](../../src/components/carousel/components/Track.tsx#L176))
under `overflow: hidden`
([`index.tsx:84`](../../src/components/carousel/index.tsx#L84)). They carry **no
`aria-hidden`, no `inert`, no `tabIndex={-1}`**
([`Item.tsx:36-51`](../../src/components/carousel/components/Item.tsx#L36)), so
every card stays in the accessibility tree.

**Why this is a screen reader defect specifically** —
[`Item.tsx:24-31`](../../src/components/carousel/components/Item.tsx#L24)
scrolls a card into view on Tab keyup, so a _keyboard_ user is partly protected.
The VoiceOver cursor fires no focus event and gets no such help. Worse: the
browser scrolls the clipped card into view behind the widget's back, leaving the
container's scroll position desynced from the carousel's own transform while the
dots still report slide 1. A keyboard-only test would not find this.

**Why axe missed it** — every card is valid, named and in the DOM. Whether an
element is visually clipped by an ancestor is not something axe evaluates, and
"should this be hidden from assistive tech?" is a question about intent.

**WCAG** — 1.3.2 (Meaningful Sequence) and 2.4.3 (Focus Order).

**Fix** — `aria-hidden` or `inert` on slides outside the current window, kept in
sync with `activeItem`.

**Guarded by** — `carousel.spec.ts` → _only the cards on screen are announced_

---

<a id="sr-017"></a>

## SR-017 — Changing slide announces nothing

|                        |                                                                      |
| ---------------------- | -------------------------------------------------------------------- |
| **Sighted user**       | Presses the arrow, watches the cards slide, sees the active dot move |
| **Screen reader user** | Silence                                                              |

Observed activating `next carousel item` — the oracle confirms the carousel
moved, and the spoken log is empty:

```
dot: carousel indicator 1 of 3 (current) -> carousel indicator 2 of 3 (current)
--- spoken ---
                                            ← nothing
```

The dots make this worse rather than better. They are
`<div role="button" tabIndex={0}>`
([`CarouselControls.tsx:82-115`](../../src/components/carousel/components/CarouselControls.tsx#L82))
with the state baked into the **name** — `carousel indicator 1 of 3 (current)` —
rather than exposed as state: no `aria-current`, no `aria-selected`, no
`aria-pressed`, and no `tablist`/`tab` relationship to the slides. So the one
place the position is published is a string the user only encounters if they
happen to land on that particular 12×12px div, and it is never announced at the
moment it changes.

**WCAG** — 4.1.3 Status Messages (AA). Same root cause as SR-011…SR-013: no live
region anywhere in the app.

**Why axe missed it** — as SR-011; and `aria-current` is optional, so its
absence is not a violation.

**Fix** — announce the new position in a live region on change, and add
`aria-current` to the active dot in addition to its `(current)` text.

**Guarded by** — `carousel.spec.ts` → _changing slide announces the new
position_

---

<a id="sr-018"></a>

## SR-018 — Card links never say where they lead

|                        |                                                                                |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Sighted user**       | Reads the card title above the link and knows exactly what it opens            |
| **Screen reader user** | Hears `( view full release ) link` six times, with nothing to distinguish them |

Navigating by link — the fastest way through a list of cards, and a normal way
to use a screen reader — every card link is identical. The card title lives in a
separate heading node, so it is not part of the link's accessible name.

**Where** —
[`NewsCarousel.tsx:220-230`](../../src/views/home/components/NewsCarousel.tsx#L220).
Note the announcement is `( view full release ) (view full release) link`: the
spaces come from a block `<p>` (`<Text>`) nested inside the anchor, which is
also invalid HTML.

**Why axe missed it** — `link-name` is satisfied; every link has a name.
Duplicate, non-descriptive names are not violations. Third instance of this
blind spot, after SR-003 and SR-014.

**WCAG** — 2.4.4 (Link Purpose, In Context).

**Fix** — include the card title, e.g.
`` aria-label={`View full release: ${carouselCard.name}`} ``.

**Guarded by** — `carousel.spec.ts` → _card links describe where they lead_

---

<a id="sr-019"></a>

## SR-019 — Nothing tells a screen reader user the table is loading

**The sharpest axe comparison in this document.** The axe suite scans this exact
state and passes it — `a11y: Home — loading` → _passes axe while the resources
table is loading_. Same route, same mocks, same DOM as the test below.

|                        |                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Sighted user**       | Sees shimmering grey placeholder bars and understands instantly that data is coming |
| **Screen reader user** | Is told it is an ordinary, complete table with eleven rows                          |

Observed on reaching the table while both queries are in flight:

```
List of repositories and resource catalogs table 5 columns, 11 rows
```

Eleven rows, ten of them fake. Nothing indicates that data is loading, that what
follows is placeholder, or that it is about to be replaced (SR-021).

**Where** — `aria-busy` appears **nowhere in `src/`**
(`grep -rn "aria-busy" src/` → 0 hits), there is no live region, and Chakra's
`Skeleton` emits no ARIA of its own — verified in
`node_modules/@chakra-ui/react/dist/esm/skeleton/skeleton.mjs`, which sets only
presentational CSS.

**Why axe missed it** — a skeleton row is valid markup, `aria-busy` is optional
so its absence is never a violation, and no rule can know that ten rows of
placeholder are standing in for real content. The shimmer that communicates
"loading" to a sighted user is pure CSS.

**Fix** — `aria-busy="true"` on the table while loading, and/or a
`role="status"` "Loading results" message. `chart-wrapper.tsx:35` already does
the latter elsewhere in this codebase.

**Guarded by** — `table-loading.spec.ts` → _the loading table announces that it
is busy_

---

<a id="sr-020"></a>

## SR-020 — Placeholder cells announce a hyphen as the cell's value

**Not silence — misinformation.** The user is not told the data is missing; they
are told what it is, incorrectly, 30 times.

Observed on the first data row:

```
row 2 of 11  NAME … blank column 1 of 5
DESCRIPTION blank column 2 of 5
TYPE … - column 3 of 5
RESEARCH DOMAIN … - column 4 of 5
ACCESS … - column 5 of 5
```

Columns 1–2 announce `blank`, which is honest. Columns 3–5 assert a value.

**Where** — the ternaries at
[TableWithSearch/index.tsx:267](../../src/views/home/components/TableWithSearch/index.tsx#L267),
[:273](../../src/views/home/components/TableWithSearch/index.tsx#L273) and
[:277](../../src/views/home/components/TableWithSearch/index.tsx#L277) fall
through to a literal `'-'` on the empty row objects that `Array(10).fill({})`
supplies.

The reason it reaches the user is a CSS subtlety: Chakra hides skeleton contents
with `&::before, &::after, * { visibility: hidden }`, and `*` matches
**element** descendants only. A bare text node is merely `color: transparent` —
invisible on screen, fully present in the accessibility tree. 10 rows × 3
columns = **30 cells**, confirmed by counting the built HTML.

**Why axe missed it** — a `-` is valid text content. Nothing in the DOM marks it
as a placeholder, and axe cannot infer intent.

**Fix** — render nothing (or the skeleton bar alone) while loading rather than
falling through to `'-'`.

**Guarded by** — `table-loading.spec.ts` → _placeholder cells are not announced
as content_

### This one corrected a prediction the suite had already written down

`home.spec.ts` described this gap as _"10 skeleton rows announced as empty
cells."_ That was **right for two of five columns and wrong for three** — and
the wrong three are a worse defect than the one predicted, because asserting a
false value is worse than saying nothing.

The prediction was mine, written while scoping this work from the markup. It is
the third overturned reading in this document, and the first drawn from the
suite's own documentation rather than the app's code. The correction came from
the built HTML and was confirmed by the transcript.

---

<a id="sr-021"></a>

## SR-021 — Data replacing the skeleton rows announces nothing

|                        |                                                                        |
| ---------------------- | ---------------------------------------------------------------------- |
| **Sighted user**       | Watches the placeholder bars resolve into real rows                    |
| **Screen reader user** | Is reading the table when its entire contents are silently swapped out |

Observed with the VoiceOver cursor parked **on the table**, then releasing the
gated requests:

```
cursor parked on: List of repositories and resource catalogs table
rows:    10 -> 2
results: 0 results -> 2 results
--- spoken ---
                    ← nothing
```

**The worst of the 4.1.3 family**, because unlike SR-011…SR-013 and SR-017 the
trigger is not a user action. There is nothing for the user to associate the
change with and no reason to expect it: they are reading row 2 of 11, and
without warning row 2 of 11 is a different row in a different table.

**Where** — the same missing live region as SR-011.

**Why axe missed it** — axe scans one DOM snapshot. A transition between two
states, each individually valid, is not something it can evaluate. This is a
different limitation from the others: not "the rule doesn't exist" but "the
method has no notion of time".

**Fix** — the same `role="status"` as SR-011, which would announce the new
result count as it changes.

**Guarded by** — `table-loading.spec.ts` → _data arriving is announced_

**Method note** — the test holds both requests with a gate it releases itself,
rather than a timed delay, so the cursor is provably on the table before the
content under it changes. A `setTimeout` would race a traversal whose duration
depends on how fast VoiceOver is speaking.

---

## Surfaces checked and found clean

Recording these matters: a method that only reports problems can't be
distinguished from one that manufactures them.

| Surface                                        | Result                                                                                                                                                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation landmark                            | `Main navigation navigation` — correctly named and roled, and the only landmark on the page that is. Now guarded                                                                                                  |
| Main navigation dropdowns                      | Announce correctly — `Search dialog pop up collapsed button` carries name, popup type, state and role. Now guarded                                                                                                |
| Footer contents                                | Static links, correctly named and grouped as lists (`list 5 items`, `link USA.gov 4 of 5`); the two footer headings announce as level 2. It is the footer's _landmark_ that is missing (SR-008), not its contents |
| Table identity                                 | `List of repositories and resource catalogs table 5 columns, 42 rows`                                                                                                                                             |
| Table row position                             | Correct despite virtualisation — see the disproved prediction above                                                                                                                                               |
| Table row ordering                             | All 40 rows reachable exactly once, in order, across recycling                                                                                                                                                    |
| Hero search field                              | Announces name and role: `Search for resources … edit text`                                                                                                                                                       |
| Hero search typing                             | Keystrokes echoed correctly                                                                                                                                                                                       |
| Table search field                             | `Search table edit text` — correct despite an `id` of `"Search table"` (a space inside an id) and no `aria-label`. Now guarded                                                                                    |
| Table filter triggers                          | `Type` / `Research Domain` / `Access` each announce `dialog pop up collapsed button` — name, popup type, state and role                                                                                           |
| Results count text                             | `2 results` announces correctly when the cursor reaches it. The defect is that it is never announced when it _changes_ (SR-011)                                                                                   |
| Carousel prev/next                             | `previous carousel item dimmed button` — name, role and the disabled state all survive into speech. Now guarded                                                                                                   |
| VoiceOver vs. the carousel's arrow-key handler | VO navigation does not operate the carousel, despite a document-level handler that ignores modifiers. See the disproved section. Now guarded                                                                      |
| Table search field while loading               | Keeps its name and role (`Search table edit text`) while the rows are still skeletons, so a user can start typing before data lands. Now guarded                                                                  |
| Table row position while loading               | `row 2 of 11` is internally consistent with the ten placeholder rows plus the header. The defect is that the eleven rows are announced as real (SR-019), not that the counting is wrong                           |

## Coverage caveat

Every observation here comes from **one** screen reader, on **one** browser, on
**one** OS version: VoiceOver + Chromium + macOS 12.

Notably that is **not Safari**, which is what most VoiceOver users actually run
— Playwright no longer ships a WebKit build for macOS 12. Announcement strings
differ between engines, so these findings should be treated as real but not
exhaustive, and re-checked against Safari before being taken as complete.

### One surface the method could not reach

**The VoiceOver cursor will not enter an opened filter popover.**
`voiceOver.act()` on the trigger does open it — Playwright confirms the
checkboxes become visible — but a linear walk from there goes straight past the
dialog to the next toolbar button, and the popover closes behind the cursor.

This is recorded as a **limit of the harness, not a defect in the app**, and
deliberately so. It may be a real bug (a dialog that opens without the screen
reader cursor following, then closes on blur, is a genuine trap), or it may be
an artefact of how guidepup drives the VO cursor versus DOM focus. The evidence
available does not distinguish those, and filing it as a finding would mean
reporting a defect the suite has not actually demonstrated.

Consequence: SR-013 ticks its checkbox with Playwright, so the popover's own
contents are **not** proven reachable. Settling it needs a different technique
than a linear walk — most likely VoiceOver's item chooser or web rotor — and is
the first thing to try if this experiment continues.
