---
outline: [2, 3]
---

# Gem server authentication

Avo comes in a few tiers. The Community tier is a free gem available on rubygems.org, and a few paid tiers ship as private gems hosted on our own private gems server ([`packager.dev`](https://packager.dev)).

To access the paid gems you must authenticate using the **Gem Server Token** found on your [dashboard](https://avohq.io/dashboard).

There are a few ways to do that. We focus on the most important and secure ones: [on the server and CI systems](#on-the-server-and-ci-systems) and [on your local development environment](#on-your-local-development-environment).

:::info
We use the `xxx` notation instead of the actual gem server token.
:::

## On the server and CI systems

:::info Recommendation
This is the recommended way for most use cases.
:::

The best way is to register this environment variable so bundler knows to use it when pulling packages from [`packager.dev`](https://packager.dev).

```bash
export BUNDLE_PACKAGER__DEV=xxx
# or
BUNDLE_PACKAGER__DEV=xxx bundle install
```

Each hosting service has its own way to add environment variables. See how to do it on [Heroku](#heroku), [Hatchbox](#hatchbox), [GitHub Actions](#github-actions), [Docker](#docker-and-docker-compose) or [Kamal](#kamal).

:::warning Warning about using the `.env` file
You might be tempted to add the token to your `.env` file, as you might do with your Rails app.
That will not work because `bundler` will not automatically load those environment variables.

Add the environment variable through the service's dedicated page or by running the `export` command before `bundle install`.
:::

### Heroku

Set the environment variable with the following command. This way `bundler` uses it when authenticating to `packager.dev`.

```bash
heroku config:set BUNDLE_PACKAGER__DEV=xxx
```

### Hatchbox

Set the environment variable in your app's "Environment" tab. This way `bundler` uses it when authenticating to `packager.dev`.

```yaml
BUNDLE_PACKAGER__DEV: xxx
```

### GitHub Actions

You might need to install Avo's paid gems in your GitHub Actions pipeline. There are two steps to enable that.

#### 1. Add `BUNDLE_PACKAGER__DEV` to your repository's secrets

In your repo, go to Settings → Secrets and Variables → Actions → New repository secret and add your gem server token with the name `BUNDLE_PACKAGER__DEV` and the token as the value.

<Image src="/assets/img/3_0/gem-server-authentication/github-actions.webp" width="2462" height="1816" alt="GitHub repository Actions secrets settings page" />
<Image src="/assets/img/3_0/gem-server-authentication/new-secret.webp" width="2462" height="1816" alt="Adding a new BUNDLE_PACKAGER__DEV repository secret" />

#### 2. Expose `BUNDLE_PACKAGER__DEV` as an environment variable

Then, in your workflow file, expose that configuration item as an environment variable.

```yml{9-10}
# .github/workflows/test.yml
name: Tests

on:
  pull_request:
    branches:
      - main

env:
  BUNDLE_PACKAGER__DEV: ${{secrets.BUNDLE_PACKAGER__DEV}}

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # Testing and deployment steps
```

### Docker and Docker Compose

Build with Docker by passing a build argument from your environment.

```dockerfile{9,11}
# Dockerfile
FROM ruby:3.2.2
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client
WORKDIR /app
COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock

# get the build argument
ARG BUNDLE_PACKAGER__DEV
# make it available in the docker image
ENV BUNDLE_PACKAGER__DEV=$BUNDLE_PACKAGER__DEV

RUN bundle install
COPY . /app
# do more stuff
```

```bash
# Pass the key to the build argument
docker build --build-arg BUNDLE_PACKAGER__DEV=xxx

# OR

# Set the key as an environment variable on your machine
# Somewhere in your `.bashrc` or `.bash_profile` file
export BUNDLE_PACKAGER__DEV=xxx
# Then pass it to the build argument from there
docker build --build-arg BUNDLE_PACKAGER__DEV=$BUNDLE_PACKAGER__DEV
```

```bash
docker compose build --build-arg BUNDLE_PACKAGER__DEV=xxx
```

### Kamal

Kamal setup is very similar to Docker: include `BUNDLE_PACKAGER__DEV` in your secrets and then use it in your `Dockerfile`.

In your `deploy.yml`:

```yaml
# config/deploy.yml
# Configure builder setup.
builder:
  arch: amd64
  secrets:
    - BUNDLE_PACKAGER__DEV
```

Then in `.kamal/secrets`:

```bash
# .kamal/secrets
# However you set your secrets in Kamal
BUNDLE_PACKAGER__DEV=xxx
```

Finally, in your `Dockerfile`:

```dockerfile
# Dockerfile
# Install application gems
COPY Gemfile Gemfile.lock ./

RUN --mount=type=secret,id=BUNDLE_PACKAGER__DEV BUNDLE_PACKAGER__DEV=$(cat /run/secrets/BUNDLE_PACKAGER__DEV) bundle install  && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile
```

## On your local development environment

For your local development environment, add the token to the default bundler configuration.
This way `bundler` is aware of it without having to specify it in the `Gemfile`.

```bash
bundle config set --global https://packager.dev/avo-hq/ xxx
```

## Add Avo to your `Gemfile`

Now you are ready to add Avo to your `Gemfile`.

<!-- @include: ./common/avo_in_gemfile.md-->

Run `bundle install` and `bundler` picks up the token and uses it to authenticate on the server.

## Bundle without the paid gems

If you need to distribute your Rails app without the paid gems, move them to an optional group.

```bash
RAILS_GROUPS=avo BUNDLE_WITH=avo bundle install
```

```ruby
# Gemfile
gem "avo"

group :avo, optional: true do
  source "https://packager.dev/avo-hq/" do
    gem "avo-advanced", "~> 4.0"
  end
end
```

## FAQ

### `Forbidden 403`

If you're seeing this error `Retrying download gem from https://packager.dev/avo-hq/ due to error (1/4): Gem::RemoteFetcher::FetchError bad response Forbidden 403`, this probably means that bundler does not have access to the `BUNDLE_PACKAGER__DEV` environment variable.

Read the guides above on how to set it on your development machine and in deployment scenarios.

### `Forbidden 403` in a sandboxed or cloud environment (Cursor Cloud)

If the token is set correctly but you still get a `403 Forbidden` inside a sandboxed or cloud environment (for example the Claude Code cloud environment, Cursor's background/cloud agents, or any setup with restricted network egress), the request to `packager.dev` is likely being blocked by a network allowlist rather than failing authentication.

Add `packager.dev` to the environment's list of allowed hosts and run `bundle install` again.
