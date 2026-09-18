# Display counter indicator on tabs switcher

When a tab contains an association field you may want to show some counter indicator about how many records are on that particular tab.

:::tip Use the built-in `badge` option
Every tab accepts a [`badge`](../fields-layout-api.html#badge) that Avo renders as a pill next to the tab's label. Avo styles that pill for both light and dark mode, so it needs no [Tailwind CSS integration](../tailwindcss-integration). Prefer it over the manual markup below.
:::

## Use the `badge` option

Pass `Avo::UI::CountComponent` — the count pill Avo ships — with the association's size:

```ruby{8,12,18-22}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    main_panel do
    end

    tabs do
      tab title: "Teams", badge: count_badge(record&.teams&.size) do
        field :teams, as: :has_and_belongs_to_many
      end

      tab title: "People", badge: count_badge(record&.people&.size) do
        field :people, as: :has_many
      end
    end
  end

  def count_badge(count)
    return if count.nil?

    Avo::UI::CountComponent.new(count: count)
  end
end
```

`record` is `nil` on the `new` view, which is what `count_badge` guards against: a `nil` badge renders nothing, while `Avo::UI::CountComponent.new(count: nil)` would render an empty pill.

A plain string works too, when you want a status hint instead of a number:

```ruby
tab title: "Reviews", badge: "new" do
  # ...
end
```

## Render your own markup

When you want full control over the markup, put the counter inside the tab's title and return it as HTML:

<Image src="/assets/img/4_0/guides/tabs-counter-indicator/tabs_counter.webp" dark-src="/assets/img/4_0/guides/tabs-counter-indicator/tabs_counter-dark.webp" width="522" height="85" alt="A tabs switcher whose Teams and People labels show a grey record-count badge" />

```ruby{8,12,18-25}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    main_panel do
    end

    tabs do
      tab title: name_with_counter("Teams", record&.teams&.size) do
        field :teams, as: :has_and_belongs_to_many
      end

      tab title: name_with_counter("People", record&.people&.size) do
        field :people, as: :has_many
      end
    end
  end

  def name_with_counter(name, counter)
    view_context.sanitize(
      "#{name} " \
      "<span class='bg-gray-500 ml-1 px-1 text-white text-xs rounded font-semibold'>" \
        "#{counter}" \
      "</span>"
    )
  end
end
```

We are also using the `sanitize` method to return it as HTML.

In order to make the counter stand out, we're using some Tailwind CSS classes that we have available in Avo. If you're trying different classes and they are not applying, you should consider adding the [Tailwind CSS integration](../tailwindcss-integration).

:::warning
Both approaches have some performance implications, as they run the `count` query on every page load.
:::
