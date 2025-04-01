## Show on edit screens

By default, the `{{ $frontmatter.field_type }}` field is only visible in the [show](./../views.html#Show) view. To make it available in the [edit](./../views.html#Edit) view as well, include the `show_on: :edit` option. This ensures that the `{{ $frontmatter.field_type }}` [show](./../views.html#Show) view component is also rendered within the [edit](./../views.html#Edit) view.
