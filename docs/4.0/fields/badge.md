---
version: '1.0'
license: community
---

# Badge

The `Badge` field is used to display an easily recognizable status of a record.

<Image src="/assets/img/fields/badge_v4.jpg" width="450" height="194" alt="Badge field" />

```ruby
field :stage,
  as: :badge,
  color: :green,
  style: :solid,
  icon: "heroicons/outline/document-text"
```

## Description

The Badge field displays a colored indicator with optional icons. You can customize the `color`, `style`, and `icon` for each value dynamically using procs.

The `Badge` field is intended to be displayed only on **Index** and **Show** views. To update the value shown by the badge field, use another field like [Text](#text) or [Select](#select) with `hide_on: [:index, :show]`.

## Options

<Option name="`color`">

Sets the badge color. Accepts a static value or a proc for dynamic coloring based on the record.

#### Available colors

**Base colors:** `orange`, `yellow`, `green`, `teal`, `blue`, `purple`

**Semantic colors:** `neutral`, `success`, `error`, `danger`, `info`


```ruby
field :status, as: :badge, color: "green"

# Or dynamically
field :status, as: :badge, color: -> { record.active? ? "green" : "orange" }
```
</Option>

<Option name="`style`">

Controls the badge appearance style.

#### Available styles

- `subtle` - Light background with colored text (default)
- `solid` - Solid colored background with white text

```ruby
field :status, as: :badge, color: :green, style: "solid"

# Or dynamically
field :status, as: :badge, color: :green, style: -> { record.completed? ? "solid" : "subtle" }
```
</Option>

<Option name="`icon`">

Adds an icon to the badge.

```ruby
field :status, as: :badge, icon: "heroicons/outline/check-circle"

# Or dynamically
field :status, as: :badge, icon: -> {
  record.approved? ? "heroicons/outline/check-circle" : "heroicons/outline/x-circle"
}
```
</Option>

## Legacy `options` syntax

:::info Backward compatibility
The legacy `options` syntax is still supported. Avo maps the old colors to the new ones automatically.
:::

```ruby
field :stage,
  as: :badge,
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: 'on hold',
    danger: :cancelled,
    neutral: :drafting
  }
```
## Examples

### Using Badge with a Select field for editing

Since Badge is display-only, pair it with a Select field to allow editing:

```ruby
field :stage,
  as: :select,
  hide_on: [:show, :index],
  options: {
    'Discovery': :discovery,
    'Idea': :idea,
    'Done': :done,
    'On hold': 'on hold',
    'Cancelled': :cancelled,
    'Drafting': :drafting
  },
  placeholder: 'Choose the stage.'

field :stage,
  as: :badge,
  hide_on: :forms,
  color: -> {
    {
      "Discovery" => "green",
      "Idea" => "blue",
      "Drafting" => "purple",
      "Done" => "green",
      "On hold" => "orange",
      "Cancelled" => "orange"
    }[record.stage]
  },
  style: -> { ["Done", "Cancelled"].include?(record.stage) ? "solid" : "subtle" },
  icon: -> {
    {
      "Discovery" => "heroicons/outline/magnifying-glass",
      "Drafting" => "heroicons/outline/document-text",
      "Done" => "heroicons/outline/check-circle",
      "On hold" => "heroicons/outline/pause-circle",
      "Cancelled" => "heroicons/outline/x-circle"
    }[record.stage]
  }
```
