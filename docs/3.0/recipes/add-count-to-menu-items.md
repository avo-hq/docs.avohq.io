# Add count to menu items

Create the `app/concerns/navigation_label_with_count.rb` file and then include that module on the resources you want to show a count in the sidebar `include NavigationLabelWithCount`.

From [here](https://discord.com/channels/740892036978442260/1004202524800204860).

```ruby
module NavigationLabelWithCount
  def navigation_label
    <<-HTML
    <div class="w-full flex justify-between pr-3">
      <div>#{plural_name}</div>
      <div>#{resource_count_html}</div>
    </div>
    HTML
    .html_safe
  end

  private

  def resource_count_html
    c = resource_count
    return if c == 0
    <<-HTML
    <span class="#{resource_count_tailwind_classes(c)}">
      #{resource_count}
    </span>
    HTML
  end

  def resource_count
    resolve_query_scope.call(model_class: model_class).count
  end

  def resource_count_tailwind_classes(c)
    classes = %w(
      text-white
      px-2
      py-0.5
      text-xs
      rounded-full
    )
    if c == 0
      classes << "bg-gray-300"
    else
      classes << "bg-blue-500"
    end
    classes.join(" ")
  end
end
```