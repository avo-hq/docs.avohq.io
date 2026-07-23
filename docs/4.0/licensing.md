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

- **`avo-pro`** — Dashboards and the Menu Editor.
- **`avo-advanced`** — everything in `avo-pro`, plus Dynamic Filters.
- **`avo-everything`** — every add-on Avo offers.

See the [pricing page](https://avohq.io/pricing) for what each one includes.

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

You can see your licenses and projects on your [dashboard](https://avohq.io/dashboard).

## Add the license key

After you purchase an Avo license, add it to your `config/initializers/avo.rb` file under `license_key`.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.license_key = '************************' # or use ENV['AVO_LICENSE_KEY']
end
```

## Configure the display of license request timeout error

If you want to hide the badge displaying the license request timeout error, you can do it by setting the `display_license_request_timeout_error` configuration to `false`. It defaults to `true`.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.display_license_request_timeout_error = false
end
```

## Purchase a license

You can purchase a license from the [pricing](https://avohq.io/pricing) page.

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

That information helps us to identify your license and return a license valid/invalid response to Avo.
The requests are made at boot time and every hour when you use Avo on any license type.

If you need a special build without the license validation mechanism please [get in touch](mailto:adrian@avohq.io).
