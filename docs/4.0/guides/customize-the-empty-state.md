---
license: community
outline: [2, 3]
---

# Customize the empty state

When a list has no records to show, Avo renders an empty state in its place: a small stack of illustrated cards and a short message. It's the `Avo::EmptyStateComponent` ViewComponent, and Avo renders it on:

- the <Index /> page of a resource with no records, or none matching the current search, filters or scope
- association panels (`has_many`, `has_and_belongs_to_many`, and `has_one` with no record attached)

Depending on how much you want to change, there are three ways to customize it:

| You want to | Use |
| --- | --- |
| Change the message everywhere | [The locale keys](#change-the-message) |
| Show a different empty state for one resource | [An `index_slot`](#change-it-for-one-resource) |
| Change how it looks everywhere | [An ejected component](#change-it-everywhere) |

## Change the message

The message comes from two locale keys:

| Key | Default (`en`) | Shown |
| --- | --- | --- |
| `avo.no_item_found` | No record found | On the <Index /> page, and in a `has_one` panel with no record attached |
| `avo.no_related_item_found` | No related record found | In `has_many` and `has_and_belongs_to_many` panels |

Set them in one of your app's locale files to change the message across every resource:

```yaml
# config/locales/avo.en.yml
en:
  avo:
    no_item_found: Nothing here yet
    no_related_item_found: Nothing linked yet
```

Both keys are plain strings, so this is a safe override. See [What you can safely put under `avo.`](./../i18n.html#safe-keys) for the rules on overriding Avo's strings.

## Change it for one resource

<VersionReq package="avo" version="4.3.6" />

Each resource can replace its own listing with an [`index_slot`](./../slots.html). When there are no records, the `records` region holds the empty state instead of the table or grid, so replace that region and branch on `resources.empty?`:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  index_slot :records, replace: true do
    if resources.empty? && parent_record.present?
      render Avo::EmptyStateComponent.new(message: "#{parent_resource.record_title} has no projects yet.")
    else
      default_content.call
    end
  end
end
```

The slot runs on the resource's <Index /> page and on every `has_many` and `has_and_belongs_to_many` panel that lists it. `parent_record` is the record the panel belongs to, and `parent_resource` its resource. Both are `nil` on the <Index /> page, so here only the panels change. Every other case calls `default_content`, which renders the records, or Avo's own empty state when there are none.

`Avo::EmptyStateComponent` takes a `message` that replaces the locale text, so you keep the illustration and only change the words. You can also render your own partial or component instead.

The empty state also shows when a search, filter or scope matches nothing, so write a message that still reads well then.

:::info
Slots only reach the listings. A `has_one` panel with no record attached renders the empty state directly, so to change that one, [eject the component](#change-it-everywhere).
:::

## Change it everywhere

To change the markup itself, for example to drop the illustration and keep a compact message, eject the component:

```bash
bin/rails generate avo:eject --component Avo::EmptyStateComponent
      create  app/components/avo/empty_state_component.rb
      create  app/components/avo/empty_state_component.html.erb
```

Your copy replaces Avo's on every page that renders an empty state. The template below keeps the message and removes the cards:

```erb
<%# app/components/avo/empty_state_component.html.erb %>
<%= content_tag :div, class: class_names("state", @classes) do %>
  <p class="state__message"><%= text %></p>
<% end %>
```

The component accepts three props. Avo passes `by_association` wherever it renders the component, and you can pass `message` and `classes` when you render it yourself:

| Prop | Default | Meaning |
| --- | --- | --- |
| `message` | `nil` | Text that replaces the locale message. |
| `by_association` | `false` | `true` inside `has_many` and `has_and_belongs_to_many` panels. It picks `avo.no_related_item_found` instead of `avo.no_item_found`. |
| `classes` | `nil` | Extra classes for the wrapper. |

`text` in the template returns `message` when one is given, and the locale message otherwise. Keep the props and `text` in your copy, even if your template doesn't use them all.

The `state` classes in the example are Avo's own, so they're already in its stylesheet. If you style your copy with Tailwind classes that Avo doesn't use itself, set up the [TailwindCSS integration](./../tailwindcss-integration.html) so they get built.

An ejected component stops receiving Avo's changes to it. When you upgrade Avo, compare your copy with the new version of `Avo::EmptyStateComponent`. See [Eject views](./../eject-views.html#eject-a-component) for more on ejecting.
