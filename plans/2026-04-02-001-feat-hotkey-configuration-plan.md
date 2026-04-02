---
title: "feat: Add hotkey configuration options"
type: feat
status: active
date: 2026-04-02
origin: docs/brainstorms/2026-04-02-hotkey-configuration-requirements.md
---

# feat: Add hotkey configuration options

## Overview

Add a namespaced `config.hotkeys` configuration hash to Avo that allows developers to disable keyboard shortcuts entirely and/or hide inline `kbd` badge elements. Additionally, provide an end-user shortcut to toggle badge visibility at runtime with localStorage persistence.

## Problem Frame

Avo's keyboard shortcut system is fully hardcoded with no configuration. Developers cannot disable hotkeys (to avoid conflicts or for users who don't need them) or hide `kbd` badges (for a cleaner UI). End-users have no way to toggle badge visibility. (see origin: docs/brainstorms/2026-04-02-hotkey-configuration-requirements.md)

## Requirements Trace

- R1. Namespaced `config.hotkeys` hash grouping all hotkey settings with `enabled` and `show_key_badges` keys
- R1a. `enabled: false` disables all keyboard shortcuts, global hotkeys, row navigation, and the shortcuts modal
- R2. `show_key_badges: false` hides inline `kbd` badges while keeping shortcuts functional. The `KeyboardShortcutsComponent` modal is unaffected
- R3. End-user shortcut to toggle badge visibility, persisted via localStorage. No effect when developer config hides badges via R2

## Scope Boundaries

- Global config only — no per-resource or per-page hotkey configuration
- No custom hotkey remapping
- No server-side per-user preference storage
- The `?` shortcut and keyboard shortcuts modal are governed by R1a, not R2

## Context & Research

### Relevant Code and Patterns

- **Hash config pattern**: `Avo::Configuration#resource_row_controls_config` uses frozen defaults constant + `attr_writer` + custom reader merging defaults (configuration.rb)
- **Config-to-JS bridge**: `app/views/avo/partials/_javascript.html.erb` populates `window.Avo.configuration` via `javascript_tag` with nonce. Supports object literals (see `media_library` example)
- **Hotkey installation**: `application.js` — `installHotkeys(root)` queries `[data-hotkey]` elements, calls `@github/hotkey` `install(el)` + `attachHotkeyFeedback(el)`. Runs on `turbo:load` and `turbo:frame-render`
- **Global hotkeys**: `global_hotkeys.js` — `installGlobalHotkeys()` creates hidden spans for element hotkeys and a document keydown listener for direct hotkeys (`?`, `/`)
- **Row navigation**: `index_row_navigator_controller.js` — Stimulus controller with document-level keydown listener for arrow/Enter/Space/Escape
- **Badge rendering**: `base_component.rb` `hotkey_badge()` (lines 20-57) renders `<kbd>` spans. Called from `sidebar/link_component.html.erb` and `button_component.rb`
- **Modal**: `KeyboardShortcutsComponent` rendered in `layouts/avo/application.html.erb` (line 77). Uses its own `chord_fragments` / `render_shortcut_keys` methods — separate code path from `hotkey_badge()`
- **kbd CSS**: `typography.css` — `kbd` styled with `@apply`, `kbd.kbd--called` for activation animation

### Institutional Learnings

No `docs/solutions/` directory exists yet — no prior learnings to reference.

## Key Technical Decisions

- **Follow `resource_row_controls_config` pattern for hash config**: Frozen defaults constant, `attr_writer`, custom reader with merge. Well-established pattern in Configuration class (see origin)
- **Client-side hotkey disabling, not server-side attribute omission**: When `enabled: false`, `data-hotkey` attributes are still rendered in HTML but `install()` is never called, making them inert. This is simpler — fewer server-side touch points — and `@github/hotkey` attributes do nothing without explicit `install()` calls. The alternative (omitting `data-hotkey` server-side) would require passing config awareness to every component that renders hotkey attributes
- **CSS-based badge hiding for R3**: Badges are server-rendered and reappear on every Turbo navigation. A CSS class on `<body>` (e.g., `hotkeys-hide-badges`) that hides all `kbd` elements is the only viable client-side approach. Applied on page load from localStorage before first paint
- **`Shift+K` for R3 toggle**: Avoids conflicts with existing single-letter hotkeys (`d`, `e`, `a`, `c`, `/`). `K` for "keys/kbd" is mnemonic. Consistent with modifier+letter pattern used elsewhere (`Mod+Enter`)
- **Config values passed via `window.Avo.configuration`**: Matches existing pattern used for `root_path`, `search_debounce`, `cookies_key`, etc. (see origin). The `_javascript.html.erb` partial is an inline script in `<head>` (layout line 16) and executes before the deferred esbuild bundle — so `Avo.configuration.hotkeys` is available when `installGlobalHotkeys()` runs at bundle evaluation time
- **R2 does not affect the shortcuts modal**: The modal uses `KeyboardShortcutsComponent` with its own rendering methods, separate from `hotkey_badge()` (see origin)

## Open Questions

### Resolved During Planning

- **How should R3 toggle hide badges?** CSS class on `<body>`. Badges are server-rendered, so DOM manipulation per-element on every Turbo navigation is impractical. A body class toggling `kbd` visibility via CSS is clean and instant.
- **What shortcut key for R3?** `Shift+K`. Mnemonic (K for keys), avoids conflicts with existing hotkeys, uses modifier to prevent accidental triggers.
- **Should `data-hotkey` attributes render when hotkeys are disabled?** Yes — they are inert without `install()`. Client-side guard is simpler than threading config through every component.

### Deferred to Implementation

- **Exact localStorage key name**: Should follow `Avo.configuration.cookies_key` prefix convention if one exists, or use a simple `avo:hotkeys:show_badges` key
- **`index_row_navigator_controller` scope when disabled**: Arrow-key navigation (up/down/Enter/Space) is preserved as an accessibility feature. Only hotkey-specific row actions (d, e, a via `data-hotkey` / `syncRowHotkeys()`) are suppressed when `enabled: false`

## Implementation Units

- [ ] **Unit 1: Add `hotkeys` config option to `Avo::Configuration`**

  **Goal:** Add the `config.hotkeys` hash with defaults, following the established pattern

  **Requirements:** R1

  **Dependencies:** None

  **Files:**
  - Modify: `gems/avo/lib/avo/configuration.rb`

  **Approach:**
  - Add `HOTKEYS_DEFAULTS` frozen constant wrapped in `unless defined?(HOTKEYS_DEFAULTS)` guard (matches existing pattern for `RESOURCE_ROW_CONTROLS_CONFIG_DEFAULTS`, `CONTAINER_WIDTH_DEFAULTS`): `{ enabled: true, show_key_badges: true }.freeze`
  - Add `attr_writer :hotkeys`
  - Set `@hotkeys = {}` in `initialize`
  - Add custom reader: `def hotkeys; HOTKEYS_DEFAULTS.merge(@hotkeys); end`

  **Patterns to follow:**
  - `RESOURCE_ROW_CONTROLS_CONFIG_DEFAULTS` + `resource_row_controls_config` in same file

  **Test scenarios:**
  - Happy path: `Avo.configuration.hotkeys` returns full defaults hash when nothing is configured
  - Happy path: `config.hotkeys = { enabled: false }` merges with defaults, preserving `show_key_badges: true`
  - Happy path: `config.hotkeys = { show_key_badges: false }` merges with defaults, preserving `enabled: true`
  - Edge case: `config.hotkeys = {}` returns full defaults

  **Verification:**
  - `Avo.configuration.hotkeys` returns `{ enabled: true, show_key_badges: true }` by default
  - Partial overrides merge correctly with defaults

- [ ] **Unit 2: Pass hotkeys config to JavaScript**

  **Goal:** Expose the hotkeys config hash to `window.Avo.configuration.hotkeys` so JS can read it

  **Requirements:** R1, R2, R3 (foundation for all JS-side behavior)

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `gems/avo/app/views/avo/partials/_javascript.html.erb`

  **Approach:**
  - Add `Avo.configuration.hotkeys = { enabled: ..., showKeyBadges: ... }` to the JS config block
  - Use camelCase on the JS side per JS convention (`showKeyBadges` not `show_key_badges`)
  - Read values from `Avo.configuration.hotkeys[:enabled]` and `Avo.configuration.hotkeys[:show_key_badges]`

  **Patterns to follow:**
  - `Avo.configuration.media_library = { enabled: ..., visible: ... }` in same file

  **Test expectation:** none -- output is verified indirectly through Units 3-6

  **Verification:**
  - View source of any Avo page shows `Avo.configuration.hotkeys` object with correct values

- [ ] **Unit 3: Disable hotkeys in JS when `enabled: false`**

  **Goal:** Guard all hotkey installation and handling behind the `enabled` config flag

  **Requirements:** R1a

  **Dependencies:** Unit 2

  **Files:**
  - Modify: `gems/avo/app/javascript/application.js`
  - Modify: `gems/avo/app/javascript/js/global_hotkeys.js`
  - Modify: `gems/avo/app/javascript/js/controllers/index_row_navigator_controller.js`
  - Test: `gems/avo/spec/system/avo/group_1/hotkey_spec.rb`

  **Approach:**
  - In `application.js`: wrap `installHotkeys()` calls (on `turbo:load` and `turbo:frame-render`) with `if (Avo.configuration.hotkeys.enabled)` guard
  - In `global_hotkeys.js`: wrap `installGlobalHotkeys()` body with early return if `!Avo.configuration.hotkeys.enabled`
  - In `index_row_navigator_controller.js`: preserve arrow-key navigation (up/down/Enter/Space) as an accessibility feature. Only suppress hotkey-specific row actions (e.g., `d` for delete, `e` for edit, `a` for actions) when `!Avo.configuration.hotkeys.enabled`. Guard the `syncRowHotkeys()` call and `data-hotkey` restoration logic behind the enabled check, but leave the arrow/Enter/Space handlers active

  **Patterns to follow:**
  - Existing guard patterns in Stimulus controllers (check config before registering listeners)

  **Test scenarios:**
  - Happy path: with `enabled: true` (default), all existing hotkey tests pass unchanged
  - Happy path: with `enabled: false`, pressing `?` does not open shortcuts modal
  - Happy path: with `enabled: false`, pressing `/` does not focus search
  - Happy path: with `enabled: false`, pressing `r r r` does not reload
  - Happy path: with `enabled: false`, sidebar hotkeys (e.g., `r u`) do not navigate
  - Happy path: with `enabled: false`, arrow-key row navigation (up/down/Enter/Space) still works
  - Happy path: with `enabled: false`, row-specific hotkeys (d, e, a) do not fire on focused rows
  - Integration: with `enabled: false`, `data-hotkey` attributes are present in DOM but clicking/pressing does nothing

  **Verification:**
  - No keyboard shortcuts fire when `enabled: false`
  - All existing hotkey behavior works when `enabled: true`

- [ ] **Unit 4: Conditionally render keyboard shortcuts modal**

  **Goal:** Don't render the `KeyboardShortcutsComponent` when hotkeys are disabled

  **Requirements:** R1a

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `gems/avo/app/views/layouts/avo/application.html.erb`
  - Test: `gems/avo/spec/system/avo/group_1/hotkey_spec.rb`

  **Approach:**
  - Wrap the `render Avo::KeyboardShortcutsComponent.new` call (line 77) with `if Avo.configuration.hotkeys[:enabled]`
  - This removes the modal from the DOM entirely when disabled, preventing it from being opened by any means

  **Patterns to follow:**
  - Conditional rendering in same layout file (e.g., debug bar, license checks)

  **Test scenarios:**
  - Happy path: with `enabled: true`, `.hotkey` modal element exists in DOM
  - Happy path: with `enabled: false`, `.hotkey` modal element is absent from DOM

  **Verification:**
  - Modal HTML is not present in page source when hotkeys are disabled

- [ ] **Unit 5: Suppress `hotkey_badge()` when `show_key_badges: false`**

  **Goal:** Prevent inline `kbd` badge rendering when developer config hides them

  **Requirements:** R2

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `gems/avo/app/components/avo/base_component.rb`
  - Test: `gems/avo/spec/components/avo/base_component_hotkey_badge_spec.rb`

  **Approach:**
  - Add early return `nil` at the top of `hotkey_badge` method if `!Avo.configuration.hotkeys[:show_key_badges]`
  - This is a single guard in the shared helper — all call sites (sidebar links, buttons) are covered without individual changes

  **Patterns to follow:**
  - Existing guard in `hotkey_badge` that returns nil for blank hotkey strings

  **Test scenarios:**
  - Happy path: with `show_key_badges: true` (default), badges render as before
  - Happy path: with `show_key_badges: false`, `hotkey_badge("d")` returns nil
  - Happy path: with `show_key_badges: false`, sidebar links render without `kbd` elements
  - Integration: with `show_key_badges: false` and `enabled: true`, hotkeys still fire (pressing `d` on show page still triggers delete)

  **Verification:**
  - No `kbd` badge elements appear on buttons or sidebar links
  - Hotkey functionality is unaffected
  - The keyboard shortcuts modal still renders its own `kbd` elements

- [ ] **Unit 6: End-user badge toggle with localStorage**

  **Goal:** Add a `Shift+K` shortcut that toggles `kbd` badge visibility and persists the preference

  **Requirements:** R3

  **Dependencies:** Unit 2, Unit 5

  **Files:**
  - Modify: `gems/avo/app/javascript/js/global_hotkeys.js`
  - Modify: `gems/avo/app/javascript/application.js`
  - Modify: `gems/avo/app/assets/stylesheets/css/typography.css`
  - Modify: `gems/avo/app/components/avo/keyboard_shortcuts_component.rb`
  - Test: `gems/avo/spec/system/avo/group_1/hotkey_spec.rb`

  **Approach:**
  - **CSS rule**: Add two rules to `typography.css`: (1) `.hotkeys-hide-badges kbd { display: none; }` hides all badges, (2) `.hotkeys-hide-badges .hotkey kbd { display: revert; }` restores visibility for kbd elements inside the `.hotkey` modal wrapper. The `:not(.hotkey)` approach does NOT work — it matches intermediate ancestors (ul, li, span) that lack `.hotkey`, hiding modal badges too
  - **localStorage read on load**: In `application.js`, on `turbo:load`, check localStorage (wrapped in try/catch) for the badge preference. If hidden, add `hotkeys-hide-badges` class to `document.body`. Run this before `installHotkeys()` so badge state is correct from first paint
  - **Register `Shift+K`**: Add to `DIRECT_HOTKEYS` in `global_hotkeys.js` with match function `(e) => e.shiftKey && e.key === 'K'` (event.key for Shift+letter is reliably uppercase across browsers). Handler toggles `hotkeys-hide-badges` class on `document.body` and writes preference to localStorage. Wrap all localStorage access in try/catch — if unavailable (private browsing), the toggle works for the current session only
  - **Guard against R2**: Only register the toggle shortcut and apply localStorage preference when `Avo.configuration.hotkeys.showKeyBadges` is `true`. If the developer has hidden badges server-side, the toggle has no effect
  - **Add to shortcuts modal**: Add a new entry in the Navigation section of `KeyboardShortcutsComponent#sections` for `Shift+K` → "Toggle keyboard shortcut badges"

  **Patterns to follow:**
  - `DIRECT_HOTKEYS` registration pattern in `global_hotkeys.js` for the `?` and `/` shortcuts
  - `TYPING_SELECTOR` guard to prevent firing in inputs

  **Test scenarios:**
  - Happy path: pressing `Shift+K` hides all inline `kbd` badges
  - Happy path: pressing `Shift+K` again restores badges
  - Happy path: after hiding badges, page reload still has badges hidden (localStorage persistence)
  - Happy path: after restoring badges, page reload shows badges (localStorage cleared/updated)
  - Happy path: `Shift+K` appears in the keyboard shortcuts modal
  - Edge case: when developer sets `show_key_badges: false`, `Shift+K` does not toggle or has no visible effect
  - Edge case: `Shift+K` does not fire when focus is in a text input or textarea
  - Integration: modal's own `kbd` elements remain visible even when inline badges are hidden

  **Verification:**
  - Badge visibility toggles immediately on shortcut press
  - Preference survives page navigation and full reload
  - Modal kbd elements are unaffected

## System-Wide Impact

- **Interaction graph:** `hotkey_badge()` in `BaseComponent` is the single suppression point for R2 — all components inherit from it. The `installHotkeys()` function in `application.js` is the single installation point for R1a element-based hotkeys. `installGlobalHotkeys()` handles the global keydown listeners separately.
- **Error propagation:** No new error paths — config values are simple booleans with defaults. Invalid config (non-boolean values) will be truthy/falsy per Ruby/JS semantics, which is acceptable.
- **State lifecycle risks:** localStorage preference (R3) and server config (R2) can be out of sync. This is by design — R2 takes precedence. If developer enables badges but user has them hidden in localStorage, user preference wins. If developer hides badges, user toggle has no effect.
- **API surface parity:** No other interfaces affected. This is a Ruby config + JS runtime change only.
- **Unchanged invariants:** Resource-level `self.hotkey = "r u"` declarations continue to work exactly as before. The `data-hotkey` attribute rendering pipeline is unchanged. Only the JS `install()` call and Ruby `hotkey_badge()` rendering are gated.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Missing a hotkey registration path when disabling | The `installHotkeys()` and `installGlobalHotkeys()` functions are the two entry points for all element-based and global hotkeys respectively. Guarding these two functions plus `index_row_navigator_controller` covers all paths. System tests verify by pressing every hotkey category. |
| CSS badge hiding rule accidentally hides modal kbd elements | Scope the CSS selector to exclude `.hotkey` (the modal's wrapper class). Test explicitly that modal kbd elements remain visible when body class is applied. |
| localStorage not available (private browsing, disabled) | Use try/catch around localStorage access. If unavailable, the toggle works for the current session only — graceful degradation. |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-02-hotkey-configuration-requirements.md](docs/brainstorms/2026-04-02-hotkey-configuration-requirements.md)
- Related code: `gems/avo/lib/avo/configuration.rb` (config pattern), `gems/avo/app/javascript/application.js` (hotkey installation), `gems/avo/app/javascript/js/global_hotkeys.js` (global hotkeys)
- Related issue: [AVO-1107](https://linear.app/avo-hq/issue/AVO-1107)
