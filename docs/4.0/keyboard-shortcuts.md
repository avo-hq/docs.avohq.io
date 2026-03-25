---
outline: [2, 3]
---

# Keyboard Shortcuts

Avo ships with a built-in keyboard shortcut system that lets users navigate and operate the admin panel without touching the mouse. Press <kbd>?</kbd> at any time to open the shortcuts reference modal.

## Library

Avo uses [**@github/hotkey**](https://github.com/github/hotkey) under the hood — the same library that powers GitHub's own keyboard shortcuts. It handles multi-key sequences (e.g. `r r r`), modifier chords (e.g. `Mod+Enter`), and fires a `hotkey-fire` DOM event that Avo listens to before triggering the bound element's click.

Hotkeys are attached declaratively via `data-hotkey` attributes on HTML elements:

```html
<a href="/avo/posts/new" data-hotkey="c">New post</a>
```

For alternatives (Mac vs. non-Mac), space-separate the variants:

```html
<button data-hotkey="Meta+Enter Control+Enter">Save</button>
```

The library is initialised once on page load and re-applied on every `turbo:load` and `turbo:frame-render` event so shortcuts survive Turbo navigations.

## Global shortcuts

These shortcuts are always available, regardless of the current page.

| Keys                                                         | Action                                      |
| ------------------------------------------------------------ | ------------------------------------------- |
| <kbd>?</kbd>                                                 | Open/close the keyboard shortcuts modal     |
| <kbd>Cmd</kbd>+<kbd>K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd>   | Focus the global search                     |
| <kbd>Cmd</kbd>+<kbd>\\</kbd> / <kbd>Ctrl</kbd>+<kbd>\\</kbd> | Toggle the sidebar                          |
| <kbd>r</kbd> <kbd>r</kbd> <kbd>r</kbd>                       | Reload the page (preserves scroll position) |
| <kbd>Esc</kbd>                                               | Close modal / unfocus field                 |

## Page-level shortcuts

### Index view

| Keys                        | Action                          |
| --------------------------- | ------------------------------- |
| <kbd>/</kbd>                | Focus the resource search input |
| <kbd>C</kbd>                | Create a new record             |
| <kbd>A</kbd>                | Open the actions menu           |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Navigate table rows             |
| <kbd>↵</kbd>                | Open the focused row            |

### Show view

| Keys         | Action            |
| ------------ | ----------------- |
| <kbd>B</kbd> | Go back           |
| <kbd>E</kbd> | Edit the record   |
| <kbd>D</kbd> | Delete the record |

### Edit view

| Keys                                                       | Action                    |
| ---------------------------------------------------------- | ------------------------- |
| <kbd>Cmd</kbd>+<kbd>↵</kbd> / <kbd>Ctrl</kbd>+<kbd>↵</kbd> | Save / submit the form    |
| <kbd>Esc</kbd>                                             | Unfocus the current field |
| <kbd>B</kbd>                                               | Go back                   |

### Action modal

| Keys                                                       | Action                            |
| ---------------------------------------------------------- | --------------------------------- |
| <kbd>Cmd</kbd>+<kbd>↵</kbd> / <kbd>Ctrl</kbd>+<kbd>↵</kbd> | Run the action                    |
| <kbd>Esc</kbd>                                             | Cancel / close the modal          |
| <kbd>↑</kbd> / <kbd>↓</kbd>                                | Navigate options inside the modal |

## Some shortcuts are hidden in association panels

When a resource is rendered **inside an association panel** (i.e. as a `has_many`, `has_one`, or similar relation on another record's show page), certain shortcuts are intentionally suppressed:

- **Create** (<kbd>C</kbd>) — hidden because the index panel is embedded; hitting <kbd>C</kbd> on a show page that already has its own create shortcut would be ambiguous. Also the user might have multiple create shortcuts for different has_many associations.
- **Actions** (<kbd>A</kbd>) — hidden for the same reason.
- **Edit** (<kbd>E</kbd>) and **Delete** (<kbd>D</kbd>) — hidden because these controls belong to the _show_ view of a top-level resource, not to an association row.

Think of it as "I am nested" — and nested views never receive conflicting hotkeys.

## Guard: no shortcuts while typing

All shortcut handlers check that the keyboard event did not originate from a focusable input element:

```js
const TYPING_SELECTOR = "input, textarea, select, [contenteditable]";

if (event.target instanceof Element && event.target.closest(TYPING_SELECTOR)) {
  return;
}
```

This means users can type freely in search boxes, filters, and form fields without triggering shortcuts.

## Sidebar menu hotkeys

The `avo-menu` DSL supports a `hotkey:` option on any item type, letting users jump directly to a sidebar section from anywhere in the admin panel.

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

The hotkey string follows `@github/hotkey` syntax — use space-separated keys for sequences.

For `resource` items, the hotkey can also be set on the resource class itself:

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.hotkey = "g p"
end
```

The menu item automatically renders a `<kbd>` badge next to the label and registers the binding.

## Visual feedback

When a hotkey fires on a button or link, Avo adds a `kbd--called` CSS class to the `<kbd>` badge for one animation frame — long enough to paint a "cold press" visual — before triggering the navigation. This gives users tactile confirmation that the shortcut was recognised.

The class is cleaned up on the next `turbo:load` event.
