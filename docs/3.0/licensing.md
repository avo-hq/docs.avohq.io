# Licensing

Avo runs on the [Open-Core model](https://en.wikipedia.org/wiki/Open-core_model). The **Community** edition is free to use and works best for personal, hobby, and small commercial projects.
There are a couple of paid tiers (**Pro**, **Advanced**, and **Enterprise**) that give you more features, more customization, a higher level of control, and more support.

## Community vs. Paid

<Option name="Community">

The **Community** version has powerful features that you can use today like [Resource management](./resources.html), most [feature-rich](./field-options.html) [fields](./fields.html), out-of-the box [sorting](./field-options.html#sortable-fields), [filtering](./filters.html) and [actions](./actions.html), all the [associations](./associations.html) you need, and about 70% of all the features Avo has to offer.

</Option>

<Option name="Pro">

The **Pro** tier comes with [Advanced Authorization](./authorization.html) using Pundit, [Advanced File Uploads](./fields/files.html#direct_upload), [Records Re-Ordering](./records-reordering.html), [Menu Editor](./menu-editor.html), and [Dashboards](./dashboards.html).

</Option>

<Option name="Advanced">

The **Advanced** tier is a pick-and-choose plan which has a few features and add-ons to offer like [Customizable Controls](./customizable-controls.html), [Resource Scopes](./scopes.html), [Dynamic Filters](./dynamic-filters.html), [Kanban Boards](kanban-boards.html), Dynamic Fields, Collaboration, or White Labeling.
In order to get a quote on the **Advanced** features, please [get in touch](https://savvycal.com/avo-hq/discovery-call-advanced) with us.

</Option>

The features are separated by their level of complexity and maintenance needs. Selling the Avo Pro edition as a paid upgrade and enables us to fund this business and work on it full-time. That way, Avo improves over time, helping developers with more features and customization options.

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
  license: Avo.configuration.license,
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


## Upgrade your 1.0 license to 2.0, to 3.0

We are grateful to our `1.0` customers for believing in us. So we offer a free and easy upgrade path and **a year of free updates** for version `2.0`.

If you have a 1.0 license and want to upgrade to 2.0, you need to log in to [avohq.io](https://avohq.io), and go to the [licenses page](https://avohq.io/subscriptions), and hit the `Upgrade` button next to your license. You'll be redirected to the new subscription screen where you can start the subscription for 2.0.
After you add your billing details, you won't get charged immediately, but on the next billing cycle next year.

If you choose not to renew the subscription after one year, that's fine; you can cancel at any time, no biggie. You won't get charged and will keep the last version available at the end of that subscription.

Same treatment was applied with the 2.0 -> 3.0 customers.
