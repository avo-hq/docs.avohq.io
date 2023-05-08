---
feedbackId: 834
---

# Field options

## Declaring fields

Each Avo resource has a `field` method that registers your `Resource`'s fields. Avo ships with various simple fields like `text`, `textarea`, `number`, `password`, `boolean`, `select`, and more complex ones like `markdown`, `key_value`, `trix`, and `code`.

We can use the `field` method like so:

```ruby
field :name, as: :text
```

The `name` property is the column in the database where Avo looks for information or a property on your model.

That will add a few fields in your admin panel. On the <Index /> view, we will get a new text column. On the <Show /> view, we will also get a text value of that record's database value. Finally, on the <Edit /> and <New /> views, we will get a text input field that will display & update the `name` field on that model.

## Field conventions

When we declare a field, we pinpoint the specific database row for that field. Usually, that's a snake case value.

Each field has a label. Avo will convert the snake case name to a humanized version.
In the following example, the `is_available` field will render the label as *Is available*.

```ruby
field :is_available, as: :boolean
```

<img :src="('/assets/img/fields-reference/naming-convention.jpg')" alt="Field naming convention" class="border mb-4" />

:::info
If having the fields stacked one on top of another is not the right layout, try the [resource-sidebar](./resource-sidebar).
:::

## Change field name

To customize the label, you can use the `name` property to pick a different label.

```ruby
field :is_available, as: :boolean, name: 'Availability'
```

<img :src="('/assets/img/fields-reference/naming-convention-override.jpg')" alt="Field naming convention override" class="border mb-4" />

## Showing / Hiding fields on different views

There will be cases where you want to show fields on different views conditionally. For example, you may want to display a field in the <New /> and <Edit /> views and hide it on the <Index /> and <Show /> views.

For scenarios like that, you may use the visibility helpers `hide_on`, `show_on`, `only_on`, and `except_on` methods. Available options for these methods are: `:create`, `:edit`, `:index`, `:show`, `:forms` (both `:create` and `:edit`) and `:all` (only for `hide_on` and `show_on`).

Be aware that a few fields are designed to override those options (ex: the `id` field is hidden in <Edit /> and <New />).

```ruby
field :body, as: :text, hide_on: [:index, :show]
```

## Field Visibility

You might want to restrict some fields to be accessible only if a specific condition applies. For example, hide fields if the user is not an admin.

You can use the `visible` block to do that. It can be a `boolean` or a lambda.
Inside the lambda, we have access to the [`context`](./customization.html#context) object and the current `resource`. The `resource` has the current `model` object, too (`resource.model`).

```ruby
field :is_featured, as: :boolean, visible: -> (resource:) { context[:user].is_admin? }  # show field based on the context object
field :is_featured, as: :boolean, visible: -> (resource:) { resource.name.include? 'user' } # show field based on the resource name
field :is_featured, as: :boolean, visible: -> (resource:) { resource.model.published_at.present? } # show field based on a model attribute
```

### Using `if` for field visibility

You might be tempted to use the `if` statement to show/hide fields conditionally. However, that's not the best choice because the fields are registered at boot time, and some features are only available at runtime. Let's take the `context` object, for example. You might have the `current_user` assigned to the `context`, which will not be present at the app's boot time. Instead, that's present at request time when you have a `request` present from which you can find the user.

```ruby{4-7,13-16}
# ❌ Don't do
class CommentResource < Avo::BaseResource
  field :id, as: :id
  if context[:current_user].admin?
    field :body, as: :textarea
    field :tiny_name, as: :text, only_on: :index, as_description: true
  end
end

# ✅ Do instead
class CommentResource < Avo::BaseResource
  field :id, as: :id
  with_options visible: -> (resource:) { context[:current_user].admin?} do
    field :body, as: :textarea
    field :tiny_name, as: :text, only_on: :index, as_description: true
  end
end
```

So now, instead of relying on a request object unavailable at boot time, you can pass it a lambda function that will be executed on request time with all the required information.

:::warning
On form submissions, the `visible` block is evaluated in the `create` and `update` controller actions. That's why you have to check if the `resource.record` object is present before trying to use it.
:::

```ruby
# `resource.record` is nil when submitting the form on resource creation
field :name, as: :text, visible -> { resource.record.enabled? }

# Do this instead
field :name, as: :text, visible -> { resource.record&.enabled? }
```

## Computed Fields

You might need to show a field with a value you don't have in a database row. In that case, you may compute the value using a block that receives the `record` (the actual database record), the `resource` (the configured Avo resource), and the current `view`. With that information, you can compute what to show on the field in the <Index /> and <Show /> views.

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

This example will display a boolean field with the value computed from your custom block.

## Fields Formatter

Sometimes you will want to process the database value before showing it to the user. You may do that using `format_using` block that receives the `value` of that field as a parameter.

```ruby
field :is_writer, as: :text, format_using: -> { value.present? ? '👍' : '👎' }
# or
field :company_url, as: :text, format_using: -> { link_to(value, value, target: "_blank") } do
  main_app.companies_url(record)
end
```

This example snippet will make the `:is_writer` field generate emojis instead of 1/0 values.

<img :src="('/assets/img/fields-reference/fields-formatter.jpg')" alt="Fields formatter" class="border mb-4" />

## Formatting with Rails helpers

You can also format using Rails helpers like `number_to_currency` (note that `view_context` is used to access the helper):

```ruby
field :price, as: :number, format_using: -> { view_context.number_to_currency(value) }
```

## Sortable fields

One of the most common operations with database records is sorting the records by one of your fields. For that, Avo makes it easy using the `sortable` option.

Add it to any field to make that column sortable in the <Index /> view.

```ruby
field :name, as: :text, sortable: true
```

<img :src="('/assets/img/fields-reference/sortable-fields.jpg')" alt="Sortable fields" class="border mb-4" />

## Custom sortable block

When using computed fields or `belongs_to` associations, you can't set `sortable: true` to that field because Avo doesn't know what to sort by. However, you can use a block to specify how the records should be sorted in those scenarios.

```ruby{4-7}
class UserResource < Avo::BaseResource
  field :is_writer,
    as: :text,
    sortable: ->(query, direction) {
      # Order by something else completely, just to make a test case that clearly and reliably does what we want.
      query.order(id: direction)
    },
    hide_on: :edit do
      record.posts.to_a.size > 0 ? "yes" : "no"
    end
end
```

The block receives the query and the direction in which the sorting should be made and must return back a `query`.

In the example of a `Post` that `has_many` `Comment`s, you might want to order the posts by which one received a comment the latest.

You can do that using this query.

::: code-group

```ruby{5} [app/avo/resources/post_resource.rb]
class PostResource < Avo::BaseResource
  field :last_commented_at,
    as: :date,
    sortable: ->(query, direction) {
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

## Placeholder

Some fields support the `placeholder` option, which will be passed to the inputs on <Edit /> and <New /> views when they are empty.

```ruby
field :name, as: :text, placeholder: 'John Doe'
```

<img :src="('/assets/img/fields-reference/placeholder.jpg')" alt="Placeholder option" class="border mb-4" />

## Required

When you want to mark a field as mandatory, you may use the `required` option to add an asterisk to that field, indicating that it's mandatory.

```ruby
field :name, as: :text, required: true
```

<img :src="('/assets/img/fields-reference/required.jpg')" alt="Required option" class="border mb-4" />

:::warning
For Avo versions 2.13 and lower, this option is only a cosmetic one. It will not add the validation logic to your model. You must add that yourself (`validates :name, presence: true`).
:::

:::info
For Avo version 2.14 and higher Avo will automatically detect your validation rules and mark the field as required by default.
:::

<DemoVideo demo-video="https://youtu.be/peKt90XhdOg?t=937" />

You may use a block as well. It will be executed in the `ViewRecordHost` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :name, as: :text, required: -> { view == :new } # make the field required only on the new view and not on edit
```

## Disabled

When you need to prevent the user from editing a field, the `disabled` option will render it as `disabled` on <New /> and <Edit /> views and the value will not be passed to that record in the database. This prevents a bad actor to go into the DOM, enable that field, update it, and then submit it, updating the record.


```ruby
field :name, as: :text, disabled: true
```

<img :src="('/assets/img/fields-reference/readonly.jpg')" alt="Disabled option" class="border mb-4" />


### Disabled as a block

<VersionReq version="2.14" class="mt-2" />

You may use a block as well. It will be executed in the `ViewRecordHost` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :id, as: :number, disabled: -> { view == :edit } # make the field disabled only on the new edit view
```

## Readonly

When you need to prevent the user from editing a field, the `readonly` option will render it as `disabled` on <New /> and <Edit /> views. This does not, however, prevent the user from enabling the field in the DOM and send an arbitrary value to the database.


```ruby
field :name, as: :text, readonly: true
```

<img :src="('/assets/img/fields-reference/readonly.jpg')" alt="Readonly option" class="border mb-4" />

## Default Value

When you need to give a default value to one of your fields on the <New /> view, you may use the `default` block, which takes either a fixed value or a block.

```ruby
# using a value
field :name, as: :text, default: 'John'

# using a callback function
field :level, as: :select, options: { 'Beginner': :beginner, 'Advanced': :advanced }, default: -> { Time.now.hour < 12 ? 'advanced' : 'beginner' }
```

## Help text

Sometimes you will need some extra text to explain better what the field is used for. You can achieve that by using the `help` method.
The value can be either text or HTML.

```ruby
# using the text value
field :custom_css, as: :code, theme: 'dracula', language: 'css', help: "This enables you to edit the user's custom styles."

# using HTML value
field :password, as: :password, help: 'You may verify the password strength <a href="http://www.passwordmeter.com/">here</a>.'
```

<img :src="('/assets/img/fields-reference/help-text.jpg')" alt="Help text" class="border mb-4" />

:::info
Since version `2.19`, the `default` block is being evaluated in the [`ResourceViewRecordHost`](./evaluation-hosts#resourceviewrecordhost).
:::

## Nullable

When a user uses the **Save** button, Avo stores the value for each field in the database. However, there are cases where you may prefer to explicitly instruct Avo to store a `NULL` value in the database row when the field is empty. You do that by using the `nullable` option, which converts `nil` and empty values to `NULL`.

You may also define which values should be interpreted as `NULL` using the `null_values` method.

```ruby
# using default options
field :updated_status, as: :status, failed_when: [:closed, :rejected, :failed], loading_when: [:loading, :running, :waiting], nullable: true

# using custom null values
field :body, as: :textarea, nullable: true, null_values: ['0', '', 'null', 'nil', nil]
```

## Link to resource

Sometimes, on the <Index /> view, you may want a field in the table to be a link to that resource so that you don't have to scroll to the right to click on the <Show /> icon. You can use `link_to_resource` to change a table cell to be a link to that resource.

```ruby
# for id field
field :id, as: :id, link_to_resource: true

# for text field
field :name, as: :text, link_to_resource: true

# for gravatar field
field :email, as: :gravatar, link_to_resource: true
```

<img :src="('/assets/img/fields-reference/as-link-to-resource.jpg')" alt="As link to resource" class="border mb-4" />

You can add this property on `Id`, `Text`, and `Gravatar` fields.

Optionally you can enable the global config `id_links_to_resource`. More on that on the [id links to resource docs page](./customization.html#id-links-to-resource).

Related:

 - [ID links to resource](./customization#id-links-to-resource)
 - [Resource controls on the left side](./customization#resource-controls-on-the-left-side)

## Align text on Index view

It's customary on tables to align numbers to the right. You can do that using the `html` option.

```ruby{2}
class ProjectResource < Avo::BaseResource
  field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
end
```

<img :src="('/assets/img/fields/index_text_align.jpg')" alt="Index text align" class="border mb-4" />

## Stacked layout

For some fields, it might make more sense to use all of the horizontal area to display it. You can do that by changing the layout of the field wrapper using the `stacked` option.

```ruby
field :meta, as: :key_value, stacked: true
```

#### `inline` layout (default)
![](/assets/img/fields/field_wrapper_layout_inline.jpg)

#### `stacked` layout

![](/assets/img/fields/field_wrapper_layout_stacked.jpg)

## Global `stacked` layout

You may also set all the fields to follow the `stacked` layout by changing the `field_wrapper_layout` initializer option from `:inline` (default) to `:stacked`.

```ruby
Avo.configure do |config|
  config.field_wrapper_layout = :stacked
end
```

Now, all fields will have the stacked layout throughout your app.

## Field options

:::option `use_resource`
<!-- TODO: this -->
:::
