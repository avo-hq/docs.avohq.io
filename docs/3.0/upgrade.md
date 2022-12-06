# Upgrade guide

We generally push changes behind the scenes, so you don't have to update your code, but sometimes the public API is updated too.

Follow these guides to make sure your configuration files are up to date.

:::warning
The 2.x to 3.0 Upgrade is a work in progress
:::

## Upgrade from 2.x to 3.0

## Removed keyword arguments from blocks

We implemented this `ExecutionContext` class that `instance_exec` the majority of avo blocks. This way blocks can be more flexible and scalable. For example, if some feature add access to some variables on some block, there is no need for you to update the keywords arguments, you can just update avo and instantly have access to that variables inside that block.

### Select options block
```ruby
# Before
field :level, as: :select, as_description: true, display_value: true,
  default: -> { Time.now.hour < 12 ? "advanced" : "beginner" },
  options: ->(model:, resource:, field:, view:) do // [!code focus]
     Beginner: :beginner, Intermediate: :intermediate, Advanced: :advanced }
end

# After
field :level, as: :select, as_description: true, display_value: true,
  default: -> { Time.now.hour < 12 ? "advanced" : "beginner" },
  options: -> do // [!code focus]
    { Beginner: :beginner, Intermediate: :intermediate, Advanced: :advanced }
end
```

### Resource resolve_query_scope block
```ruby
# Before
self.resolve_query_scope = ->(model_class:) do // [!code focus]
    model_class.order(last_name: :asc)
  end

# After
self.resolve_index_query = -> do // [!code focus]
    model_class.order(last_name: :asc)
  end
```

:::warning
  Method name changed from `resolve_query_scope` to `resolve_index_query`
:::
### Resource resolve_find_scope block
```ruby
# Before
self.resolve_find_scope = ->(model_class:) do // [!code focus]
    model_class.friendly
  end

# After
self.resolve_find_scope = -> do // [!code focus]
    model_class.friendly
  end
```

### Field visible block
```ruby
# Before
field :user, as: :belongs_to, searchable: true, visible: ->(resource:) { // [!code focus]
  resource.params[:id].present?
}

# After
field :user, as: :belongs_to, searchable: true, visible: -> { // [!code focus]
  resource.params[:id].present?
}
```

### Moved some globals to Avo::Current

Rename the follwing
- `Avo::App.context`      -> `Avo::Current.context`
- `Avo::App.current_user` -> `Avo::Current.current_user`
- `Avo::App.params`       -> `Avo::Current.params`
- `Avo::App.request`      -> `Avo::Current.request`
- `Avo::App.view_context` -> `Avo::Current.view_context`
