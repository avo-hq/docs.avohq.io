# Performance

Avo uses the application's cache system to enhance performance. The cache system is especially beneficial when dealing with resource index tables and license requests.

## Cache store selection

Avo picks its cache store based on the environment:

- **Production** — Avo uses `Rails.cache`, unless it's one of `ActiveSupport::Cache::MemoryStore` or `ActiveSupport::Cache::NullStore`. In that case it falls back to the `:file_store` with a cache path of `tmp/cache`.
- **All other environments** (development, test, and any custom environment) — Avo uses the `:file_store` with a cache path of `tmp/cache`.

:::warning `MemoryStore` in production
Our recommendation is to not use `MemoryStore` in production because it will not be shared between multiple processes (when using Puma). That's why Avo rejects it and falls back to the `:file_store`.
:::

### Custom selection

You can force Avo to use a particular store.

```ruby
# config/initializers/avo.rb
config.cache_store = -> {
  ActiveSupport::Cache.lookup_store(:solid_cache_store)
}

# or

config.cache_store = ActiveSupport::Cache.lookup_store(:solid_cache_store)
```

The `cache_store` configuration option expects a cache store object. The lambda syntax can be useful if different stores are desired on different environments.

## Row caching

Avo caches each item on the <Grid /> view for improved performance. Table rows are not cached today; they are rendered on every request. Caching them under the same key is a follow-up.

Every cached row is keyed on the record **and on the viewer**: the current user, the locale and the tenant are part of the key by default, so a field that is shown or hidden per role, a computed field that reads `current_user` or a grid card lambda is cached per user and never leaks between users. Cached rows expire after one day.

### What invalidates a cached row

A row is re-rendered when any part of its key changes:

- **The record is updated.** The key carries the record's `cache_key_with_version`, so a change to `updated_at` busts it. A model without `updated_at` only busts on expiry.
- **The resource file or its policy file is edited.** [`file_hash`](./resources-api#cache_hash) is an MD5 of both files.
- **Avo or any plugin is upgraded.** `file_hash` also folds in `Avo.cache_version`, a digest of the installed Avo version and every registered plugin's version. Rows rendered by a ViewComponent carry no template digest, so this is what busts them after `bundle update`.
- **The viewer changes.** A different user, a locale switch or a tenant switch is a different key. Editing the viewer's own user record busts their rows too.
- **The parent record is updated**, for rows in an association table.
- **One day passes.**

Two things do not bust a row on their own: a change to an associated record the row displays (add `touch: true` on the association, or fold it into `cache_hash`), and a role stored outside the user record, such as a roles table (fold a version of it into [`index_cache_context`](#index_cache_context), or `touch` the user when it changes).

<Option name="`cache_resources_on_index_view`">

Controls whether Avo caches the rows on the <Index /> view. Set it to `false` to disable row caching entirely.

```ruby
# config/initializers/avo.rb
config.cache_resources_on_index_view = false
```

- **Type:** Boolean
- **Default:** caching is enabled in every environment except development.

</Option>

<Option name="`index_cache_context`">

What a row's cache key varies by besides the record.

```ruby
# config/initializers/avo.rb
config.index_cache_context = -> { [current_user, I18n.locale, Avo::Current.tenant_id] }
```

- **Type:** Lambda, resolved through `Avo::ExecutionContext` once per request
- **Default:** the current user record, `I18n.locale` and `Avo::Current.tenant_id`

The user *record* is in the key rather than its id, so editing a user's roles busts their cached rows immediately. Narrow it to a role when many users see identical rows and should share the cache, but only if nothing a row renders reads the user:

```ruby
# config/initializers/avo.rb
config.index_cache_context = -> { [current_user.role, I18n.locale] }
```

A resource can override the resolved value with its own [`cache_context`](./resources-api#cache_context) method.

</Option>

<Option name="`cache_hash`">

The `cache_hash` method is the record's part of the key. Override it per resource to fold in an association the row displays.

More about this on the [resource options page](./resources-api#cache_hash).
</Option>

### What a key cannot fix

A cached row can only vary by what is in its key. A `visible:` or computed field that reads `params` — a query-string flag, a filter value — is served from whichever request cached the row first, under any key. If the values form a small, bounded set, add them to `index_cache_context`; otherwise turn `cache_resources_on_index_view` off for that app.

## Caching caveats

Because Avo caches each item on the <Grid /> view, some side-effects may occur. We'll try to outline some of them below and keep this page up to date as we find them or as they get reported to us.

These are things that may happen to regular Rails apps, not just in the Avo context.

### Rows may not be automatically updated when certain associations change

There are two things you could do to prevent this:

#### Option 1: Use `touch: true` on association

Example with Parent Model and Association
```ruby
  class Post < ApplicationRecord
    has_many :comments, dependent: :destroy
  end
```
Example with Child Model and Association with `touch: true`
```ruby
  class Comment < ApplicationRecord
    belongs_to :post, touch: true
  end
```

#### Option 2: override `cache_hash` method on resource to take associations in consideration

Avo, internally, uses the [`cache_hash`](./resources-api#cache_hash) method to compute the hash that will be remembered by the caching driver when displaying the rows.

You can take control and override it on that particular resource to take the association into account.
```ruby
  class Avo::Resources::User < Avo::BaseResource
    def fields
      # your fields
    end

    def cache_hash(parent_record)
      # record.post will now be taken under consideration
      result = [record, file_hash, record.post]

      if parent_record.present?
        result << parent_record
      end

      result
    end
  end
```

### `root_path` change won't break the cache keys

When the rows are cached, the links from the controls, [`belongs_to`](./associations/belongs_to) and [`record_link`](./fields/record_link) fields, and maybe others will be cached along.

The best solution here is to clear the cache with this ruby command `Rails.cache.clear`. If that's not an option then you can try to add the `root_path` to the [`cache_hash`](./resources-api#cache_hash) method in your particular resource.

## Solid Cache

Avo seamlessly integrates with [Solid Cache](https://github.com/rails/solid_cache). To setup Solid Cache follow these essential steps

Add this line to your application's Gemfile:

```ruby
gem "solid_cache"
```

And then execute:
```bash
$ bundle
```

Or install it yourself as:
```bash
$ gem install solid_cache
```

Add the migration to your app:

```bash
$ bin/rails solid_cache:install:migrations
```

Then run it:
```bash
$ bin/rails db:migrate
```

To set Solid Cache as your Rails cache, you should add this to your environment config:

```ruby
# config/environments/production.rb

config.cache_store = :solid_cache_store
```

Check [Solid Cache repository](https://github.com/rails/solid_cache) for additional valuable information.

## Log ViewComponent loading times and allocations

Sometimes, you may want to track the loading times and memory allocations of ViewComponents, similar to how you do with partials. Follow these two steps to enable this functionality.

#### 1. Enable ViewComponent Instrumentation

First, you need to enable instrumentation for ViewComponents. Add the following configuration to your `application.rb` or `development.rb` file:

```ruby
# application.rb or development.rb
config.view_component.instrumentation_enabled = true
```

#### 2. Add Logging

Next, set up logging to capture the performance data. Create or update the `config/initializers/view_component.rb` file with the following code:

```ruby
# config/initializers/view_component.rb
module ViewComponent
  class LogSubscriber < ActiveSupport::LogSubscriber
    define_method :'!render' do |event|
      info do
        message = +"  Rendered #{event.payload[:name]}"
        message << " (Duration: #{event.duration.round(1)}ms"
        message << " | Allocations: #{event.allocations})"
      end
    end
  end
end

ViewComponent::LogSubscriber.attach_to :view_component
```

<Image src="/assets/img/3_0/performance/views-performance/view-component-logs.webp" size="2236x 462" alt="View Component logging" />

:::warning
Enabling this logging can negatively impact your application's performance. We recommend using it in the development environment or disabling it in production once you have completed debugging.
:::
