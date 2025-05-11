# Custom view types
By default, Avo displays all the configured view types on the view switcher. For example, if you have `map_view` and `grid_view` configured, both of them, along with the `table_view`, will be available on the view switcher.

However, there might be cases where you only want to make a specific view type available without removing the configurations for other view types. This can be achieved using the `view_types` class attribute on the resource. Note that when only one view type is available, the view switcher will not be displayed.

```ruby{3}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = :table
  #...
end
```

If you want to make multiple view types available, you can use an array. The icons on the view switcher will follow the order in which they are declared in the configuration.

```ruby{3}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = [:table, :grid]
  #...
end
```

You can also dynamically restrict the view types based on user roles, params, or other business logic. To do this, assign a block to the `view_types` attribute. Within the block, you'll have access to `resource`, `record`, `params`, `current_user`, and other default accessors provided by `ExecutionContext`.


```ruby{3-9}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = -> do
    if current_user.is_admin?
      [:table, :grid]
    else
      :table
    end
  end
  #...
end
```
