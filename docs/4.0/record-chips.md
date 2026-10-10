---
license: addon
addon_link: https://avohq.io/addons/ai
outline: [2, 3]
api_docs: ./record-chips-api.html
---

# Record chips

Record chips turn records named by the Avo AI assistant into compact, clickable summaries. Define a chip on the resource to control its stable content, visual treatment, tooltip, and whether the assistant may include fields relevant to the current answer.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  def chip
    part resource.avatar
    part resource.record_title
    part record.status, tone: :success
    dynamic_fields only: %i[owner due_at]
  end
end
```

Without a declaration, every resource inherits a default [`chip`](./record-chips-api.html#chip) containing `part resource.avatar` followed by `part resource.record_title`. Defining `chip` replaces that default wholesale. Dynamic fields are disabled unless the resource enables them.

:::warning `def chip` is alpha
The DSL is new and still moving. Expect the part vocabulary, tones, and method names to change before it settles. Breaking changes will be documented in release notes, so plan to revisit chip declarations when upgrading.
:::

## Choose what the chip shows

Add one [`part`](./record-chips-api.html#part) for each piece of content. Parts render in declaration order, so put the title exactly where it belongs.

```ruby
# app/avo/resources/issue.rb
class Avo::Resources::Issue < Avo::BaseResource
  def chip
    part resource.avatar
    part icon: "tabler/outline/circle-dot", tone: :success
    part record.identifier, tone: :muted
    part resource.record_title
    part record.assignee_name, tone: :muted
  end
end
```

`record` and `resource` are available because `chip` is an ordinary resource instance method. The resource also delegates `view`, `params`, `request`, `context`, `current_user`, `view_context`, `main_app`, `avo`, `helpers`, and `t`. Call helpers through `view_context` or `helpers`; unlike a lambda, `chip` does not implicitly forward bare helper calls to the view context.

Empty parts are skipped, so conditional values do not need special handling. Avatar objects render as pictures; other values render as text. See the [`part` reference](./record-chips-api.html#part) for icon and tone values.

## Give the chip a background

Use [`background`](./record-chips-api.html#background) with one fill source: a color, gradient, or image.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  def chip
    background gradient: [:indigo, "#c026d3", :rose]
    part resource.avatar
    part resource.record_title
    part record.status
  end
end
```

Avo chooses light or dark text by measuring declared colors against a 4.5:1 contrast floor. For gradients and photographs, it adds the smallest light or dark scrim needed for readable text. Set [`foreground`](./record-chips-api.html#foreground) only when the visual direction matters more than automatic selection; contrast protection still applies.

A filled chip uses one foreground color for all parts because semantic colors cannot remain readable on every fill. A muted part keeps its hierarchy through its smaller secondary text size.

## Add fields that fit the answer

Enable [`dynamic_fields`](./record-chips-api.html#dynamic_fields) where answer-specific values should appear. The assistant selects Avo fields requested by the query, while Avo formats and labels their current values through the field definitions.

```ruby
# app/avo/resources/city.rb
class Avo::Resources::City < Avo::BaseResource
  def chip
    part resource.avatar
    part resource.record_title
    dynamic_fields only: %i[population continent]
    part record.status, tone: :success
  end
end
```

Dynamic values appear exactly where `dynamic_fields` is declared and render muted. A value is not
repeated when a declared part already contains that value. If the query requests no permitted
field, the declared chip remains unchanged.

Use [`only`](./record-chips-api.html#only) to offer a small set or [`except`](./record-chips-api.html#except) to exclude unsuitable readable fields. Authorization, field policy, and `visible:` always win. Unknown fields and arbitrary record methods are ignored.

Call `dynamic_fields false` when conditional Ruby should explicitly turn the feature off:

```ruby
# app/avo/resources/order.rb
class Avo::Resources::Order < Avo::BaseResource
  def chip
    part resource.avatar
    part resource.record_title
    dynamic_fields current_user.can_view_order_details?
  end
end
```

## Customize the hover text

Define [`chip_tooltip`](./record-chips-api.html#chip_tooltip) when the record title is not the most useful hover text.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  def chip_tooltip
    record.summary
  end
end
```

A blank tooltip or an exception falls back to the record title without losing the chip.

## Keep links and authorization consistent

Chips resolve records through the viewer's policy, the record's `to_param`, and the resource's `find_record_method`. This keeps friendly IDs, hashids, custom finders, and authorization aligned with the rest of Avo. A missing or unauthorized record renders as plain label text rather than exposing a link.

A chip appears only when an answer names a record, so counts and totals do not produce chips. When the answer itself is a set of records, Avo renders the chips as full-width rows. A record embedded in a sentence remains inline.

## Support streaming and reloads

Chips render both while an answer streams from a background job over Turbo Stream and when a controller reloads the conversation. The same declaration and delegated resource context work in both paths, including `view_context`, `main_app`, and `avo`, so content should not depend on a request existing.

Dynamic field values are also resolved live at render time. A reloaded conversation therefore displays the record's current permitted value, not a value copied into the original message.
