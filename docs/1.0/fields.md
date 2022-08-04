# Fields

[[toc]]

## Badge

The `Badge` field is used to display an easily recognizable status of a record in the database.

<img :src="$withBase('/assets/img/fields/badge.jpg')" alt="Badge field" class="border mb-4" />

```ruby
field :stage, as: :badge, options: { info: [:discovery, :idea], success: :done, warning: 'on hold', danger: :cancelled } # The mapping of custom values to badge values.
```

By default, the badge field supports four value types: `info` (blue), `success` (green), `danger` (red) and `warning` (yellow). We can choose what database values are mapped to which type with the `options` parameter.

The `options` parameter is a `Hash` the has the state as the `key` and your configured values as `value`. The `value` param can be a symbol, string, or array of symbols or strings.

The `Badge` field is intended to be displayed only on **Index** and **Show** views. In order to update the value shown by badge field you need to use another field like [Text](#text) or [Select](#select), in combination with `hide_on: index` and `hide_on: show`.

Below is an example on how you can use two fields in that combination.

```ruby
field :stage, as: :select, hide_on: [:show, :index], options: { 'Discovery': :discovery, 'Idea': :idea, 'Done': :done, 'On hold': 'on hold', 'Cancelled': :cancelled }, placeholder: 'Choose the stage.'
field :stage, as: :badge, options: { info: [:discovery, :idea], success: :done, warning: 'on hold', danger: :cancelled }
```


## Boolean

The `Boolean` field renders a `input[type="checkbox"]` on **Form** views and a nice green check icon/red X icon on the **Show** and **Index** views.

<img :src="$withBase('/assets/img/fields/boolean.jpg')" alt="Boolean field" title="Boolean field on the Show view" class="border mb-4" />

```ruby
field :is_published, as: :boolean, name: 'Published', true_value: 'yes', false_value: 'no',
```

You might not use `true`/`false` or `1`/`0` to store the value in the database. By using `true_value` and `false_value`, you may declare different values for that database field like `yes`/`no`.

## Boolean Group

<img :src="$withBase('/assets/img/fields/boolean-group.jpg')" alt="Boolean group field" class="border mb-4" />

The `BooleanGroup` is used to update a `Hash` with `string` keys and `boolean` values in the database.

```ruby
field :roles, as: :boolean_group, name: 'User roles', options: { admin: 'Administrator', manager: 'Manager', writer: 'Writer' }
```

It's useful when you want have something like a roles hash in your database.

```ruby
# Example boolean group hash stored in the database
{
  admin: true,
  manager: true,
  creator: true,
}
```

## Code

<img :src="$withBase('/assets/img/fields/code.jpg')" alt="Code field" class="border mb-4" />

The `Code` field generates a code editor using [codemirror](https://codemirror.net/) package. This field is hidden on **Index** view.

```ruby
field :custom_css, as: :code, theme: 'dracula', language: 'css'
```

### Customize Theme

You can customize the theme of the `Code` field using the theme option. It defaults to `material-darker`, but you can choose from `material-darker`, `eclipse`, `dracula`. You can preview the themes here: [codemirror-themes](https://codemirror.net/demo/theme.html).

### Customize Syntax Highlighting

You can customize the programming language highlighting of the `Code` field using the language method. It defaults to `javascript` but you can choose from `css`, `dockerfile`, `htmlmixed`, `javascript`, `markdown`, `nginx`, `php`, `ruby`, `sass`, `shell`, `sql`, `vue` or `xml`.

## Country

`Country` field generates a [Select](#select) field on **Edit** view that includes all [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) countries. The value stored in the database is going to be the country code, and the value displayed in Avo is going to be the name of the country.

You can easily choose to display the `name` of the countries in **Index** and **Show** views by declaring `display_name` to `true`.

```ruby
field :country, as: :country, display_name: true
```

## Date

The `Date` field may be used to display date values.
For the **Index** and **Show** views you should use [ruby date format](https://apidock.com/ruby/DateTime/strftime) or [`Time::DATE_FORMATS`](https://api.rubyonrails.org/classes/Time.html#DATE_FORMATS) tokens.

The **Edit** view of the picker is using [flatpickr](https://flatpickr.js.org). You may use the [formatting tokens](https://flatpickr.js.org/formatting/) to format the date.
You may also pass the `first_day_of_week` attribute to have that reflected on the generated calendar component. 1 is Monday (default), and 7 is Sunday.

```ruby
field :birthday, as: :date, first_day_of_week: 1, picker_format: 'F J Y', format: '%Y-%m-%d', placeholder: 'Feb 24th 1955'
```

If you'd like to show the time relative to the present (4 months ago, in 3 years, etc.) use the `relative: true` option.

```ruby
field :valid_until, as: :date, relative: true
```

## DateTime

<img :src="$withBase('/assets/img/fields/date-time.jpg')" alt="DateTime field" class="border mb-4" />

The `DateTime` field is similar to the Date field with two new attributes. `time_24hr` tells flatpickr to use 24 hours format and `timezone` to tell it in what timezone to display the time. By default it uses your browser's timezone.

```ruby
filed :created_at, as: :date_time, name: 'User joined', picker_format: 'Y-m-d H:i', format: :db, time_24hr: true, timezone: 'PST'
```

## External image

You may have a field in the database that holds the url to an image and you want to display that in Avo. This is where the `ExternalImage` field comes in to help.

It will take the value and insert it into an `image_tag`.

```ruby
field :logo, as: :external_image
```

It takes three options `:width`, `:height` and `:radius` that get used to show the image on the **Index** view.

You may also pass in a computed value or pass it as the grid `:cover` position.

```ruby
cover :logo, as: :external_image, link_to_resource: true do |model|
  if model.url.present?
    "//logo.clearbit.com/#{URI.parse(model.url).host}?size=180"
  end
end
```

## File

The `File` field may be used to attach files using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html). Avo will use your application's Active Storage settings. You may use whichever supported [disk services](https://edgeguides.rubyonrails.org/active_storage_overview.html#disk-service).

```ruby
field :avatar, as: :file, is_image: true
```

### Display the file as image

The `is_image` option renders the file as an image instead of rendering the file name.

### Display the file as an audio file

The `is_audio` option renders an audio player that allows you to play the file.

### Display the file as an video file

The `is_video` option renders an video player that allows you to play the file.

### Direct upload support

If you have large files and you don't want to overload the server with uploads you can use the `direct_upload` feature which will upload the file directly to your cloud provider.

<!-- @todo: add links to avodemo page, avodemo source code, rails docs and demo video -->

```ruby
field :cover_video, as: :file, direct_upload: true
```

### Authorization

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        If you're using <strong>pundit</strong>, please make sure you have the <code>upload_attachments?</code>, <code>delete_attachments?</code> and <code>download_attachments?</code> methods set on your model policy. Otherwise the input and download/delete button will not be shown.
      </div>
    </div>
  </div>
</div>

## Files

The `Files` field is similar to `File` and enables you to upload multiple files at once using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html).

```ruby
field :documents, as: :files
```

### Direct upload support

If you have large files and you don't want to overload the server with uploads you can use the `direct_upload` feature which will upload the file directly to your cloud provider.

<!-- @todo: add links to avodemo page, avodemo source code, rails docs and demo video -->

```ruby
field :files, as: :files, direct_upload: true
```

## Gravatar

The `Gravatar` field should be linked to an email field from the database, displaying the avatar image assigned to that email address in the [Gravatar](https://en.gravatar.com/site/implement/images/) database. By default, it uses the `email` field, but if the email address is stored in another column, you can specify that column.

```ruby
field :email, as: :gravatar, rounded: false, size: 60, default_url: 'some image url'
```

You may also pass in a computed value.

```ruby
field :email, as: :gravatar do |model|
  "#{model.google_username}@gmail.com"
end
```

### Customization

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
heading '<div class="underline text-gray-800 uppercase">Address fields</,div>', as_html: true
```

## Hidden

You might have a scenario where you need a value to update a model. You may use the `Hidden` field to add an `input[type="hidden"]` field to the **Form** views.

```ruby
field :group_id, as: :hidden
```

## ID

The `id` field is used to show the record's id.

```ruby
field :id, as: :id
```

This is a good field to add `as_link_to_resource` option to make it a shortcut to the resource **Show** page.

## KeyValue

<img :src="$withBase('/assets/img/fields/key-value.jpg')" alt="KeyValue field" class="border mb-4" />

The `KeyValue` field allows you to edit flat key-value pairs stored in `JSON` format in the database.

```ruby
field :meta, as: :key_value
```

### Customizing the labels

You can easily customize the labels displayed in the UI by mentioning custom values in `key_label`, `value_label`, `action_text`, and `delete_text` properties when defining the field.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  key_label: 'Meta key', # Custom value for key header. Defaults to 'Key'.
  value_label: 'Meta value', # Custom value for value header. Defaults to 'Value'.
  action_text: 'New item', # Custom value for button to add a row. Defaults to 'Add'.
  delete_text: 'Remove item' # Custom value for button to delete a row.. Defaults to 'Delete'.
```

### Enforce restrictions

You can enforce some restrictions by removing the ability to edit the field's key, by setting `disable_editing_keys` to `true`. Be aware that this option will also disable adding rows as well. You can separately remove the ability to add a new row by setting `disable_adding_rows` to `true`. Deletion of rows can be enforced by setting `disable_deleting_rows` to `true`.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  disable_editing_keys: false, # Option to disable the ability to edit keys. Implies disabling to add rows. Defaults to false.
  disable_adding_rows: false, # Option to disable the ability to add rows. Defaults to false.
  disable_deleting_rows: false # Option to disable the ability to delete rows. Defaults to false.
```

`KeyValue` is hidden on **Index** view.

## Markdown

<img :src="$withBase('/assets/img/fields/markdown.jpg')" alt="Trix field" class="border mb-4" />

The `Markdown` field renders a [SimpleMDE Markdown Editor](https://simplemde.com/) and is associated to a text or textarea column in the database.
`Markdown` field converts text within the editor in raw Markdown text and stores it back to database.

Markdown field is hidden from the **Index** view. By default, the Markdown field is not directly shown to the user on the **Show** view, instead being hidden under a _Show Content_ link, that displays the content. You can set Markdown to always display the content by setting `always_show` to `true`.

```ruby
field :description, as: :markdown, always_show: true
```

### Enable spell checker

You can also enable the spell checker using the `spell_checker: true` option.

```ruby
field :description, as: :markdown, spell_checker: true
```

## Number

The `Number` field renders a `input[type="number"]` element and has the `min`, `max`, and `step` options.

```ruby
field :age, as: :number, min: 0, max: 120, step: 5
```

## Password

The `Password` field renders a `input[type="password"]` element for that field.

`Password` field is by default enforced to be shown only on **Form** views.

```ruby
field :password, as: :password, placeholder: 'secret',
```

## Progress bar

The `ProgressBar` field renders a `progress` element on `index` and `show` views and and a `input[type=range]` element on forms.

```ruby
field :progress, as: :progress_bar
```
<img :src="$withBase('/assets/img/custom-fields/progress-index.jpg')" alt="Progress bar custom field on index" class="border mb-4" />

The field takes four options. The `max` option sets the maximum value and `step` for the stepping interval.

Using the `display_value` option you can choose to show the value above the progress bar. You can even add the `%` suffix using the `value_suffix` option.

```ruby
field :progress, as: :progress_bar, max: 150, step: 10, display_value: true, value_suffix: "%"
```

<img :src="$withBase('/assets/img/custom-fields/progress-edit.jpg')" alt="Progress bar custom field edit" class="border mb-4" />

## Select

The `Select` field renders a `select` field.

```ruby
field :type, as: :select, options: { 'Large container': :large, 'Medium container': :medium, 'Tiny container': :tiny }, display_with_value: true, placeholder: 'Choose the type of the container.'
```

We can configure it using the `options` attribute, which is a `Hash` with the `key` as the label and the `value` as the database value.

On **Index**, **Show** and **Edit** views you may want to display the values and not the labels of the options. You may change that by setting `display_value` to `true`.

The Select field also supports Active Record [enums](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html). For that to work you only need switch `options` with `enum`.

```ruby
# app/models/project.rb
class Project < ApplicationRecord
  enum type: { 'Large container': 'large', 'Medium container': 'medium', 'Tiny container': 'small' }
end

# app/avo/resources/project_resource.rb
class ProjectResource < Avo::BaseResource
  field :type, as: :select, enum: ::Project.types, display_with_value: true, placeholder: 'Choose the type of the container.'
  # other fields go here
end
```

### Computed options

You may want to computed the values for your select field. You can use a lambda for that. That lambda gives you access to the `model`, `resource`, `view`, and `field` properties that you can pull data off.

```ruby
# app/avo/resources/project_resource.rb
class ProjectResource < Avo::BaseResource
  field :type, as: :select, options: ->(model: model, resource: resource, view: view, field: field) { model.get_types_from_the_database.map { |type| [type.name, type.id] } }, placeholder: 'Choose the type of the container.'
end
```

The output value must be a supported [`options_for_select`](https://apidock.com/rails/ActionView/Helpers/FormOptionsHelper/options_for_select) value.

## Status

The `Status` field is used to visually display the status of a column (loading or failed), supporting the following options:

<img :src="$withBase('/assets/img/fields/status.jpg')" alt="Status field" class="border mb-4" />

```ruby
field :progress, as: :status, failed_when: ['closed', 'rejected', 'failed'], loading_when: ['loading', 'running', 'waiting', 'in progress']
```

You may customize the `failed` and `loading` states by using `failed_when` and `loading_when`. `failed_when` defaults to `failed`, while `loading_when` defaults to both `waiting` and `running`.

## Text

The `Text` field renders a regular `text` `input`.

```ruby
field :title, as: :text
```

### Display data as HTML

You may want to display some information as HTML. Maybe a link to another record.
You may use `as_html: true` attribute.

```ruby
field :title, as: :text, as_html: true do |&args|
  '<a href="https://avohq.io">Avo</a>'
end
```

You may customize it with as many options as you need.

```ruby
field :title, # The database field ID
  as: :text, # The field type
  name: 'Post title', # The label you want displayed
  required: true, # Display it as required
  readonly: true, # Display it disabled
  as_html: true # Should the output be parsed as html
  placeholder: 'My shiny new post', # Update the placeholder text
  format_using: -> (value) { value.truncate 3 } # Format the output
```

## Textarea

The `Textarea` field renders a `textarea` element and has the `rows` option that controls how many rows it should render.

```ruby
field :body, as: :textarea, rows: 5
```

## Trix

<img :src="$withBase('/assets/img/fields/trix.jpg')" alt="Trix field" class="border mb-4" />

The `Trix` field renders a [WYSIWYG Trix Editor](https://trix-editor.org/) and is associated to a `string` or `text` column in the database.
`Trix` field converts text within the editor in HTML and stores it back to database.

Trix field is hidden from **Index** view. By default, the Trix field is not directly visible to the user on the **Show** view, instead being hidden under a **Show Content** link, that triggers the visibility of the content. You can set Trix to always display the content by setting `always_show` to `true`.

```ruby
field :body, as: :trix, always_show: true
```

### File attachments

Trix supports drag-and-drop file attachments. To enable **Active Storage** integration, you have to add the `attachment_key` option to your Trix field.

```ruby
field :body, as: :trix, attachment_key: :trix_attachments
```

That `attachment_key` has to have the same name as on the model.

```ruby{2}
class Post < ApplicationRecord
  has_many_attached :trix_attachments
end
```

Now, when you upload a file in the Trix field, Avo will create an Active Record attachment.

### Disable attachments

You may want to use Trix only as a text editor and disable the attachments feature. Adding the `attachments_disabled` option will hide the attachments button (paperclip icon).

```ruby
field :body, as: :trix, attachments_disabled: true
```

### Remove attachment attributes

When adding an attachment, by default, Trix will add some meta-data in the editor (filename, filesize, and url). You might not need those to be present in the document. You can hide them using `hide_attachment_filename`, `hide_attachment_filesize`, and `hide_attachment_url`.
