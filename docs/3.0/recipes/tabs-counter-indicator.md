# Display counter indicator on tabs switcher

When a tab contains an association field you may want to show some counter indicator about how many records are on that particular tab. You can include that information inside tab's name.

![](/assets/img/recipes/tabs-counter-indicator/tabs_counter.png)

```ruby{7,10,16-23}
class Avo::Resources::User < Avo::BaseResource
  def fields
    main_panel do
    end

    tabs do
      tab name_with_counter("Teams", record&.teams&.size) do
        field :teams, as: :has_and_belongs_to_many
      end
      tab name_with_counter("People", record&.people&.size) do
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
This approach will have some performance implications as it will run the `count` query on every page load.
:::
