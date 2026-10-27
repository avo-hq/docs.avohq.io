---
license: community
outline: [2, 3]
guide: ./keyboard-shortcuts.html
prev:
  text: "Keyboard Shortcuts"
  link: "./keyboard-shortcuts.html"
next: false
---

# Keyboard Shortcuts API

The per-option reference for `config.hotkeys`. For how-to guides, see [Keyboard Shortcuts](./keyboard-shortcuts.html). All options go in `config/initializers/avo.rb`:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.hotkeys = {
    enabled: true,
    show_key_badges: true,
    bindings: {
      "record.edit": "Shift+E"
    }
  }
end
```

Each key is merged with its default, so a hash that sets only `bindings` keeps `enabled` and `show_key_badges` at `true`.

## Switches

<Option name="`enabled`">

Master switch for every keyboard shortcut, including add-on shortcuts and the <kbd>?</kbd> modal.

```ruby
config.hotkeys = {
  enabled: false
}
```

- **Type:** `Boolean`
- **Default:** `true`

</Option>

<Option name="`show_key_badges`">

Renders the inline key badges on buttons, links and search inputs. Shortcuts keep working when it's `false`, and users can no longer toggle badges with <kbd>Shift</kbd>+<kbd>K</kbd>.

```ruby
config.hotkeys = {
  show_key_badges: false
}
```

- **Type:** `Boolean`
- **Default:** `true`

</Option>

## Bindings

<Option name="`bindings`">

<VersionReq version="4.3.6" />

Rebinds or disables shortcuts by ID. Each value is a key in the [hotkey syntax](#hotkey-syntax), or `false` to disable the shortcut. IDs you leave out keep their default.

```ruby
config.hotkeys = {
  bindings: {
    "record.edit": "Shift+E",
    "record.delete": false,
    "index.next_row": "j,ArrowDown"
  }
}
```

- **Type:** `Hash` of `String` or `Symbol` ID to `String` or `false`
- **Default:** `{}`
- **Values:** any ID from [Shortcut IDs](#shortcut-ids)
- **Validation:** raises `ArgumentError` at boot when:
  - an ID is unknown in a namespace that exists (`"record.edti"`);
  - a value is neither a `String` nor `false`;
  - two shortcuts that can fire on the same page share a key;
  - a single key is the start of another shortcut's sequence (`v` would block `v t`);
  - a value uses a [fixed key](#fixed-keys).
- **Add-ons:** IDs for an add-on that isn't installed are ignored, so one initializer works across apps with different add-ons.

Two shortcuts may share a key when they never render on the same page. For example, `resource.go_to_index` (show and edit) can use `/`, which `index.focus_search` uses only on the index.

</Option>

## Hotkey syntax

Keys use the [`@github/hotkey`](https://github.com/github/hotkey#hotkey-string-format) string format, the same format as `data-hotkey` attributes and the menu's `hotkey:` option. The library's [Hotkey Mapper](https://github.github.io/hotkey/hotkey_mapper.html) shows the string for any key you press.

| Rule | Example | Meaning |
| --- | --- | --- |
| Keys use [W3C key names](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values), matched against `event.key` | `Enter`, `ArrowDown`, `/` | |
| `+` joins modifiers to a key, in the order `Control+Alt+Meta+Shift+KEY` | `Control+Alt+h` | <kbd>Ctrl</kbd>, <kbd>Alt</kbd> and <kbd>H</kbd> together |
| `Mod` is <kbd>Cmd</kbd> on macOS and iOS, <kbd>Ctrl</kbd> elsewhere. Don't combine it with `Control` or `Meta` | `Mod+k` | <kbd>Cmd</kbd>+<kbd>K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> |
| A space makes a sequence | `g i` | <kbd>G</kbd>, then <kbd>I</kbd> within 1.5 seconds |
| A comma separates alternatives | `j,ArrowDown` | <kbd>J</kbd> or <kbd>↓</kbd> |
| Uppercase letters and shifted symbols include `Shift` | `Shift+A`, `Shift+?` | not `A` or `?` |
| `Plus` and `Space` name the <kbd>+</kbd> and space keys | `Shift+Plus` | |
| A comma right after a key is the comma key | `Control+,,x` | <kbd>Ctrl</kbd>+<kbd>,</kbd> or <kbd>X</kbd> |

:::info Keyboard layouts
`Shift+?` and `Shift+|` also match on layouts where those symbols sit elsewhere, and letter shortcuts also match by physical key on non-Latin layouts (Cyrillic, Greek).
:::

Key badges and the <kbd>?</kbd> modal show the first alternative of a binding.

## Shortcut IDs

### Core

| ID | Default | Action | Where it fires |
| --- | --- | --- | --- |
| `shortcuts.toggle` | `Shift+?` | Open/close the keyboard shortcuts modal | everywhere |
| `navigation.focus_content` | `Shift+T` | Focus the page content | everywhere |
| `navigation.go_back` | `b` | Go back | everywhere |
| `navigation.reload` | `r r r` | Reload the page, keeping the scroll position | everywhere |
| `sidebar.toggle` | `Shift+\|` | Toggle the sidebar | everywhere |
| `hotkeys.toggle_badges` | `Shift+K` | Toggle the key badges | everywhere |
| `appearance.cycle_scheme` | `Shift+M` | Cycle the color scheme | everywhere |
| `appearance.cycle_neutral` | `Shift+N` | Cycle the neutral theme | everywhere |
| `appearance.cycle_accent` | `Shift+A` | Cycle the accent color | everywhere |
| `appearance.toggle_sound` | `Shift+S` | Toggle the pick sound | everywhere |
| `resource.new` | `c` | Create a new record | index, show |
| `resource.actions` | `a` | Open the actions menu | index, show, edit, focused index row |
| `resource.go_to_index` | `i` | Go back to the index | show, edit |
| `record.edit` | `e` | Edit the record | show, focused index row |
| `record.delete` | `d` | Delete the record | show, focused index row |
| `index.focus_search` | `/` | Focus the resource search | index |
| `index.next_row` | `j` | Focus the table and move to the next row | index |
| `index.previous_row` | `k` | Focus the table and move to the previous row | index |
| `index.view_table` | `v t` | Switch to table view | index |
| `index.view_grid` | `v g` | Switch to grid view | index |
| `index.view_map` | `v m` | Switch to map view | index |

`resource.new` also drives the create buttons on the Avo AI chats page and the kanban board.

### Add-ons

An add-on's IDs start with its gem name minus `avo-`: `avo-advanced_search` registers `advanced_search.*`.

| ID | Default | Action | Add-on |
| --- | --- | --- | --- |
| `advanced_search.open` | `Mod+k` | Focus the global search | [Advanced search](./search.html) |
| `ai.toggle_assistant` | `Mod+j` | Open the assistant. Fires from inside fields too | [Avo AI](./ai.html) |

### Fixed keys

These keys can't be rebound or used in `bindings`:

| Keys | Action |
| --- | --- |
| `Escape` | Close the modal, cancel the action, unfocus the field |
| `Mod+Enter` | Submit the form or modal |

Navigation keys inside a widget (the arrows, `Enter` and `Space` in tables, menus, the lightbox and editors) aren't shortcuts and aren't configurable either.

## Plugin shortcuts

Plugins register their shortcuts on the object `Avo.plugin_manager.register` returns, inside the plugin's `avo_boot` hook. The ID's namespace comes from the gem name, so `avo-dynamic_filters` gets `dynamic_filters.*`.

```ruby
ActiveSupport.on_load(:avo_boot) do
  Avo.plugin_manager.register("avo-dynamic_filters")
    .register_hotkey(:open, default: "f", label: "Open filters", section: "Index view", scopes: [:index])
end
```

Render the bound key with `Avo::Hotkeys.key_for("dynamic_filters.open")` in `data-hotkey`, or match it in a keydown listener with `window.Avo.hotkeys.matches(event, "dynamic_filters.open")`.

<Option name="`register_hotkey`">

Adds a shortcut to the registry, the `bindings` validation and the <kbd>?</kbd> modal.

- **Type:** method on `Avo::Plugin`, returns the plugin so calls chain
- **Arguments:**
  - `action` (`Symbol`) — the part of the ID after the namespace.
  - `default:` (`String`) — the default key, in the [hotkey syntax](#hotkey-syntax).
  - `label:` (`String`) — the row text in the <kbd>?</kbd> modal.
  - `section:` (`String`) — the modal section to list it under. A section core doesn't have is added at the end.
  - `scopes:` (`Array` of `:global`, `:index`, `:show`, `:edit`) — the pages it fires on, used to detect conflicts. Default `[:global]`.
- **Validation:** raises `ArgumentError` when the namespace equals a core namespace (`record`, `index`, `navigation`...).

</Option>
