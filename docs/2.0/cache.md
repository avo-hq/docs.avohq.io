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

There is the possibility to force the usage of a custom cache store into Avo.

```ruby
# config/initializers/avo.rb
config.cache_store = -> {
  ActiveSupport::Cache.lookup_store(:solid_cache_store)
}

# or

config.cache_store = ActiveSupport::Cache.lookup_store(:solid_cache_store)
```

`cache_store` configuration option is expecting a cache store object, the lambda syntax can be useful if different stores are desired on different environments.

:::warning MemoryStore in production
Our computed system do not use MemoryStore in production because it will not be shared between multiple processes (when using Puma).
:::

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
