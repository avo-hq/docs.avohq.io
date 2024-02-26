# `Avo::Current`

`Avo::Current` is based on the `Current` pattern Rails exposes using [`ActiveSupport/CurrentAttributes`](https://api.rubyonrails.org/classes/ActiveSupport/CurrentAttributes.html).

On each request Avo will set some values on it.

:::option `user`
This is what will be returned by the [`current_user_method`](./authentication.html#customize-the-current-user-method) that you've set in your initializer.
:::

:::option `params`
Equivalent of `request.params`.
:::

:::option `request`
The Rails `request`.
:::

:::option `context`
The [`context`](./customization.html#context) that you configured in your initializer evaluated in `Avo::ApplicationController`.
:::

:::option `view_context`
An instance of [`ActionView::Rendering`](https://api.rubyonrails.org/classes/ActionView/Rendering.html#method-i-view_context) off of which you can run any methods or variables that are available in your partials.

```ruby
view_context.link_to "Avo", "https://avohq.io"
```
:::

:::option `locale`
The `locale` of the app.
:::

:::option `tenant_id`
You can set the `tenant_id` for the current request.
:::

:::option `tenant`
You can set the `tenant` for the current request.
:::

**Related:**
  - [Multitenancy](./multitenancy)
  - [`extend_controllers_with`](./customization#extend_controllers_with)

