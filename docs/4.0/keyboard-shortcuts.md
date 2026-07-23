---
license: community
outline: [2, 3]
---

# Keyboard Shortcuts

Avo ships with a built-in keyboard shortcut system that lets users navigate and operate the admin panel without touching the mouse. Press <kbd>?</kbd> at any time to open the shortcuts reference modal, which lists every shortcut available on the current page.

With no configuration, all shortcuts are enabled and each bound button or link renders a small badge — for example <kbd>C</kbd> on a *Create* button — hinting at its shortcut. Shortcuts never fire while you're typing in an input, textarea, select, or contenteditable field, so search boxes and form fields behave normally.

## Configure keyboard shortcuts

Keyboard shortcuts are controlled through `config.hotkeys`:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.hotkeys = {
    enabled: true,          # master switch for all keyboard shortcuts
    show_key_badges: true   # show the inline <kbd> badges next to buttons and links
  }
end
```

Set `enabled: false` to turn the whole system off — no shortcuts fire and the key badges disappear. Set `show_key_badges: false` to keep the shortcuts working but hide the inline badges from the UI.

Both default to `true`, so you only need to set the keys you want to change.

## Global shortcuts

These shortcuts are available from anywhere in the admin panel.

| Keys                                                        | Action                             |
| ----------------------------------------------------------- | ---------------------------------- |
| <kbd>?</kbd>                                                | Open/close the keyboard shortcuts modal |
| <kbd>Cmd</kbd>+<kbd>K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd>  | Focus the global search            |
| <kbd>Shift</kbd>+<kbd>\\</kbd>                              | Toggle the sidebar                 |
| <kbd>Shift</kbd>+<kbd>T</kbd>                               | Focus the page content (then <kbd>Tab</kbd> into it) |
| <kbd>Shift</kbd>+<kbd>K</kbd>                               | Toggle the shortcut key badges     |
| <kbd>B</kbd>                                                | Go back                            |
| <kbd>r</kbd> <kbd>r</kbd> <kbd>r</kbd>                      | Reload the page (preserves scroll position) |
| <kbd>↑</kbd> / <kbd>↓</kbd>                                 | Navigate options inside a modal    |
| <kbd>Esc</kbd>                                              | Close modal / unfocus field        |

<kbd>Shift</kbd>+<kbd>K</kbd> hides or shows the inline badges for the current browser (the choice is remembered). It only works when `show_key_badges` isn't set to `false`.

## Appearance shortcuts

Cycle the [appearance](./appearance.html) settings from any page.

| Keys                         | Action                                       |
| ---------------------------- | -------------------------------------------- |
| <kbd>Shift</kbd>+<kbd>M</kbd> | Cycle the color scheme (auto / light / dark) |
| <kbd>Shift</kbd>+<kbd>N</kbd> | Cycle the neutral theme                      |
| <kbd>Shift</kbd>+<kbd>A</kbd> | Cycle the accent color                       |

## Index view

| Keys                       | Action                                       |
| -------------------------- | -------------------------------------------- |
| <kbd>/</kbd>               | Focus the resource search input              |
| <kbd>C</kbd>               | Create a new record                          |
| <kbd>A</kbd>               | Open the actions menu                        |
| <kbd>J</kbd> / <kbd>K</kbd> | Focus the table and move to the next / previous row |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Navigate rows (once the table is focused)    |
| <kbd>↵</kbd>               | Open the focused record                      |
| <kbd>Space</kbd>          | Select / deselect the row                    |
| <kbd>Esc</kbd>            | Clear row focus / deselect rows              |
| <kbd>V</kbd> <kbd>T</kbd> | Switch to table view                         |
| <kbd>V</kbd> <kbd>G</kbd> | Switch to grid view                          |
| <kbd>V</kbd> <kbd>M</kbd> | Switch to map view                           |

Use <kbd>J</kbd> / <kbd>K</kbd> to jump into the table from anywhere on the page; the arrow keys take over once a row is focused.

## Show view

| Keys         | Action            |
| ------------ | ----------------- |
| <kbd>E</kbd> | Edit the record   |
| <kbd>D</kbd> | Delete the record |
| <kbd>A</kbd> | Open the actions menu |
| <kbd>I</kbd> | Go back to the index |

## Edit view

| Keys                                                       | Action                    |
| ---------------------------------------------------------- | ------------------------- |
| <kbd>Cmd</kbd>+<kbd>↵</kbd> / <kbd>Ctrl</kbd>+<kbd>↵</kbd> | Submit the form           |
| <kbd>I</kbd>                                               | Go back to the index      |
| <kbd>Esc</kbd>                                             | Unfocus the current field |

## Action modal

| Keys                                                       | Action         |
| ---------------------------------------------------------- | -------------- |
| <kbd>Cmd</kbd>+<kbd>↵</kbd> / <kbd>Ctrl</kbd>+<kbd>↵</kbd> | Run the action |
| <kbd>Esc</kbd>                                             | Cancel / close the modal |

## Assign hotkeys to the sidebar menu

The [`avo-menu`](./menu-editor.html) DSL supports a `hotkey:` option on any item type, letting users jump straight to a sidebar section from anywhere in the admin panel.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Content", icon: "tabler/outline/files" do
      resource :post, hotkey: "g p"
      resource :category, hotkey: "g c"
      link "Analytics", path: "/avo/analytics", hotkey: "g a"
    end
  }
end
```

The menu item automatically renders a key badge next to its label and registers the binding. Hotkey strings use [`@github/hotkey`](https://github.com/github/hotkey) syntax — space-separate keys for a sequence like <kbd>g</kbd> <kbd>p</kbd>.

For `resource` items you can set the hotkey on the resource class instead, and it applies wherever that resource appears in the menu:

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.hotkey = "g p"
end
```

## Add your own shortcuts

Avo binds shortcuts declaratively through `data-hotkey` attributes, so any button or link you render in a custom tool or partial can opt in:

```html
<a href="/avo/posts/new" data-hotkey="c">New post</a>
```

To offer platform alternatives (Mac vs. non-Mac), space-separate the variants:

```html
<button data-hotkey="Meta+Enter Control+Enter">Save</button>
```

Bindings are re-applied on every Turbo navigation, so they survive `turbo:load` and `turbo:frame-render` without extra work.

## Shortcuts hidden inside association panels

When a resource is rendered **inside an association panel** — as a `has_many`, `has_one`, or similar relation on another record's show page — some shortcuts are intentionally suppressed to avoid ambiguity:

- **Create** (<kbd>C</kbd>) and **Actions** (<kbd>A</kbd>) — hidden because the show page may host several association panels, so a single <kbd>C</kbd> or <kbd>A</kbd> can't know which one to target.
- **Edit** (<kbd>E</kbd>) and **Delete** (<kbd>D</kbd>) — hidden because they belong to the show view of the top-level record, not to an association row.
