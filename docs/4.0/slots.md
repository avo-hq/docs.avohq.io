---
license: community
outline: [2, 3]
api_docs: ./resources-api.html#index_slot
---

# Slots

Slots let you add content to a resource's default [Index, Show, Edit, and New views](./views.html), or wrap, replace, and hide individual regions without overriding the full view component. Shared form slots customize both Edit and New, including validation-error rerenders.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  index_slot :after_header do
    render partial: "avo/projects/summary", locals: {resource: resource}
  end
end
```

Without registrations, the built-in views are unchanged. Slots add content by default; replacing a built-in region requires `replace: true`. Slots do not grant permissions or run once per row.

## Choose the view and region

Declare slots inside the resource class. Each region supports `before_REGION` and `after_REGION` additions, and `REGION, replace: true` for replacement:

| Method | Views | Regions |
| --- | --- | --- |
| [`index_slot`](./resources-api.html#index_slot) | Index, including association index panels | `cards`, `header`, `title`, `toolbar`, `collection`, `records`, `pagination` |
| [`show_slot`](./resources-api.html#show_slot) | Show | `cards`, `header`, `title`, `controls`, `body` |
| [`edit_slot`](./resources-api.html#edit_slot) | Edit, including update validation rerenders | `cards`, `header`, `title`, `controls`, `body`, `form` |
| [`new_slot`](./resources-api.html#new_slot) | New, including create validation rerenders | `cards`, `header`, `title`, `controls`, `body`, `form` |
| [`form_slot`](./resources-api.html#form_slot) | Both Edit and New | `cards`, `header`, `title`, `controls`, `body`, `form` |

The generic [`view_slot`](./resources-api.html#view_slot) takes `:index`, `:show`, `:edit`, `:new`, or `:form`. For example, `view_slot :show, :after_header` is equivalent to `show_slot :after_header`. The generic and named methods share registrations, validation, and ordering.

## Add content to the index

<VersionReq version="4.3.6" />

Use `index_slot` to add a summary, notice, or badge around the existing listing. Index has seven regions and fourteen additive positions; it does not gain the single-record views' `body`, `controls`, or `form` regions.

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

## Customize a single record page

Use `show_slot` for a read-only record page, or `edit_slot` and `new_slot` for view-specific content:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  show_slot :after_title do
    tag.span(record.status, class: "text-sm text-gray-500")
  end

  new_slot :before_body do
    tag.p("Choose an owner before saving this project.")
  end
end
```

`record` is `resource.record`, including the unsaved record on New. `view` is a normalized `Avo::ViewInquirer`: use `view.show?`, `view.edit?`, or `view.new?`, including when a failed create or update rerenders the form. It is not `:form`, `:create`, or `:update` in these blocks.

The `body` region contains all resource items: the primary header on full pages, fields, panels, tabs, tools, and associations. Use `before_body` / `after_body` around that complete area. Replacing `body` without calling its default removes its nested header, title, and controls hooks too. Cards are outside the body and, on Edit and New, outside the form.

## Share additions across Edit and New

Use `form_slot` for shared form content. Use the current Rails builder, `form`, to add an input inside the existing form:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  form_slot :before_body do
    tag.div(class: "mb-4") do
      safe_join([form.label(:reference), form.text_field(:reference)])
    end
  end

  edit_slot :after_controls do
    tag.span("Changes are saved when you submit.", class: "text-sm")
  end
end
```

This example assumes the model has a writable `reference` attribute and the resource permits that field. Slots do not add attributes to permitted parameters.

At each position, shared `form_slot` additions render before view-specific `edit_slot` or `new_slot` additions, regardless of declaration order. Registration order is preserved within each group, including inherited additions. These hooks also run after failed create and update submissions, so keep them safe to render again.

### Keep custom inputs inside the form

The `form` region wraps the contents inside Avo's original form, after its protected hidden referrer parameters. Its default contains the body and resource items. A replacement retains the outer form, CSRF protection, HTTP method handling, and Stimulus wiring:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  form_slot :form, replace: true do
    tag.div(default_content.call, class: "project-form-content")
  end
end
```

`before_form` and `after_form` render outside the form, with `form` set to `nil`. Cards are outside the form too. Inside the `form` region and its nested `body`, `header`, `title`, and `controls` regions, `form` is the current Rails builder. Show and Index always have `form: nil`. Do not open another form inside a slot or put inputs in outside-form hooks expecting them to submit with Avo's form.

### Choose a shared or view-specific replacement

A replacement declared with `edit_slot` or `new_slot` takes precedence over the corresponding `form_slot` fallback. This also applies when the specific replacement is inherited and the shared replacement is declared on a child. There is no replacement chain: `default_content.call` always returns Avo's built-in content, never a parent replacement or the shared form replacement.

### Support creation modals and repeated controls

In belongs-to creation modals, `new_slot` and shared `form_slot` support title, body, controls, and form hooks. Main `header` hooks deliberately do not run: the modal's native chrome, close control, and ARIA structure remain protected. Title additions sit inline in the modal heading; controls additions appear in its footer.

The modal body's default already excludes the header. Its title and controls are outside the body, so replacing the modal body does not remove those hooks. Both receive the current form builder because Avo's form wraps the modal. Cards, `before_form`, and `after_form` remain outside that form and have no builder.

On normal form pages, controls hooks also render at the optional form footer when [`config.buttons_on_form_footers`](./resources-api.html#config.buttons_on_form_footers) is enabled. Do not use globally fixed HTML IDs or assume a controls block runs only once.

## Add the same content to every resource

Declare shared slots in your application's base resource before individual resources declare their own:

```ruby
# app/avo/base_resource.rb
class Avo::BaseResource < Avo::Resources::Base
  %i[index show form].each do |view|
    view_slot view, :before_title do
      render partial: "avo/shared/resource_badge",
        locals: {resource: resource}
    end
  end
end
```

Every resource inheriting from this base receives the badge on Index, Show, Edit, and New, including association index panels. Registering `:form` covers Edit and New once each; do not also register `:edit` and `:new` unless you want additional badges. Use just `index_slot` if the badge belongs only on listings.

The block's `resource` is the resource currently rendering. Individual resources can append their own slots. A fully replaced header that omits its default also omits these nested title hooks.

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
Inheritance uses per-view copy-on-write registrations. Adding shared declarations later, such as from an initializer after resources have loaded, can leave children that customized that view using an earlier copy. This applies to both additions and replacements. Define shared registrations in the base resource before child declarations rather than relying on late global registration. Re-running additive declarations from reload hooks also appends them again; it is not an idempotent update.
:::

## Wrap or replace default content

Use `replace: true` with a region supported by the chosen view to take ownership of it. For Index, these are `:cards`, `:header`, `:title`, `:toolbar`, `:collection`, `:records`, and `:pagination`. Show, Edit, New, and shared forms use the regions in [Choose the view and region](#choose-the-view-and-region). The generic `view_slot :index, :title, replace: true` form works too.

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

Only one replacement may be declared per view and region by the same resource class. A child may override its inherited replacement without changing its parent or siblings. Edit and shared form replacements are distinct registrations, not duplicates. Their `default_content` still means Avo's built-in content, not another replacement. Additive registrations keep accumulating independently.

:::warning Replacement boundaries
Avo retains the outer Turbo replacement targets and, on Index, loading boundaries and the resource search controller. Replacing a region can still remove its search, selection, or navigation controls. Call the default to preserve those controls; fully replacing their markup means owning their UI behavior. Skipping default rendering does not skip authorization or record loading. Index lazy-loading and live-search refresh boundaries below apply equally to index replacements.
:::

## Use loaded records in slot content

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

## Keep slot rendering inexpensive

Registrations are stored in memory. Unregistered additions return without rendering or looking for a partial; an unreplaced region renders its built-in content. Slot dispatch adds no IO, does not spawn a shell process, and does not scan the filesystem for conventionally named files. Registered blocks run on each relevant render; explicitly rendered partials use Rails' normal template lookup and caching, including development reload behavior.

A slot does not cache your output or prevent queries, network calls, or other expensive work inside its block. Reuse loaded records and use ordinary Rails caching when appropriate. Cache keys must include whatever affects the content, such as permissions, parent association, search, filters, locale, or page. Do not cache user-specific HTML under a shared key. Calling the default twice avoids repeating its rendering work, but inserting the returned HTML twice still duplicates the UI. No latency or throughput guarantee is implied; measure expensive custom content in your application.

## Keep slots when customizing the index

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

## Troubleshoot missing or unexpected content

1. **The declaration raises at boot:** use symbol names from the [reference](./resources-api.html#view_slot), supply a block, and use `replace: true` only with a region name. A second replacement for the same view and region on the same resource class is an error, even when one uses `view_slot` and the other uses the named shorthand.
2. **The slot does not appear:** check the active view type, overridden component, and empty-result branch. A registered position is not automatically inserted into a custom template. Check whether an outer replacement omitted its default and therefore skipped nested hooks.
3. **A shared slot is missing on some resources:** check which base class they inherit and move shared declarations before child registrations. Late registration is not a reliable way to update already-customized children.
4. **Content is duplicated:** check base and child additions, reloader registration, and whether a custom component renders the same hook twice. Only insert `default_content.call` once.
5. **A summary is stale after searching:** move it out of the shell or toolbar and into a listing slot. Notification bell updates are not index refreshes. Calendar summaries must use the visible date range, not the paginated index context.
6. **Controls disappear or stop working:** a full replacement owns the markup it removed. Preserve the default or restore the necessary controls and their behavior; keep the outer Turbo targets in custom components.
7. **A wrapper shrinks or overflows:** slots supply no layout styles. Match the surrounding layout; title content should remain inline, while wrappers inside flex cards may need `w-full`.
