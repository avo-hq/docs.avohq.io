# Eject

If you want to change one of Avo's built-in views, you can eject it, update it and use it in your admin panel.

:::warning
Once ejected, the views will not receive updates on new Avo releases. You must maintain them yourself.
</Option>

<Option name="`--partial`">
Utilize the `--partial` option when you intend to extract certain partial

## Prepared templates

We prepared a few templates to make it easier for you.

`bin/rails generate avo:eject --partial :logo` will eject the `_logo.html.erb` partial.

```
▶ bin/rails generate avo:eject --partial :logo
Running via Spring preloader in process 20947
      create  app/views/avo/logo/_logo.html.erb
```

A list of prepared templates:

- `:logo` ➡️ &nbsp; `app/views/avo/partials/_logo.html.erb`
- `:head` ➡️ &nbsp; `app/views/avo/partials/_head.html.erb`
- `:header` ➡️ &nbsp; `app/views/avo/partials/_header.html.erb`
- `:footer` ➡️ &nbsp; `app/views/avo/partials/_footer.html.erb`
- `:scripts` ➡️ &nbsp; `app/views/avo/partials/_scripts.html.erb`
- `:sidebar_extra` ➡️ &nbsp; `app/views/avo/partials/_sidebar_extra.html.erb`

### Logo

In the `app/views/avo/partials` directory, you will find the `_logo.html.erb` partial, which you may customize however you want. It will be displayed in place of Avo's logo.

### Header

The `_header.html.erb` partial enables you to customize the name and link of your app.

### Footer

The `_footer.html.erb` partial enables you to customize the footer of your admin.

### Scripts

The `_scripts.html.erb` partial enables you to insert scripts in the footer of your admin.

## Eject any template

You can eject any partial from Avo using the partial path.

```
▶ bin/rails generate avo:eject --partial app/views/layouts/avo/application.html.erb
      create  app/views/layouts/avo/application.html.erb
```
</Option>

<Option name="`--component`">
You can eject any view component from Avo using the `--component` option.

```bash
$ bin/rails generate avo:eject --component Avo::Index::TableRowComponent
```
or

```bash
$ bin/rails generate avo:eject --component avo/index/table_row_component
```

Have the same output:
```bash
create  app/components/avo/index/table_row_component.rb
create  app/components/avo/index/table_row_component.html.erb
```
</Option>

<Option name="`--field-components`">
With `--field-components` option is easy to eject, one or multiple field components. Notice that without using the `--scope`, the ejected components will override the original components for that field everywhere on the project.

Check the `--scope` and the [`components`](./field-options.html#components) field options for more details on how to override the components only on specific parts of the project.

```bash
$ rails g avo:eject --field-components text
      create  app/components/avo/fields/text_field
      create  app/components/avo/fields/text_field/edit_component.html.erb
      create  app/components/avo/fields/text_field/edit_component.rb
      create  app/components/avo/fields/text_field/index_component.html.erb
      create  app/components/avo/fields/text_field/index_component.rb
      create  app/components/avo/fields/text_field/show_component.html.erb
      create  app/components/avo/fields/text_field/show_component.rb
```

Let's say you want to override only the edit component of the `TextField`, that can be achieved with this simple command.

```bash
$ rails g avo:eject --field-components text --view edit
      create  app/components/avo/fields/text_field/edit_component.rb
      create  app/components/avo/fields/text_field/edit_component.html.erb
```

<Option name="`--view`">
While utilizing the `--field-components` option, you can selectively extract a specific view using the `--view` parameter, as demonstrated in the example above. If this option is omitted, all components of the field will be ejected.
</Option>


<Option name="`--scope`">
When you opt to eject a view component that exists under `Avo::Views` or a field component under `Avo::Fields` namespace, for example the `Avo::Views::ResourceIndexComponent` or `Avo::Fields::TextField::ShowComponent` you can employ the `--scope` option to specify the namespace that should be adopted by the ejected component, extending from `Avo::Views` / `Avo::Fields`.

```bash
$ rails g avo:eject --component Avo::Views::ResourceIndexComponent --scope admins
      create  app/components/avo/views/admins/resource_index_component.rb
      create  app/components/avo/views/admins/resource_index_component.html.erb

$ rails g avo:eject --field-components text --view show --scope admins
      create  app/components/avo/fields/admins/text_field/show_component.rb
      create  app/components/avo/fields/admins/text_field/show_component.html.erb
```

The ejected file have the same code that original `Avo::Views::ResourceIndexComponent` or `Avo::Fields::TextField::ShowComponent` but you can notice that the class name and the directory has changed

```ruby
class Avo::Views::Admins::ResourceIndexComponent < Avo::ResourceComponent

class Avo::Fields::Admins::TextField::ShowComponent < Avo::Fields::ShowComponent
```

:::info Scopes transformation
`--scope users_admins` -> `Avo::Views::UsersAdmins::ResourceIndexComponent`<br>
`--scope users/admins` -> `Avo::Views::Users::Admins::ResourceIndexComponent`

</Option>
