---
feedbackId: 834
license: community
outline: [2, 3]
---

# Fields

Fields are the backbone of a [`Resource`](./resources).
Through fields you tell Avo what to fetch from the database and how to display it on the <Index />, <Show />, and <Edit /> views.

Fields can also be used in [`Actions`](./actions/overview) to gather user input before running the action.

Avo ships with various simple fields like `text`, `textarea`, `number`, `password`, `boolean`, `select`, and more complex ones like `markdown`, `key_value`, `trix`, `tags`, and `code`.

## Declaring fields

You add fields to a resource through the `fields` method using the `field DATABASE_COLUMN, as: FIELD_TYPE, **FIELD_OPTIONS` notation.

```ruby
def fields
  field :name, as: :text
end
```

The first argument (`:name` here) is the column in the database where Avo looks for information, or a property on your model.

On the <Index /> and <Show /> views, we'll get a new text column of that record's database value.
Finally, on the <Edit /> and <New /> views, we will get a text input field that will display & update the `name` field on that model.

### Specific methods for each view

The `fields` method is used whenever no view-specific method is defined. To specify fields for each view or a group of views, you can use the following methods:

`index` view -> `index_fields`<br>
`show` view -> `show_fields`<br>
`edit` / `update` views -> `edit_fields`<br>
`new` / `create` views -> `new_fields`

You can also register fields for a specific group of views as follows:

`index` / `show` views -> `display_fields`<br>
`edit` / `update` / `new` / `create` views -> `form_fields`

When specific view fields are defined, they take precedence over view group fields. If neither specific view fields nor view group fields are defined, the fields will be retrieved from the `fields` method.

```ruby
class Avo::Resources::City < Avo::BaseResource
  # Used on the `index` and `show` views
  def display_fields
    field :id, as: :id
    field :name, as: :text
    field :population, as: :number
    field :created_at, as: :date_time
  end

  # Used on the `new`, `create`, `edit`, and `update` views
  def form_fields
    field :name, as: :text
    field :population, as: :number
  end
end
```

:::info
On the [`preview`](./fields/preview) view, Avo gathers fields from the `fields`, `index_fields`, `show_fields`, and `display_fields` methods combined.
:::

:::warning Some fields must be declared even when hidden
When a form submits a value for a field, that field must be declared on the form views so Avo knows its type and can parse the submitted value. This comes up with [resource tools](./resource-tools) that render inputs for fields themselves: declare those fields with `hide_on: :forms` instead of omitting them.

For instance, if a tool renders an input for `features`, a `key_value` field, you must keep `field :features, as: :key_value, hide_on: :forms` in your form fields. Omit it and Avo will be unable to update that database column.
:::


## Field conventions

When we declare a field, we pinpoint the specific database column for that field. Usually, that's a snake case value.

Each field has a label. Avo will convert the snake case name to a humanized version.
In the following example, the `is_available` field will render the label as *Is available*.

```ruby
field :is_available, as: :boolean
```

:::info
If having the fields stacked one on top of another is not the right layout, try the [sidebar](./fields-layout#move-compact-fields-to-a-sidebar).
:::

### A more complex example

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
    field :first_name, as: :text
    field :last_name, as: :text
    field :email, as: :text
    field :active, as: :boolean
    field :cv, as: :file
    field :is_admin?, as: :boolean
  end
end
```

The `fields` method is already hydrated with the `current_user`, `params`, `request`, `view_context`, and `context` variables so you can use them to conditionally show/hide fields

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
    field :first_name, as: :text
    field :last_name, as: :text
    field :email, as: :text
    field :is_admin?, as: :boolean
    field :active, as: :boolean

    if current_user.is_admin?
      field :cv, as: :file
    end
  end
end
```

<Image src="/assets/img/4_0/fields/complex-example.webp" dark-src="/assets/img/4_0/fields/complex-example-dark.webp" width="980" height="372" alt="User resource Show view with id, first and last name, email, active, cv and is_admin fields" />

## Field types

<FieldTypesList />
