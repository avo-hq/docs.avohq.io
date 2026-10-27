---
license: community
outline: [2, 3]
---

# Views

The Avo CRUD feature generates four main views for each resource.

## Index

The page where you see all your resources listed in a [table](./table-view.html), [grid](./grid-view.html), or [map](./map-view.html).
<br/>
<RelatedList>
<RelatedItem href="./customization.html#click-a-row-to-view-the-record">Click row to view record</RelatedItem>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

### Add content to the index

<VersionReq version="4.3.6" />

Use [`index_slot`](./resources-api.html#index_slot) to add a summary, notice, or other content around the existing index UI without replacing its component:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  index_slot :after_header do
    render partial: "avo/projects/summary", locals: {resource: resource}
  end
end
```

Without registrations, the index is unchanged. Slots add content by default; replacing a built-in region requires `replace: true`. Slots do not grant permissions or run once per row. They apply only to index views, including association index panels, not Show, Edit, or New views.

The generic form, [`view_slot :index, :after_header do ... end`](./resources-api.html#view_slot), is equivalent to `index_slot :after_header do ... end`. Both append to the same registrations in declaration order. Only `:index` is currently supported; other views raise an error rather than silently ignoring content.

Pass partial locals explicitly. Avo does not add them automatically:

```erb
<%# app/views/avo/projects/_summary.html.erb %>
<div class="mb-4 rounded border p-4">
  Review these projects before starting a new one.
</div>
```

Slots have no automatic wrapper or spacing. Use your own markup and classes. The `before_title` and `after_title` positions sit inline beside the title, so return inline content such as a badge rather than a full-width panel.

See the [position reference](./resources-api.html#index_slot) for all fourteen positions and their placement. Register multiple blocks at a position to render them in registration order. A child resource keeps inherited registrations and can add its own without changing its parent or siblings.

Use `before_collection` / `after_collection` for full-width content outside the complete table or grid and its paginator. Use `before_records` / `after_records` immediately around the records, inside the card for tables. Title slots are inside the header and pagination slots are inside the table footer. These are insertion points inside existing areas, not replacements for their built-in content.

### Add the same content to every resource

Declare shared slots in your application's base resource before individual resources declare their own:

```ruby
# app/avo/base_resource.rb
class Avo::BaseResource < Avo::Resources::Base
  index_slot :before_title do
    render partial: "avo/shared/resource_badge",
      locals: {resource: resource}
  end
end
```

Every resource inheriting from this base receives the registration, including association index panels. The block's `resource` is the resource currently rendering. Individual resources can append their own slots. A fully replaced header that omits its default also omits these nested title hooks.

There is no separate global slot initializer or public API to remove an inherited addition. For exceptions, keep the condition in the shared block and return `nil` for resources or panels that should not display it:

```ruby
# app/avo/base_resource.rb
class Avo::BaseResource < Avo::Resources::Base
  index_slot :before_title do
    next if resource.model_class.name == "AuditEvent"
    next if parent_record.present?

    tag.span("Internal", class: "text-xs text-gray-500")
  end
end
```

This example shows the badge on top-level indexes except `AuditEvent`. Use this block instead of the earlier shared declaration, not in addition to it. Additions accumulate; a later declaration does not replace the earlier one. Resources supplied by an engine only inherit this registration if they use your application's base resource.

:::warning Register shared slots before resource-specific slots
Inheritance uses copy-on-write registrations. Adding shared declarations later, such as from an initializer after resources have loaded, can leave customized children using an earlier copy. This applies to both additions and replacements. Define shared registrations in the base resource before child declarations rather than relying on late global registration. Re-running additive declarations from reload hooks also appends them again; it is not an idempotent update.
:::

### Wrap or replace default content

Use `replace: true` with one of `:cards`, `:header`, `:title`, `:toolbar`, `:collection`, `:records`, or `:pagination` to take ownership of that region. The generic `view_slot :index, :title, replace: true` form works too.

`default_content.call` returns the built-in content, so you can wrap it without copying Avo's template:

```ruby
index_slot :title, replace: true do
  tag.span(class: "flex items-center gap-2") do
    safe_join([default_content.call, tag.span("Preview", class: "my-badge")])
  end
end

index_slot :pagination, replace: true do
  if params[:compact]
    render partial: "avo/projects/compact_pagination", locals: {pagy: pagy}
  else
    default_content.call
  end
end
```

The default is rendered only if called and is memoized for that region's current render, not across requests. Calling it does not insert it automatically: return it, include it in your markup, or return different content to replace it. Returning `nil` hides the region. Inserting the same default twice duplicates its HTML and may duplicate IDs; do not use that as a way to render controls twice. Plain strings are escaped, just as in additive slots.

Keep the HTML you want to display as the block's final expression. For example, `default_content.call` followed by a logging statement returns the logging result, not the default. When rendering a partial, pass `default_content` explicitly as a local if the partial needs to invoke it; it is not injected into partial locals. The callable belongs to this render, so do not store it for later requests or background work.

To replace the records on one view type while retaining other view types and the empty state, branch before calling the default:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  view_slot :index, :records, replace: true do
    if view_type.to_sym == :table && resources.present?
      render partial: "avo/projects/custom_records", locals: {resources: resources}
    else
      default_content.call
    end
  end
end
```

The custom partial owns the replaced records UI, including any selection checkboxes or row actions. To hide a region instead, use a replacement block returning `nil`; that removes its content, not necessarily the surrounding card, footer, or panel wrapper. For example, hiding pagination does not turn off server-side pagination, so later pages still exist even though their controls are gone.

Surrounding additions remain: replacing `:title` preserves `before_title` and `after_title`. Nested content is different: replacing `:header` without calling its default omits the title, description, controls, and nested title hooks. Replacing `:collection` without its default omits records, pagination, and their nested hooks. For empty results, `:records` wraps or replaces the empty state; pagination hooks do not run.

Only one replacement may be declared per region on a resource. A child may override its inherited replacement without changing its parent or siblings. Its `default_content` still means Avo's built-in content, not the parent's replacement. Additive registrations keep accumulating independently.

:::warning Replacement boundaries
Avo retains the outer Turbo replacement targets, loading boundaries, and the resource search controller. Replacing a region can still remove its search, selection, or navigation controls. Call the default to preserve those controls; fully replacing their markup means owning their UI behavior. Skipping default rendering does not skip authorization or record loading. Lazy-loading and live-search refresh boundaries below apply equally to replacements.
:::

### Use loaded records in slot content

Slot blocks run in [`Avo::ExecutionContext`](./execution-context.html), with rendering helpers and request context available. For a summary of the current page, use `resources`, whose entries are hydrated Avo resources, rather than assuming they are model records:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  index_slot :before_records do
    tag.p("Projects on this page: #{resources.size}", class: "p-4")
  end
end
```

Return a rendered partial or component, tag-helper HTML, plain text (which is escaped), or `nil` to show nothing. The [API reference](./resources-api.html#index_slot) lists the available context. In association panels, `parent_record` and `parent_resource` identify the parent. The `query` is already authorized, but is not necessarily an ActiveRecord relation; use only operations supported by your resource's query.

Use `resources.map(&:record)` when you need the page's model records. This is still just the current page, not all matching records. An aggregate over `query` may issue another database query. Keep the authorized query and any parent association constraints when calculating summaries; starting again from `Project.all` can expose counts or data the visitor cannot access.

Build HTML with `tag`, `safe_join`, a partial, or a component. Do not mark interpolated user input as `html_safe`. A slot is application Ruby code, not a sandbox: rendering errors propagate, and slow queries or network requests delay the response. Keep blocks free of writes and other side effects, because navigation, association panels, and refreshes can render them again.

:::warning Lazy indexes
With [`self.index_view_loading = :lazy`](./resources-api.html#self.index_view_loading), cards and header slots render in the initial page shell, before `resources`, `query`, and `pagy` are loaded. Put data-dependent content in toolbar, collection, records, or pagination slots, which render in the deferred content instead. Toolbar slots render even when there is no toolbar. Collection and record slots surround the empty state too; pagination slots are absent for empty results.
:::

Live search refreshes the listing, not the toolbar or its slots. For summaries that must track the current search and page, use collection or record slots, or pagination slots when the summary is only needed for nonempty results. In the built-in table and grid, collection, records, and pagination slots refresh with live search; collection and record slots also surround the listing's empty state. Toolbar slots defer with the lazy body, but do not refresh on live search. Cards and header slots remain part of the page shell.

| Where the content belongs | Available on the initial lazy shell? | Refreshed by built-in live search? |
| --- | --- | --- |
| Cards, header, title | Yes, without loaded index data | No |
| Toolbar | No; renders with deferred content | No |
| Collection, records | No; renders with deferred content | Yes, including empty results |
| Pagination | No; renders with deferred content | Yes, but only for nonempty results |

### Keep slot rendering inexpensive

Registrations are stored in memory. An unregistered position returns immediately without rendering or looking for a partial. Slot dispatch does not spawn a shell process or scan the filesystem for conventionally named files. Registered blocks run on each relevant render; partials use Rails' normal template lookup and caching, including development reload behavior.

A slot does not cache your output or prevent queries, network calls, or other expensive work inside its block. Reuse loaded records and use ordinary Rails caching when appropriate. Cache keys must include whatever affects the content, such as permissions, parent association, search, filters, locale, or page. Do not cache user-specific HTML under a shared key. Calling the default twice avoids repeating its rendering work, but inserting the returned HTML twice still duplicates the UI. No latency or throughput guarantee is implied; measure expensive custom content in your application.

### Keep slots when customizing the index

The built-in table and grid render collection, records, and pagination slots. Updated [Calendar](./calendar-view.html#customize-the-calendar-index) and [Notifications](./notifications.html#customize-the-notification-index) add-ons expose the same collection and records slots; Notifications also exposes pagination. Calendar has date navigation rather than pagination, so pagination slots do not run there. All four inherit the resource shell's cards, header, title, and toolbar slots.

| Index view | Shell slots | Collection / records | Pagination |
| --- | --- | --- | --- |
| Table and grid | Yes | Yes | Yes, for nonempty results |
| Calendar, updated add-on | Yes | Yes; records excludes date navigation | No paginator |
| Notifications, updated add-on | Yes | Yes; records excludes its internal header and selection controls | Yes, for nonempty results |
| Map | Yes | Only its optional embedded table, not the map itself | Only the embedded table |
| Custom view type | If it retains the core shell | Only positions its component renders | Only if implemented |

Map's table slots do not wrap the whole map layout; hiding the table removes those slots too. Kanban boards are a separate surface, not resource index view types, so this API does not insert content into boards. MCP connections use the core index; its server-status banner is a `before_cards` addition and coexists with application additions.

When the index page has no records, Avo renders its shared empty state instead of the view-type component. Collection and records hooks still surround that state, but add-on-specific headings, navigation, and pagination are not rendered. Replacing records can therefore replace an empty state too. If you want to retain it, branch on `resources.empty?` and return `default_content.call` in that case.

Other view types must opt in. In a component inheriting from `Avo::ViewTypes::BaseViewTypeComponent`, call `render_index_slot` at each supported location. Surround the entire collection and paginator with collection slots, and the records markup with record slots. Place pagination slots immediately around the paginator, and omit them for empty results. Do not render shell hooks again inside a view type; an internal heading is not the resource title.

For replacement support, pass the default markup as a block at the named region, leaving its before/after hooks outside:

```erb
<%= render_index_slot :before_records %>
<%= render_index_slot :records do %>
  <%# Your existing records markup goes here. %>
<% end %>
<%= render_index_slot :after_records %>
```

Existing [custom index components](./resources-api.html#self.components) must adopt slot rendering themselves; declaring slots on the resource does not insert them into an overridden template. See [custom view types](./custom-view-types.html) for the component setup.

### Troubleshoot missing or unexpected content

1. **The declaration raises at boot:** use symbol names from the [reference](./resources-api.html#index_slot), supply a block, and use `replace: true` only with a region name. A second replacement for the same region on the same resource is an error, even when one uses `view_slot` and the other uses `index_slot`.
2. **The slot does not appear:** check the active view type, overridden component, and empty-result branch. A registered position is not automatically inserted into a custom template. Check whether an outer replacement omitted its default and therefore skipped nested hooks.
3. **A shared slot is missing on some resources:** check which base class they inherit and move shared declarations before child registrations. Late registration is not a reliable way to update already-customized children.
4. **Content is duplicated:** check base and child additions, reloader registration, and whether a custom component renders the same hook twice. Only insert `default_content.call` once.
5. **A summary is stale after searching:** move it out of the shell or toolbar and into a listing slot. Notification bell updates are not index refreshes. Calendar summaries must use the visible date range, not the paginated index context.
6. **Controls disappear or stop working:** a full replacement owns the markup it removed. Preserve the default or restore the necessary controls and their behavior; keep the outer Turbo targets in custom components.
7. **A wrapper shrinks or overflows:** slots supply no layout styles. Match the surrounding layout; title content should remain inline, while wrappers inside flex cards may need `w-full`.

## Show

The page where you see one resource in more detail.
<br/>
<RelatedList>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

## Edit

The page where you can edit one resource.
<br/>
<RelatedList>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

## New

The page where you can create a new resource.
<br/>
<RelatedList>
<RelatedItem href="./resources-api.html#self.components">Resource custom components</RelatedItem>
</RelatedList>

## View groups

Three named groups let you target several views at once:

### Display

`:display` is an alias for the `Index` and `Show` views where you can display records and their details.

### Form

`:form` is an alias for the `Edit` and `New` views for creating and editing records. The `create` and `update` requests that submit those forms also count as form views.

### Single

`:single` is an alias for every view except `Index` — that is `Show`, `Edit`, and `New` (plus the `create` and `update` form submissions).

## Preview

The fields marked with `show_on: :preview` will be shown in the [preview field](./fields/preview) popup.
By default, all fields are hidden in `:preview`.

## Checking the current view

The `view` object, available in the code, is an instance of the `Avo::ViewInquirer` class.
This enables you to examine the existing `view` status through expressions such as `view.show?` and `view.index?`.
Essentially, these are equivalent to asserting whether view equals `show` or `index`.

## Multiple ways to check

```ruby
view == "edit" # Check against a string
view == :edit # Check against a symbol
view.edit? # Ask if it's a view
view.form? # Ask if it's a collection of views
view.in? [:edit, :new] # Check against an array of symbols
view.in? ["edit", "new"] # Check against an array of strings
```

::: code-group

```ruby [Ask]
if view.show?
  # Code for the "show" view
elsif view.index?
  # Code for the "index" view
elsif view.edit?
  # Code for the "edit" view
elsif view.new?
  # Code for the "new" view
elsif view.form?
  # Code for the "new" or "edit" views
elsif view.display?
  # Code for the "index" or "show" views
end
```

```ruby [Symbol comparator]
if view == :show
  # Code for the "show" view
elsif view == :index
  # Code for the "index" view
elsif view == :edit
  # Code for the "edit" view
elsif view == :new
  # Code for the "new" view
end
```

```ruby [String comparator]
if view == "show"
  # Code for the "show" view
elsif view == "index"
  # Code for the "index" view
elsif view == "edit"
  # Code for the "edit" view
elsif view == "new"
  # Code for the "new" view
end
```

:::

It's also possible to check if the view is on a `form` (`new`, `edit`) or `display` (`index`, `show`).

::: code-group

```ruby [Ask]
if view.form?
  # Code for the "new" and "edit" views
elsif view.display?
  # Code for the "show" and "index" views
end
```

```ruby [Symbol comparator]
if view.in? [:new, :edit]
  # Code for the "new" and "edit" views
elsif view.in? [:show, :index]
  # Code for the "show" and "index" views
end
```

```ruby [String comparator]
if view.in? ["new", "edit"]
  # Code for the "new" and "edit" views
elsif view.in? ["show", "index"]
  # Code for the "show" and "index" views
end
```

:::

## Common `visible_on` configuration values

In many parts of the DSL you'll be able to configure visibility through options like `visible_on`, `show_on`, `hide_on`, `only_on`, or `except_on`. These options control the views where the configuration applies.
You may use the following values:

- `:show`
- `:edit`
- `:new`
- `:index`
- `:forms` — expands to `:new` and `:edit`
- `:display` — expands to `:index` and `:show`

You may also use a combination of views using an array.

- `[:show, :index]`
- `[:show, :forms]`

Field visibility options (`show_on`, `hide_on`, `only_on`, `except_on`) additionally accept `:preview` — see [Preview](#preview) above.

## View types

The <Index /> view can render records through several view types, each with its own options, documented on its own page:

- [Table view](./table-view.html) — the default tabular layout; row controls placement and per-row styling.
- [Grid view](./grid-view.html) — card-based layout with cover, title, body, and badge, for image-heavy resources.
- [Map view](./map-view.html) — plot records with geospatial data on a map.
- [Custom view types](./custom-view-types.html) — register entirely new view types from a plugin.

### Restrict the available view types

By default, Avo displays all the configured view types on the view switcher. For example, if you have [`map_view`](./map-view.html) and [`grid_view`](./grid-view.html) configured, both of them, along with the `table_view`, will be available on the view switcher.

However, there might be cases where you only want to make a specific view type available without removing the configurations for other view types. This can be achieved using the [`view_types`](./resources-api.html#self.view_types) class attribute on the resource. Note that when only one view type is available, the view switcher will not be displayed.

```ruby{4}
# app/avo/resources/city.rb
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = :table
  # ...
end
```

If you want to make multiple view types available, you can use an array. The icons on the view switcher will follow the order in which they are declared in the configuration.

```ruby{4}
# app/avo/resources/city.rb
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = [:table, :grid]
  # ...
end
```

You can also dynamically restrict the view types based on user roles, params, or other business logic. To do this, assign a block to the `view_types` attribute. Within the block, you'll have access to `resource`, `record`, `params`, `current_user`, and other default accessors provided by `ExecutionContext`.

```ruby{4-10}
# app/avo/resources/city.rb
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = -> do
    if current_user.is_admin?
      [:table, :grid]
    else
      :table
    end
  end
  # ...
end
```

The current pick is persisted in the URL as the `view_type` query parameter, so it survives page reloads and can be bookmarked.

:::warning
Requesting a view type that isn't in the available list raises an error, and rendering a view type that was never registered raises `Avo::ViewTypeComponentNotFoundError`. Keep `view_types`, [`default_view_type`](./resources-api.html#self.default_view_type), and your registered view types in sync.
:::
