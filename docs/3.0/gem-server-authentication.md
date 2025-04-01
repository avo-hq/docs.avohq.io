# Gem server authentication

Avo comes in a few tiers. The Community tier which comes as a free gem available on rubygems.org and a few paid tiers which come in private gems hosted on our own private gems server (packager.dev).

In order to have access to the paid gems you must authenticate using the **Gem Server Token** found on your [license page](https://v3.avohq.io/licenses).

There are a few ways to do that, but we will focus on the most important and secure ones for [on the server and CI systems](#on-the-server-and-ci-systems) and [on your local development environment](#on-your-local-development-environment).

:::info
We'll use the `xxx` notiation instead of the actual gem server token.
:::

## On the server and CI systems

:::info Recommendation
This is the recommended way for most use cases.
:::

The best way to do it is to register this environment variable so bundler knows to use it when pulling packages from [`packager.dev`](https://packager.dev).

```bash
export BUNDLE_PACKAGER__DEV=xxx
# or
BUNDLE_PACKAGER__DEV=xxx bundle install
```

Each hosting service will have their own way to add environment variables. Check out how to do it on [Heroku](#Heroku), [Hatchbox](#Hatchbox), [Docker](#docker_and_docker_compose), [Kamal](#Kamal) or [GitHub Actions](#git_hub_actions).

:::warning Warning about using the `.env` file
You might be tempted to add the token to your `.env` file, as you might do with your Rails app.
That will not work because `bundler` will not automatically load those environment variables.

You should add the environment variable through the service dedicated page or by running the `export` command before `bundle install`.
:::

## On your local development environment

For your local development environment you should add the token to the default bundler configuration.
This way `bundler` is aware of it without having to specify it in the `Gemfile`.

```bash
bundle config set --global https://packager.dev/avo-hq/ xxx
```

## Add Avo to your `Gemfile`

Now you are ready to add Avo to your `Gemfile`.

<!-- @include: ./common/avo_in_gemfile.md-->

Now you can run `bundle install` and `bundler` will pick it up and use it to authenticate on the server.

<Option name="Heroku">

If you're using heroku, you can set the environment variable using the following command. This way `bundler` will use it when authenticating to `packager.dev`.

```bash
heroku config:set BUNDLE_PACKAGER__DEV=xxx
```
</Option>

<Option name="Hatchbox">

If you're using Hatchbox, you can set the environment variable in your apps "Environment" tab. This way `bundler` will use it when authenticating to `packager.dev`.

```yaml
BUNDLE_PACKAGER__DEV: xxx
```
</Option>

<Option name="GitHub Actions">

You might need to install Avo's paid gems in you GitHub Actions pipeline. There are two steps you need to take in order to enable that.

#### 1. Add `BUNDLE_PACKAGER__DEV` to your repository's secrets

Go in your repo, under Settings -> Secrets and Variables -> Actions -> New repository secret and add your Gem server token there with the name `BUNDLE_PACKAGER__DEV` and the token as the value.

<Image src="/assets/img/3_0/gem-server-authentication/github-actions.png" width="2462" height="1816" alt="" />
<Image src="/assets/img/3_0/gem-server-authentication/new-secret.png" width="2462" height="1816" alt="" />

#### 2. Expose `BUNDLE_PACKAGER__DEV` as an environment variable

Then, in your `test.yml` (you might have it as a different name), expose that configuration item as an environment variable.

```yml{8-9}
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
</Option>

<Option name="Docker and docker compose">

You can build with docker by passing a build argument from your environment.

```dockerfile{8,10}
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

</Option>

<Option name="Kamal">

Kamal setup is very similar to Docker: include `BUNDLE_PACKAGER__DEV` in your secrets and then use it in your `Dockerfile`.

In your `deploy.yml`:

```yaml
# Configure builder setup.

builder:
  arch: amd64
  secrets:
    - BUNDLE_PACKAGER__DEV
```

Then in `.kamal/secrets`:

```
# However you set your secrets in Kamal
BUNDLE_PACKAGER__DEV=xxx
```

Finally, in your `Dockerfile`:

```dockerfile
# Install application gems
COPY Gemfile Gemfile.lock ./

RUN --mount=type=secret,id=BUNDLE_PACKAGER__DEV BUNDLE_PACKAGER__DEV=$(cat /run/secrets/BUNDLE_PACKAGER__DEV) bundle install  && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile
```

</Option>

## Bundle without paid gems

If you need to distribute your Rails app without the paid gems you can move them to an optional group.

```bash
RAILS_GROUPS=avo BUNDLE_WITH=avo bundle install
```

```ruby
# Gemfile
gem 'avo',

group :avo, optional: true do
  source "https://packager.dev/avo-hq/" do
    gem "avo-advanced", "~> 3.17"
  end
end
```

## FAQ

Frequently asked questions:

<Option name="`Forbidden 403`">

If you're seeing this error `Retrying download gem from https://packager.dev/avo-hq/ due to error (1/4): Gem::RemoteFetcher::FetchError bad response Forbidden 403`, this probably means that bundler does not have access to the `BUNDLE_PACKAGER__DEV` environment variable.

Please read the guides above on how to set that on your development machine and in deployment scenarios.
</Option>
