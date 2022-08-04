# Field options

[[toc]]

## Defining fields

Each Avo resource has a `field` method that registers your `Resource`'s fields. Avo ships with a variety of fields like `text`, `textarea`, `number`, `password`, `boolean`, `select`, and others. We can use the `field` method like so:

```ruby
field :name, as: :text
```

This will add a few fields to your admin panel. On the **Index** view we will get a new text column. On the **Show** view we will also get a text value of that record's database value. On the **Edit** and **Create** views we will get a text input field that will display & update the `name` field on that model.

## Field conventions

When we declare a field we specify the database row that's specific for that field. Usually that's a snake case value.

Each field has a label. Avo will convert the snake case name to a humanized version.
In the following example, the `is_available` field will render the label as *Is available*.

```ruby
field :is_available, as: :boolean
```

<img :src="$withBase('/assets/img/fields-reference/naming-convention.jpg')" alt="Field naming convention" class="border mb-4" />

If you want to customize the label, you can use the `name` property to pick a different label.

```ruby
field :is_available, as: :boolean, name: 'Availability'
```

<img :src="$withBase('/assets/img/fields-reference/naming-convention-override.jpg')" alt="Field naming convention override" class="border mb-4" />

## Showing / Hiding fields on different views

There will be cases where you want to conditionally show fields on different views. For example, you may want to display a field in the **Create** and **Edit** views and hide it on the **Index** and **Show** views.

For scenarios like that you may use the visibility helpers `hide_on`, `show_on`, `only_on` and `except_on` methods. Available options for these methods are: `:create`, `:edit`, `:index`, `:show`, `:forms` (both `:create` and `:edit`) and `:all` (only for `hide_on` and `show_on`).

Be aware that a few fields are designed in such a way that they override those options (ex: the `id` field is hidden in **Edit** and **Create**).

```ruby
field :body, as: :text, hide_on: [:index, :show]
```

## Field visibility

You might want to restrict some fields to be accessible only if a certain condition applies. Like hide fields if the user is not an admin.

You can use the `visible` block to do that. It can be a `boolean` or a lambda.
Inside the lambda we have access to the [`context`](./customization.html#context) object and the current `resource`. The `resource` has the current `model` object too (`resource.model`).

```ruby
field :is_featured, as: :boolean, visible: -> (resource:) { context[:user].is_admin? }  # show field based on the context object
field :is_featured, as: :boolean, visible: -> (resource:) { resource.name.include? 'user' } # show field based on the resource name
field :is_featured, as: :boolean, visible: -> (resource:) { resource.model.published_at.present? } # show field based on a model attribute
```

## Computed Fields

At times you might need to show a field with a value that you don't have in a database row. In that case, you may compute the value using a block that receives the `model` (the actual database record), the `resource` (the configured Avo resource), and the current `view`. With that information you can compute what to show on the field in the **Index** and **Show** views (computed fields are automatically hidden in **Edit** and **Create**).

```ruby
field 'Has posts', as: :boolean do |model, resource, view|
  model.posts.present?
end
```

This example will display a boolean field with the value computed from your custom block.

## Fields Formatter

Sometimes you will want to process the database value before showing it to the user. You may do that using `format_using` block that receives the `value` of that field as a parameter.

```ruby
field :is_writer, as: :text, format_using: -> (value) { value.present? ? '👍' : '👎' }
# or
field :company_url, as: :text, format_using: -> (url) { link_to(url, url, target: "_blank") } do |model, *args|
  main_app.companies_url(model)
end
```

This example snippet will make the `:is_writer` field to generate emojis instead of 1/0 values.

<img :src="$withBase('/assets/img/fields-reference/fields-formatter.jpg')" alt="Fields formatter" class="border mb-4" />

## Sortable fields

One of the most common operations with database records is sorting the records by one of your fields. For that Avo makes it easy using the `sortable` option.

Just add it to any field to make that column sortable in the **Index** view.

```ruby
field :name, as: :text, sortable: true
```

<img :src="$withBase('/assets/img/fields-reference/sortable-fields.jpg')" alt="Sortable fields" class="border mb-4" />

## Placeholder

Some fields support the `placeholder` option which will be passed to the inputs on **Edit** and **New** views when they are empty.

```ruby
field :name, as: :text, placeholder: 'John Doe'
```

<img :src="$withBase('/assets/img/fields-reference/placeholder.jpg')" alt="Placeholder option" class="border mb-4" />

## Required

When you will want to show to the user that a field is mandatory. You may use the `required` option that will add an asterisk to that field, indicating that it's mandatory.

```ruby
field :name, as: :text, required: true
```

<img :src="$withBase('/assets/img/fields-reference/required.jpg')" alt="Required option" class="border mb-4" />

However, you will need to add validation logic to your model (`validates :name, presence: true`).

## Readonly

When you need to prevent the user from editing a field, the `readonly` option will render the field as `disabled` on **Create** and **Edit** views.

```ruby
field :name, as: :text, readonly: true
```

<img :src="$withBase('/assets/img/fields-reference/readonly.jpg')" alt="Readonly option" class="border mb-4" />

## Default Value

When you need to give a default value to your one of your fields on the **Create** view, you may use the `default` block, which takes either a fixed value or a block.

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
# using text value
field :custom_css, as: :code, theme: 'dracula', language: 'css', help: "This enables you to edit the user's custom styles."

# using HTML value
field :password, as: :password, help: 'You may verify the password strength <a href="http://www.passwordmeter.com/">here</a>.'
```

<img :src="$withBase('/assets/img/fields-reference/help-text.jpg')" alt="Help text" class="border mb-4" />

## Nullable

When a user uses the **Save** button, Avo is storing the value for each field in the database. There are cases where you may prefer to explicitly instruct Avo to store a `NULL` value in the database row when the field is empty. You do that by using the `nullable` option, which converts `nil` and empty values to `NULL`.

You may also define which values should be interpreted as `NULL` using the `null_values` method.

```ruby
# using default options
field :updated_status, as: :status, failed_when: [:closed, :rejected, :failed], loading_when: [:loading, :running, :waiting], nullable: true

# using custom null values
field :body, as: :textarea, nullable: true, null_values: ['0', '', 'null', 'nil', nil]
```

## Link to resource

Sometimes, on the **Index** view, you may want a field in the table to be a link to that resource, so that you don't have to scroll to the right to click on the **Show** icon. You can use `link_to_resource` to change a table cell to be a link to that resource.

```ruby
# for id field
field :id, as: :id, link_to_resource: true

# for text field
field :name, as: :text, link_to_resource: true

# for gravatar field
field :email, as: :gravatar, link_to_resource: true
```

<img :src="$withBase('/assets/img/fields-reference/as-link-to-resource.jpg')" alt="As link to resource" class="border mb-4" />

You can add this property on `Id`, `Text`, and `Gravatar` fields.

Optionally you can enable the global config `id_links_to_resource`. More on that on the [id links to resource docs page](./customization.html#id-links-to-resource).
