---
license: community
outline: [2, 3]
---

# Eject views

Avo renders its UI from partials, ViewComponents, and controllers that live inside the gem. When configuration isn't enough, run `bin/rails generate avo:eject` to copy any of them into your application and customize them however you need — your copy takes precedence over Avo's.

:::warning You take over maintenance
Ejected files stop receiving updates on new Avo releases; keeping them in sync becomes your responsibility. That's why the generator asks you to confirm every ejection.
:::

## Eject a partial

Use the `--partial` option with the partial's path inside the gem to copy it into your app at the same path:

```bash
bin/rails generate avo:eject --partial app/views/layouts/avo/application.html.erb
      create  app/views/layouts/avo/application.html.erb
```

### Prepared templates

The most commonly customized partials have a shorthand — pass the template name as a symbol:

```bash
bin/rails generate avo:eject --partial :logo
      create  app/views/avo/partials/_logo.html.erb
```

| Template | Ejects to `app/views/avo/partials/` | Rendered |
|:---------|:------------------------------------|:---------|
| `:logo` | `_logo.html.erb` | In place of Avo's logo in the navbar |
| `:header` | `_header.html.erb` | The app name and link in the navbar |
| `:pre_head` | `_pre_head.html.erb` | Inside `<head>`, before Avo's assets |
| `:head` | `_head.html.erb` | Inside `<head>`, after Avo's assets — good for style overrides |
| `:scripts` | `_scripts.html.erb` | Before `</body>` — good for extra scripts |
| `:sidebar_extra` | `_sidebar_extra.html.erb` | Extra content after the sidebar menu |
| `:profile_menu_extra` | `_profile_menu_extra.html.erb` | Extra items in the profile menu |

## Eject a component

Use the `--component` option to eject any of Avo's ViewComponents. It accepts the class name or the underscored path — these two commands are equivalent:

```bash
bin/rails generate avo:eject --component Avo::Index::TableRowComponent
bin/rails generate avo:eject --component avo/index/table_row_component
      create  app/components/avo/index/table_row_component.rb
      create  app/components/avo/index/table_row_component.html.erb
```

Both the `.rb` and `.html.erb` files are copied. Components are ejected into the directory set by [`config.view_component_path`](./customization.html#custom-view_component-path) (`app/components` by default).

## Eject field components

Use the `--field-components` option with a field name to eject all of that field's components at once:

```bash
bin/rails generate avo:eject --field-components text
      create  app/components/avo/fields/text_field
      create  app/components/avo/fields/text_field/edit_component.html.erb
      create  app/components/avo/fields/text_field/edit_component.rb
      create  app/components/avo/fields/text_field/index_component.html.erb
      create  app/components/avo/fields/text_field/index_component.rb
      create  app/components/avo/fields/text_field/show_component.html.erb
      create  app/components/avo/fields/text_field/show_component.rb
```

If you only want one of them, add the `--view` option with `edit`, `index`, or `show`:

```bash
bin/rails generate avo:eject --field-components text --view edit
      create  app/components/avo/fields/text_field/edit_component.rb
      create  app/components/avo/fields/text_field/edit_component.html.erb
```

:::warning
Without `--scope`, the ejected components replace the originals for that field everywhere in your project. To override components only in specific places, combine `--scope` with the [`components`](./field-options-api.html#components) field option.
:::

## Scope ejected components

When ejecting a component under the `Avo::Views` or `Avo::Fields` namespace, add the `--scope` option to nest your copy in its own namespace instead of replacing the original everywhere:

```bash
bin/rails generate avo:eject --component Avo::Views::ResourceIndexComponent --scope admins
      create  app/components/avo/views/admins/resource_index_component.rb
      create  app/components/avo/views/admins/resource_index_component.html.erb

bin/rails generate avo:eject --field-components text --view show --scope admins
      create  app/components/avo/fields/admins/text_field/show_component.rb
      create  app/components/avo/fields/admins/text_field/show_component.html.erb
```

The ejected files keep the original code, but the class is renamed to include the scope:

```ruby
class Avo::Views::Admins::ResourceIndexComponent < Avo::ResourceComponent

class Avo::Fields::Admins::TextField::ShowComponent < Avo::Fields::ShowComponent
```

:::info Scope transformation
`--scope users_admins` → `Avo::Views::UsersAdmins::ResourceIndexComponent`<br>
`--scope users/admins` → `Avo::Views::Users::Admins::ResourceIndexComponent`
:::

Wire the scoped copy in wherever you need it — with the [`self.components`](./resources-api.html#self.components) resource option for view components, or the [`components`](./field-options-api.html#components) field option for field components. For a full walkthrough, see the [safely override resource components guide](./guides/safely-override-resource-components.html).

## Eject a controller

Use the `--controller` option to eject any of Avo's controllers:

```bash
bin/rails generate avo:eject --controller application_controller
      create  app/controllers/avo/application_controller.rb
```

The most common use case is ejecting the `application_controller`. It's an extendable layer that inherits from `Avo::BaseApplicationController`, where the core logic resides, and every resource controller inherits from it — so it's the place to add behavior that should apply to all of your Avo controllers without modifying Avo's base controllers.

## Options reference

| Option | Description |
|:-------|:------------|
| `--partial` | Partial to eject: a [prepared template](#prepared-templates) symbol or a path inside the gem |
| `--component` | ViewComponent to eject: class name or underscored path |
| `--field-components` | Field name whose components to eject |
| `--view` | With `--field-components`, limit to `edit`, `index`, or `show` |
| `--scope` | Namespace for the ejected `Avo::Views` / `Avo::Fields` component |
| `--controller` | Controller to eject, e.g. `application_controller` |
