---
license: community
outline: [2, 3]
---

# Asset manager

In your plugins or custom content you might want to add a new stylesheet or javascript file to be loaded inside Avo.

The asset manager adds them to the `<head>` element of Avo's layout file, and is meant for **library code such as a plugin**. If you're adding assets from your own app, use the asset pipeline instead — see [Asset handling](./asset-handling.html).

## Add a stylesheet file

Use `Avo.asset_manager.add_stylesheet PATH`

Example:

```ruby
Avo.asset_manager.add_stylesheet "/public/magic_file.css"
Avo.asset_manager.add_stylesheet Avo::Engine.root.join("app", "assets", "stylesheets", "magic_file.css")
```

## Add a javascript file

Use `Avo.asset_manager.add_javascript PATH`

Example:

```ruby
Avo.asset_manager.add_javascript "/public/magic_file.js"
Avo.asset_manager.add_javascript Avo::Engine.root.join("app", "javascripts", "magic_file.js")
```

## Register a Stimulus controller

Use `Avo.asset_manager.register_stimulus_controller NAME, CONTROLLER` to register a Stimulus controller against Avo's Stimulus instance, so plugin or custom controllers are available on every Avo screen.

Example:

```ruby
Avo.asset_manager.register_stimulus_controller "magic-controller", MagicController
```
