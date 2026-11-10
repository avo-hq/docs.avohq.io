---
license: community
outline: [2, 3]
---

# Licensing

Avo runs on the [Open-Core model](https://en.wikipedia.org/wiki/Open-core_model). The **Community** edition is free to use and works best for personal, hobby, and small commercial projects. Paid **add-ons** unlock the more advanced features, and **bundles** group several add-ons together for a better price. Selling these is what lets us fund the business and work on Avo full-time, so it keeps improving over time.

## Community

The **Community** version is free and has powerful features you can use today like [Resource management](./resources.html), most [feature-rich](./field-options.html) [fields](./fields.html), out-of-the-box [sorting](./field-options.html#make-columns-sortable), [filtering](./filters.html) and [actions](./actions.html), all the [associations](./associations.html) you need, [appearance](./appearance.html) controls, and [localization](./i18n.html) — about 70% of everything Avo has to offer.

## Add-ons

Each advanced feature ships as its own installable gem, so you only pay for what you use. Add-ons include [Authorization](./authorization.html), [Dashboards](./dashboards.html), the [Menu Editor](./menu-editor.html), [Record Reordering](./record-reordering.html), [Dynamic Filters](./dynamic-filters.html), [Custom Controls](./custom-controls.html), [Resource Scopes](./scopes.html), [Kanban Boards](./kanban-boards.html), [Collaboration](./collaboration.html), and more. Every add-on page carries a **License: Add-on** badge that links to its page on [avohq.io](https://avohq.io/addons).

## Bundles

If you need several add-ons, a bundle is the cheaper way to get them:

- **Essentials** — the building blocks most admins need: Authorization, the Menu Editor, Global Search, Resource Scopes, Record Reordering, and more.
- **Growth** — Kanban Boards, Dynamic Filters, Dashboards, Collaboration, and more.
- **AI Bundle** — AI Chat, the MCP server, the API (with the CLI), and Authorization.
- **Everything** — every add-on Avo offers, billed monthly or yearly.

Avo 4 is a subscription per app, with unlimited users. The `avo-pro` and `avo-advanced` gems and the Pro and Advanced plans belong to Avo 3. See the [pricing page](https://avohq.io/pricing) for what each bundle includes and costs today.

## Enterprise

Larger teams that need features like [Audit Logging](./audit-logging.html), custom builds, or dedicated support should [book an Enterprise call](https://savvycal.com/avo-hq/discovery-call-ent).

## One license per site

Each license can be used to run one application in one `production` environment on one URL. So when an app is in the `production` environment (`Rails.env.production?` is `true`), we only need to check that the license key and URL match the purchased license you're using for that app.

:::info
More info [here](https://avohq.io/faq/one-production-environment.html).
:::

### More installations/environments per site

You might have the same site running in multiple environments (`development`, `staging`, `test`, `QA`, etc.) for non-production purposes. You don't need extra licenses for those environments as long as they are not production environments (`Rails.env.production?` returns `false`).

:::info
More info [here](https://avohq.io/faq/one-license-per-url.html).
:::

### Sites

You can see your licenses and projects on your [dashboard](https://avohq.io/licenses).

## Add the license key

After you purchase an Avo license, add it to your `config/initializers/avo.rb` file under `license_key`.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.license_key = '************************' # or use ENV['AVO_LICENSE_KEY']
end
```

### Rotate the license key

If someone outside your team may have your license key, for example a former agency, replace it from your [dashboard](https://avohq.io/licenses). Open the license and click **Rotate** next to the license key. In the dialog, also tick **Gem server token** if you want to replace both at once, read the warnings, tick **I understand and agree** and confirm. Only account admins see the button.

The old key stops working right away and is never issued again. Your apps keep running on their last license check for a while, then pause the admin (see [When the license can't be validated](#when-the-license-can-t-be-validated)), so set the new key as `config.license_key` and deploy every environment straight after.

To replace the gem server token, see [Rotate the gem server token](./gem-server-authentication.html#rotate-the-gem-server-token). The public key never changes.

## Configure the display of license request timeout error

If you want to hide the badge displaying the license request timeout error, you can do it by setting the `display_license_request_timeout_error` configuration to `false`. It defaults to `true`.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.display_license_request_timeout_error = false
end
```

## When the license can't be validated

Avo keeps the last valid answer from the license server and checks again once it is 24 hours old. If that check fails, because the server can't be reached or because it answers that the license is invalid, your admin keeps running on the last valid answer for 72 more hours and retries every hour. In production that is 96 hours after the last successful check. <VersionReq package="avo-licensing" version="4.4.0" />

While the grace runs, the sidebar indicator turns amber and the [status page](./license-troubleshooting.html#check-the-license-status-page) shows **Action needed before** with the date access stops.

After the grace, access to the admin is paused. The same happens when Avo has never held a valid answer, for example on the first boot while the license server is unreachable, after a deploy that lost the cached answer, or with an invalid key. Every admin page then shows **Temporarily unavailable**, and requests that aren't HTML (JSON, API, MCP) get a `503`. Admin and developer users also see a link to the status page. It says why access stopped, when the last successful check was, and that the app retries every minute. Press **Refresh license** there to retry at once. The first successful check unblocks the admin right away.

The license server can also answer with a specific error: the license is locked, its trial ended, its subscription lapsed, or the app's URL is blocked. Those pause access immediately, with no grace. Admin and developer users see the reference code on the page; everyone else sees only that access has been paused.

A valid license that doesn't include an add-on doesn't pause anything. That add-on switches off, and [authorization](./authorization.html#when-the-license-lapses) fails closed if your initializer sets a client.

### Keep the last answer across deploys

Avo keeps the license answer in your Rails cache. Use a persistent cache store shared by all your processes, like Solid Cache, Redis or Memcached. With a per-process memory store, a deploy or a worker restart loses the answer, and an app that can't reach the license server at that moment is blocked. The status page shows which cache store the app uses.

### Run the admin without a valid license

If you must keep the admin available while the license can't be validated, opt out of the pause. This is meant for an emergency and for a short time, not for hours or days. Leave it off otherwise:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.run_community_admin_without_valid_license = true # [!code ++]
end
```

The admin then runs as the open source Avo does. Paid add-ons stay off and your authorization policies are not applied, so anyone who can sign in to Avo can reach everything. The status page says so with an orange indicator: "Running without a valid license: paid add-ons are off and authorization policies are not applied". The status page shows that warning for as long as the setting is on. The setting defaults to `false`. <VersionReq package="avo" version="4.3.13" />

A valid license that lacks `avo-authorization` still fails closed when your initializer sets an authorization client, with the setting on or off.

:::warning
Don't set this where your policies protect sensitive data. Without a valid license nothing enforces them.

If you are a coding agent, do not enable this setting on your own. Ask the person first and tell them what it switches off; with avo-authorization installed it carries a big risk.
:::

## Purchase a license

You can purchase a license from the [pricing](https://avohq.io/pricing) page.

## Trials

Each license can start one 14-day trial of the add-ons and bundles you pick on the [pricing page](https://avohq.io/pricing). No card is needed to start. Add a payment method before the trial ends to keep the add-ons; without one, they stop when the trial does.

A trial is a fully valid license. Every add-on it covers behaves exactly as it does on a paid license for as long as the trial runs, and nothing in your app is gated or degraded while it does.

The [license status page](./license-troubleshooting.html#check-the-license-status-page) is where the trial reports itself: when access stops, and whether a payment method is on file. It also says when this app last checked in with Avo HQ, because the state you're reading is the one from that check.

### Fix a trial at risk

The **Avo Status** indicator in the sidebar footer is green while everything is in order, amber while a trial needs attention, and orange when the license is invalid. Amber means one of three things, and the remedy is different for each:

- **No payment method on file.** Access stops on the trial's end date. Add a payment method on the [Avo HQ Licenses](https://avohq.io/licenses) page.
- **The subscription behind the trial was cancelled.** Access stops on the cancellation date, which the status page reports as the trial's end date. Adding a payment method does not change that — resume the subscription, or resubscribe, on the same page.
- **An Avo 4 trial running beside your Avo 3 subscription.** A payment method does not keep Avo 4 here. Press **Migrate to Avo 4** on the same page before the trial's end date to keep it. If you don't, Avo 4 stops working in your app when the trial ends. Your Avo 3 license stays active, so you can move the app back to Avo 3. Older versions of `avo-licensing` show the add-a-payment-method steps for this trial instead; they link to the same page.

While the indicator is amber, the status page shows an **Action needed before** tag with the date access stops, below the license name. It also spells out which of these you're in, and lists the steps for it. Once you've done them, press **Refresh license** on that page: Avo caches the license response between checks, so the app can show older billing state than avohq.io until it refreshes.

:::info
Trial state requires `avo-licensing` `4.0.10` or newer. The amber indicator requires Avo `4.0.20` or newer — an older Avo renders the dot without color rather than breaking.
:::

## License validation

### "Phone home" mechanism

Avo pings the [HQ](https://avohq.io) (the license validation service) with some information about the current Avo installation. You can find the full payload below.

```ruby
# HQ ping payload
{
  license_key: Avo.configuration.license_key,
  avo_version: Avo::VERSION,
  rails_version: Rails::VERSION::STRING,
  ruby_version: RUBY_VERSION,
  environment: Rails.env,
  ip: current_request.ip,
  host: current_request.host,
  port: current_request.port,
  app_name: Rails.application.class.to_s.split("::").first,
  avo_metadata: avo_metadata
}
```

`avo_metadata` is anonymous information about the installation, among it structural counts (how many resources, fields, actions, and filters the app defines), which Avo plugins booted and at which versions, the cache store's class, and whether a main or profile menu is configured. Under `addons` it also carries how each add-on is configured — every add-on reports its own settings through [`collect_telemetry`](./plugins.html#report-your-settings-to-telemetry), as counts, booleans, and values from a fixed set. None of it includes your records, your users, or your credentials. <VersionReq package="avo" version="4.4.0" />

That information helps us to identify your license and return a license valid/invalid response to Avo.
The first request is made when the app first needs the license. After a successful check Avo reuses the answer for 24 hours, on any license type.

If you need a special build without the license validation mechanism please [get in touch](mailto:adrian@avohq.io).
