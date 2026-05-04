---
date: 2026-04-02
topic: hotkey-configuration
---

# Disable Hotkeys & Hide Kbd Badges

## Problem Frame

Avo's keyboard shortcut system is fully hardcoded with no configuration. Developers building admin panels may want to disable hotkeys entirely (to avoid conflicts or because their users don't need them), hide the `kbd` badges from the UI (cleaner look), or let end-users toggle badge visibility themselves. Currently none of this is possible.

## Requirements

**Developer Configuration**

- R1. Namespaced `config.hotkeys` configuration hash grouping all hotkey settings. API:
  ```ruby
  config.hotkeys = {
    enabled: true,      # R1a — master switch for all keyboard shortcuts
    show_key_badges: true     # R2 — hide inline kbd badge elements
  }
  ```
- R1a. `enabled: false` disables all keyboard shortcuts: `@github/hotkey` listeners are not installed, the `index_row_navigator_controller` keyboard handling is suppressed, global hotkeys (`?`, `/`, `r r r`) do not fire, and the keyboard shortcuts modal is inaccessible.
- R2. `show_key_badges: false` hides inline `kbd` badge elements from the UI: `hotkey_badge()` renders nothing on buttons, sidebar links, and other inline locations. The keyboard shortcuts modal (triggered by `?`) is unaffected — it renders its own `kbd` elements via a separate code path (`KeyboardShortcutsComponent`). Hotkeys themselves still function — only the inline visual indicators are removed.

**End-User Runtime Toggle**

- R3. A keyboard shortcut (when hotkeys are enabled and badges are visible) to toggle `kbd` badge visibility. The preference persists across sessions via localStorage. This is a user-level override on top of the developer config — if the developer hides badges via R2, this toggle has no effect.

## Success Criteria

- A developer can set `config.hotkeys = { enabled: false }` and no keyboard shortcuts fire anywhere in the app
- A developer can set `config.hotkeys = { show_key_badges: false }` and no inline `kbd` elements appear, while shortcuts still work
- An end-user can press a shortcut to hide/show `kbd` badges persistently
- Existing behavior is unchanged when no configuration is set (defaults: `enabled: true`, `show_key_badges: true`)

## Scope Boundaries

- No per-resource or per-page hotkey configuration — this is global only
- No custom hotkey remapping — that's a separate feature
- No server-side per-user preference storage — localStorage is sufficient
- The `?` shortcut and keyboard shortcuts modal are governed by R1 (disabled when hotkeys are disabled), not by R2

## Key Decisions

- **localStorage for persistence**: Avoids needing user model changes or server-side storage for a UI preference
- **Namespaced `config.hotkeys` hash**: Groups all hotkey settings under one namespace. `enabled` and `show_key_badges` are independent — a developer may want shortcuts active but with a clean UI
- **Config values passed via `window.Avo.configuration`**: Matches the existing pattern in `_javascript.html.erb` used for `root_path`, `search_debounce`, `cookies_key`, etc.
- **R2 does not affect the shortcuts modal**: The modal renders its own `kbd` elements via `KeyboardShortcutsComponent` (separate from `hotkey_badge()`), so R2's suppression of `hotkey_badge()` does not touch the modal. The modal's availability is governed by R1 only

## Outstanding Questions

### Deferred to Planning

- [Affects R3][Technical] How should the R3 toggle hide badges — via CSS class on `<body>` or by removing elements? CSS-based hiding is likely the only viable approach since badges are server-rendered and re-appear on every Turbo navigation.
- [Affects R3][Technical] What shortcut key should toggle badge visibility? Should match the pattern used in the keyboard shortcuts modal. Candidates: `Shift+K`, `h` (for hide).
- [Affects R1][Technical] Should `data-hotkey` attributes still be rendered in HTML when hotkeys are disabled, or should they be omitted entirely? Omitting is cleaner but requires server-side awareness.

## Next Steps

-> `/ce:plan` for structured implementation planning
