# Use environment variables in the `Gemfile`

There are a few ways to use the secret tokens in the Gemfile

:::info
I'll use the `xxx-xxx-xxx` notiation instead of the actual gem server token which is a UUID
:::

## 1. Add them to your bundler configuration

The best way to do it is to register the credentials before hand using the following command.

This way `bundler` is aware of them without having to specify it in the `Gemfile`.

```bash
bundle config set --global https://packager.dev/avo-hq/ xxx-xxx
```

```ruby
# In your Gemfile one of the below

# Community
gem "avo", source: "https://packager.dev/avo-hq/"

# Pro
gem "avo_pro", source: "https://packager.dev/avo-hq/"

# Advanced
gem "avo_advanced", source: "https://packager.dev/avo-hq/"
```

## 2. Export the variable before running `bundle install`

The second method is exposing the env variable to `bundler`. You can do that by adding it to your `.bashrc` or `.bash_profile` file or by running the command directly.

```bash
# Add this to your .bashrc or .bash_profile files
export AVO_GEM_TOKEN=xxx-xxx-xxx
```

Or

```bash
# Run in your terminal
export AVO_GEM_TOKEN=xxx-xxx-xxx

bundle install
```

```ruby
# In your Gemfile one of the below

# Community
gem "avo", source: "https://packager.dev/avo-hq/"

# Pro
gem "avo_pro", source: "https://#{ENV['AVO_GEM_TOKEN']}@packager.dev/avo-hq/"

# Advanced
gem "avo_advanced", source: "https://#{ENV['AVO_GEM_TOKEN']}@packager.dev/avo-hq/"
```

Now you can run `bundle install` and `bundler` will pick it up and use it to authenticate on the server.

:::warning
Using the credentials this way, they might be exposed in the terminal history and will be exposed in the `Gemfile.lock` file.
:::

## 3. Export the variable as you run `bundle install`

The third way you can do it is to send it to the environment as you run `bundle install`.

```bash
# Run in your terminal
AVO_GEM_TOKEN=xxx bundle install
```

```ruby
# In your Gemfile one of the below

# Community
gem "avo", source: "https://packager.dev/avo-hq/"

# Pro
gem "avo_pro", source: "https://#{ENV['AVO_GEM_TOKEN']}@packager.dev/avo-hq/"

# Advanced
gem "avo_advanced", source: "https://#{ENV['AVO_GEM_TOKEN']}@packager.dev/avo-hq/"
```

`bundler` will use that environment variable to authenticate to the server and it will not be saved to that terminal session.

:::warning
Using the credentials this way, they might be exposed in the terminal history and will be exposed in the `Gemfile.lock` file.
:::
