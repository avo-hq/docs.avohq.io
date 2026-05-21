---
license: community
outline: [2, 3]
---

# Fields Layout

Avo gives you a composable DSL to control how fields are arranged on resource show and edit pages. You can nest fields inside panels, split panels into a main area and a sidebar, group panels under tabs, and control where the resource header appears.

## Layout building blocks

| Block     | Purpose                                                                          | Nesting                     |
| --------- | -------------------------------------------------------------------------------- | --------------------------- |
| `header`  | Title, description, profile photo, discreet information and controls             | Root level                  |
| `panel`   | Groups related fields inside a titled container                                  | Root level or inside `tabs` |
| `card`    | Lightweight grouping inside a panel — useful for sectioning fields visually      | Inside a panel              |
| `sidebar` | Narrow column for compact fields (boolean, date, badge…)                         | Inside a panel              |
| `tabs`    | Tabbed container that switches between panels and tools                          | Root level                  |

### Default behavior

When you declare fields at the root level without any explicit structure, Avo wraps them in a computed panel and places a **header** at the top automatically. The result looks like this:

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id,    as: :id
    field :name,  as: :text
    field :email, as: :text
  end
end
```

Avo renders the header, then a single panel containing all three fields — no extra DSL needed.

### Explicit structure

As resources grow, declare the structure explicitly to get full control:

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    header # place header here rather than at the very top

    panel do
      field :id,         as: :id, link_to_record: true
      field :first_name, as: :text
      field :last_name,  as: :text

      sidebar do
        field :active,     as: :boolean, only_on: :show
        field :created_at, as: :date_time, only_on: :show
      end
    end

    tabs do
      tab title: "Projects" do
        panel do
          field :projects, as: :has_many
        end
      end

      tab title: "Settings" do
        panel do
          field :role,     as: :select, enum: ::User.roles
          field :verified, as: :boolean
        end
      end
    end
  end
end
```

## Field-level layout

Beyond structural blocks, individual fields have two layout modes that control how their label and value are positioned relative to each other.

### Inline (default)

Label and value sit side by side. This is the default for every field.

```ruby
field :meta, as: :key_value
```

### Stacked

Label is placed above the value, giving the value the full horizontal width. Useful for wide fields like `key_value`, `trix`, `code`, or `markdown`.

```ruby
field :meta, as: :key_value, stacked: true
```

:::info
Fields inside a `sidebar` are always stacked automatically because the narrower column requires it.
:::

### Global stacked layout

To apply stacked layout to every field across the entire app, set the initializer option:

```ruby
Avo.configure do |config|
  config.field_wrapper_layout = :stacked
end
```

## Multi-column rows with `width`

To place multiple fields on the same row, pass a `width` percentage to each one. Adjacent fields with a `width` below `100` sit side by side.

```ruby
field :first_name, width: 50
field :last_name,  width: 50
```

Supported values are `25`, `33`, `50`, `66`, `75`, and `100` (default). See [`width` in field options](./field-options#width) for the full reference.

## Layout reference

| Page                                | What it covers                                                            |
| ----------------------------------- | ------------------------------------------------------------------------- |
| [Header](./resource-header.html)    | Auto-generation, custom positioning, header content                       |
| [Panels](./resource-panels.html)    | Custom panels, cards, computed vs. manual grouping, panel options         |
| [Sidebars](./resource-sidebar.html) | Sidebar block, `panel_wrapper` option, per-panel sidebars                 |
| [Tabs](./tabs.html)                 | Tab groups, nesting panels inside tabs, associations inside tabs          |
