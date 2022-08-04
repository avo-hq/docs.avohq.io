# Fields

[[toc]]

## Badge

The `Badge` field is used to display an easily recognizable status of a record in the database.

<img :src="$withBase('/assets/img/fields/badge.jpg')" alt="Badge field" class="border mb-4" />

```ruby
badge :stage, options: { info: [:discovery, :idea], success: :done, warning: 'on hold', danger: :cancelled } # The mapping of custom values to badge values.
```

By default, the badge field supports four values: `info` (blue), `success` (green), `danger` (red) and `warning` (yellow), having the possibility to override and or add values by providing `options` parameter.

The `options` parameter is a `Hash` the has the state as the `key` and your agreed values as `value`. The `value` param can be a symbol, string, or array of symbols or strings.

The `Badge` field is intended to be displayed only on **Index** and **Show** views. In order to update the value shown by badge field you need to use another field like [Text](#text) or [Select](#select), in combination with `hide_on: index` and `hide_on: show`.

## Boolean

<img :src="$withBase('/assets/img/fields/boolean.jpg')" alt="Boolean field" class="border mb-4" />

The `Boolean` field renders a `input[type="checkbox"]` and supports the following options.

```ruby
boolean :is_published, name: 'Published', true_value: 'yes', false_value: 'no',
```

You might not use `true`/`false` or `1`/`0` to store the value in the database. By using `true_value` and `false_value`, you may declare different values for that database field like `yes`/`no`.

## Boolean Group

<img :src="$withBase('/assets/img/fields/boolean-group.jpg')" alt="Boolean group field" class="border mb-4" />

The `BooleanGroup` is used to update a `Hash` with `string` keys and `boolean` values in the database.

```ruby
# Example boolean group hash
{
  admin: true,
  manager: true,
  creator: true,
}
```

```ruby
boolean_group :roles, name: 'User roles'
```

## Code

<img :src="$withBase('/assets/img/fields/code.jpg')" alt="Code field" class="border mb-4" />

The `Code` field generates a code editor using [vue-codemirror](https://github.surmon.me/vue-codemirror/) package. This field is hidden on **Index** view.

```ruby
code :custom_css, theme: 'dracula', language: 'css'
```

### Customize Theme

You can customize the theme of the `Code` field using the theme method. It defaults to `material-darker`, but you can choose from `material-darker`, `eclipse`, `dracula`. You can preview the themes here: [codemirror-themes](https://codemirror.net/demo/theme.html).

### Customize Syntax Highlighting

You can customize the programming language highlighting of the `Code` field using the language method. It defaults to `javascript` but you can choose from `css`, `dockerfile`, `htmlmixed`, `javascript`, `markdown`, `nginx`, `php`, `ruby`, `sass`, `shell`, `sql`, `vue` or `xml`.

## Country

`Country` field generates a [Select](/#sellect) field on **Edit** view that includes all [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) countries. The value stored in the database is going to be the country code, and the value displayed in Avo is going to be the name of the country.

You can easily choose to display the `name` of the countries in **Index** and **Show** views by declaring `display_name` to `true`.

```ruby
country :country, display_name: true
```

## Currency

The `Currency` field generates a [Number](/#number) field that is automatically formatted using [Vue Currency Input](https://dm4t2.github.io/vue-currency-input/) to look like a currency. You may use `currency` and `locale` to specify the sign and format of the currency field.

Be aware that `currency` defaults to `USD`, and `locale` defaults to `en`.

```ruby
currency :salary, currency: 'EUR', locale: 'de-DE'
```

## Date

The `Date` field may be used to display date values.

The **Edit**** view of the picker is using [flatpickr](https://flatpickr.js.org). You may use the [formatting tokens](https://flatpickr.js.org/formatting/) to format the **Edit** view element and the [moment.js tokens](https://momentjs.com/docs/#/displaying/format/) to display the **Index** and **Show** views element.

You may also pass the `first_day_of_week` attribute to have that reflected on the generated calendar component. 1 is Monday (default), and 7 is Sunday.

```ruby
date :birthday, first_day_of_week: 1, picker_format: 'F J Y', format: 'MMMM Do YYYY', placeholder: 'Feb 24th 1955', required: true
```

If you'd like to show the time relative to the present (4 months ago, in 3 years, etc.) use the `relative: true` option.


```ruby
date :valid_until, relative: true
```

## DateTime

<img :src="$withBase('/assets/img/fields/date-time.jpg')" alt="DateTime field" class="border mb-4" />

The `DateTime` field is similar to the Date field with two new attributes. `time_24hr` tells the component to use 24 hours format and `timezone` to tell it in what timezone to display the time.

```ruby
datetime :created_at, name: 'User joined', first_day_of_week: 1, picker_format: 'Y-m-d', format: 'YYYY-MM-DD', time_24hr: true, timezone: 'PST'
```

## File

The `File` field may be used to attach files using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html). Avo will respect your application's Active Storage settings. You may use whichever supported [disk services](https://edgeguides.rubyonrails.org/active_storage_overview.html#disk-service).

```ruby
file :avatar, is_image: true
```

The `is_image` option renders the file as an image instead of rendering the file name.
<!-- The `is_avatar` option is used to show the image next to the model searches. It also sets the `is_image` to `true`. -->

## Files

The `Files` field is similar to `File` and enables you to upload multiple files at once using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html).

```ruby
files :documents
```

## Gravatar

The `Gravatar` field should be linked to an email field from the database, displaying the avatar image assigned to that email address in the [Gravatar](https://en.gravatar.com/site/implement/images/) database. By default, it uses the `email` field, but if the email address is stored in another column, you can specify that column.

```ruby
gravatar :email, rounded: false, size: 60, default_url: 'some image url'
```

On **Index**, by default, the image is `rounded` and has size of `40 px`, but it can be changed by setting `rounded` to `false` and by specifying the `size` (in pixels) in field declaration.

On **Show**, the image is always `squared` and the size is `responsive`.

You can customize the image shown when gravatar is not found by changing the `default_url` attribute to a custom image URL.

## Heading

<img :src="$withBase('/assets/img/fields/heading.jpg')" alt="Heading field" class="border mb-4" />

The `Heading` field is used to display a banner between fields, such as a separator for big lists or a header for different sections.

`Heading` is not assigned to any column in the database and only visible on **Edit** and **Create** views.

```ruby
heading 'Address fields'
```

The `as_html` option will render it as HTML.

```ruby
heading '<div class="underline text-gray-800 uppercase">Address fields</div>', as_html: true
```

## Hidden

You might have a scenario where you need a value to update a model. You may use the `Hidden` field to add the field to the form a hidden input but not render it on the page.

```ruby
hidden :group_id
```

## ID

The `id` field is used to show the record's id.

```ruby
id :id
```

This is a good field to add `as_link_to_resource` option to make it a shortcut to the resource **Show** page.

## KeyValue

<img :src="$withBase('/assets/img/fields/key-value.jpg')" alt="KeyValue field" class="border mb-4" />

The `KeyValue` field allows you to edit flat key-value pairs stored in `JSON` format in the database.

```ruby
key_value :meta
```

### Customizing the labels

You can easily customize the labels displayed in the UI by mentioning custom values in `key_label`, `value_label`, `action_text`, and `delete_text` properties when defining the field.

```ruby
key_value :meta, # The database field ID
  key_label: 'Meta key', # Custom value for key header. Defaults to 'Key'.
  value_label: 'Meta value', # Custom value for value header. Defaults to 'Value'.
  action_text: 'New item', # Custom value for button to add a row. Defaults to 'Add'.
  delete_text: 'Remove item' # Custom value for button to delete a row.. Defaults to 'Delete'.
```

### Enforce restrictions

You can enforce some restrictions by removing the ability to edit the field's key, by setting `disable_editing_keys` to `true`. Be aware that this option will also disable adding rows as well. You can separately remove the ability to add a new row by setting `disable_adding_rows` to `true`. Deletion of rows can be enforced by setting `disable_deleting_rows` to `true`.

```ruby
key_value :meta, # The database field ID
  disable_editing_keys: false, # Option to disable the ability to edit keys. Implies disabling to add rows. Defaults to false.
  disable_adding_rows: false, # Option to disable the ability to add rows. Defaults to false.
  disable_deleting_rows: false # Option to disable the ability to delete rows. Defaults to false.
```

`KeyValue` is hidden on **Index** view.

## Markdown

<img :src="$withBase('/assets/img/fields/markdown.jpg')" alt="Trix field" class="border mb-4" />

The `Markdown` field renders a [Markdown Editor](https://github.com/hinesboy/mavonEditor) and is associated to a text or textarea column in the database.
`Markdown` field converts text within the editor in raw Markdown text and stores it back to database.

Markdown field is hidden from **Index** view. By default, the Markdown field is not directly shown to the user on the **Show** view, instead being hidden under a
'Show Content' link, that triggers the visibility of the content. You can set Markdown to always display the content by setting `always_show` to **true**.

```ruby
markdown :description,
  always_show: true
```

## Number

The `Number` field renders a `input[type="number"]` element and has the regular `min`, `max`, and `step` options.

```ruby
number :age, min: 0, max: 120, step: 5
```

## Password

The `Password` field renders a `input[type="password"]` element for that field.

`Password` field is by default enforced to be shown only on `:forms` (`:create` and `:edit`). Because of security reasons, this type of field allows
only a few additional options for view visibility: `only_on`, `hide_on` methods and `:create`, `:edit` options for each method.

```ruby
password :password placeholder: 'secret',
```

## Select

The `Select` field renders a `select` field.

```ruby
select :type,
  options: { large: 'Large container', medium: 'Medium container', small: 'Tiny container' },
  display_with_value: true,
  placeholder: 'Choose the size of the container.'
```
<!-- #  -->

You may add options using the `options` option, which is a `Hash` with the id (database value) as the `key` and the label as `value`.

On **Index**, **Show** and **Edit** views you may want to display the values and not the labels of the options. You may change that by setting `display_value` to true.

The Select field also supports Active Record hash [enums](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html). For that to work you only need to remove `options` and add `enum` instead.

```ruby
class Project < ApplicationRecord
  enum type: { 'Large container': 'large', 'Medium container': 'medium', 'Tiny container': 'small' }
end

select :type,
  enum: ::Project.types
  display_with_value: true,
  placeholder: 'Choose the size of the container.'
```

This tells Avo to treat the value and the options a bit different because of the way Rails casts the attribute with the value from the enum.

## Status

The `Status` field is used to visually display the status of a column, supporting the following options:

<img :src="$withBase('/assets/img/fields/status.jpg')" alt="Status field" class="border mb-4" />

```ruby
status :progress, failed_when: ['closed', 'rejected', 'failed'], loading_when: ['loading', 'running', 'waiting', 'in progress']
```

You may customize the `failed` and `loading` states by using `failed_when` and `loading_when`. `failed_when` defaults to `failed`, while `loading_when` defaults to both `waiting` and `running`.

## Text

The `Text` field renders a regular `text` `input`.

```ruby
text :title
```

You may customize it with as many options as you need.

```ruby
text :title, # The database field ID
  name: 'Post title', # The name you want displayed
  required: true, # Display it as required
  readonly: true, # Display it disabled
  placeholder: 'My shiny new post', # Update the placeholder text
  format_using: -> (value) { value.truncate 3 } # Format the output
```

## Textarea

The `Textarea` field renders a `textarea` element and takes has the `rows` option that controls how many rows it should render.

```ruby
textarea :body, rows: 5
```

## Trix

<img :src="$withBase('/assets/img/fields/trix.jpg')" alt="Trix field" class="border mb-4" />

The `Trix` field renders a [WYSIWYG Trix Editor](https://trix-editor.org/) and is associated to a text or textarea column in the database.
`Trix` field converts text within the editor in HTML and stores it back to database.

Trix field is hidden from **Index** view. By default, the Trix field is not directly shown to the user on the **Show** view, instead being hidden under a
'Show Content' link, that triggers the visibility of the content. You can set Trix to always display the content by setting `always_show` to **true**.

```ruby
trix :body,
  always_show: true
```