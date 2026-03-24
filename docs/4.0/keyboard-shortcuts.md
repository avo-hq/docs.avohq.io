# Keyboard Shortcuts

Avo ships with a built-in keyboard shortcut system that lets users navigate and perform common actions without reaching for the mouse. Shortcuts work everywhere except when the cursor is inside a text input, textarea, select, or any contenteditable element.

Press <kbd>?</kbd> at any time to open the shortcuts reference panel.

## Built-in shortcuts

### Navigation

| Action                                          | Shortcut                                              |
| ----------------------------------------------- | :---------------------------------------------------: |
| Show keyboard shortcuts                         | <kbd>?</kbd>                                          |
| Focus resource search                           | <kbd>⌘</kbd> + <kbd>K</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd>         |
| Toggle sidebar                                  | <kbd>⌘</kbd> + <kbd>\\</kbd> or <kbd>Ctrl</kbd> + <kbd>\\</kbd>        |
| Close dialog / shortcuts panel                  | <kbd>Esc</kbd>                                        |
| Navigate options in the confirmation dialog     | <kbd>↑</kbd> / <kbd>↓</kbd>                           |
| Go back                                         | <kbd>B</kbd>                                          |

### Records

| Action                              | Shortcut                                              |
| ----------------------------------- | :---------------------------------------------------: |
| Save form                           | <kbd>⌘</kbd> + <kbd>↵</kbd> or <kbd>Ctrl</kbd> + <kbd>↵</kbd>         |
| Create new record (index view)      | <kbd>C</kbd>                                          |
| Edit record (show view)             | <kbd>E</kbd>                                          |
| Delete record (show view)           | <kbd>D</kbd>                                          |

## Resource navigation hotkey

You can assign a single-letter hotkey to a resource so that pressing that key from anywhere in Avo jumps directly to that resource's index page. The key is displayed as a badge in the sidebar next to the resource link.

```ruby{2}
class Avo::Resources::Project < Avo::BaseResource
  self.hotkey = "p"

  self.title = :name
end
```

When a hotkey is set, the sidebar link for that resource renders a <kbd>P</kbd> badge and the keydown listener is wired automatically.

:::info
Only the first character is used — if you pass `"pr"`, only `"p"` will be bound and displayed. Avoid letters already bound to built-in shortcuts: `b`, `c`, `d`, `e`.
:::

## Menu item hotkeys

When using the [menu editor](./menu-editor), you can assign a `hotkey:` to any sidebar item that renders as a link. `section` and `group` do not support hotkeys because they render as containers, not links.

### `resource`

```ruby
resource :projects, hotkey: "p"
```

### `link` / `link_to`

```ruby
link_to "External tool", path: "https://example.com", hotkey: "x"

resource :projects, hotkey: "p" do
  link "New project", path: "/admin/resources/projects/new", hotkey: "n"
end
```

### `dashboard`

```ruby
dashboard :sales, hotkey: "s"
```

### Resource item override

If both the menu item and the resource class define a hotkey, the **menu item hotkey takes precedence**:

```ruby
# Resource class defines "p"
class Avo::Resources::Project < Avo::BaseResource
  self.hotkey = "p"
end

# Menu item overrides with "j" — menu item wins
resource :projects, hotkey: "j"
```
