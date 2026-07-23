---
license: community
outline: [2, 3]
---

# How pages are rendered

Every Avo screen — index, show, new, edit — is served by the same controller and follows the same pipeline: a request hits a resource controller, a chain of `before_action`s builds the resource, the action picks a **view component**, and a thin ERB template renders that component inside a layout.

Understanding this flow helps when you want to [customize a controller](./controllers), swap in a [custom view component](./customization), or debug why a page renders the way it does.

:::info
This documents Avo's private controllers. They are a private API and may change between versions without notice. Read this to understand the flow, not to copy internals into your app. When you need to hook in, use the officially supported extension points linked throughout.
:::

## The request lifecycle

Take a typical request like `GET /avo/resources/users`. Here's what happens:

```
Router
  └─► Avo::UsersController  (inherits Avo::BaseController)
        ├─ before_action chain   → builds @resource, @record, fields, authorization
        ├─ #index (the action)   → breadcrumbs, filters, actions, picks @component
        ├─ layout :choose_layout → avo/application (or avo/modal)
        └─ index.html.erb        → renders @component wrapped in a Turbo frame
```

The controller is `Avo::UsersController`, but it barely contains any code. All the shared logic lives in `Avo::BaseController`, which every resource controller inherits from. See [Resource controllers](./controllers) for how to add your own behavior to a single resource.

## 1. The `before_action` chain

Before the action method runs, `Avo::BaseController` runs a series of `before_action`s that assemble everything the page needs. The important ones, in order:

| Callback | Runs for | What it does |
| --- | --- | --- |
| `set_resource_name` | all | Reads the resource name from the params/route. |
| `set_resource` | all | Instantiates the resource (`resource.new(view:, user:, params:)`) into `@resource`, then sets up `@authorization`. Raises `Avo::ResourceNotFoundError` if no resource matches. |
| `set_record` | show, edit, destroy, update, preview | Finds the DB record via `@resource.find_record` and hydrates the resource with it (`@record`). |
| `set_record_to_fill` | new, edit, create, update | Prepares the record that form input will be written into. |
| `detect_fields` | all | Runs the resource's `fields` block for the current view, producing the field list. |
| `fill_record` | create, update (and reactive requests) | Writes permitted params into the record. |
| `authorize_base_action` | all except preview/search | Runs the authorization policy for the action. |

By the time the action method executes, `@resource`, `@record`, `@authorization`, and the resolved fields are all in place.

:::info
Fields are detected **per view**. The `fields` block runs against the current view (`:index`, `:show`, `:new`, `:edit`), which is why a field marked `hide_on: :index` never shows up on the index page — it was never even collected for that view.
:::

## 2. The action method

Each action (`index`, `show`, `new`, `edit`) is small and does the same handful of things:

- Sets `@page_title`.
- Builds the breadcrumbs for the current context (including the parent record when viewing an association).
- Collects the [filters](./filters) and [actions](./actions) available on the page (`set_filters`, `set_actions`).
- Calls `set_component_for(...)` to decide **which view component** renders the page.

For `index`, this is also where the query is built and paginated (`build_index_query`, `apply_pagination`), turning the resource into a list of hydrated resources — one per record.

## 3. Choosing the view component

This is the heart of the render. Avo doesn't render fields directly from ERB — each view is a [ViewComponent](https://viewcomponent.org/). The controller resolves which component to use in `set_component_for`:

```ruby
def set_component_for(view, fallback_view: nil)
  default_component = "Avo::Views::Resource#{(fallback_view || view).to_s.classify}Component"

  # Look for a custom component declared on the resource, by key or by class name
  custom_component = @resource.custom_components.dig(:"resource_#{view}_component") ||
    @resource.custom_components.dig(default_component)

  # Fall back to the default component when the resource doesn't override it
  return @component = default_component.constantize if custom_component.nil?

  @component = custom_component.to_s.safe_constantize

  # A declared-but-missing component is a hard error
  if @component.nil?
    raise "The component '#{custom_component}' was not found."
  end
end
```

The rules:

- **Default** — each view maps to a built-in component: `Avo::Views::ResourceIndexComponent`, `ResourceShowComponent`, `ResourceNewComponent`, `ResourceEditComponent`.
- **Custom** — if the resource declares a component via the `self.components` option, that one is used instead. It's looked up first by the conventional key (`resource_index_component`, `resource_show_component`, …) and then by the default class name.
- **Fallbacks** — `new` and `create` fall back to the edit component (forms share one component), and `create`/`update` reuse `:edit` after a failed save so validation errors re-render the same form.

Override the component on a resource like this:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.components = {
    resource_index_component: "Avo::Views::Users::CustomIndexComponent"
  }
end
```

See [Customize components](./customization) for the full list of overridable keys.

## 4. The layout

`Avo::BaseController` sets its layout with `layout :choose_layout`:

```ruby
def choose_layout
  if params[:modal_layout].present?
    "avo/modal"
  else
    "avo/application"
  end
end
```

Most requests render inside `avo/application` — the full chrome with sidebar, header, and breadcrumbs. Requests that open a record in a modal (for example, creating an associated record inline) pass `modal_layout` and render in the stripped-down `avo/modal` layout instead.

## 5. The ERB template

Finally, the matching template in `app/views/avo/base/` renders the resolved `@component`. The templates are intentionally thin — they only pass state into the component and wrap it in a Turbo frame:

```erb
<%# app/views/avo/base/show.html.erb %>
<%= render Avo::TurboFrameWrapperComponent.new(params[:turbo_frame]) do %>
  <%= render @component.new(
    resource: @resource,
    reflection: @reflection,
    actions: @actions,
    parent_record: @parent_record,
    parent_resource: @parent_resource,
  ) %>
<% end %>
```

The `Avo::TurboFrameWrapperComponent` is what makes association tables, filters, and search update in place without a full page reload — the same controller action can respond to a full page load or a Turbo Frame request, and the component renders accordingly.

## Turbo Stream responses

Not every request ends in a rendered page. Some actions respond with [Turbo Streams](https://turbo.hotwired.dev/handbook/streams) instead of HTML — for example:

- **Search** on the index page replaces just the table body (`#{resource}_body_content`) rather than reloading the whole view.
- **Create/update failures** re-render the form with validation errors via `create_fail_action` / `update_fail_action`.
- **Destroy** from a Turbo Frame reloads the frame and flashes an alert instead of redirecting.

These paths reuse the same `@resource`, fields, and components — they just wrap the output in a `turbo_stream` response targeting a specific part of the page.

## Where to hook in

You almost never need to touch the controller internals above. The supported ways to change what renders are:

- [**Resource controllers**](./controllers) — add `before_action`s or override actions on a single resource's controller.
- [**Custom components**](./customization) — swap the view component for any resource/view via `self.components`.
- [**`Avo::ApplicationController`**](./avo-application-controller) — add cross-cutting behavior (multitenancy, `Current` attributes) the safe way, using concerns.
- [**Eject views**](./eject-views) — take over a specific partial or component template when you need full control of the markup.
