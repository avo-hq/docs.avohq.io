---
title: "Configurable keyboard shortcuts in Avo"
date: 2026-04-02
category: best-practices
module: "Hotkeys / Keyboard Shortcuts"
problem_type: best_practice
component: frontend_stimulus
severity: medium
applies_when:
  - Adding namespaced configuration options to Avo
  - Implementing client-side feature toggles that survive Turbo navigation
  - Building CSS-based visibility toggles that exclude specific DOM subtrees
  - Persisting user preferences across sessions without server state
tags:
  - hotkeys
  - configuration
  - css-visibility-toggle
  - localStorage
  - turbo
  - stimulus
---

# Configurable keyboard shortcuts in Avo

## Context

Avo's keyboard shortcut system was fully hardcoded with no configuration. Developers couldn't disable hotkeys (to avoid conflicts or because their users don't need them), hide `kbd` badges (for a cleaner UI), or let end-users toggle badge visibility. Linear issue AVO-1107 tracked this.

The solution required coordination across Ruby configuration, ERB layout, JavaScript hotkey registration, CSS visibility, and localStorage persistence — all working correctly with Turbo Drive navigation.

## Guidance

### 1. Hash config with frozen defaults and merge reader

Follow the `resource_row_controls_config` pattern in `Avo::Configuration`:

```ruby
unless defined?(HOTKEYS_DEFAULTS)
  HOTKEYS_DEFAULTS = { enabled: true, show_key_badges: true }.freeze
end

attr_writer :hotkeys

# In initialize:
@hotkeys = {}

def hotkeys
  HOTKEYS_DEFAULTS.merge @hotkeys
end
```

Developers can partially override: `config.hotkeys = { enabled: false }` merges with defaults, preserving `show_key_badges: true`.

### 2. Config-to-JS bridge via `_javascript.html.erb`

Pass Ruby config to `window.Avo.configuration` using the existing inline script pattern. Convert to camelCase on the JS side:

```erb
Avo.configuration.hotkeys = {
  enabled: <%= Avo.configuration.hotkeys[:enabled] %>,
  showKeyBadges: <%= Avo.configuration.hotkeys[:show_key_badges] %>
}
```

This inline script is in `<head>` and executes before the deferred esbuild bundle, so config is available when JS runs at module evaluation time.

### 3. Guard all hotkey registration paths

There are three independent registration paths — each needs its own guard:

| Path | File | Mechanism |
| --- | --- | --- |
| Element hotkeys | `application.js` | `installHotkeys()` scans `[data-hotkey]` and calls `@github/hotkey` `install()` |
| Global hotkeys | `global_hotkeys.js` | `installGlobalHotkeys()` creates hidden spans + registers keydown listener |
| Row hotkeys | `index_row_navigator_controller.js` | Stimulus controller with document-level keydown |

Use `!== false` (not `=== true`) with optional chaining to avoid disabling when config is undefined:

```javascript
if (window.Avo?.configuration?.hotkeys?.enabled !== false) {
  installHotkeys()
}
```

For the row navigator, preserve arrow-key navigation (accessibility) while suppressing hotkey actions:

```javascript
this.hotkeysEnabled = window.Avo?.configuration?.hotkeys?.enabled !== false
// Arrow/Enter/Space handlers always active
// syncRowHotkeys() and handleRowHotkey() guarded by this.hotkeysEnabled
```

### 4. Single suppression point for badge rendering

Guard `hotkey_badge()` in `BaseComponent` — all call sites (sidebar links, buttons) inherit from it:

```ruby
def hotkey_badge(hotkey, **html_options)
  return unless Avo.configuration.hotkeys[:enabled] && Avo.configuration.hotkeys[:show_key_badges]
  # ...render kbd elements
end
```

### 5. CSS-based runtime toggle (the `:not()` gotcha)

Badges are server-rendered and reappear on every Turbo navigation, so CSS body class is the only viable client-side approach. **Two rules are needed:**

```css
.hotkeys-hide-badges kbd { display: none; }
.hotkeys-hide-badges .hotkey kbd { display: revert; }
```

**Do NOT use** `.hotkeys-hide-badges :not(.hotkey) kbd { display: none; }` — the `:not(.hotkey)` matches intermediate ancestors (`ul`, `li`, `span`) that lack the `.hotkey` class, which hides kbd elements inside the modal too. The two-rule approach hides everything then restores within the `.hotkey` modal wrapper.

### 6. localStorage with try/catch and Turbo lifecycle

Read preference on `turbo:load` (before `installHotkeys()` for correct first paint):

```javascript
document.addEventListener('turbo:load', () => {
  if (window.Avo?.configuration?.hotkeys?.showKeyBadges !== false) {
    try {
      if (localStorage.getItem('avo:hotkeys:hide_badges') === '1') {
        document.body.classList.add('hotkeys-hide-badges')
      } else {
        document.body.classList.remove('hotkeys-hide-badges')
      }
    } catch (e) { /* private browsing */ }
  }
  // ...
})
```

The toggle shortcut only registers when `showKeyBadges` is `true` — developer config takes precedence over user preference.

### 7. Test pattern: `around` blocks for config override

When the dummy app sets non-default config (e.g., `enabled: false`), tests need explicit `around` blocks:

```ruby
around do |example|
  original = Avo.configuration.hotkeys
  Avo.configuration.hotkeys = {enabled: true, show_key_badges: true}
  example.run
  Avo.configuration.hotkeys = original
end
```

Add this at the top-level `describe` for all tests that assume defaults, and override in nested contexts.

## Why This Matters

- The frozen-defaults-with-merge pattern is reusable for any new Avo config namespace
- The three-path hotkey registration is a non-obvious implementation detail — missing one path leaves shortcuts partially active
- The CSS `:not()` ancestor matching gotcha is a common mistake that breaks modal badge visibility
- The `turbo:load` timing matters for preventing badge flash on navigation

## When to Apply

- Adding new namespaced configuration options to Avo (follow the `HOTKEYS_DEFAULTS` pattern)
- Implementing any client-side feature toggle that must survive Turbo Drive navigation (use body class + `turbo:load`)
- Building CSS visibility rules that must exclude specific DOM subtrees (use two-rule hide/restore, not `:not()`)
- Persisting user preferences without server state (localStorage with try/catch)

## Examples

**Disabling all hotkeys:**
```ruby
# config/initializers/avo.rb
config.hotkeys = { enabled: false }
```
Result: No keyboard shortcuts fire, no kbd badges render, shortcuts modal not in DOM.

**Hiding badges only:**
```ruby
config.hotkeys = { show_key_badges: false }
```
Result: Shortcuts work, but no inline kbd badges visible. Modal still accessible via `?`.

**End-user toggle:**
Press `Shift+K` to toggle badge visibility. Persists across sessions via localStorage.

## Related

- [AVO-1107](https://linear.app/avo-hq/issue/AVO-1107) — Original issue
- [Requirements doc](../../brainstorms/2026-04-02-hotkey-configuration-requirements.md)
- [Implementation plan](../../plans/2026-04-02-001-feat-hotkey-configuration-plan.md)
- `Avo::Configuration#resource_row_controls_config` — Reference pattern for hash config with defaults
