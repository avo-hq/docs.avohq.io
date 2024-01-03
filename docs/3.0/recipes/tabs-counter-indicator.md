# Display counter indicator on tabs switcher

When a tab contains an association field you may want to show some counter indicator about how many records are on that particular tab. You can include that information inside tab's name:

```ruby{6,9}
def fields
  main_panel do
  end

  tabs do
    tab "Teams (#{record&.teams&.size})" do
      field :teams, as: :has_and_belongs_to_many
    end
    tab "People (#{record&.people&.size})" do
      field :people, as: :has_many
    end
  end
end
```

![](/assets/img/recipes/tabs-counter-indicator/tabs_counter.png)
