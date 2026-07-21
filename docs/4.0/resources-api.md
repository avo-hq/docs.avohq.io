---
license: community
outline: [2, 3]
guide: ./resources.html
---

# Resources API

Per-option reference for resource configuration. For task-oriented documentation and worked examples, see the [Resources guide](./resources.html).

All options are class attributes declared at the top of the resource file:

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.title = :name
  self.includes = [:user]

  def fields
    field :id, as: :id
  end
end
```

## Identity

<Option name="`self.title`" headingSize="3">

The attribute or block Avo uses as the record's display name — in link labels, breadcrumbs, association pickers, and the `Show` view header. When not set, Avo tries the `name`, `title`, and `label` attributes in order and falls back to `id`.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.title = :slug # it will now reference @post.slug to show the title
end
```

A block receives access to `resource` and `record`, so the title can be computed without touching the model:

```ruby
class Avo::Resources::Comment < Avo::BaseResource
  self.title = -> {
    ActionView::Base.full_sanitizer.sanitize(record.body).truncate 30
  }
end
```

The Symbol may also point to a plain getter method defined on the model:

```ruby
# app/models/comment.rb
class Comment < ApplicationRecord
  def tiny_name
    ActionView::Base.full_sanitizer.sanitize(body).truncate 30
  end
end
```

- **Type:** Symbol or Proc
- **Default:** the first of `name`, `title`, `label` present on the model, otherwise `id`

</Option>

<Option name="`self.description`" headingSize="3">

A piece of text displayed to users on the `Index`, `Show`, `Edit`, and `New` views, under the resource name.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.description = "These are the users of the app."
end
```

<Image src="/assets/img/4_0/resources/description.webp" dark-src="/assets/img/4_0/resources/description-dark.webp" width="2352" height="456" alt="Avo message" />

A String is displayed on all views. A block can vary the message per context — it has access to `record`, `resource`, `view`, `current_user`, and `params`:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.description = -> do
    if view == :index
      "These are the users of the app"
    else
      if current_user.is_admin?
        "You can update all properties for this user: #{record.id}"
      else
        "You can update some properties for this user: #{record.id}"
      end
    end
  end
end
```

- **Type:** String or Proc
- **Default:** `nil`

:::warning
`self.description` is rendered as HTML (`<%==`). Do not use direct user input or any value that users can edit — that can allow stored XSS attacks.
:::

:::info
`self.description` is not displayed when the resource is rendered as an association (for example, in a `has_many` table on another resource's page). To show a description there, use the [`description` option on the association field](./associations/has_many#description).
:::

</Option>

<Option name="`self.avatar`" headingSize="3">

The photo displayed next to the record on the <Show /> and <Edit /> views and in the breadcrumbs.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.avatar = {
    source: :profile_photo
  }
end
```

- **Type:** Hash with keys `source` (Symbol or Proc) and `visible_on`
- **Default:** `nil`

More information on the [cover and avatar page](./cover-and-avatar.html).

</Option>

<Option name="`self.cover`" headingSize="3">

The large banner image displayed at the top of the record.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.cover = {
    source: :cover_photo
  }
end
```

- **Type:** Hash with keys `source` (Symbol or Proc), `visible_on`, and `size`
- **Default:** `nil`

More information on the [cover and avatar page](./cover-and-avatar.html).

</Option>

<Option name="`self.icon`" headingSize="3">

The icon displayed next to the resource on the sidebar.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.icon = "tabler/outline/user"
end
```

- **Type:** String — an [icon path](./icons.html)
- **Default:** Avo's default resource icon

</Option>

<Option name="`self.model_class`" headingSize="3">

The model this resource references. Set it when the model is namespaced, when the class can't be inferred from the resource name, or when the resource is a [secondary resource for a model](./resources.html#use-multiple-resources-for-the-same-model).

```ruby
class Avo::Resources::DelayedJob < Avo::BaseResource
  self.model_class = "Delayed::Job"
end
```

- **Type:** String or Class
- **Default:** `nil` — the model class is inferred from the resource name (namespace included)

</Option>

## Index view

<Option name="`self.default_view_type`" headingSize="3">

The view type the `Index` view renders when the user hasn't picked one — the classic `:table`, or `:grid`/`:map` for more visual data.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = :grid
end
```

<Image src="/assets/img/4_0/resources/grid-view.webp" dark-src="/assets/img/4_0/resources/grid-view-dark.webp" width="2330" height="1290" alt="Avo grid view" />

A Proc can pick the view type per request. Within the block you have access to all attributes of [`Avo::ExecutionContext`](execution-context) along with `resource` and `view`:

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = -> {
    mobile_user = request.user_agent =~ /Mobile/

    mobile_user ? :table : :grid
  }
end
```

- **Type:** Symbol or Proc
- **Default:** `:table`
- **Values:** `:table`, [`:grid`](./grid-view.html), [`:map`](./map-view.html), or a [custom view type](./custom-view-types.html)

</Option>

<Option name="`self.default_sort_column`" headingSize="3">

The column records are sorted by on the `Index` view.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.default_sort_column = :last_name
end
```

- **Type:** Symbol — any sortable column on the model
- **Default:** `:created_at`
- **Validation:** if the column doesn't exist on the model, Avo falls back to `created_at`

:::info
When changing the default sort column, it's recommended to add an index to that column in your database for better query performance.

```ruby
class AddIndexOnUsersLastName < ActiveRecord::Migration[7.1]
  def change
    add_index :users, :last_name
  end
end
```

:::

<RelatedList>
  <RelatedItem href="./guides/best-practices.html#add-an-index-on-the-created-at-column">Add an index on the `created_at` column</RelatedItem>
</RelatedList>

</Option>

<Option name="`self.default_sort_direction`" headingSize="3">

The direction records are sorted in on the `Index` view, applied to the [default sort column](#self.default_sort_column).

```ruby
class Avo::Resources::Task < Avo::BaseResource
  self.default_sort_column = :position
  self.default_sort_direction = :asc
end
```

- **Type:** Symbol
- **Default:** `:desc`
- **Values:** `:asc` or `:desc`

</Option>

<Option name="`self.pagination`" headingSize="3">

Pagination settings for the `Index` view. On large tables the record count can be inefficient — the `:countless` type skips it entirely.

```ruby
# As block:
self.pagination = -> do
  {
    type: :default,
    slots: 9,
  }
end

# Or as hash:
self.pagination = {
  type: :default,
  slots: 9,
}
```

- **Type:** Hash, or Proc returning a Hash
- **Default:** `{ type: :default, slots: 9 }`

| Key     | Values                                                                                                       | Default    | Behavior                                |
| ------- | ------------------------------------------------------------------------------------------------------------ | ---------- | --------------------------------------- |
| `type`  | `:default`, `:countless`                                                                                      | `:default` | `:countless` skips the record count     |
| `slots` | see [Pagy docs — control the page links](https://ddnexus.github.io/pagy/toolbox/helpers/series_nav/#options) | `9`        | Number of page links rendered           |

#### Examples

##### Default

```ruby
self.pagination = -> do
  {
    type: :default,
    slots: 9,
  }
end
```

<Image src="/assets/img/4_0/resources/pagination/default.webp" dark-src="/assets/img/4_0/resources/pagination/default-dark.webp" width="2250" height="60" alt="Default pagination" />

##### Countless

```ruby
self.pagination = -> do
  {
    type: :countless
  }
end
```

<Image src="/assets/img/4_0/resources/pagination/countless.webp" dark-src="/assets/img/4_0/resources/pagination/countless-dark.webp" width="2250" height="60" alt="Countless pagination" />

##### Countless and "pageless"

```ruby
self.pagination = -> do
  {
    type: :countless,
    slots: 0
  }
end
```

<Image src="/assets/img/4_0/resources/pagination/countless_empty_size.webp" dark-src="/assets/img/4_0/resources/pagination/countless_empty_size-dark.webp" width="2250" height="60" alt="Countless pagination size empty" />

</Option>

<Option name="`self.index_query`" headingSize="3">

The base query for the `Index` view. Useful for dropping a model's `default_scope` when rendering the index:

```ruby
class Project < ApplicationRecord
  default_scope { order(name: :asc) }
end
```

```ruby
class Avo::Resources::Project < Avo::BaseResource
  self.index_query = -> { query.unscoped }
end
```

- **Type:** Proc — receives `query` and returns the modified query

</Option>

<Option name="`self.record_selector`" headingSize="3">

Whether the selection checkbox is rendered on each row of the `Index` view. Disable it for resources that will never be selected to reclaim the horizontal space.

```ruby
class Avo::Resources::Comment < Avo::BaseResource
  self.record_selector = false
end
```

<Image src="/assets/img/4_0/resources/record_selector.webp" dark-src="/assets/img/4_0/resources/record_selector-dark.webp" width="2330" height="1090" alt="Hide the record selector." />

- **Type:** Boolean
- **Default:** `true`

</Option>

<Option name="`self.keep_filters_panel_open`" headingSize="3">

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=374" />

Whether the filters panel stays open after the user changes a filter value.

```ruby
class Avo::Resources::Course < Avo::BaseResource
  self.keep_filters_panel_open = true

  def filters
    filter Avo::Filters::CourseCountryFilter
    filter Avo::Filters::CourseCityFilter
  end
end
```

<Image src="/assets/img/4_0/filters/keep-filters-panel-open.webm" dark-src="/assets/img/4_0/filters/keep-filters-panel-open-dark.webm" width="900" height="408" alt="Avo filters" />

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`self.link_to_child_resource`" headingSize="3">

For Single Table Inheritance (STI) models. When declared on the parent resource, clicking a record on the `Index` view redirects to the child resource's record instead of the parent's.

For example, with `Sibling` and `Spouse` models inheriting from `Person`, a user clicking a person on the `Person` index is redirected to the `Sibling` or `Spouse` record.

```ruby
class Avo::Resources::Person < Avo::BaseResource
  self.link_to_child_resource = true
end
```

- **Type:** Boolean
- **Default:** `false`

</Option>

## Forms and saving

<Option name="`self.confirm_on_save`" headingSize="3">

Whether Avo asks for confirmation before saving a record. Adds friction to the saving process, helping avoid human error.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.confirm_on_save = true
end
```

<Image src="/assets/img/4_0/customization/confirm-on-save.webp" dark-src="/assets/img/4_0/customization/confirm-on-save-dark.webp" width="2880" height="1800" alt="Confirm on save" />

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`self.after_create_path`" headingSize="3">

Where the user is redirected after creating a record.

```ruby
class Avo::Resources::Comment < Avo::BaseResource
  self.after_create_path = :index
end
```

- **Type:** Symbol
- **Default:** `:show`
- **Values:** `:show`, `:edit`, or `:index`

For more granular control over the redirect or response, use the [`after_create_path` controller method](./controllers#after_create_path).

</Option>

<Option name="`self.after_update_path`" headingSize="3">

Where the user is redirected after updating a record.

```ruby
class Avo::Resources::Comment < Avo::BaseResource
  self.after_update_path = :edit
end
```

- **Type:** Symbol
- **Default:** `:show`
- **Values:** `:show`, `:edit`, or `:index`

For more granular control over the redirect or response, use the [`after_update_path`](./controllers#after_update_path) and [`after_destroy_path`](./controllers#after_destroy_path) controller methods.

</Option>

<Option name="`self.devise_password_optional`" headingSize="3">

If you use `devise` and update your user models (usually `User`) without passing a password, you will get a validation error. `devise_password_optional` stops that error by [stripping out](https://stackoverflow.com/questions/5113248/devise-update-user-without-password/11676957#11676957) the `password` key from `params`.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.devise_password_optional = true
end
```

- **Type:** Boolean
- **Default:** `false`

<RelatedList>
  <RelatedItem href="./fields/password.html">Password field</RelatedItem>
</RelatedList>

</Option>

<Option name="`config.buttons_on_form_footers`" headingSize="3">

Whether the `Back` and `Save` buttons are also rendered in the footer of `New` and `Edit` forms — useful when forms grow tall. Unlike the other options on this page, this one is set in the initializer and applies to all resources.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.buttons_on_form_footers = true
end
```

<Image src="/assets/img/4_0/resources/buttons_on_footer.webp" dark-src="/assets/img/4_0/resources/buttons_on_footer-dark.webp" width="2310" height="1000" alt="Buttons on footer" />

- **Type:** Boolean
- **Default:** `false`

</Option>

## Navigation

<Option name="`self.visible_on_sidebar`" headingSize="3">

Whether the resource appears in the auto-generated sidebar menu.

```ruby
class Avo::Resources::TeamMembership < Avo::BaseResource
  self.visible_on_sidebar = false
end
```

- **Type:** Boolean
- **Default:** `true`

:::warning
This option is used in the **auto-generated menu**, not in the [menu editor](./menu-editor).

You'll have to use your own logic in the [`visible`](./menu-editor#item-visibility) block for that.
:::

</Option>

<Option name="`self.hotkey`" headingSize="3">

A keyboard shortcut that jumps to the resource's `Index` view from anywhere in the admin panel. The binding is used automatically when the resource appears in the sidebar via the auto-generated menu or the [menu editor](./menu-editor).

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.hotkey = "g p"
end
```

- **Type:** String — [@github/hotkey](https://github.com/github/hotkey) syntax; space-separate keys for sequences (`"g p"` = press <kbd>g</kbd> then <kbd>p</kbd>)
- **Default:** `nil`

<RelatedList>
  <RelatedItem href="./keyboard-shortcuts.html">Keyboard shortcuts — full reference for built-in shortcuts and patterns</RelatedItem>
</RelatedList>

</Option>

<Option name="`self.external_link`" headingSize="3">

A link to the record's public page outside the Avo interface. When configured, Avo displays an external link button on the record — clicking it takes the user to the returned URL.

The block should return a String URL. It has access to all attributes of [`Avo::ExecutionContext`](execution-context) along with `record`, so you can use your application's path helpers (e.g. `main_app.post_path`) or any external URL generator.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.external_link = -> {
    main_app.post_path(record)
  }
end
```

<Image src="/assets/img/4_0/resources/external-link.webp" dark-src="/assets/img/4_0/resources/external-link-dark.webp" width="2264" height="264" alt="External link demonstration" />

- **Type:** Proc returning a String
- **Default:** `nil`

</Option>

## Performance

<Option name="`self.includes`" headingSize="3">

Associations to eager load on the `Index` view — the cure for those nasty `n+1` performance issues.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.includes = [:user, :tags]

  # or a very nested scenario
  self.includes = [files_attachments: :blob, users: [:comments, :teams, post: [comments: :user]]]
end
```

We know, the array notation looks weird, but it works.

- **Type:** Array — anything ActiveRecord's `includes` accepts
- **Default:** `[]`

</Option>

<Option name="`self.single_includes`" headingSize="3">

Works the same as [`self.includes`](#self.includes), but eager loads the associations on the <Show /> and <Edit /> views only.

- **Type:** Array
- **Default:** `[]`

</Option>

<Option name="`self.attachments`" headingSize="3">

Attachments to eager load on the `Index` view, similar to how [`self.includes`](#self.includes) works for associations.

:::code-group

```ruby{2-4} [app/models/post.rb]
class Post < ApplicationRecord
  has_one_attached :cover_photo
  has_one_attached :audio
  has_many_attached :attachments
end
```

```ruby{2} [app/avo/resources/post.rb]
class Avo::Resources::Post < Avo::BaseResource
  self.attachments = [:cover_photo, :audio, :attachments]
end
```

:::

- **Type:** Array of Symbols — attachment names
- **Default:** `[]`

</Option>

<Option name="`self.single_attachments`" headingSize="3">

Works the same as [`self.attachments`](#self.attachments), but eager loads the attachments on the <Show /> and <Edit /> views only.

- **Type:** Array of Symbols
- **Default:** `[]`

</Option>

<Option name="`cache_hash`" headingSize="3">

The method Avo uses to compute the cache key for each row. The default implementation looks like this:

```ruby
def cache_hash(parent_record)
  result = [record, file_hash]

  if parent_record.present?
    result << parent_record
  end

  result
end

def file_hash
  content_to_be_hashed = ""

  file_name = self.class.underscore_name.tr(" ", "_")
  resource_path = Rails.root.join("app", "avo", "resources", "#{file_name}.rb").to_s
  if File.file? resource_path
    content_to_be_hashed += File.read(resource_path)
  end

  # policy file hash
  policy_path = Rails.root.join("app", "policies", "#{file_name.gsub("_resource", "")}_policy.rb").to_s
  if File.file? policy_path
    content_to_be_hashed += File.read(policy_path)
  end

  Digest::MD5.hexdigest(content_to_be_hashed)
end
```

It's an md5 of the resource file and the policy file (so the cache gets busted when the rules change). The `parent_record` is added when the resource is displayed as an association, so there's a separate cache record for each association.

Override the method in your resource file when you have special requirements:

```ruby
class Avo::Resources::User < Avo::BaseResource
  def cache_hash(parent_record)
    result = [record, file_hash, "SOMETHING_NEW"]

    if parent_record.present?
      result << parent_record
    end

    result
  end
end
```

<RelatedList>
  <RelatedItem href="./cache.html">Caching</RelatedItem>
</RelatedList>

</Option>

## Customization

<Option name="`self.components`" headingSize="3">

The ViewComponent classes rendered for each view. By default, each view renders:

| View                                                   | Component                          |
| ------------------------------------------------------ | ---------------------------------- |
| [Index](views.html#index)                              | `Avo::Views::ResourceIndexComponent` |
| [Show](views.html#show)                                | `Avo::Views::ResourceShowComponent`  |
| [New](views.html#new), [Edit](views.html#edit)         | `Avo::Views::ResourceEditComponent`  |

Swap any of them for your own classes. Keys must be strings that match the original component class name; values may be classes or strings.

```ruby
self.components = {
  "Avo::Views::ResourceIndexComponent": Avo::Views::Users::ResourceIndexComponent,
  "Avo::Views::ResourceShowComponent": "Avo::Views::Users::ResourceShowComponent",
  "Avo::Views::ResourceEditComponent": "Avo::Views::Users::ResourceEditComponent",
  "Avo::Index::GridItemComponent": "Avo::Custom::GridItemComponent",
  "Avo::ViewTypes::MapComponent": "Avo::Custom::MapComponent",
  "Avo::ViewTypes::TableComponent": "Avo::Custom::TableComponent",
  "Avo::ViewTypes::GridComponent": "Avo::Custom::GridComponent",
  "Avo::Index::TableRowComponent": "Avo::Custom::TableRowComponent"
}
```

- **Type:** Hash — original component class name (String key) to replacement component (Class or String)
- **Default:** `{}`

:::warning
The custom view components must ensure that their initializers are configured to receive all the arguments passed during the rendering of a component. You can verify this in our codebase through the following files:

[Index](views.html#index) -> `app/views/avo/base/index.html.erb`<br>
[Show](views.html#show) -> `app/views/avo/base/show.html.erb`<br>
[New](views.html#new) -> `app/views/avo/base/new.html.erb`<br>
[Edit](views.html#edit) -> `app/views/avo/base/edit.html.erb`
:::

The easiest way to create a compatible component is to eject an existing one with the [`--scope` parameter](./customization.html#scope). For a full walkthrough, see the [safely override resource components guide](./guides/safely-override-resource-components.html).

</Option>

<Option name="`self.discreet_information`" headingSize="3">

Shows information about records without adding another field.

More information on the [discreet information page](./discreet-information).

</Option>

## Options documented on their own pages

Some resource options have enough surface to warrant a dedicated page:

| Option                | Documented on                                             |
| --------------------- | --------------------------------------------------------- |
| `self.search`         | [Resource search](./search/resource-search.html)          |
| `self.translation_key`| [I18n](./i18n.html)                                       |
| `self.ordering`       | [Record reordering](./record-reordering.html)           |
| `self.grid_view`      | [Grid view](./grid-view.html)                             |
| `self.map_view`       | [Map view](./map-view.html)                               |
| `self.avatar`         | [Cover and avatar](./cover-and-avatar.html#add-an-avatar) |
| `self.cover`          | [Cover and avatar](./cover-and-avatar.html#add-a-cover-photo) |
| `self.row_controls_config` | [Table view API](./table-view-api.html#row_controls_config) |
| `self.table_view`     | [Table view API](./table-view-api.html#table_view)        |
