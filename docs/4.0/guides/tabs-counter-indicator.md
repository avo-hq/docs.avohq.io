# Display counter indicator on tabs switcher

When a tab wraps an association, you often want a count next to the label so users can see how many records sit behind it before they open the tab.

<Image src="/assets/img/4_0/guides/tabs-counter-indicator/tabs_counter.webp" dark-src="/assets/img/4_0/guides/tabs-counter-indicator/tabs_counter-dark.webp" width="522" height="85" alt="A tabs switcher whose Teams and People labels show a grey record-count badge" />

Pass [`badge`](../fields-layout-api.html#badge) on the `tab` and hand it an `Avo::UI::CountComponent` — the same accent-tinted count pill Avo uses on filters and scopes:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    panel do
      field :id, as: :id
      field :name, as: :text
    end

    tabs do
      tab title: "Teams", badge: Avo::UI::CountComponent.new(count: record&.teams&.size) do
        field :teams, as: :has_and_belongs_to_many
      end

      tab title: "People", badge: Avo::UI::CountComponent.new(count: record&.people&.size) do
        field :people, as: :has_many
      end
    end
  end
end
```

`CountComponent` also accepts `label:` (rendered as `aria-label` when the visible count is abbreviated), plus `data:` and `classes:` for the pill.

:::warning
`record.association.size` runs a count query on every page load — once per badged tab. Prefer a [counter cache](https://guides.rubyonrails.org/association_basics.html#options-for-belongs-to-counter-cache) when the association is large, or compute the count only when you need it.
:::

## Custom badge content

`badge` accepts any ViewComponent instance or an HTML-safe string, so you can render your own markup when `CountComponent` isn't the right fit:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    tabs do
      tab title: "Teams", badge: teams_badge do
        field :teams, as: :has_and_belongs_to_many
      end
    end
  end

  def teams_badge
    view_context.sanitize(
      "<span class='count'>#{record.teams.size}</span>"
    )
  end
end
```

If you invent your own CSS classes for the pill, wire up the [Tailwind CSS integration](../tailwindcss-integration.html) so they are compiled into the host build.
