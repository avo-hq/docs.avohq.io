# Fields reference

[[toc]]

## Defining fields

Each Avo resource has a `fields` method that registers your resource's fields. Avo ships with a variety of fields like `text`, `textarea`, `number`, `password`, `boolean`, `select`, and others.

To add a field you need to declare it in the `fields` method like so:

```ruby
fields do
  text :name
end
```

This will create a text input field that will update the `name` field on that model.

## Field conventions

Avo will convert the snake case version of your field to a humanized version.

In the following example, the `is_available` id will render the label of the field as *Is available*.

```ruby
boolean :is_available
```

<img :src="$withBase('/assets/img/fields-reference/naming-convention.jpg')" alt="Field naming convention" class="border mb-4" />

If you want to customize the label, you can give it a name that's different from the field itself with the `name` property.

```ruby
text :body, name: 'Post body'
```

<img :src="$withBase('/assets/img/fields-reference/naming-convention-override.jpg')" alt="Field naming convention override" class="border mb-4" />

## Showing / Hiding fields on different views

You may want to display a field in the **Create** and **Edit** view and hide it **Index** and **Show** view. For this you may use `hide_on`,
`show_on`, `only_on` and `except_on` methods like so. Available options for these methods are: `:create`, `:edit`, `:index`, `:show`, `:forms`
(both `:create` and `:edit`) and `:all` (only for `hide_on` and `show_on`).

Be aware that some fields are designed in such a way that a few methods or a few options don't work. Check the documentation for fields to find out
more!

```ruby
text :body, hide_on: [:index, :show]
```

## Computed Fields

At times you might need to show a field with something else than you have available in the database. In this case, you may compute the value using a block that receives the `model` (the actual database record), the `resource` (the Avo configured resource), and the current `view`. Then you can compute what to show on this field in the **Index** and **Show** views.

```ruby
boolean 'Has written something' do |model, resource, view|
  model.posts.present?
end
```

This example will display a boolean field with the value computed from your custom block.

## Fields Formatter

There could be a case where you will want to process the database value before showing it to the user. You may do that using `format_using` block.

```ruby
text :is_writer, format_using: -> (value) { value ? '👍' : '👎' }
```

This example snippet will make the `:is_writer` field to generate emojis instead of 1/0 values.

<img :src="$withBase('/assets/img/fields-reference/fields-formatter.jpg')" alt="Fields formatter" class="border mb-4" />

## Sortable fields

One of the most common operations with database records is sorting the records by one of your fields. You leverage the `sortable` option.

Just add it to any field, and Avo will make that column sortable in the **Index** view.

```ruby
text :name, sortable: true
```

<img :src="$withBase('/assets/img/fields-reference/sortable-fields.jpg')" alt="Sortable fields" class="border mb-4" />

## Placeholder

Some fields support the `placeholder` option which will be passed to the inputs on **Edit** and **New** views.

```ruby
text :name, placeholder: 'John Doe'
```

<img :src="$withBase('/assets/img/fields-reference/placeholder.jpg')" alt="Placeholder" class="border mb-4" />

## Required

Sometimes you will want to prevent the user from submitting the form without filling in a field. You may use the `required` option that will add an asterisk to that field, indicating that it's mandatory.

```ruby
text :name, required: true
```

<img :src="$withBase('/assets/img/fields-reference/required.jpg')" alt="Required" class="border mb-4" />

However, you will need to add your validation logic to your model (`validates :name, presence: true`).

## Readonly

Sometimes you will want to prevent the user from editing a field. `readonly` will render the field as `disabled`.

```ruby
text :name, readonly: true
```

<img :src="$withBase('/assets/img/fields-reference/readonly.jpg')" alt="Readonly" class="border mb-4" />

## Default Value

When you need to give a default value to your one of your fields on the **Create** view, you may use the `default` method, which takes either a fixed value or a block.

```ruby
# using a value
text :name, default: 'John'

# using a callback function
select :level, options: { beginner: 'Beginner', advanced: 'Advanced' }, default: -> (model, resource, view, field) { Time.now.hour < 12 ? 'advanced' : 'beginner' }
```

## Help text

Sometimes you will need some extra text to explain better what the field is used for. You can achieve this by using the `help` method.

The value can be either text or HTML.

```ruby
# using text value
code :custom_css, theme: 'dracula', language: 'css', help: "This enables you to edit the user's custom styles."

# using HTML value
password :password, help: 'You may verify the password strength <a href="http://www.passwordmeter.com/">here</a>.'
```

<img :src="$withBase('/assets/img/fields-reference/help-text.jpg')" alt="Help text" class="border mb-4" />

## Nullable

Regularly, Avo is trying to store a value for each field. There are cases where you may prefer to explicitly instruct Avo to store a `NULL` value in the database when the field is empty.
To achieve this, you may use the `nullable` option, which converts nil and empty in `NULL`.

You may also define which values are interpreted as `NULL` using the `null_values` method.

```ruby
# using default options
status :updated_status, failed_when: [:closed, :rejected, :failed], loading_when: [:loading, :running, :waiting], nullable: true

# using custom null values
textarea :body, nullable: true, null_values: ['0', '', 'null', 'nil']
```

## Link to resource

Sometimes, on the **Index** view, you may want a field in the table to be a link to the resource, so that you don't have to scroll to the right to click on the `show` icon. You can use `link_to_resource` to change a table cell to be a link to that resource. You can add this property on `Id`, `Text`, and `Gravatar` fields.

```ruby
# for id field
id link_to_resource: true

# for text field
text :name, link_to_resource: true

# for gravatar field
gravatar :email, link_to_resource: true
```

<img :src="$withBase('/assets/img/fields-reference/as-link-to-resource.jpg')" alt="As link to resource" class="border mb-4" />