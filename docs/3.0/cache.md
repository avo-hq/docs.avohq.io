# Cache

Avo uses the application's cache system to enhance performance. The cache system is especially beneficial when dealing with resource index tables and license requests.

## Cache store selection

The cache system dynamically selects the appropriate cache store based on the application's environment:

### Production

In production, if the existing cache store is one of the following: `ActiveSupport::Cache::MemoryStore` or `ActiveSupport::Cache::NullStore` it will use the default `:file_store` with a cache path of `tmp/cache`. Otherwise, the existing cache store `Rails.cache` will be used.

### Test

In testing, it directly uses the `Rails.cache` store.

### Development and other environments

In all other environments the `:memory_store` is used.

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

`cache_store` configuration option is expecting a cache store object, the lambda syntax can be useful if different stores are desired on different environments.

:::warning `MemoryStore` in production
Our computed system do not use MemoryStore in production because it will not be shared between multiple processes (when using Puma).
:::

<Option name="`cache_hash`">

The `cache_hash` method is used to compute the cache key for each row.

More about this on the [resource options page](./resources#cache_hash).
</Option>

## Caching caveats

Avo caches each record on the <Index /> view for improved performance. However side-effects may occur from this strategy. We'll try to outline some of them below and keep this page up to date as we find them or as they get reported to us.

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

Avo, internally, uses the [`cache_hash`](./resources#cache_hash) method to compute the hash that will be remembered by the caching driver when displaying the rows.

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

The best solution here is to clear the cache with this ruby command `Rails.cache.clear`. If that's not an option then you can try to add the `root_path` to the [`cache_hash`](./resources#cache_hash) method in your particular resource.

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
config.cache_store = :solid_cache_store
```

Check [Solid Cache repository](https://github.com/rails/solid_cache) for additional valuable information.
