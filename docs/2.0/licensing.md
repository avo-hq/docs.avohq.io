# Licensing

Avo has two types of licenses. The **Community edition**is free to use and works best for personal, hobby, and small commercial projects, and the **Pro edition** for when you need more advanced features.

## Community vs. Pro

The **Community version** has powerful features that you can use today like [Resource management](./resources.html), most [feature-rich](./field-options.html) [fields](./fields.html), out-of-the box [sorting](./field-options.html#sortable-fields), [filtering](./filters.html) and [actions](./actions.html) and all the [associations](./associations.html) you need.

The **Pro version** has [advanced authorization](./authorization.html) using Pundit, [localization support](./localization.html), [Custom tools](./custom-tools.html), [Custom fields](./custom-tools.html) and much [more](https://avohq.io/pricing). [More](https://avohq.io/roadmap) features like Settings screens and Themes are coming soon.

The features are separated by their level of complexity and maintenance needs. Selling the Avo Pro edition as a paid upgrade allows us to fund this business and work on it full-time. That way, Avo improves over time, helping developers with more features and customization options.

## One license per site

Each license can be used to run one application in one production environment on one URL. So when an app is in the `production` environment, we only need to check that the license key and URL match the purchased license you're using for that app.

### More installations/environments per site

You might have the same site running in multiple environments (`development`, `staging`, `test`, `QA`, etc.) for non-production purposes. You don't need extra licenses for those environments as long as they are not production environments.

### Sites

You can see your license keys on your [licenses](https://avohq.io/licenses) page.

## Add the license key

After you purchase an Avo license, add it to your `config/initializers/avo.rb` file on the `license_key`, and change the license type from `community` to `pro`.

```ruby{3-4}
# config/initializers/avo.rb
Avo.configure do |config|
  config.license = 'pro'
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

You can purchase a license on the [purchase](https://avohq.io/purchase/pro) page.

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
The requests are made at boot time and every hour when you use Avo.


## Upgrade your 1.0 license to 2.0

We are grateful to our `1.0` customers for believing in us. So we offer a free and easy upgrade path and **a year of free updates** for version `2.0`.

If you have a 1.0 license and want to upgrade to 2.0, you need to log in to [avohq.io](https://avohq.io), and go to the [licenses page](https://avohq.io/subscriptions), and hit the `Upgrade` button next to your license. You'll be redirected to the new subscription screen where you can start the subscription for 2.0.
After you add your billing details, you won't get charged immediately, but on the next billing cycle next year.

If you choose not to renew the subscription after one year, that's fine; you can cancel at any time, no biggie. You won't get charged and will keep the last version available at the end of that subscription.
