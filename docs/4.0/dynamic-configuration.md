---
license: add_on
add_on_link: https://avohq.io/pricing-4?add_ons[]=dynamic-configuration
betaStatus: Beta
outline: [2, 3]
api_docs: ./dynamic-configuration-api.html
---

# Dynamic configuration

Avo keeps booting from your Ruby class files. Dynamic configuration adds a **database-persisted overlay** that is deep-merged onto that file config on every request, so an admin can change a resource title, add a field, attach a scope, or flip a config value from an in-app builder — no code change, no deploy.

Your files stay authoritative *as written*. The overlay never edits classes, files, or `Avo.configuration`; it only layers on top at request time. Remove the gem and Avo behaves exactly as it does today — the core hooks become no-ops.

```ruby
# config/initializers/avo_dynamic_config.rb
Avo::DynamicConfig.configure do |config|
  config.authorize_with = ->(actor, grant) { actor.admin? }
end
```

Once installed, everything else happens in the builder UI under **Dynamic configuration** in the Avo sidebar. The initializer is only where you set the safety switches — access, locks, and the opt-in trusted code tier.

:::info Working name
`avo-dynamic_config` is a working name and may change before the stable release. The concepts on this page are stable; the gem name may not be.
:::

## Requirements

- An Avo Advanced or Pro license (the overlay is a paid add-on).
- **PostgreSQL** — entry payloads are stored as `jsonb`. MySQL and SQLite are not supported in v1.
- Sibling gems are integrated at minimum versions: `avo-dashboards >= 4.0.2`, `avo-menu >= 4.0.4`, `avo-kanban >= 4.0.2`. An older-but-installed sibling degrades exactly like an absent one — its entity type shows as unavailable with an explanation rather than crashing.

## Installation

### 1. Install the gem

Add it to your `Gemfile`:

```ruby
# Gemfile
gem "avo-dynamic_config", source: "https://packager.dev/avo-hq/"
```

Then:

```bash
bundle install
```

### 2. Run the installer

```bash
bin/rails generate avo:dynamic_config install
```

This creates the migration for the overlay tables and a `config/initializers/avo_dynamic_config.rb` initializer.

### 3. Migrate

```bash
bin/rails db:migrate
```

This creates three tables: `avo_dynamic_config_entries` (the overlay entries), `avo_dynamic_config_entry_versions` (append-only history for rollback and audit), and `avo_dynamic_config_version_counters` (the cache-invalidation counter).

:::info Installing before migrating is safe
If the gem is present but the tables are not yet created, resolution degrades to file-only config and logs a single warning per process. You will not get an error page. See [Turn the overlay off](#turn-the-overlay-off).
:::

### 4. Grant access

The builder is **default-deny**: until you say who may use it, nobody can. Grant access with the [`authorize_with`](./dynamic-configuration-api.html#authorize_with) hook in the initializer. It receives the acting user and a grant symbol and returns a truthy value to allow.

```ruby
# config/initializers/avo_dynamic_config.rb
Avo::DynamicConfig.configure do |config|
  config.authorize_with = ->(actor, grant) do
    case grant
    when :view then actor.staff?
    when :edit then actor.admin?
    when :code then false # trusted code is a separate, higher bar — see below
    end
  end
end
```

There are three grants:

| Grant   | Allows                                                                   |
| ------- | ----------------------------------------------------------------------- |
| `:view` | Read the resolved config and browse entries in the builder.             |
| `:edit` | Create, edit, activate, roll back, discard, and import entries.         |
| `:code` | Additionally required for any change that carries stored code (trusted mode). |

If you run [avo-authorization](./authorization.html), you can instead define an `Avo::DynamicConfig::OverlayPolicy` with `view?`, `edit?`, and `edit_code?` methods; it is consulted when no `authorize_with` hook is set. Either way, anything unhandled denies.

## How resolution works

On each request the overlay reads a single version-counter row, reuses a per-process cache of the merged tree when the counter is unchanged, and otherwise rebuilds it: load active entries, validate them, skip anything broken, deep-merge each option onto the file value, and annotate every option with its origin (`file` or `overlay`) and lock state.

Two rules matter for everyday use:

- **Merge is per option.** Overriding one option on a resource leaves its other options exactly as the file defines them.
- **The overlay never stores code.** Entries hold data and *references* to named lambdas — never Ruby. The one exception is the opt-in [trusted code mode](#trusted-code-mode).

## Keep code out of the database

By default the overlay is **declarative only**. An admin can pick a column to filter on, set a title, or choose a value — but cannot type Ruby that gets stored and run. When a config option needs real logic (a dynamic `visible:` condition, a custom query), you provide that logic as a **named lambda** registered in code, and the overlay only references it by name.

Register lambdas in your initializer through the registry's `declare` block, which is replayed on every boot so it survives dev reloads:

```ruby
# config/initializers/avo.rb
Avo.lambda_registry.declare do |registry|
  registry.register :active_records,
    label: "Active records only",
    description: "Scopes the query to records where active is true",
    kinds: [:query] do
    query.where(active: true)
  end

  registry.register :admins_only,
    label: "Admins only",
    kinds: [:visibility] do
    current_user.admin?
  end
end
```

Each lambda declares one or more **kinds** — `:visibility`, `:query`, `:scope`, `:format`, or `:authorization` — and the builder only offers a lambda where its kind fits the option being edited. Lambdas are evaluated per request through `Avo::ExecutionContext`, so inside the block you reach `current_user`, `record`, `params`, `request`, and route helpers, exactly as with an inline proc.

Kind is enforced when the reference is bound, not just when it is picked. A reference in a gating slot (like `visible:`) that points at a missing or wrong-kind lambda **fails closed** — the element is hidden or denied, never shown by accident — regardless of how the reference got into the database. For cosmetic options the value is skipped and a single warning is logged.

## Lock what the overlay may not touch

Some things must never be overridable from a database row. The overlay already refuses a **default-locked set** you cannot unlock: authentication and current-user methods, all authorization settings, admin/developer predicates, and the license key. On resources, `authorization_policy` is locked the same way.

To lock more, list config keys in your Avo initializer:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.lock_config_keys :app_name, :per_page
end
```

Or lock options on a specific resource:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::Resources::Base
  self.locked_options = [:title, :description]
end
```

Both are additive to the default-locked set. A locked option always resolves to its file value and renders in the builder as locked and uneditable — the write path refuses to change it, and resolution ignores any override even if one were planted directly in the database.

See the [Locking section of the API reference](./dynamic-configuration-api.html#locking) for the full default-locked list.

## Build configuration in the builder

Open **Dynamic configuration** in the sidebar to browse the resolved tree. Every option carries a badge showing where its value comes from — **file**, **overlay**, or **overridden** (file value shadowed by the overlay) — plus lock and drift indicators, so you can always see what the overlay is changing.

### Draft, preview, activate

New entries land as **drafts** and change nothing until you activate them. From a draft you can open a **preview**, which shows the resolved configuration tree *as if the draft were active*.

:::info Preview is configuration-level
In v1 the preview is the merged configuration tree, not a rendered screenshot of your app with the draft applied. A rendered in-app preview is a planned follow-up.
:::

Activating multiple drafts at once is all-or-nothing: the batch runs in one transaction, and if a single entry is invalid the whole batch is refused and the blocking entry is named.

### History and rollback

Every write snapshots a version (who, when, before, after). Open an entry to see its history and roll back to any prior version. Rollback re-applies through the normal write path and **appends a new version** — it never rewrites history. If the historical value no longer validates (a referenced lambda was removed, the option is now locked, or trusted mode was turned off), the rollback is refused with the reason shown rather than half-applied.

### Discard and restore

Entries are never hard-deleted in v1. Discarding soft-deletes (with confirmation); discarded entries stay findable behind the builder's **discarded** filter and can be restored. A restored entry returns in the **disabled** state and is re-validated before you activate it again.

The full lifecycle is `draft → active ⇄ disabled → discarded`, with **ejected** as a separate flag on active entries (see below).

## Export configuration to Ruby

When a piece of overlay config is ready to become permanent, export it to Ruby.

- **Net-new entities** — dynamic actions, scopes, filters, and dashboards — export to standalone, generator-quality `.rb` files that pass Standard/RuboCop and `ruby -c`. Re-running the export is byte-identical.
- **Resource overrides** export to a **hand-applied snippet**: a commented block you paste into the resource yourself, because the overlay can't safely rewrite your existing resource file.

Every value in exported code is emitted as an inert Ruby literal, so a hostile stored string can never turn into executable code or influence a file path.

### Eject lifecycle

Exporting is paired with **ejecting** so there's no window where config vanishes:

1. Eject an active entry. It keeps resolving (no production gap) but becomes read-only in the builder.
2. Deploy the exported file.
3. When resolution detects the same entity is now defined in your files — by identity, not just name — the ejected entry **auto-retires** to an inactive, inspectable state. You can also retire it manually.

Editing an ejected entry is refused until you un-eject it, which cancels the auto-retire watch. Resource-override snippets never auto-retire — because they're hand-applied, the overlay can't confirm you pasted them, so you retire those yourself once the file is in place.

## Detect drift

When active entries shadow file config, the overlay logs one boot notice per process pointing you at the status task. Run it any time to list what the overlay is changing:

```bash
rake avo:dynamic_config:status
```

It prints each entry with its state, what file option it shadows, and drift/eject flags. "Drift" (stale) means the file-side target changed shape since the entry was written; a cleanly-applying stale override still applies, and you resolve the flag from the builder by re-fingerprinting, editing, or disabling the entry.

## Move configuration between apps

Export the overlay as a versioned JSON **bundle** — the whole overlay, selected entity types, a single resource with its attachables, or specific entries — and import it into another app.

Import is a two-step, safe flow:

1. **Preview** shows a per-entry diff classifying each as create, update (identical), or conflict, and warns about anything that won't resolve locally (a referenced lambda that isn't registered in the target app). It mints a snapshot token.
2. **Apply** goes through the same validated, audited write path as the builder. For each conflict you choose **replace** or **skip** (skip is the default — nothing is clobbered silently). If another admin changed the target between preview and apply, the token goes stale and you re-preview.

An imported group is revertible as a unit. Both export and import are grant-gated: `:view` is the floor for any export, and code-bearing entries need the `:code` grant on both ends *and* trusted mode enabled on the importing app. Bundles are treated as hostile input — size, entry-count, and nesting caps are enforced at preview, and an unknown or older-than-supported `format_version` is refused rather than silently accepted.

## Turn the overlay off

The overlay has a dedicated kill switch that disables **resolution only** — stored entries stay readable and editable, and bundle export still works, so recovery never needs database surgery.

Two independent halves, either one turns resolution off:

- **Environment variable** — set `AVO_DYNAMIC_CONFIG_DISABLED=1` (also accepts `true`/`yes`/`on`). This wins over everything and needs no deploy.
- **Config flag** — set [`config.enabled = false`](./dynamic-configuration-api.html#enabled) in the initializer.

While panicked, Avo serves pure file config and the builder shows a banner explaining the state.

This is distinct from the **missing-store** degradation (tables absent or the database unreachable): that also collapses resolution to file-only, but because there's no reachable store the builder and export are unavailable too. The builder tells you which of the two degraded modes you're in.

## Trusted code mode

Trusted code mode lets a `:code`-grant holder author Ruby lambdas and SQL **directly in the builder**, stored in the overlay and evaluated server-side. It is **off by default** and opt-in only from the initializer:

```ruby
# config/initializers/avo_dynamic_config.rb
Avo::DynamicConfig.configure do |config|
  config.allow_code_editing = true
end
```

:::danger The code grant is deployer-equivalent access
A stored lambda runs **unsandboxed, with full application privileges** — it can reach credentials, run arbitrary code, and has no execution timeout. Granting `:code` is effectively giving shell-level access to your application, not a narrow feature permission. Grant it only to people you would trust to deploy. The [panic switch](#turn-the-overlay-off) is the only backstop for a misbehaving lambda.
:::

With the flag off, the evaluation path is structurally unreachable: a code-bearing row planted directly in the database is never compiled or run — it fails closed.

### SQL over a least-privilege connection

SQL-backed scopes, filters, and cards run **only** over a connection you configure explicitly — never your app's own database user:

```ruby
# config/initializers/avo_dynamic_config.rb
Avo::DynamicConfig.configure do |config|
  config.allow_code_editing = true
  config.trusted_sql_connection = {
    adapter: "postgresql",
    host: ENV["AVO_OVERLAY_DB_HOST"],
    database: ENV["AVO_OVERLAY_DB_NAME"],
    username: "avo_overlay_ro",
    password: ENV["AVO_OVERLAY_RO_PASSWORD"]
  }
  config.trusted_sql_timeout_ms = 5000
end
```

:::warning A read-only user is not enough
SQL runs in-panel and its results render to the operator. A merely read-only role still reads password digests, tokens, and other tenants' rows. Configure a **dedicated role with explicit per-table `SELECT` grants** — the role, not a read-only flag, is the confidentiality boundary. Avo enforces a single statement per query and a `SET LOCAL statement_timeout` on top. With [`trusted_sql_connection`](./dynamic-configuration-api.html#trusted_sql_connection) unset, SQL mode stays unavailable even when trusted code mode is on.
:::

Reading stored code in the builder requires the `:code` grant. For a `:view`-only user, code payloads and code in version history are redacted.

### Unlocking sensitive columns for actions

The declarative `update_attribute` action primitive refuses to write columns that look sensitive — `role`/`admin` flags, `*_token`, `*_digest`, `encrypted_*`, and anything containing `password` — so no UI-authored action can flip privileges or overwrite a digest. A developer who genuinely needs one writable opts in explicitly, in code:

```ruby
# config/initializers/avo_dynamic_config.rb
config.unlocked_sensitive_columns = %w[users.role] # "table.column" or bare "column"
```

Like every safety switch, [`unlocked_sensitive_columns`](./dynamic-configuration-api.html#unlocked_sensitive_columns) is read only from the initializer, never from a stored entry.

## Sibling-gem integrations

The overlay plugs into other Avo gems through a registration contract:

- **Dashboards** — declarative dashboards with cards, injected through the dashboard manager.
- **Menu** — menu items inserted at stable addressed positions.
- **Kanban** — see the caveat below.

An installed-but-too-old sibling (below the [minimum versions](#requirements)) registers its entity type as unavailable with an explanation, exactly like an absent gem — nothing crashes.

### Kanban is annotation-only

Kanban boards are already database-native rows, so the overlay does **not** give them a second persistence path. In v1 the integration adds **origin, locking, and audit annotations** over native board rows only — there is no draft, rollback, or bundle-export for kanban's own rows. Edit boards where you always have, in the kanban UI; the overlay just records provenance and lock state.

## Options not overridable in v1

A slice of resource options is consumed at the class level without an override wrapper, so it is **not overridable through the overlay in v1**. This is surfaced honestly in the builder rather than silently no-op'd. The carve-out:

| Option           | Why it's excluded                                          |
| ---------------- | --------------------------------------------------------- |
| `id`             | Primary-key identity, used in class-level find and routing |
| `abstract`       | Boot-time resource-discovery flag                         |
| `view_types`     | Read at the class level with no override wrapper          |
| `grid_view`      | Read at the class level with no override wrapper          |
| `table_view`     | Read at the class level with no override wrapper          |
| `scopes_loader`  | Internal plumbing — use declarative scopes instead        |
| `filters_loader` | Internal plumbing — use declarative filters instead       |

Options that *are* wrapped and overridable include `index_query`, `find_record_method`, the search surface, `visible_on_sidebar`, and `icon`. Control DSLs (`show_controls`, `edit_controls`, `index_controls`, `row_controls`, `ordering`, `discreet_information`) are code-bearing and deferred — reachable only through trusted code mode if wired at all. `authorization_policy` is wrapped but deliberately **locked**, not carved out.

## Reference

For every configuration key, the lambda-registry API, the lock DSLs, the panic env var, and the status task with types and defaults, see the [Dynamic configuration API reference](./dynamic-configuration-api.html).
