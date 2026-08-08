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

| ID                | Surface            | Defect                                              | WCAG         | Reach               |
| ----------------- | ------------------ | --------------------------------------------------- | ------------ | ------------------- |
| [SR-001](#sr-001) | Search suggestions | Dropdown announces nothing at all                   | 4.1.2, 1.3.1 | 8 files / 4 routes  |
| [SR-002](#sr-002) | Table sorting      | Activating a sort control announces nothing         | 4.1.2, 1.4.1 | 16 files / 4 routes |
| [SR-003](#sr-003) | Table sorting      | 8 sort controls share 2 generic labels              | 2.4.6, 4.1.2 | 16 files / 4 routes |
| [SR-004](#sr-004) | Table cells        | Every cell announcement padded with a control label | 1.3.1        | 16 files / 4 routes |
| [SR-005](#sr-005) | Table headers      | First column header announces as empty              | 1.3.1        | 16 files / 4 routes |
| [SR-006](#sr-006) | News carousel      | Heading outline jumps `h3` → `h2`                   | 1.3.1        | 2 files / 2 routes  |

**Reach** counts files importing the affected shared component. None of these is
page-specific markup — each is one fix that lands everywhere the component is
used.

| Component                             | Consumer files | Routes                                           |
| ------------------------------------- | -------------- | ------------------------------------------------ |
| `src/components/table/`               | 16             | home, search, saved, resource detail             |
| `src/components/input-with-dropdown/` | 8              | home, search, ontology-browser, knowledge-center |
| `src/components/carousel/`            | 2              | home, search                                     |

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

## Surfaces checked and found clean

Recording these matters: a method that only reports problems can't be
distinguished from one that manufactures them.

| Surface                   | Result                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Main navigation dropdowns | Announce correctly — `Search dialog pop up collapsed button` carries name, popup type, state and role                |
| Footer                    | Static links, reached normally by the heading walk; `Policies` and `Related Government Websites` announce as level 2 |
| Table identity            | `List of repositories and resource catalogs table 5 columns, 42 rows`                                                |
| Table row position        | Correct despite virtualisation — see the disproved prediction above                                                  |
| Table row ordering        | All 40 rows reachable exactly once, in order, across recycling                                                       |
| Hero search field         | Announces name and role: `Search for resources … edit text`                                                          |
| Hero search typing        | Keystrokes echoed correctly                                                                                          |

## Coverage caveat

Every observation here comes from **one** screen reader, on **one** browser, on
**one** OS version: VoiceOver + Chromium + macOS 12.

Notably that is **not Safari**, which is what most VoiceOver users actually run
— Playwright no longer ships a WebKit build for macOS 12. Announcement strings
differ between engines, so these findings should be treated as real but not
exhaustive, and re-checked against Safari before being taken as complete.
