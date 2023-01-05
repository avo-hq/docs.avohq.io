# Asset manager

In your plugins or custom content you might want to add a new stylesheet or javascript file to be loaded inside Avo.

You can manually add them to the `_head.html.erb` or `_pre_head.html.erb` files or you can use the `AssetManager`.

Next, the asset manager will add them to the `<head>` element of Avo's layout file.

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
