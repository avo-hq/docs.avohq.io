---
feedbackId: 834
---

# Field options

## Change field name

To customize the label, you can use the `name` property to pick a different label.

```ruby
field :is_available, as: :boolean, name: "Availability"
```

<img :src="('/assets/img/fields-reference/naming-convention-override.png')" alt="Field naming convention override" class="border mb-4" />

## Showing / Hiding fields on different views

There will be cases where you want to show fields on different views conditionally. For example, you may want to display a field in the <New /> and <Edit /> views and hide it on the <Index /> and <Show /> views.

For scenarios like that, you may use the visibility helpers `hide_on`, `show_on`, `only_on`, and `except_on` methods. Available options for these methods are: `:new`, `:edit`, `:index`, `:show`, `:forms` (both `:new` and `:edit`) and `:all` (only for `hide_on` and `show_on`).

Be aware that a few fields are designed to override those options (ex: the `id` field is hidden in <Edit /> and <New />).

```ruby
field :body, as: :text, hide_on: [:index, :show]
```

## Field Visibility

You might want to restrict some fields to be accessible only if a specific condition applies. For example, hide fields if the user is not an admin.

You can use the `visible` block to do that. It can be a `boolean` or a lambda.
Inside the lambda, we have access to the [`context`](./customization.html#context) object and the current `resource`. The `resource` has the current `record` object, too (`resource.record`).

```ruby
field :is_featured, as: :boolean, visible: -> { context[:user].is_admin? }  # show field based on the context object
field :is_featured, as: :boolean, visible: -> { resource.name.include? 'user' } # show field based on the resource name
field :is_featured, as: :boolean, visible: -> { resource.record.published_at.present? } # show field based on a record attribute
```

:::warning
On form submissions, the `visible` block is evaluated in the `create` and `update` controller actions. That's why you have to check if the `resource.record` object is present before trying to use it.
:::

[Check how to use your application's helpers within any field context.](./helpers)


```ruby
# `resource.record` is nil when submitting the form on resource creation
field :name, as: :text, visible -> { resource.record.enabled? }

# Do this instead
field :name, as: :text, visible -> { resource.record&.enabled? }
```

## Computed Fields

You might need to show a field with a value you don't have in a database row. In that case, you may compute the value using a block that receives the `record` (the actual database record), the `resource` (the configured Avo resource), and the current `view`. With that information, you can compute what to show on the field in the <Index /> and <Show /> views.

[Check how to use your application's helpers within any computed field context.](./helpers)

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

<img :src="('/assets/img/fields-reference/fields-formatter.png')" alt="Fields formatter" class="border mb-4" />

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

<img :src="('/assets/img/fields-reference/sortable-fields.png')" alt="Sortable fields" class="border mb-4" />

## Custom sortable block

When using computed fields or `belongs_to` associations, you can't set `sortable: true` to that field because Avo doesn't know what to sort by. However, you can use a block to specify how the records should be sorted in those scenarios.

```ruby{4-7}
class Avo::Resources::User < Avo::BaseResource
  field :is_writer,
    as: :text,
    sortable: -> {
      # Order by something else completely, just to make a test case that clearly and reliably does what we want.
      query.order(id: direction)
    },
    hide_on: :edit do
      record.posts.to_a.size > 0 ? "yes" : "no"
    end
end
```

The block receives the `query` and the `direction` in which the sorting should be made and must return back a `query`.

In the example of a `Post` that `has_many` `Comment`s, you might want to order the posts by which one received a comment the latest.

You can do that using this query.

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

## Placeholder

Some fields support the `placeholder` option, which will be passed to the inputs on <Edit /> and <New /> views when they are empty.

```ruby
field :name, as: :text, placeholder: 'John Doe'
```

<img :src="('/assets/img/fields-reference/placeholder.png')" alt="Placeholder option" class="border mb-4" />

## Required
To indicate that a field is mandatory, you can utilize the `required` option, which adds an asterisk to the field as a visual cue.

Avo automatically examines each field to determine if the associated attribute requires a mandatory presence. If it does, Avo appends the asterisk to signify its mandatory status. It's important to note that this option is purely cosmetic and does not incorporate any validation logic into your model. You will need to manually include the validation logic yourself, such as (`validates :name, presence: true`).


```ruby
field :name, as: :text, required: true
```

<img :src="('/assets/img/fields-reference/required.png')" alt="Required option" class="border mb-4" />

<DemoVideo demo-video="https://youtu.be/peKt90XhdOg?t=937" />

You may use a block as well. It will be executed in the `Avo::ExecutionContext` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :name, as: :text, required: -> { view == :new } # make the field required only on the new view and not on edit
```

## Disabled

When you need to prevent the user from editing a field, the `disabled` option will render it as `disabled` on <New /> and <Edit /> views and the value will not be passed to that record in the database. This prevents a bad actor to go into the DOM, enable that field, update it, and then submit it, updating the record.


```ruby
field :name, as: :text, disabled: true
```

<img :src="('/assets/img/fields-reference/readonly.png')" alt="Disabled option" class="border mb-4" />


### Disabled as a block

<VersionReq version="2.14" class="mt-2" />

You may use a block as well. It will be executed in the `Avo::ExecutionContext` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :id, as: :number, disabled: -> { view == :edit } # make the field disabled only on the new edit view
```

## Readonly

When you need to prevent the user from editing a field, the `readonly` option will render it as `disabled` on <New /> and <Edit /> views. This does not, however, prevent the user from enabling the field in the DOM and send an arbitrary value to the database.


```ruby
field :name, as: :text, readonly: true
```

<img :src="('/assets/img/fields-reference/readonly.png')" alt="Readonly option" class="border mb-4" />

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

<img :src="('/assets/img/fields-reference/help-text.png')" alt="Help text" class="border mb-4" />

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
class Avo::Resources::Project < Avo::BaseResource
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

:::option `components`
The field's `components` option allows you to customize the view components used for rendering the field in all, `index`, `show` and `edit` views. This provides you with a high degree of flexibility.

### Ejecting the field components
To start customizing the field components, you can eject one or multiple field components using the `avo:eject` command. Ejecting a field component generates the necessary files for customization. Here's how you can use the `avo:eject` command:

#### Ejecting All Components for a Field

`$ rails g avo:eject --field-components <field_type> --scope admin`

Replace `<field_type>` with the desired field type. For instance, to eject components for a Text field, use:

`$ rails g avo:eject --field-components text --scope admin`

This command will generate the files for all the index, edit and show components of the Text field, for each field type the amount of components may vary.

For more advanced usage check the [`--fields-components` documentation](./customization.html#field_components)
:::warning Scope
If you don't pass a `--scope` when ejecting a field view component, the ejected component will override the default components all over the project.

Check [ejection documentation](./customization.html#eject) for more details.
:::

### Customizing field components using `components` option

Here's some examples of how to use the `components` option in a field definition:

::: code-group
```ruby [Hash]
field :description,
  as: :text,
  components: {
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

The components block it's executed using `Avo::ExecutionContent` and gives access to a bunch of variables as: `resource`, `record`, `view`, `params` and more.

`<view>_component` is the key used to render the field's `<view>`'s component, replace `<view>` with one of the views in order to customize a component per each view.

:::warning Initializer
It's important to keep the initializer on your custom components as the original field view component initializer.
:::
