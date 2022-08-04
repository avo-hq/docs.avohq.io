# Licensing

Avo has two types of licenses. **Community edition** which is free and open source for personal and hobby projects and **Pro** for commercial usage.

## Community vs Pro

The **Community version** has features that you can use today like [Resource management](./resources.html), quite a lot of [feature-rich](./field-options.html) [fields](./fields.html), out-of-the box [sorting](./field-options.html#sortable-fields), [filtering](./filters.html) and [actions](./actions.html) and all the [associations](./associations.html) you need.

The **Pro version** has [advanced authorization](./authorization.html) using Pundit, [localization support](./localization.html), [Custom tools](./custom-tools.html), [Custom fields](./custom-tools.html) and much more. [More](https://avohq.io/roadmap) features are coming soon like Dashboards, Settings screens, and Themes.

## One license per site

Each license entitles you to run one site in one production environment.

### More installations/environments per site

You might have the same site running in multiple environments (`development`, `staging`, `test`, `QA`, etc.) for non-production purposes. You don't need extra licenses for those environments.

We only need to check that the license key and URL matches the purchased license you're using for that one site (in any environment).

### Sites

On you [avohq.io licenses](https://avohq.io/licenses) page you can see your licenses keys.

<!-- ### Public Domains

When Avo calls home we use a series of rules to determine if the domain it’s running on is considered "public".

If any of the following rules match, the domain is considered **not public** (letting you stay in Trial Mode)

- Is the host a single segment? eg. `localhost`
- Is the host an IP address?
- Does it use a port other than 80 or 443?
- Does it have a dev-related subdomain? `test.`, `testing.`, `sandbox.`, `local.`, `dev.`, `stage.`, `staging.`
- Does it use a dev-related TLD? `.local`, `.localhost`, `.test`, `.invalid`, `.example`, or `.wip` -->

## Add the license key

After you purchase an Avo license add it to your `config/initializers/avo.rb` file along with changing the license type from `community` to `pro`.

```ruby{3-4}
# config/initializers/avo.rb
Avo.configure do |config|
  config.license = 'pro'
  config.license_key = '************************' # or use ENV['AVO_LICENSE_KEY']
end
```

## Configure display of license request timeout error

If you want to hide the badge displaying the license request timeout error, you can do it by setting `display_license_request_timeout_error` configuration to `false`. It defaults to `true`.

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
  port: current_request.port
}
```

That information helps us to identify your license and return a license valid/invalid response back to Avo.
The requests are made at boot time and every hour when you use Avo.
