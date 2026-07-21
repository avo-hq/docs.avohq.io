---
feedbackId: 834
license: community
outline: [2, 3]
api_docs: ./field-options-api.html
---

# Field options

Every Avo field accepts a set of **common options** that control its label, visibility, formatting, and behavior. This page walks through what you can do with them; the [Field options API](./field-options-api.html) lists every option's type, default, and accepted values.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :name, as: :text, sortable: true, placeholder: "John Doe"
  end
end
```

With no options, a field shows up on the <Index />, <Show />, <New />, and <Edit /> views with a humanized version of its id as the label.

Besides the common options, some fields respond to **field-specific options** — like `options` on the [select field](./fields/select.html) — documented on each field's page.

## Change the field label

Pass [`name`](./field-options-api.html#name) to display a different label than the humanized field id.

```ruby
field :is_available, as: :boolean, name: "Availability"
```

<Image src="/assets/img/4_0/field-options/change-field-name.webp" dark-src="/assets/img/4_0/field-options/change-field-name-dark.webp" width="1776" height="570" alt="An Avo index table with three columns — ID, Name and a boolean column whose header reads “Availability”, the custom label set via the field's name option, highlighted." prompt="index with the column header Availability anotated" />

If you localize your app, translate the label through the [i18n conventions](./i18n.html) instead of hardcoding it.

## Show and hide fields on different views

There will be cases where you want to show fields on some views and hide them on others. For example, you may want to display a field on the <New /> and <Edit /> views and hide it on the <Index /> and <Show /> views.

Use the visibility helpers [`hide_on`](./field-options-api.html#hide_on), [`show_on`](./field-options-api.html#show_on), [`only_on`](./field-options-api.html#only_on), and [`except_on`](./field-options-api.html#except_on). They accept `:index`, `:show`, `:new`, `:edit`, and `:preview`, plus the shorthands `:forms` (`:new` and `:edit`), `:display` (`:index` and `:show`), and `:all` (only for `hide_on` and `show_on`).

```ruby
field :body, as: :textarea, hide_on: [:index, :show]
```

Be aware that a few fields override those options — for example, the [`id`](./fields/id.html) field hides itself on the <Edit /> and <New /> views.

Please read the detailed [views](./views.html) page for more info.

## Show fields conditionally

You might want to restrict some fields to be accessible only if a specific condition applies — for example, hide fields if the user is not an admin.

Use the [`visible`](./field-options-api.html#visible) option with a boolean or a block. Inside the block, you have access to the [`context`](./customization.html#context) object and the current `resource`. The `resource` has the current `record` object, too (`resource.record`).

```ruby
field :is_featured, as: :boolean, visible: -> { context[:user].is_admin? }  # show field based on the context object
field :is_featured, as: :boolean, visible: -> { resource.name.include? 'user' } # show field based on the resource name
field :is_featured, as: :boolean, visible: -> { resource.record.published_at.present? } # show field based on a record attribute
```

:::warning
On form submissions, the `visible` block is evaluated in the `create` and `update` controller actions. That's why you have to check if the `resource.record` object is present before trying to use it.
:::

```ruby
# `resource.record` is nil when submitting the form on resource creation
field :name, as: :text, visible: -> { resource.record.enabled? }

# Do this instead
field :name, as: :text, visible: -> { resource.record&.enabled? }
```

## Compute the value with a block

You might need to show a field with a value you don't have in a database row. In that case, you may compute the value using a block that receives the `record` (the actual database record), the `resource` (the configured Avo resource), and the current `view`.

```ruby
field 'Has posts', as: :boolean do
  record.posts.present?
rescue
  false
end
```

:::info
Computed fields are displayed only on the <Show /> and <Index /> views.
:::

## Format displayed values

Sometimes you will want to process the database value before showing it to the user. Inside every formatter block you have access to all the defaults that [`Avo::ExecutionContext`](./execution-context.html) provides plus `value`, `record`, `resource`, `view`, and `field`.

### On every view

[`format_using`](./field-options-api.html#format_using) formats the value on **all** views — including inside the inputs on forms, so return the raw value on form views if the user should edit it.

```ruby
field :is_writer, as: :text, format_using: -> {
  if view.form?
    value
  else
    value.present? ? '👍' : '👎'
  end
}
```

<Image src="/assets/img/4_0/field-options/format-using.webp" dark-src="/assets/img/4_0/field-options/format-using-dark.webp" width="1776" height="566" alt="An Avo index table with three columns — ID, Name and an “Is writer” column whose cells show a 👍 or 👎 emoji rendered via format_using instead of the raw value." prompt="Index view text field shown as a thumbs up/down emoji via format_using instead of the raw boolean value" />

### On specific views

If the formatting only applies to certain views, reach for the view-scoped variants — [`format_display_using`](./field-options-api.html#format_view_using), `format_form_using`, `format_index_using`, `format_show_using`, `format_edit_using`, or `format_new_using` — instead of branching on `view` yourself. When several are declared, the most specific one wins; see the [precedence table](./field-options-api.html#format_view_using).

```ruby
field :is_writer, format_display_using: -> { value.present? ? '👍' : '👎' }
```

<Image src="/assets/img/4_0/field-options/format-display-using.webp" dark-src="/assets/img/4_0/field-options/format-display-using-dark.webp" width="1520" height="520" alt="An Avo Show view details panel card laid out in three rows — ID spanning the full width on top, First name and Last name side by side, then Is writer and User Email side by side — the “Is writer” value showing a 👍 emoji rendered via format_display_using." />

### With Rails helpers

You can format using Rails helpers like `number_to_currency` (note that `view_context` is used to access the helper):

```ruby
field :price, as: :number, format_using: -> { view_context.number_to_currency(value) }
```

## Parse the value before saving

When it's necessary to parse information before storing it in the database, the [`update_using`](./field-options-api.html#update_using) option proves to be useful. Inside the block you can access the raw `value` from the form, and the returned value will be saved in the database.

```ruby
field :metadata,
  as: :code,
  update_using: -> do
    ActiveSupport::JSON.decode(value)
  end
```

## Make columns sortable

Add [`sortable`](./field-options-api.html#sortable) to any field to make that column sortable on the <Index /> view.

```ruby
field :name, as: :text, sortable: true
```

<Image src="/assets/img/4_0/field-options/sortable.webp" dark-src="/assets/img/4_0/field-options/sortable-dark.webp" width="1776" height="664" alt="An Avo index table for Projects sorted by the Name column, whose header shows the active sort-arrow indicator for the sortable name text field." />

**Related:**
  - [Add an index on the `created_at` column](./guides/best-practices#add-an-index-on-the-created-at-column)

### Sort computed fields and associations

When using computed fields or `belongs_to` associations, you can't set `sortable: true` because Avo doesn't know what to sort by. Pass a block instead — it receives the `query` and the `direction` and must return a query.

In the example of a `Post` that `has_many` `Comment`s, you might want to order the posts by which one received a comment the latest:

::: code-group

```ruby{5} [app/avo/resources/post.rb]
class Avo::Resources::Post < Avo::BaseResource
  field :last_commented_at,
    as: :date,
    sortable: -> {
      query.includes(:comments).order("comments.created_at #{direction}")
    }
end
```

```ruby{4-6} [app/models/post.rb]
class Post < ApplicationRecord
  has_many :comments

  def last_commented_at
    comments.last&.created_at
  end
end
```

:::

## Mark fields as required

To indicate that a field is mandatory, use the [`required`](./field-options-api.html#required) option, which adds an asterisk to the field as a visual cue.

Avo automatically adds the asterisk when the model has a presence validator on the attribute, so you often don't need this option at all. It's purely cosmetic either way — add the actual validation to your model (`validates :name, presence: true`).

```ruby
field :name, as: :text, required: true

# or conditionally
field :name, as: :text, required: -> { view == :new }
```

<Image src="/assets/img/4_0/field-options/required.webp" dark-src="/assets/img/4_0/field-options/required-dark.webp" width="1256" height="254" alt="An Avo Edit form text field whose label has a red asterisk marking it as required." prompt="Edit form field label with a red asterisk marking it as required" />

<DemoVideo demo-video="https://youtu.be/peKt90XhdOg?t=937" />

## Prevent users from editing a field

Two options render the input as `disabled` on the <New /> and <Edit /> views — pick based on how much protection you need.

[`disabled`](./field-options-api.html#disabled) also ignores the field's value on save. Even if a bad actor re-enables the input in the DOM and submits, the record is not updated.

```ruby
field :name, as: :text, disabled: true

# or conditionally
field :id, as: :number, disabled: -> { view == :edit }
```

<Image src="/assets/img/4_0/field-options/disabled.webp" dark-src="/assets/img/4_0/field-options/disabled-dark.webp" width="1256" height="254" alt="An Avo Edit form with a disabled, greyed-out 'Name' text field above a normal, editable 'Website' field — the contrast shows the disabled state." prompt="Edit form showing a disabled greyed-out text field" />

[`readonly`](./field-options-api.html#readonly) only disables the input in the UI — a user can still re-enable it in the DOM and submit an arbitrary value. Use it for convenience, not protection.

```ruby
field :name, as: :text, readonly: true
```

<Image src="/assets/img/4_0/field-options/readonly.webp" dark-src="/assets/img/4_0/field-options/readonly-dark.webp" width="1256" height="254" alt="An Avo Edit form with a readonly, greyed-out 'Name' text field above a normal, editable 'Website' field — the contrast shows the readonly state." prompt="Edit form showing a readonly text field" />

## Set a default value

Use [`default`](./field-options-api.html#default) to pre-fill the field on the <New /> view (and in action modals) with a fixed value or a block.

```ruby
# using a value
field :name, as: :text, default: 'John'

# using a callback function
field :level, as: :select, options: { 'Beginner': :beginner, 'Advanced': :advanced }, default: -> { Time.now.hour < 12 ? 'advanced' : 'beginner' }
```

## Add help text

Use [`help`](./field-options-api.html#help) to display extra text — plain or HTML — below the input on the form views.

```ruby
# using the text value
field :custom_css, as: :code, theme: 'dracula', language: 'css', help: "This enables you to edit the user's custom styles."

# using HTML value
field :password, as: :password, help: 'You may verify the password strength <a href="http://www.passwordmeter.com/">here</a>.'
```

<Image src="/assets/img/4_0/field-options/help.webp" dark-src="/assets/img/4_0/field-options/help-dark.webp" width="1440" height="284" alt="An Avo Edit form 'Custom CSS' text field with a line of help text shown directly below the input explaining what the field does." prompt="Edit form field with help text shown below the input" />

If the text should appear on every view — not just forms — use [`label_help`](./field-options-api.html#label_help), which renders below the field's label.

```ruby
field :custom_css, as: :code, theme: 'dracula', language: 'css', label_help: "This enables you to edit the user's custom styles."
```

<Image src="/assets/img/4_0/field-options/label-help.webp" dark-src="/assets/img/4_0/field-options/label-help-dark.webp" width="1440" height="248" alt="An Avo Edit form 'Custom css' code field with a line of help text shown directly below the field label explaining what the field does." prompt="Form field with label_help text shown below the field label" />

## Add a placeholder

Some fields support the [`placeholder`](./field-options-api.html#placeholder) option, which will be passed to the inputs on the <New /> and <Edit /> views when they are empty.

```ruby
field :name, as: :text, placeholder: 'John Doe'
```

<Image src="/assets/img/4_0/field-options/placeholder.webp" dark-src="/assets/img/4_0/field-options/placeholder-dark.webp" width="1256" height="254" alt="An Avo New form text field whose empty input shows the grey placeholder text “John Doe”." prompt="New form empty text input showing the placeholder text John Doe" />

## Place fields on the same row

The [`width`](./field-options-api.html#width) option controls how much horizontal space a field takes inside its parent panel or card. Adjacent fields with a `width` below `100` (a percentage) sit side by side.

```ruby
field :first_name, width: 50
field :last_name,  width: 50
field :years_of_experience # full width
```

Setting any `width` below `100` automatically marks the field as [`stacked`](./field-options-api.html#stacked) — the label moves above the value so the field fits the narrower column. See the [supported values](./field-options-api.html#width) in the reference.

### Stack the label above the value

For some fields, it might make more sense to use all of the horizontal area to display the value. Change the layout of the field wrapper using the [`stacked`](./field-options-api.html#stacked) option.

```ruby
field :meta, as: :key_value, stacked: true
```

#### `inline` layout (default)

<Image src="/assets/img/4_0/field-options/stacked-inline.webp" dark-src="/assets/img/4_0/field-options/stacked-inline-dark.webp" width="1940" height="448" alt="An Avo show view key_value 'Meta' field in the default inline layout, the field label beside a key/value control listing three pairs (environment: production, region: eu-west, tier: premium)." prompt="show page key_value field with the default inline layout, label beside value" />

#### `stacked` layout

<Image src="/assets/img/4_0/field-options/stacked-stacked.webp" dark-src="/assets/img/4_0/field-options/stacked-stacked-dark.webp" width="2124" height="528" alt="An Avo show view key_value 'Meta' field in the stacked layout, the field label shown above a key/value control listing three pairs (environment: production, region: eu-west, tier: premium)." prompt="key_value field with the stacked layout, label above value" />

### Global `stacked` layout

You may also set all the fields to follow the `stacked` layout by changing the `field_wrapper_layout` initializer option from `:inline` (default) to `:stacked`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.field_wrapper_layout = :stacked
end
```

Now, all fields will have the stacked layout throughout your app.

Avo 4 also adds `use_stacked_fields`, which stacks every field at the CSS level:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.use_stacked_fields = true # default: false
end
```

With it enabled, fields render stacked by default without needing `stacked: true` on each one, and you can still override per field.

## Store empty values as `NULL`

When a user saves a form, Avo stores the value for each field in the database as-is. If you prefer to store `NULL` when the field is empty, use the [`nullable`](./field-options-api.html#nullable) option — it converts `nil` and empty values to `NULL`.

You may also define which values should be interpreted as `NULL` using [`null_values`](./field-options-api.html#null_values).

```ruby
# using default null values (nil and "")
field :body, as: :textarea, nullable: true

# using custom null values
field :body, as: :textarea, nullable: true, null_values: ['0', '', 'null', 'nil', nil]
```

## Link the table cell to the record

Sometimes, on the <Index /> view, you may want a field in the table to be a link to that resource so that you don't have to scroll to the right to click the <Show /> icon. Use [`link_to_record`](./field-options-api.html#link_to_record) to change a table cell into a link to that record. It's available on the [`id`](./fields/id.html), [`text`](./fields/text.html), [`gravatar`](./fields/gravatar.html), and [`belongs_to`](./associations/belongs_to.html) fields.

```ruby
field :id, as: :id, link_to_record: true
field :name, as: :text, link_to_record: true
```

<Image src="/assets/img/4_0/field-options/link-to-record.webp" dark-src="/assets/img/4_0/field-options/link-to-record-dark.webp" width="1776" height="758" alt="An Avo index table where the Name column cells are rendered as blue links to each record via link_to_record." prompt="Index table cell rendered as a link to the record via link_to_record" />

Optionally you can enable the global config `id_links_to_resource`, which links every `id` field automatically. More on that on the [customization page](./customization.html#id-links-to-resource).

## Summarize a column

The [`summarizable`](./field-options-api.html#summarizable) option generates a visual summary of a column's data distribution. A chart icon appears in the table header; clicking it displays a summary chart based on the data in that column.

```ruby
field :status, as: :select, summarizable: true
```

<Image src="/assets/img/4_0/field-options/summarizable.webm" dark-src="/assets/img/4_0/field-options/summarizable-dark.webm" width="900" height="397" alt="An animated Avo Projects index table (ID, Name, Status, Country columns) with the summarizable summary popover open over it, cycling a hover across each segment of the Status distribution pie chart to reveal each value's label and count." prompt="Index table header showing the summarizable chart icon and summary popover for a column" />

## Let users copy the value

The [`copyable`](./field-options-api.html#copyable) option shows a clipboard icon when hovering over the field's value, allowing easy copying. Particularly useful for unique identifiers, URLs, or other text users frequently need to copy.

```ruby
field :name, as: :text, copyable: true
```

:::info
The copied value is the displayed value. If you truncate it with [`format_using`](./field-options-api.html#format_using), the truncated text is what gets copied — use CSS truncation via the [`html` option](./html.html) if you need to display a short value but copy the full one.
:::

## Align text on the Index view

It's customary on tables to align numbers to the right. You can do that using the [`html`](./field-options-api.html#html) option, which attaches classes, styles, and data attributes to the field's elements — see the [HTML attributes page](./html.html) for everything it can do.

```ruby{2}
class Avo::Resources::Project < Avo::BaseResource
  field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
end
```

<Image src="/assets/img/4_0/field-options/align-text.webp" dark-src="/assets/img/4_0/field-options/align-text-dark.webp" width="1776" height="758" alt="An Avo index table where the Users required number column is right-aligned via the html option, its numbers hugging the right edge of the column, contrasting with the left-aligned text columns." prompt="Index table numeric column right-aligned via the html option" />

## Customize the field components

The [`components`](./field-options-api.html#components) option lets you swap the view components used to render the field on the `index`, `show`, and `edit` views.

### Eject the field components

To start customizing, eject one or multiple field components using the `avo:eject` command — it generates the files for all of the field type's components:

```bash
rails g avo:eject --field-components text --scope admin
```

:::warning Scope
If you don't pass a `--scope` when ejecting a field view component, the ejected component will override the default components all over the project.

Check the [eject documentation](./eject-views.html) for more details.
:::

### Point the field at your components

Pass a hash (or a block returning one) with `<view>_component` keys:

::: code-group
```ruby [Hash]
field :description,
  as: :text,
  components: {
    index_component: Avo::Fields::Admin::TextField::IndexComponent,
    show_component: Avo::Fields::Admin::TextField::ShowComponent,
    edit_component: "Avo::Fields::Admin::TextField::EditComponent"
  }
```

```ruby [Block]
field :description,
  as: :text,
  components: -> do
    {
      show_component: Avo::Fields::Admin::TextField::ShowComponent,
      edit_component: "Avo::Fields::Admin::TextField::EditComponent"
    }
  end
```
:::

## Target a different database attribute

Use [`for_attribute`](./field-options-api.html#for_attribute) to point a field at a different model attribute than its id — for example, to declare two fields backed by the same attribute with different presentations:

```ruby
field :status, as: :select, options: [:one, :two, :three], only_on: :forms

field :secondary_field_for_status,
  as: :badge,
  for_attribute: :status,
  options: {info: :one, success: :two, warning: :three},
  except_on: :forms,
  help: "Secondary field for status using the for_attribute option"
```

## Pass arbitrary data to the field

The [`meta`](./field-options-api.html#meta) option sends arbitrary information to the field — especially useful when you're building your own [custom fields](./custom-fields.html) or using custom [components](#customize-the-field-components) for the built-in fields.

```ruby
# meta as a hash
field :status,
  as: :custom_status,
  meta: {foo: :bar}

# meta as a block
field :status,
  as: :badge,
  meta: -> do
    record.statuses.map(&:id)
  end
```

Within your field template you can now access the `@field.meta` attribute:

```erb{2}
<%= field_wrapper **field_wrapper_args do %>
  <% if @field.meta[:foo] %>
    <%= @resource.record.foo_value %>
  <% else %>
    <%= @field.value %>
  <% end %>
<% end %>
```

## React to changes in other fields

The [`react_on`](./field-options-api.html#react_on) option re-evaluates a field when other fields change in the form, refreshing `@record` with the latest form values. Updates run when the watched field's value is committed — on selection for selects and checkboxes, and when the input loses focus for text fields.

This feature is provided by the **`avo-reactive_fields`** add-on. Add the gem to your app before using `react_on` (see the [Avo 4 upgrade guide](./avo-3-avo-4-upgrade.html#gems) for the `packager.dev` source).

### Dependent select

In the example below, the `city` field reacts whenever the `country` select changes, so the available city options are always relevant to the selected country:

```ruby{11}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :country,
      as: :select,
      options: Course.countries,
      include_blank: "No country"

    field :city,
      as: :select,
      react_on: :country,
      options: -> { Course.cities.dig(@record.country&.to_sym) || [""] }
  end
end
```

### Derived value (slug from name)

Pair `react_on` with [`format_using`](./field-options-api.html#format_using) to re-compute a derived value whenever another field changes. When the user fills in **name** (for example `Hello World`) and the input loses focus, **slug** updates to `hello_world` — on each reactive request, `@record` is hydrated from the submitted form params, so `format_using` always sees the latest **name**, even before save:

```ruby
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :name

    field :slug,
      react_on: :name,
      format_using: -> { @record.name&.downcase&.gsub(" ", "_") }
  end
end
```

:::tip
To retrieve the original value of a field before it was changed, use the [`*_was`](https://api.rubyonrails.org/classes/ActiveModel/Dirty.html#method-i-2A_was) methods.
:::
