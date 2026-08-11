---
license: addon
addon_link: https://avohq.io/addons/scopes
outline: [2, 3]
api_docs: ./scopes-api.html
---

# Scopes

<Image src="/assets/img/4_0/scopes/scopes.webp" dark-src="/assets/img/4_0/scopes/scopes-dark.webp" width="2824" height="1208" alt="Scopes bar" />

Sometimes you need to segment your data beyond just a few filters. You might have a `User` resource but frequently need to see all the **Active users** or **Admin users**. You can use a filter for that, or add a scope — a one-click segment rendered as a tab bar above the records.

## Generate a scope

```bash
bin/rails generate avo:scope admins
```

The generator creates a scope class in `app/avo/scopes`. Point its [`scope`](./scopes-api.html#scope) option to a scope on your model:

```ruby
# app/avo/scopes/admins.rb
class Avo::Scopes::Admins < Avo::Scopes::BaseScope
  self.name = "Admins" # Name displayed on the scopes bar
  self.description = "Admins only" # This is the tooltip value
  self.scope = :admins # A scope on the model this resource uses
  self.visible = -> { true } # Control the visibility
end

# app/models/user.rb
class User < ApplicationRecord
  scope :admins, -> { where role: :admin } # This is used in the scope file above
end
```

If you'd rather not define a model scope, `scope` also accepts a proc that modifies the query directly.

## Register the scope on a resource

Because scopes are reusable, you must manually add each scope to a resource using the `scope` method inside the `scopes` method:

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::Admins
  end
end
```

### Set a default scope

Pass [`default: true`](./scopes-api.html#default) when registering a scope to apply it when you navigate to the resource's <Index /> view. It also accepts a proc, so you can pick the default per user:

```ruby{5-6}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::OddId
    # EvenId is the default scope only for admins
    scope Avo::Scopes::EvenId, default: -> { current_user.admin? }
  end
end
```

### Remove the "All" scope

Avo adds an `All` scope by default. If you don't want it — or you'd rather ship a custom "All" scope of your own — call [`remove_scope_all`](./scopes-api.html#remove_scope_all) inside the `scopes` method and mark another scope as the default:

```ruby{4-5}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    remove_scope_all
    scope Avo::Scopes::Everybody, default: true
    scope Avo::Scopes::Admins
  end
end
```

## Show record counts

To display a count badge next to a scope's label, set [`counter`](./scopes-api.html#counter) on the scope class:

```ruby{3}
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = :lazy
end
```

Use `:lazy` on large tables so the count loads after the page paints instead of slowing down the request, or `:hover` to load it only when the user hovers over the scope tab; `true` (or `:eager`) computes it inline. For finer control — a custom count, showing the badge conditionally, or formatting the number — pass a Hash with [`count`](./scopes-api.html#counter.count), [`visible`](./scopes-api.html#counter.visible), and [`format`](./scopes-api.html#counter.format) keys. The badge isn't limited to numbers: return a String (text or an emoji) from `count` and pass it through with a `format` of just `value`.

```ruby{3-7}
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    count: -> { query.active.count },
    format: -> { "#{value} #{resource.name.pluralize.downcase}" }
  }
end
```

## Control who sees a scope

Use the [`visible`](./scopes-api.html#visible) option to show, hide, or authorize a scope per user:

```ruby{4}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  # Only show this scope to admins
  self.visible = -> { current_user.admin? }
end
```

## Dynamic values

Every option accepts a proc instead of a static value, executed using the [Avo::ExecutionContext](./execution-context.html) with access to `query`, `resource`, `scope`, and `scoped_query`. For example, a description that adapts to the resource:

```ruby{3-5}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.description = -> {
    "Only #{resource.name.downcase.pluralize} that have an even ID"
  }
end
```

:::warning Performance note
`scoped_query` executes the scope when called. If the scope is slow, using it inside a proc impacts every page load. To show record counts, prefer the built-in [`counter`](./scopes-api.html#counter) option over computing them in `name`.
:::

See the [execution context reference](./scopes-api.html#execution-context) for what each option's proc has access to.

## Localization

The shortest path is a locale key. Avo resolves `avo.scope_translations.<class_path>.{name,description}` before falling back to the class attribute, the same way it does for [resources and actions](./i18n.html#localizing-scopes-cards-and-dashboards):

```yaml
# config/locales/avo.sv.yml
sv:
  avo:
    scope_translations:
      admins:
        name: Administratörer
        description: Endast administratörer
```

```ruby
# app/avo/scopes/admins.rb
class Avo::Scopes::Admins < Avo::Scopes::BaseScope
  self.name = "Admins"          # the fallback when no translation is present
  self.scope = :admins
  # Optional. Defaults to avo.scope_translations.admins
  # self.translation_key = "avo.scope_translations.admins"
end
```

A namespaced scope uses the slash-joined path — `Avo::Scopes::Admin::Archived` resolves to `avo.scope_translations.admin/archived`.

### Or assign a callable

The class attribute stays available and still resolves per request, which is what you want when the label depends on something the locale file cannot know:

A scope's `name` and `description` accept a callable, and it is resolved on **every render** in the requesting user's locale. That is all it takes to translate a tab bar: assign a lambda that calls `I18n.t`.

```ruby{3-4}
# app/avo/scopes/admins.rb
class Avo::Scopes::Admins < Avo::Scopes::BaseScope
  self.name = -> { I18n.t("avo.scopes.admins.name", default: "Admins") }
  self.description = -> { I18n.t("avo.scopes.admins.description", default: "Admins only") }
  self.scope = :admins
end
```

```yaml
# config/locales/avo.scopes.sv.yml
sv:
  avo:
    scopes:
      admins:
        name: Administratörer
        description: Endast administratörer
```

The key path is spelled in full above on purpose: the lookups are `avo.scopes.admins.name` and `avo.scopes.admins.description`.

:::info The namespace is yours
Pick a key namespace your app owns. `avo.scopes.*` reads well beside Avo's own keys and is safe — the Scopes gem itself only ships `avo.scopes.record_count` — but nothing requires it. Any namespace works.
:::

:::warning Always pass a String `default:`
Under a locale your app has not translated, a lookup with no `default:` renders `Translation missing: …` as the tab label, and Avo does not fall back to English for you unless you have configured `config.i18n.fallbacks`.
:::

A Symbol is **not** resolved as an i18n key. `self.name = :admins` sets the literal label `:admins` — use a callable.

### Translating a label cannot break scope selection

A scope's URL slug comes from its class path through `self.param`, never from `name`. So `?scope=admins` is identical in every locale, and a bookmark made in one language keeps working in another. You can translate `name` freely.

### The cost of a callable

Because it re-resolves per request — which is exactly what makes it follow the locale — anything expensive inside `name` runs on every page load. An `I18n.t` lookup is cheap. A query is not: to show a record count, use the [`counter`](./scopes-api.html#counter) option rather than computing it in `name`.

### Translating the gem's own chrome

Separately from your tab labels, the Scopes gem renders one string of its own — the accessible name on a [count pill](#show-record-counts) — and it ships **English only**:

```yaml
# config/locales/avo.scopes.sv.yml
sv:
  avo:
    scopes:
      record_count:
        one: "%{count} record"
        other: "%{count} records"
```

**Keep the `%{count}` placeholder.** The `All` tab's label is core's `avo.default_scope`, which is already translated in every locale Avo ships — override it there, not under `avo.scopes`.

## Limit index columns per scope

A scope normally changes which **records** appear on the index. It can also change which **columns** appear while it's active — only on the <Index /> view; the show, new, and edit views keep the resource's normal fields.

There are three ways to do it, in order of precedence:

- Define a [`fields`](./scopes-api.html#fields) method on the scope to declare the exact index columns from scratch, using the same DSL as a resource's `fields`.
- Set [`field_whitelist`](./scopes-api.html#field_whitelist) to keep the resource's fields but show **only** the listed ids.
- Set [`field_blacklist`](./scopes-api.html#field_blacklist) to keep the resource's fields but **hide** the listed ids.

```ruby{5-9}
# app/avo/scopes/published.rb
class Avo::Scopes::Published < Avo::Scopes::BaseScope
  self.scope = -> { query.where(published: true) }

  def fields
    field :id, as: :id
    field :title, as: :text
    field :published_at, as: :date_time
  end
end
```

:::warning Display only
`field_whitelist` and `field_blacklist` only change which columns render on the index. They are **not** an authorization boundary — the data is still loaded and stays visible on the show and edit views and through the API. To actually restrict access, use a [policy](./authorization.html) or a field's [`visible`](./field-options.html) option.
:::

## Full example

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.name = "Even"

  # This will compute the description based on the resource name
  self.description = -> {
    "Only #{resource.name.downcase.pluralize} that have an even ID"
  }

  # This will scope the query to only even IDs
  self.scope = -> { query.where("#{resource.model_key}.id % 2 = ?", "0") }

  # Only show this scope to admins
  self.visible = -> { current_user.admin? }

  # Show a record count badge, loaded lazily so it won't slow down the page
  self.counter = :lazy
end
```
