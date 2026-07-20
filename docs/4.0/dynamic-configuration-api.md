---
license: add_on
add_on_link: https://avohq.io/pricing-4?add_ons[]=dynamic-configuration
betaStatus: Beta
outline: [2, 3]
guide: ./dynamic-configuration.html
---

# Dynamic configuration API

Per-option reference for dynamic configuration. For task-oriented documentation and worked examples, see the [Dynamic configuration guide](./dynamic-configuration.html).

Gem-level options are set on `Avo::DynamicConfig.configure` in `config/initializers/avo_dynamic_config.rb`:

```ruby
# config/initializers/avo_dynamic_config.rb
Avo::DynamicConfig.configure do |config|
  # options listed below
end
```

The core-side surfaces — the lambda registry, the lock DSLs, the panic env var, and the status task — live in your Avo initializer or on your resources and are documented in their own sections.

## Availability

<Option name="`enabled`">

The in-code half of the panic switch. When `false`, overlay **resolution** is off — Avo serves pure file config — while stored entries stay readable and editable in the builder, and bundle export still works. The other half is the [`AVO_DYNAMIC_CONFIG_DISABLED`](#avo_dynamic_config_disabled) environment variable, which wins over this flag.

```ruby
config.enabled = true
```

- **Type:** Boolean
- **Default:** `true`

</Option>

## Authorization

<Option name="`authorize_with`">

The explicit policy hook consulted first when deciding the `:view`, `:edit`, and `:code` grants. It receives the acting user and the requested grant and returns a truthy value to allow. Everything is fail-closed — a `nil` actor, an unknown grant, or a raised exception all deny.

```ruby
config.authorize_with = ->(actor, grant) do
  case grant
  when :view then actor.staff?
  when :edit then actor.admin?
  when :code then false
  end
end
```

| Grant   | Allows                                                                        |
| ------- | ---------------------------------------------------------------------------- |
| `:view` | Read the resolved tree and browse entries.                                   |
| `:edit` | Create, edit, transition, roll back, discard, and import entries.            |
| `:code` | Additionally required for any change carrying stored code (trusted mode).    |

- **Type:** Proc / Lambda — `->(actor, grant)`
- **Default:** `nil`
- **Values:** `grant` is one of `:view`, `:edit`, `:code`
- **Lockable:** always locked — part of the default-locked set, so overlay data can never set it

:::info avo-authorization alternative
When `authorize_with` is unset and [avo-authorization](./authorization.html) is installed, an `Avo::DynamicConfig::OverlayPolicy` (a Pundit-shaped policy with `view?`, `edit?`, and `edit_code?` methods) is consulted instead. With neither configured, all grants deny.
:::

</Option>

## Trusted code mode

<Option name="`allow_code_editing`">

Enables the opt-in tier where a `:code`-grant holder authors Ruby lambdas and SQL directly in the builder, stored in the overlay and evaluated server-side. With it off, the evaluation path is structurally unreachable — a code-bearing row planted directly in the database is never compiled or run.

```ruby
config.allow_code_editing = true
```

- **Type:** Boolean
- **Default:** `false`
- **Lockable:** always locked — initializer-only, never settable through overlay data

:::danger Deployer-equivalent access
A stored lambda runs unsandboxed with full application privileges (arbitrary code execution, credential reach) and no execution timeout. Granting `:code` is effectively granting shell access to your app. The panic switch is the only backstop.
:::

</Option>

<Option name="`trusted_sql_connection`">

The connection used for in-UI SQL (scopes, filters, cards). Only consulted when `allow_code_editing` is `true`. Point it at a **dedicated least-privilege role** with explicit per-table `SELECT` grants — never the app's own database user.

```ruby
config.trusted_sql_connection = {
  adapter: "postgresql",
  host: ENV["AVO_OVERLAY_DB_HOST"],
  database: ENV["AVO_OVERLAY_DB_NAME"],
  username: "avo_overlay_ro",
  password: ENV["AVO_OVERLAY_RO_PASSWORD"]
}
```

- **Type:** Hash (an ActiveRecord database config) or a Proc returning one
- **Default:** `nil` — SQL mode is unavailable even with trusted code mode on
- **Lockable:** always locked — initializer-only

:::warning A read-only flag is not the boundary
Results render in-panel, so a merely read-only role still exposes password digests, tokens, and other tenants' data. The confidentiality boundary is the role's explicit per-table `SELECT` grants. Avo also enforces a single statement per query and a `SET LOCAL statement_timeout`.
:::

</Option>

<Option name="`trusted_sql_timeout_ms`">

The per-query statement timeout for trusted SQL, applied via `SET LOCAL statement_timeout`.

```ruby
config.trusted_sql_timeout_ms = 5000
```

- **Type:** Integer (milliseconds)
- **Default:** `5000`

</Option>

<Option name="`unlocked_sensitive_columns`">

Columns the declarative `update_attribute` action primitive is allowed to write. By default, columns that look sensitive — `role`/`admin` flags, `*_token`, `*_digest`, `encrypted_*`, and anything containing `password` — can never enter an action's write allowlist. List an entry here to opt one in, in code.

```ruby
config.unlocked_sensitive_columns = %w[users.role email]
```

- **Type:** Array of Strings
- **Default:** `[]`
- **Values:** the qualified `"table.column"` form unlocks the column on that model only; the bare `"column"` form unlocks it on every model
- **Lockable:** always locked — read only from the initializer, never from a stored entry

</Option>

## Core-side surfaces

These are configured in your Avo initializer (`config/initializers/avo.rb`) or on your resources, not on `Avo::DynamicConfig.configure`.

<Option name="`Avo.lambda_registry`">

The process-global registry of named lambdas. Overlay entries reference lambdas by name instead of storing code. Register through a `declare` block so registrations are replayed on every boot and survive dev reloads.

```ruby
# config/initializers/avo.rb
Avo.lambda_registry.declare do |registry|
  registry.register :active_records,
    label: "Active records only",
    description: "Scopes the query to active records",
    kinds: [:query] do
    query.where(active: true)
  end
end
```

- **`declare(&block)`** — captures the block and replays it on every boot; the initializer-safe registration path.
- **`register(name, kinds:, label: nil, description: nil, &block)`** — adds one named lambda. Durable only from something that re-runs on boot (use `declare` from an initializer).
- **Kinds:** one or more of `:visibility`, `:query`, `:scope`, `:format`, `:authorization`. The builder offers a lambda only where its kind fits the option; an empty or invalid kind raises at boot.
- **Evaluation:** through `Avo::ExecutionContext` — inside the block, `current_user`, `record`, `params`, `request`, and route helpers are available. A literal passed where a reference is accepted passes through unchanged.
- **Kind enforcement:** the expected kind is checked when the reference is bound. A missing or wrong-kind reference in a gating slot fails closed (hidden/denied); in a cosmetic slot it is skipped with one logged warning.

</Option>

<Option name="`lock_config_keys`">

Adds config keys to the set the overlay may never override, on top of the default-locked set. Additive and callable more than once.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.lock_config_keys :app_name, :per_page
end
```

- **Type:** one or more Symbols
- **Default:** `[]` (in addition to the always-locked set below)

</Option>

<Option name="`self.locked_options`">

Per-resource lock list. Options named here always resolve to their file value and render uneditable in the builder. Additive to the default-locked resource options.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::Resources::Base
  self.locked_options = [:title, :description]
end
```

- **Type:** Array of Symbols
- **Default:** `[]` (in addition to the always-locked `authorization_policy`)

</Option>

### Locking

The overlay enforces a default-locked set core-side, so locks hold even against a malfunctioning provider. These are always locked and cannot be unlocked:

**Config keys:** `current_user`, `current_user_method`, `authenticate`, `authenticate_with`, `authorization_client`, `authorization_methods`, `explicit_authorization`, `is_admin_method`, `is_developer_method`, `license_key`, `raise_error_on_missing_policy`, `authorization_enabled`.

**Resource options:** `authorization_policy`.

The gem's own switches — `authorize_with`, `allow_code_editing`, `trusted_sql_connection`, `trusted_sql_timeout_ms`, and `unlocked_sensitive_columns` — are set on `Avo::DynamicConfig.configure` and are never reachable through overlay data.

## Operations

<Option name="`AVO_DYNAMIC_CONFIG_DISABLED`">

Environment variable that disables overlay **resolution** without a deploy. It wins over the [`enabled`](#enabled) config flag. Stored entries stay readable and editable, and bundle export still works, so recovery never needs database surgery.

```bash
AVO_DYNAMIC_CONFIG_DISABLED=1
```

- **Type:** Environment variable
- **Values:** treated as set when the value is `1`, `true`, `yes`, or `on` (case-insensitive)
- **Default:** unset

</Option>

<Option name="rake avo:dynamic_config:status">

Lists overlay entries with their state, what each shadows in file config, and drift/eject flags. The developer-side view of what the overlay is changing; the overlay also logs a one-line boot notice per process when active entries shadow file options.

```bash
rake avo:dynamic_config:status
```

</Option>
