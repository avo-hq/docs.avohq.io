---
license: add_on
betaStatus: Beta
outline: [2, 3]
api_docs: ./dynamic-dashboards-api.html
---

# Dynamic dashboards

Dynamic dashboards let a technical admin create dashboards and cards **at runtime**, from inside Avo, instead of writing a dashboard class, committing, and deploying. The dashboards and their cards are stored in database tables, their query/format/visibility logic is written as Ruby (and ERB) that Avo evaluates server-side, and they show up in the sidebar and routing right alongside your code-defined dashboards.

They coexist with [code-defined dashboards](./dashboards.html): both kinds render through the same pipeline, appear in the same navigation, and use the same [cards](./cards.html). You keep authoring dashboards in code whenever you want to — dynamic dashboards only add a runtime path.

:::danger This feature runs stored code as your application
A dynamic card's `query`, `format`, inline ERB, and partial path, and a dynamic dashboard's `visible`/`authorize` snippets, are evaluated on your server **with the full privileges of your app** — there is no sandbox. Anyone who can create or edit a dynamic dashboard can run arbitrary code, and **authorization is fail-open until you write policies**. Read [The trust model](#the-trust-model) before you install this, and gate write access with [authorization](./authorization.html).
:::

## Requirements

- An Avo license that enables Pro/add-on features.
- [`avo-authorization`](./authorization.html) configured with Pundit, **with explicit policies** for the ejected `DynamicDashboard`/`DynamicCard` resources. This is not optional: authorization is fail-open by default (see [the trust model](#the-trust-model)), so without those policies anyone who can reach the forms can execute arbitrary code on your server.
- The [`chartkick`](https://github.com/ankane/chartkick) gem in your `Gemfile` if you author chart cards (same requirement as code-defined chart cards).
- [`avo-reactive_fields`](https://avohq.io/pricing) is an **optional** soft dependency. With it, the card form shows only the option groups that apply to the selected card type and updates as you switch types. Without it, every option group is shown and the inapplicable ones are discarded when you save.

## Installation

### 1. Add the gem

```ruby
# Gemfile
gem "avo-dashboards", source: "https://packager.dev/avo-hq/"
```

```bash
bundle install
```

### 2. Run the installer

```bash
rails generate avo:dashboards install
```

This creates a migration for the two gem-owned tables (`avo_dashboards_dashboards` and `avo_dashboards_cards`) and **ejects four files** into your app so you can customize the authoring experience:

- `app/avo/resources/dynamic_dashboard.rb`
- `app/avo/resources/dynamic_card.rb`
- `app/controllers/avo/dynamic_dashboards_controller.rb`
- `app/controllers/avo/dynamic_cards_controller.rb`

The models stay inside the gem. Security-sensitive behavior — attribution, save-time authorization, snippet evaluation, and code-card allowlisting — also lives in the gem and cannot be weakened by editing the ejected files; they may only *add* restrictions.

### 3. Run the migration

```bash
rails db:migrate
```

### 4. Restart your app

Avo caches whether the tables are installed **once per boot**, so dynamic dashboards do not appear until you restart the server after migrating. This is intentional: the check never runs per-request.

## The trust model

Dynamic dashboards trade the safety of a deploy pipeline for the convenience of runtime authoring. The persona this is built for is a **Ruby-fluent, trusted administrator**. Understand the following before enabling it.

:::danger No sandbox — stored code runs as your app
Stored code is evaluated server-side with your application's full privileges. There is no isolation and no per-card timeout. Treat the ability to create or edit a dynamic dashboard as equivalent to the ability to deploy code. The code-bearing surfaces are:

- a card's `query` and `format` Ruby snippets;
- a partial card's inline `erb_body`;
- a partial card's `partial` **path** — this is an unsandboxed Rails partial-path picker, the same trust level as the Ruby/ERB surfaces: it renders any partial in your app;
- a dashboard's `visible` and `authorize` Ruby snippets.
:::

:::danger Authorization is fail-OPEN without policies — this is an RCE surface
Write access to the ejected `DynamicDashboard` and `DynamicCard` resources is the **only** thing standing between a panel user and server-side code execution. Both the save path and the [live preview](#preview-before-saving) authorize through those resources' [`avo-authorization`](./authorization.html) policies — and when a resource is **not ejected/registered, or is registered but you have not written explicit policies for it**, authorization falls back to Avo's framework default, which is **allow**.

Stated plainly: on such a host, **any authenticated Avo panel user can author and preview-execute arbitrary Ruby/ERB on your server** — this is remote code execution, not merely over-permissive CRUD.

The trust model **requires** that you configure `avo-authorization` policies (`create?`, `update?`, `edit?`, `destroy?`) for both `Avo::Dashboards::DynamicDashboard` and `Avo::Dashboards::DynamicCard`, restricting them to the trusted administrators who are allowed to run code, **before** granting panel access to anyone who should not.

Mind the install ordering: the [installer](#installation) ejects the resources and creates the tables, but writing their policies is a **separate manual step**. Between migrating (and restarting) and adding those policies, the resources are live and fail-open. Write the policies before — or in the same deploy as — the migration, not afterward.
:::

:::warning The database is part of the trust boundary
Because the code lives in your tables, anything that can write to `avo_dashboards_cards` or `avo_dashboards_dashboards` can achieve code execution — a SQL-injection bug elsewhere in your app, or a tampered/restored database backup, becomes a code-execution vector. Protect these tables as you would protect your deploy pipeline.
:::

:::warning Inline ERB is auto-escaped — but `raw`/`html_safe` are an XSS vector
Inline ERB card bodies render with standard Rails auto-escaping: `<%= %>` output is HTML-escaped by default. If you opt out with `raw(...)` or `html_safe` on `params`, request data, or user-sourced strings, you open a stored-XSS hole against **every viewer** of that dashboard. Only mark trusted content as safe.
:::

:::warning There is no per-card timeout
Your host request timeout is the only bound on a runaway snippet — a snippet like `loop {}` hangs the worker until that timeout fires. The likeliest cost/DoS triggers are: a card's [preview retries](#preview-before-saving), a card's [`refresh_every`](./dynamic-dashboards-api.html#refresh_every) polling, and — most impactful — a dashboard's [`visible`/`authorize` snippets](#control-a-dashboard-s-visibility-and-authorization), which run on **every sidebar render** on every Avo page. Keep those snippets cheap.
:::

:::warning Iterating on an inline ERB body in preview grows process memory
Rails compiles each distinct `render inline:` ERB source into a method that is retained for the life of the process (a known Rails behavior). Every time you edit an ERB card body and re-run the [preview](#preview-before-saving), that new source is a distinct string, so it adds another permanently-retained method — an author iterating on an ERB body grows process memory until the next restart or deploy. Saved ERB bodies are fine: an unchanged source is reused, not recompiled. This is an accepted cost of the unsandboxed model, like the absence of a per-card timeout above — not a bug — but it's worth knowing when an author does a long preview session on an ERB card.
:::

For change history, see [Attribution and change history](#attribution-and-change-history).

## Create a dashboard

Go to the **Dynamic dashboards** resource and create a record. A dashboard has:

- a `name` (shown to the user) and a `slug` (its route — auto-generated from the name when left blank),
- a `description`,
- `grid_cols` (`3`–`6`, defaults to `3`),
- optional `global_ranges` shared by its cards,
- optional `visible` and `authorize` snippets (see [below](#control-a-dashboard-s-visibility-and-authorization)).

Once saved, the dashboard appears in the sidebar and is routable by its slug, exactly like a code-defined dashboard. Add cards to it from the dashboard page or from the Dynamic cards resource.

## Add cards

A card belongs to a dashboard and has a **type** and a **source**.

The four card types are `metric`, `chartkick`, `partial`, and `divider`. The two sources are `query` (you write a Ruby snippet) and `code_class` (you [reuse a registered code card](#reuse-a-code-defined-card)). The source is fixed once the card is created; the type stays editable, and switching it discards options that don't apply to the new type.

### Metric card

Write a `query` snippet that **returns** the number to display. Unlike a code-defined card, you do not call `result(...)` — the snippet's return value *is* the result:

```ruby
User.where(created_at: 1.week.ago..).count
```

Your snippet has `card`, `dashboard`, `arguments`, `params`, and `current_user` in scope (the same contract as a code card's `query`). A blank query falls back to the default (no value), never an error. A `nil` result renders as `0`, matching code cards.

Optionally add a `format` snippet to format the value. In a `format` snippet you additionally have `value` (the query result) and Rails' number helpers in scope:

```ruby
number_to_currency value
```

`prefix` and `suffix` decorate the number as they do on code metric cards.

### Chartkick card

The `query` snippet returns the chart data (a Hash, or an array of series). Set `chart_type` to one of `line_chart`, `pie_chart`, `column_chart`, `bar_chart`, `area_chart`, or `scatter_chart`, and optionally pass `chart_options` as JSON. A result shape Chartkick can't plot (for example a bare scalar) renders the [error state](#error-states) rather than a broken chart.

Chart cards require the `chartkick` gem. On a host without it, the card shows the standard "chartkick missing" notice.

### Partial card

A partial card renders custom markup two ways:

- **By path** — set `partial` to a partial path (e.g. `avo/cards/my_card`) and Avo renders that partial.
- **Inline ERB** — set `erb_body` to an ERB string. It renders with auto-escaping on. Its locals are `card`, `dashboard`, `arguments`, `value`, `params`, and `current_user`.

:::warning
Inline ERB is the most direct XSS channel in this feature. See [the trust model](#the-trust-model): never `raw`/`html_safe` untrusted data.
:::

### Divider

A `divider` card is a labelled separator between cards, like the `divider` you'd declare in a code dashboard. Set `invisible` to add spacing without a visible line or label.

## Control a dashboard's visibility and authorization

A dynamic dashboard carries two optional snippets:

- **`visible`** decides whether the dashboard shows in navigation.
- **`authorize`** decides whether it can be viewed at all.

Both have `dashboard`, `params`, and `current_user` in scope and must **return a boolean**. Both are host-policy gated first: if the ejected `DynamicDashboard` resource's policy denies the user, the snippet never runs.

These snippets **fail closed**: if the snippet raises, the dashboard is hidden/denied rather than shown, and the error is logged. A blank snippet means "visible"/"authorized". Because `visible` runs on every sidebar render, keep it cheap — see the [trust model](#the-trust-model).

Cards have their own `visible` behavior through the `invisible` option; a card hidden this way is also 404'd on a direct frame request, so `invisible` isn't a pseudo-authorization backdoor. Genuine access control belongs in the dashboard `authorize` snippet and your resource policies.

## Preview before saving

While authoring a card, click **Preview** to run the card in its current, unsaved form and see the result before you save. Preview:

- is an explicit action — it runs when you click it, not on every keystroke, and marks the shown result stale when you change a field afterward;
- is a **write-level, CSRF-protected POST**. It requires create/update authority on the card **and** edit authority on the target dashboard — view access is not enough — because it executes submitted code;
- never puts your code in a URL or a log. The code-bearing params are filtered out of request logs, and the audit log records only a digest of the code, never the code itself.

A preview of a failing snippet renders the [error card](#error-states), not a 500.

## Reuse a code-defined card

Instead of a `query` snippet, a card can reuse one of your existing code-defined card classes: set its **source** to `code_class` and pick the class from the list. The list — and the render-time resolution — come from an **allowlist** (every `Avo::Cards::BaseCard` descendant except the gem's internal `Dynamic*` classes). Names are never `constantize`d, so a card can only reference a class that is actually registered and renderable.

You can override the reused card's `label`, `description`, `cols`, `rows`, `refresh_every`, and visibility per row, and pass `arguments` as JSON — the same `arguments` mechanism code dashboards use to [parameterize a shared card](./dashboards.html#override-card-arguments-from-the-dashboard). The same class can be reused several times on one dashboard with different `arguments`; each row renders as its own card.

:::info JSON-expressible arguments only
`arguments` are stored as JSON, so only JSON-expressible values are supported (strings, numbers, booleans, arrays, hashes) — no Ruby objects, symbols as values, procs, or dates-as-objects. They are deep-symbolized on the way in, so `arguments[:scope]` works in the card.
:::

:::warning Code-dashboard `authorize` procs do not travel with the card
Reusing a code card copies the *card*, not the authorization of the dashboard it originally lived on. If a code card relied on its parent code dashboard's `authorize` proc to keep it private, that protection does **not** come along — gate the dynamic dashboard yourself with its `authorize` snippet and resource policy.
:::

If a reused class is later renamed, removed, or dropped from the allowlist, the card degrades to an [error card](#error-states) naming the missing class and logs a warning; the rest of the dashboard renders normally.

## Attribution and change history

Every dashboard and card records `created_by` and `updated_by`. These are **server-set from the current user and read-only** — they are sourced in the gem model, never accepted from form params, so they can't be spoofed and can't be dropped by editing the ejected controller. Each write also logs the actor and a digest of any changed snippet field.

For a full change history, enable [`avo-audit_logging`](./audit-logging/) on the ejected `DynamicDashboard` and `DynamicCard` resources. Given that these records hold executable code, tracking who changed what is strongly recommended.

## When a dashboard is shadowed

If a dynamic dashboard's slug collides with a code-defined dashboard's id, **the code dashboard wins**: the dynamic one is hidden from navigation and routing, and a warning is logged. The dynamic record's detail/index view shows a **shadowed** indicator naming the collision.

This is recoverable — change the dynamic dashboard's slug (or remove the code dashboard) and it reappears on the next request. Nothing is deleted; the record is only hidden while the collision stands.

## Error states

Failures are contained so one bad card never takes down a page:

- A card whose `query`, ERB, or chart data **raises** shows an **error card inside its own frame** — siblings and the dashboard keep rendering. Users authorized to edit the card see the exception class and message (always HTML-escaped) plus an "edit" deep-link and a retry; everyone else sees a generic message. The full error goes to your logs.
- An unknown or corrupt `card_type`, or a `code_class` that no longer resolves, likewise renders an **error card for that card only** (the code-class one names the missing class and logs a warning).
- A **blank** `query` is not an error — it renders an empty result (a metric shows `0`, a chart shows an empty chart).
- A `format` snippet that fails falls back to the card's **default formatting** (and logs), rather than showing an error card — so a formatting bug never hides the number.
- A dashboard or card `visible`/`authorize` snippet that **fails** fails **closed** — the dashboard/card is hidden rather than shown — and the failure is logged. Navigation never 500s from a bad snippet.

## What's not included

This feature is deliberately scoped. It does **not** include:

- a visual/drag-and-drop builder — dashboards and cards are authored through Avo forms;
- a sandbox or per-card timeout — see [the trust model](#the-trust-model);
- resource cards — those stay code-only;
- referencing a dynamic (DB-stored) card from a code dashboard;
- exporting a dynamic dashboard back to a code dashboard.

## Upgrading

If you already run `avo-dashboards` with code-defined dashboards, note these behavior changes when you upgrade to the version that adds dynamic dashboards. Both are security/correctness fixes and apply to **all** hosts, whether or not you install the dynamic tables.

### Card frames now authorize their parent

The shared card-frame endpoint now authorizes a card's **parent** before rendering the card. In practice:

- **Direct or out-of-band frame requests that previously rendered for unauthorized users are now denied.** If you have a restrictive code dashboard, a request that fetches one of its card frames directly is now subject to the dashboard's `authorize` before the card renders.
- **Legitimate in-page loads are unaffected**, including resource cards on an index view that have no record — those authorize the `:index` action rather than being blanket-denied.
- **A hidden card 404s on a direct frame request.** A card hidden by its `visible`/`invisible` state is never linked from a rendered dashboard, so only direct requests are affected.

### `chartkick_missing` detection revived for code chart cards

A latent bug prevented the "chartkick missing" notice from ever showing. With it fixed, code-defined **chart** cards on a host that doesn't have Chartkick installed now correctly display the missing-gem notice. If you use chart cards, make sure `chartkick` is in your `Gemfile`.

### Future changes to ejected files

The installer ejects resources and controllers into your app. There is not yet an automated upgrade path for future changes to those ejected files — including how a security fix to an ejected template reaches your app. Watch the release notes for changes to the ejected files and reconcile them by hand.

## Options reference

For the exhaustive per-option reference — every dashboard and card option, its type, default, and the exact snippet context each surface receives — see the [Dynamic dashboards API](./dynamic-dashboards-api.html).
