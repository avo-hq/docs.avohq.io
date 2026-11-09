---
license: community
description: "The badge field is used to display an easily recognizable status of a record."
fieldTags: [display]
outline: [2, 3]
api_docs: ./badge-api.html
---

# Badge

The `badge` field displays a record's status as a colored label on the <Index /> and <Show /> views. Map stored values to colors to make statuses easy to recognize.

```ruby
# app/avo/resources/project.rb
field :status, as: :badge,
  options: {
    success: "Done",
    danger: "Cancelled",
    warning: "On hold",
    green: "In review",
    purple: "Idea"
  }
```

<span id="description"></span>

Without configuration, badges use a subtle appearance with no icon, render values in neutral colors, and stay off forms. To allow editing, see [Editing the value](#editing-the-value).

<Image src="/assets/img/4_0/fields/badge/types.webp" dark-src="/assets/img/4_0/fields/badge/types-dark.webp" width="1280" height="668" alt="Two Avo panels showing every badge color the field can render at its native size, grouped by category: a Base colors panel with red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink and rose badge pills, and a Semantic colors panel with neutral, info, success, warning and danger badge pills, each labelled with its color name." prompt="all posible badges types split nice per categories no outside labels, the label should be inside the badge" />

## Color-code statuses {#options}

Use [`options`](./badge-api.html#options) to group stored values by color. A single color can cover several statuses, and values not included in the mapping remain neutral. See the [available colors](./badge-api.html#options) for the complete palette.

<span id="examples"></span>
<span id="using-semantic-colors"></span>

```ruby
# app/avo/resources/project.rb
field :status, as: :badge,
  options: {
    success: ["active", "completed"],
    info: ["pending", "review"],
    danger: ["failed", "cancelled"],
    neutral: "unknown"
  }
```

<span id="using-base-colors"></span>

For priorities, use base colors to show increasing urgency:

```ruby
# app/avo/resources/project.rb
field :priority, as: :badge,
  options: { green: :low, amber: :medium, orange: :high, red: :urgent }
```

## Emphasize a status {#style}

Set [`style`](./badge-api.html#style) to `"solid"` for a stronger background, or use a lambda to emphasize only particular records:

```ruby
# app/avo/resources/project.rb
field :status, as: :badge,
  options: { success: "Done", warning: "On hold" },
  style: -> { record.status == "Done" ? "solid" : "subtle" }
```

## Add a status icon {#icon}

Provide [`icon`](./badge-api.html#icon) with an icon name such as `"heroicons/outline/check-circle"`. For a different icon per status, return the name from a lambda:

```ruby
# app/avo/resources/project.rb
field :status, as: :badge,
  options: { success: "Done" },
  icon: -> {
    record.status == "Done" ? "heroicons/outline/check-circle" : "heroicons/outline/x-circle"
  }
```

Both dynamic options use an [ExecutionContext](../execution-context.html), with access to `record`, `resource`, `view`, and `field`.

## Editing the value

<VersionReq package="avo" version="4.3.1" />

Add [`show_on: :forms`](../field-options.html#show_on) and the badge renders a select of the values listed in `options` on <New /> and <Edit />:

```ruby
# app/avo/resources/project.rb
field :stage, as: :badge,
  show_on: :forms,
  options: {
    info: ["discovery", "idea"],
    success: "done",
    danger: "cancelled"
  }
```

Badges stay off forms unless you opt in. Any visibility option does it, so `only_on: [:show, :edit]` and `except_on: :index` put the select on forms too.

- The select starts with a blank option, so a record with no value doesn't silently take the first one on its next save. A blank selection saves `""`. Add [`nullable: true`](../field-options.html#nullable) to save `nil` instead.
- A value that `options` doesn't map to a color still shows in the list for the record that holds it, so saving the form never erases it.
- A computed badge, one declared with a block, stays off forms.
- In an [action](./../actions.html) modal, a badge with `show_on: :forms` renders as the same select. Without it, the badge renders read-only.

### Custom labels with a Select field

The select lists the stored values as they are. For labels or a placeholder, keep the badge off forms and pair it with a [Select](./select.html) field on the same attribute:

```ruby
# app/avo/resources/project.rb
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
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: "on hold",
    danger: :cancelled,
    neutral: :drafting
  },
  style: -> { ["done", "cancelled"].include?(record.stage) ? "solid" : "subtle" },
  icon: -> {
    {
      "discovery" => "tabler/outline/zoom",
      "idea" => "tabler/outline/bulb",
      "drafting" => "tabler/outline/file-text",
      "done" => "tabler/outline/circle-check",
      "on hold" => "tabler/outline/player-pause",
      "cancelled" => "tabler/outline/xbox-x"
    }[record.stage]
  }
```

## Show when a status changed {#showing-the-moment-behind-a-status}

A badge says *what* the state is. The [`tooltip`](../field-options.html#tooltip) option can say *when*, on hover, without spending a column on it:

```ruby
# app/avo/resources/project.rb
field :status,
  as: :badge,
  options: {success: :active, warning: :expired, danger: :revoked},
  tooltip: -> { "Revoked at #{record.revoked_at}" if record.revoked_at? }
```
