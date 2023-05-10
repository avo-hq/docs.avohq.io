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
