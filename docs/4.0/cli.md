---
license: addon
addon_link: https://avohq.io/addons/avo-api
addon: avo-api
betaStatus: "Beta"
outline: [2, 3]
---

# Command line client

`avo-cli` is a command line client for the [REST API](./rest-api.html). It talks to any Rails app running `avo-api` over HTTP — list, read, create, update, and delete records from a terminal, a script, or an agent. Nothing is installed in the app: the CLI is an HTTP client and never loads your code.

```sh
avo login                               # save the app, the token and the API version
avo schema                              # what this token may reach
avo list users --sort name --dir desc   # a page of records
avo get users 5                         # one record
```

Every command prints a table for a person, and the server's own JSON body under `--format json` for a script.

:::info Beta
`avo-cli` ships as a prerelease while the 4.2 line is in beta, so `gem install` needs `--pre` and a Gemfile line needs an explicit version. Both are shown below.
:::

## Requirements

- An app running [`avo-api`](./rest-api.html), reachable over HTTP, and an [API token](./rest-api.html#create-a-token) created in that app.
- **Ruby 3.0 or newer** — the `avo` executable ships as a gem, and the gem has no dependencies of its own.
- **Node 18.12.1 or newer**, as `node` on your `PATH` or named by `AVO_CLI_NODE`. Node is not bundled.

You don't need the app's source, a Rails app on the same machine, yarn, or npm.

## Install

### Install it once for your user

The way to reach many apps from one terminal:

```sh
gem install avo-cli --pre
avo --version
```

Two things to know:

- **"Once" means once per Ruby version.** rbenv, asdf, mise and chruby keep gems per Ruby, so a project pinned to another Ruby won't see `avo` until you install it there too. The symptom is `command not found: avo`. rbenv and asdf also want a rehash after installing a gem with an executable — `rbenv rehash`, `asdf reshim ruby`.
- **Inside a project that has a Gemfile, run `avo`, not `bundle exec avo`** — `bundle exec` only sees gems in that Gemfile.

### Or put it in the Gemfile

The way to pin one version per project, so the client and the server can't drift apart without a diff showing it:

```ruby
# Gemfile
group :development do
  gem "avo-cli", ">= 4.2.0.beta.3", require: false
end
```

```sh
bundle install
bundle exec avo --version
```

`group :development` keeps it off production servers, which rarely have Node and don't need the CLI. `require: false` because there's nothing to load into the app. `bundle binstubs avo-cli` writes `bin/avo` if you prefer that.

:::info No gem server token needed
Unlike the other paid add-ons, `avo-cli` is served from rubygems.org, so it installs with no [gem server authentication](./gem-server-authentication.html). It is a client: what it may do is decided by the token it sends, on the server, by the app's own entitlements and policies.
:::

## Connect to an app

Log in once and every later command knows the app:

```sh
avo login
```

It asks for three things, checks them against the app, and saves them:

| Asked for | What to give it |
| --- | --- |
| API base URL | The address `avo-api` answers on, **mount path included** — `https://admin.example.com/api`, `http://localhost:3000/api`. A scheme is required. |
| API token | A token's secret, as [minted in the panel](./rest-api.html#create-a-token). |
| API version | The version segment your app generated controllers for. Enter takes `v1`. |

`avo schema` is the right first command after that — it lists what the token may reach. `avo logout` deletes what was saved.

:::warning The token is saved as plain text
It goes to `~/.config/avo/config.json` (`$XDG_CONFIG_HOME/avo` when set, `%LOCALAPPDATA%\avo\config.json` on Windows), readable by your user only. Use a token you can [revoke](./rest-api.html#token-lifecycle), and revoke it if the machine is shared or lost.
:::

### Connect without logging in

In CI, in a container, or anywhere without a terminal to prompt at, set the environment instead:

```sh
export AVO_API_HOST=https://admin.example.com/api
export AVO_API_TOKEN=avo_...
export AVO_API_VERSION=v1   # the default; set it when the app generated another
avo schema
```

`--host`, `--token` and `--api-version` do the same per line.

Resolution is **flag → environment variable → saved login → default**, and the saved host and token are used all or nothing: name one of them yourself and the other is *not* taken from the file. That way a saved token can never be sent to a host you passed on the command line.

## The shape of a command

```
avo <verb> <resource> [id] [flags]
```

The resource is its **route key** — the same URL segment the API uses (`users`, `blog_posts`), as `avo schema` lists it. Not the model name, and not the resource's title.

```sh
avo schema users
avo list users
avo get users 5
avo create users --data '{"name": "Ada"}'
avo update users 5 --data '{"name": "Ada King"}'
avo delete users 5
```

`delete` asks for no confirmation.

## Discover what an app serves

`avo schema` reads the API's [discovery endpoints](./rest-api.html#discovery), so you never have to guess a resource name or which fields a write takes.

```sh
avo schema          # every resource this token may reach, and how far
avo schema users    # the fields a create sends
```

`avo schema <resource>` describes one view at a time. `--view create` (the default) and `--view update` list what a write may send, with each field's shape and its allowed values; `--view index` and `--view show` list what a record reads back.

```sh
avo schema users --view show
avo schema users --view create --format json
```

## Read records

`list` returns one page at a time, with a `Page N of M` footer:

```sh
avo list users
avo list users --page 2 --per-page 10
avo list users --sort name --dir desc
```

`--sort` and `--dir` are sent under the API's own [sorting parameters](./rest-api.html#index); `--per-page` defaults to the app's own Avo setting.

`get` returns one record by id:

```sh
avo get users 5
```

Both take `--fields` to pick the table's columns, client side:

```sh
avo list users --fields id,name,email
```

## Write records

`create` and `update` take their fields as **one JSON object**, under `--data`:

```sh
avo create users --data '{"name": "Ada Lovelace", "email": "ada@example.com"}'
avo update users 5 --data '{"name": "Ada King"}'
```

An update sends only what you name; every other field is left as it is.

When shell quoting gets in the way, read the object from a file or from stdin instead:

```sh
avo create users --data @user.json
avo create users --data - < user.json
```

### Send the right value for a field

Values are sent in the JSON type you wrote them with, and the server validates and casts them the way it does a browser form. Most fields need nothing special — a string for a text field, a number for a number field, `true`/`false` for a boolean, an ISO 8601 string for a date.

These are the ones worth knowing:

| Field | Write | Note |
| --- | --- | --- |
| `belongs_to` | `{"user_id": 5}` | The foreign key, not the association name. |
| Polymorphic `belongs_to` | `{"commentable_type": "Post", "commentable_id": 7}` | Both halves. |
| `select` with `multiple`, `checkbox_list`, `boolean_group` | `{"roles": ["editor", "reviewer"]}` | An array of the option **values**, never the labels. |
| `tags` | `{"tags": "ruby,rails"}` | One string; the field splits it on its delimiter. |
| `key_value`, `code` | `{"settings": {"a": 1}}` | The field takes its JSON as a string — write the object and the CLI stringifies it for you. |
| `location` stored in two columns | `{"coordinates": {"latitude": 44.4, "longitude": 26.1}}` | The keys are the field's own `stored_as` column names. |
| Any field, to clear it | `{"bio": null}` | `null` clears. On a list it is sent as `[]` and on a hash as every key set to `null`, since a bare `null` in either place is dropped silently. |

`file` and `files` fields need a multipart upload the CLI doesn't send; it names them rather than sending a body the server errors on. Associations (`has_many`, `has_one`, `has_and_belongs_to_many`) aren't writable over the API at all — set them from the child's `belongs_to` foreign key.

When you're not sure, ask the app:

```sh
avo schema users --view create
```

That lists every field a create may send, with the shape it takes, whether it's required, and the values a `select` accepts. The CLI checks nothing against it — a field the schema doesn't name and a value of the wrong shape both go out as written, so that one set of rules lives in the API and a newer server is never refused a write by an older client.

## Output for scripts and agents

```sh
avo list users --format json
```

`--format json` prints the response body **exactly as the server sent it**, so anything that reads the REST API directly reads the CLI's output too. `--verbose` logs each request and response line to stderr, leaving stdout clean to pipe.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `1` | The request failed — no answer, a timeout, or a `4xx`/`5xx` from the app. |
| `2` | The command was wrong — a missing host or token, `--data` that isn't one JSON object, a field type the CLI can't send, or no usable Node. |
| `130` | Ctrl-C at an `avo login` prompt. |

## When a command doesn't work

| Message | What it means |
| --- | --- |
| `command not found: avo` | Installed for another Ruby (check `ruby -v`), or the version manager needs a rehash. |
| `avo-cli needs Node 18.12.1 or newer on your PATH` | No `node` found, or the first one on `PATH` is too old. Install Node, or set `AVO_CLI_NODE=/path/to/node`. |
| `No host.` | Nothing saved and nothing passed. Run `avo login`, or set `AVO_API_HOST` and `AVO_API_TOKEN`. |
| `Unauthorized: … rejected the token.` | The token is absent, unknown, expired or revoked. Check its **Status** in the panel — a `401` [never says which it was](./rest-api.html#tell-the-three-refusals-apart). |
| `Forbidden: … was refused (reason: token_entitlement)` | The token isn't [entitled](./rest-api.html#entitle-a-token) to that action on that resource. |
| `Forbidden: … was refused (reason: policy)` | Your app's [policy](./rest-api.html#authorization) refused it for the token's owner. |
| `Not found: …` | A wrong resource name or API version, a record that isn't there, or an app with `avo-api` unmounted or unlicensed. |
| `… redirected to …` | Usually `force_ssl` answering an `http` host. Use the address it points to. |
| `Connection refused by …` | Nothing is listening there. |
| `… did not answer with a schema. Is this an app running avo-api?` | Something answered, but not this API — check the host, mount path included. |

Docker and CI images need **Node as well as Ruby**. A Ruby-only image installs the gem without complaint and fails on the first `avo` command.

## Works better with

- **[REST API](./rest-api.html)** — the add-on the CLI talks to. Mounting it, minting and entitling tokens, and what each endpoint answers are all there.
- **[MCP Server](./mcp.html)** — for an AI client acting as an admin in natural language, rather than a scripted client acting as a token.
