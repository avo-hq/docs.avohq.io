---
feedbackId: 834
---

<script setup>
  import {useData} from 'vitepress'
  const {site} = useData()
  const fields = site.value.themeConfig.sidebar['/3.0/']
    .find((item) => item.text === 'Field types')
    .items
    .map((item) => ({
      text: item.text,
      link: item.link.replace('.md', '.html')
    }))
</script>

# Fields

Fields are the backbone of a [`Resource`](./resources).
Through fields you tell Avo what to fetch from the database and how to display it on the <Index />, <Show />, and <Edit /> views.

Avo ships with various simple fields like `text`, `textarea`, `number`, `password`, `boolean`, `select`, and more complex ones like `markdown`, `key_value`, `trix`, `tags`, and `code`.

## Declaring fields

You add fields to a resource through the `fields` method using the `field DATABASE_COLUMN, as: FIELD_TYPE, **FIELD_OPTIONS` notation.

```ruby
def fields
  field :name, as: :text
end
```

The `name` property is the column in the database where Avo looks for information or a property on your model.

That will add a few fields in your new Avo app.

On the <Index /> and <Show /> views, we'll get a new text column of that record's database value.
Finally, on the <Edit /> and <New /> views, we will get a text input field that will display & update the `name` field on that model.

### Specific methods for each view

The `fields` method in your resource is invoked whenever non-specific view methods are present. To specify fields for each view or a group of views, you can use the following methods:

`index` view -> `index_fields`<br>
`show` view -> `show_fields`<br>
`edit` / `update` views -> `edit_fields`<br>
`new` / `create` views -> `new_fields`

You can also register fields for a specific group of views as follows:

`index` / `show` views -> `display_fields`<br>
`edit` / `update` / `new` / `create` views -> `form_fields`

When specific view fields are defined, they take precedence over view group fields. If neither specific view fields nor view group fields are defined, the fields will be retrieved from the `fields` method.

The below example use two custom helpers methods to organize the fields through `display_fields` and `form_fields`

:::code-group
```ruby [display_fields]
def display_fields
  base_fields
  tool_fields
end
```

```ruby [form_fields]
def form_fields
  base_fields
  tool_fields
  tool Avo::ResourceTools::CityEditor, only_on: :forms
end
```

```ruby [tool_fields (helper method)]
# Notice that even if those fields are hidden on the form, we still include them on `form_fields`.
# This is because we want to be able to edit them using the tool.
# When submitting the form, we need this fields declared on the resource in order to know how to process them and fill the record.
def tool_fields
  with_options hide_on: :forms do
    field :name, as: :text, help: "The name of your city", filterable: true
    field :population, as: :number, filterable: true
    field :is_capital, as: :boolean, filterable: true
    field :features, as: :key_value
    field :image_url, as: :external_image
    field :tiny_description, as: :markdown
    field :status, as: :badge, enum: ::City.statuses
  end
end
```

```ruby [base_fields (helper method)]
def base_fields
  field :id, as: :id
  field :coordinates, as: :location, stored_as: [:latitude, :longitude]
  field :city_center_area,
    as: :area,
    geometry: :polygon,
    mapkick_options: {
      style: "mapbox://styles/mapbox/satellite-v9",
      controls: true
    },
    datapoint_options: {
      label: "Paris City Center",
      tooltip: "Bonjour mes amis!",
      color: "#009099"
    }
  field :description,
    as: :trix,
    attachment_key: :description_file,
    visible: -> { resource.params[:show_native_fields].blank? }
  field :metadata,
    as: :code,
    format_using: -> {
      if view.edit?
        JSON.generate(value)
      else
        value
      end
    },
    update_using: -> do
      ActiveSupport::JSON.decode(value)
    end

  field :created_at, as: :date_time, filterable: true
end
```
:::

:::warning In some scenarios fields require presence even if not visible
In certain situations, fields must be present in your resource configuration, even if they are hidden from view. Consider the following example where `tool_fields` are included within `form_fields` despite being wrapped in a `with_options hide_on: :forms do ... end` block.

For instance, when using `tool Avo::ResourceTools::CityEditor, only_on: :forms`, it will render the `features` field, which is of type `key_value`. When the form is submitted, Avo relies on the presence of the `features` field to determine its type and properly parse the submitted value.

If you omit the declaration of `field :features, as: :key_value, hide_on: :forms`, Avo will be unable to update that specific database column.
:::


## Field conventions

When we declare a field, we pinpoint the specific database row for that field. Usually, that's a snake case value.

Each field has a label. Avo will convert the snake case name to a humanized version.
In the following example, the `is_available` field will render the label as *Is available*.

```ruby
field :is_available, as: :boolean
```

<Image src="/assets/img/fields-reference/naming-convention.jpg" width="490" height="78" alt="Field naming convention" />

:::info
If having the fields stacked one on top of another is not the right layout, try the [resource-sidebar](./resource-sidebar).
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

## Field Types

<ul>
  <li v-for="field in fields">
    <a :href="field.link">
      {{field.text}}
      </a>
  </li>
</ul>
