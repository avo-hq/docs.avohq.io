---
license: community
outline: [2, 3]
pageClass: cli-reference
---

# Command line client

`avo-cli` is the command line client for the [REST API](./rest-api.html). It talks to an app running `avo-api` over HTTP, so nothing is installed in the app. Every command prints a plain text table, or the raw JSON body under `--format json`.

```bash
avo login                                  # once: host, token, API version
avo schema                                 # what the token may reach
avo list users --sort name --dir desc      # a page of records
avo create users --data '{"name": "Ada", "email": "ada@example.com"}'
```

Every line has the same shape, `avo <verb> <resource> [id] [flags]`, with the resource named by its route key. Once you have logged in, no command needs a host or a token again.

:::info The CLI is free, the API is an add-on
`avo-cli` is a free, separate gem. The app it talks to must run the paid `avo-api` add-on. [See the add-on page](https://avohq.io/addons/api).
:::

## Requirements

- **Ruby 3.0 or newer**: the `avo` executable is a Ruby gem.
- **Node 18.12.1 or newer**, the first `node` on your `PATH` or the binary `AVO_CLI_NODE` names. The gem hands the line over to it.
- **An app running `avo-api`**, reachable over HTTP, and an [API token](./rest-api.html#create-a-token) created in that app.

## Installation

### 1. Install the gem

```bash
gem install avo-cli
avo --version
```

### 2. Connect to your app

Log in once and every later command knows the app:

```bash
avo login
# or with everything on the line
avo login --host https://admin.example.com/api --token avo_xxxx --api-version v1
```

It asks for three things and checks them against the app before saving them:

| <div style="min-width: 8rem">Prompt</div> | What to answer                                              |
| ----------------------------------------- | ----------------------------------------------------------- |
| `API base URL` | The address `avo-api` answers on, mount path included: `https://admin.example.com/api` |
| `API token`    | The secret shown once when the token was created. Typed masked, never printed          |
| `API version`  | Enter takes `v1`. Change it only when the app generated its controllers under another  |

If the check fails, nothing is saved.

:::warning The token is saved as plain text
`avo login` writes `~/.config/avo/config.json`. Use a token you can revoke from the [API tokens](./rest-api.html#manage-tokens-in-the-panel) screen, and run `avo logout` on a machine you are leaving.
:::

### 3. Check what the token reaches

```bash
avo schema
```

This is the right first command after logging in. It lists every resource the API serves and the actions this token may call on each:

```
route_key  name     entitlements
posts      Post     index, show, create, update, destroy
users      User     index, show, create, update, destroy
```

The first column is the name every other command takes.

## Connect without logging in

If you would rather not save anything, or you are running in a job, set the variables instead and skip `avo login`:

```bash
export AVO_API_HOST=https://admin.example.com/api
export AVO_API_TOKEN=avo_xxxx
export AVO_API_VERSION=v1
avo schema
```

| Variable          | Flag            | Default | What it sets                                                         |
| ----------------- | --------------- | ------- | -------------------------------------------------------------------- |
| `AVO_API_HOST`    | `--host`        | none    | API base URL, mount path included, e.g. `http://localhost:3000/api`  |
| `AVO_API_TOKEN`   | `--token`       | none    | API token secret, sent as `Authorization: Bearer`                    |
| `AVO_API_VERSION` | `--api-version` | `v1`    | API version segment of the URL                                       |
| `AVO_CLI_NODE`    | none            | none    | Path to the Node binary the `avo` executable runs, instead of `PATH` |

A flag beats the variable, the variable beats the saved login. To reach one other app for one command, pass both halves:

```bash
avo list users --host http://localhost:3000/api --token avo_yyyy
```

:::info The saved host and token are used only together
Name a host or a token yourself and the saved pair is left out entirely, so a saved token never reaches another host.
:::

The host is the API base URL: the address the API answers on, mount path included. The CLI appends only `/resources/<version>/<path>` to it, so `--host https://admin.example.com/api` makes its requests to `https://admin.example.com/api/resources/v1/...`. Where an app mounts the API is [Mount the API](./rest-api.html#mount-the-api). It must start with `http://` or `https://`.

## Look up what you can send

Ask for one resource's fields before writing to it. `--view create` is the default:

```bash
avo schema users
```

```
field_id  field_type  field_options
name      text        {"required":true,"shape":"scalar"}
email     text        {"required":true,"shape":"scalar"}
active    boolean     {"required":false,"shape":"scalar"}
role      select      {"required":false,"shape":"scalar","options":["user","admin","moderator"]}
team_id   number      {"required":false,"shape":"scalar"}
```

`field_options` is one JSON object per row, printed whole so a long `options` list is never cut. It appears on the two form views only.

Pass `--view update` for what an update may send, and `--view index` or `--view show` for what a record reads back, where the `field_options` column is gone since nothing is sent. Each view needs the entitlement of the request it describes.

A `belongs_to` is listed by the key that sets it, `team_id`.

## List records

```bash
avo list users
```

The server decides the columns, and the pagination comes back as a footer line. Narrow or reorder the columns with `--fields`, and page and sort with the rest:

```bash
avo list users --sort name --dir desc --fields id,name,email --per-page 10
```

## Read one record

```bash
avo get users 5
```

The record reads down the page, one field per row, and `--fields name,email` picks the rows.

## Create a record

Pass the fields as one JSON object and the created record is printed back:

```bash
avo create users --data '{"name": "Ada Lovelace", "email": "ada@example.com"}'
```

A create reads the resource's `create` view first, for the key the body nests under and the shape of each field, then sends the `POST`. Use `--verbose` to see both requests.

## Update a record

```bash
avo update users 5 --data '{"name": "Ada King"}'
```

Every field you do not name is left as it is, and `null` clears the ones you do:

```bash
avo update users 5 --data '{"bio": null, "roles": []}'
```

The update is partial per field, not inside a field's value. Setting a JSON column replaces the whole column, so send the whole object to keep the rest of it.

## Delete a record

```bash
avo delete users 5
```

:::warning No confirmation
`delete` asks nothing before sending: the line already names the record.
:::

## Send the right value for a field

`--data` (`-d`) takes one JSON object. Pass it inline, as `@path` to read a file, or as `-` to read stdin.

Each key is a field name from `avo schema <resource>`. Write values in their natural JSON type (string, number, boolean, array, object) and the CLI sends them as they are. The app validates and casts them.

### Arrays and hashes

The `shape` inside a field's `field_options` tells you when a field takes more than a scalar:

| The view says                                | You write                                              | Note                                   |
| -------------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| `shape: array`                               | `"roles": ["editor", "reviewer"]`                      | `null` clears it to `[]`               |
| `shape: hash`, `keys: [latitude, longitude]` | `"coordinates": {"latitude": 44.4, "longitude": 26.1}` | `null` sets every key to `null`        |

### Key-value and code fields

Write a `key_value` or `code` field as a JSON object. The CLI serializes it to a string for you and the field parses it on the app side:

```bash
avo update users 5 --data '{"settings": {"theme": "dark"}}'
```

### Tags

A `tags` field takes one string and splits it on the field's delimiter, `,` by default:

```bash
avo update profiles 5 --data '{"skills": "ruby,rails"}'
```

### Associations

- `belongs_to`: write the foreign key, `"team_id": 2`.
- Polymorphic `belongs_to`: write both parts, `"reactable_type": "Post"` and `"reactable_id": 7`.
- `has_one`, `has_many`, `has_and_belongs_to_many`: not writable from this side. Set the `belongs_to` on the child record instead.

### Files

`file` and `files` fields are refused with exit `2`. They need a multipart upload, which the CLI does not send.

### Long or awkward values

When shell quoting gets in the way (a value that contains a quote, an object too long for one line), put the JSON in a file:

```bash
avo update users 5 --data @user.json
```

Or pipe it in:

```bash
cat user.json | avo update users 5 --data -
```

:::warning A successful write can still skip a field
The CLI sends `--data` as you wrote it. Apart from refusing `file` fields, it does not check your keys or values against the view. The app decides what to keep, and its strong params silently drop anything they do not permit, such as a misspelled field name or an array sent to a scalar field. The command still exits `0`.

To confirm a write took, read the record back:

```bash
avo get users 5 --fields name,email
```
:::

## Get JSON for a script

`--format json` prints the body exactly as the server sent it, on stdout and nothing else, so a script can read it:

```bash
avo get users 5 --format json
```

```json
{"record": {"id": 5, "name": "Ada", "email": "ada@example.com"}}
```

The default `table` format shortens long values with an ellipsis. When you see one, use `--format json` to get the whole value.

`--verbose` logs each request and response line to stderr, so `--format json --verbose` still leaves only the body on stdout.

## Sign out

```bash
avo logout
```

This deletes what `avo login` saved. Anything exported in your shell (`AVO_API_HOST`, `AVO_API_TOKEN`, `AVO_API_VERSION`) keeps working after it.

## When a command fails

A failed command prints one message on stderr, nothing on stdout, and exits non-zero. The message names what to change. Add `--verbose` to also see the request and response lines on stderr.

| Exit code | Meaning                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `0`       | Success                                                                                              |
| `1`       | The app refused or did not answer. The request was sent, so read the message before retrying a write |
| `2`       | The CLI refused the command before sending anything. Nothing was written                             |
| `130`     | Ctrl-C at an `avo login` prompt. Nothing was saved                                                   |

### Exit `1`: the app refused or did not answer

The message is one of two kinds.

**The app answered with an error.** The message starts with `Unauthorized`, `Forbidden`, `Not found`, `Failed to create ...`, `Failed to update ...`, `HTTP 400` or `Server error 5xx`, and carries the app's own `error` and, when present, `reason`. These are the REST API's responses, so:

- What each status means and where to fix it: the [status-code table](./rest-api-api.html#status-codes)
- The two `Forbidden` reasons: [Tell the three refusals apart](./rest-api.html#tell-the-three-refusals-apart)
- `Not found` on every resource: usually an app without `avo-api` mounted and licensed
- `HTTP 400`: also what an empty `--data` object gets

**The app never answered.** The request did not reach a response the app meant to send:

| Message starts with                                         | Cause and fix                                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `... redirected to ...`                                     | Never followed, since the token would be dropped on the way. Usually `http://` on an app that forces `https://`: use the address the message points to as the host |
| `Connection refused`, `Unknown host`, `Timed out after 30s` | The app was not reached, or did not finish answering in 30 seconds. Check the host and that the app is running                                                     |
| `... did not answer with ...`                               | A `200` whose body is not what `avo-api` sends. The host is probably a different app                                                                               |

### Exit `2`: the CLI refused before sending

Nothing was sent, so nothing changed on the app. The message names what to fix, and it is one of:

- **The command line.** An unknown command (with a `Did you mean` when the typo is close), a flag the command does not take, an empty id, or `--view` without a resource
- **The data.** `--data` that is not one JSON object, or names a file it cannot read, or includes a `file` field (files need a multipart upload the CLI does not send)
- **The connection.** No host or no token, a host that is not an `http://` or `https://` URL or carries a username and password, or a token with a character a header cannot carry, such as a newline
- **The saved login.** A file `avo login` wrote that cannot be read, written, or parsed
- **The environment.** `avo login` with no terminal to ask on, or no Node 18.12.1 or newer on `PATH`

## Command reference

Every line has the same shape:

```
avo <command> [RESOURCE] [ID] [flags]
```

`RESOURCE` is a resource by its route key, as `schema` lists them, and `ID` a record id.

| Command                    | Shortcut | What it does                                                                                    |
| -------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `avo login`                |          | [Save the host, token and API version](#_2-connect-to-your-app), so later commands need none    |
| `avo logout`               |          | [Delete what `login` saved](#sign-out)                                                          |
| `avo schema [RESOURCE]`    | `s`      | [List the resources](#_3-check-what-the-token-reaches), or [the fields of one](#look-up-what-you-can-send) |
| `avo list RESOURCE`        | `l`      | [List records](#list-records), one page at a time                                               |
| `avo get RESOURCE ID`      | `g`      | [Show one record](#read-one-record)                                                             |
| `avo create RESOURCE`      | `c`      | [Create a record](#create-a-record)                                                             |
| `avo update RESOURCE ID`   | `u`      | [Update a record](#update-a-record)                                                             |
| `avo delete RESOURCE ID`   | `d`      | [Delete a record](#delete-a-record), asking nothing first                                       |

A shortcut goes in the command's slot: `avo l users` is `avo list users`. `avo help [COMMAND]` or `avo <command> --help` prints one command's usage, and a typo close to a command gets a `Did you mean:` line.

| Flag                           | Commands                         | Description                                                                              |
| ------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `--host <url>`                 | every request                    | API base URL, mount path included. Env: `AVO_API_HOST`                                   |
| `--token <secret>`             | every request                    | API token secret, sent as a Bearer token. Env: `AVO_API_TOKEN`                           |
| `--api-version <name>`         | every request                    | API version segment of the URL. Defaults to the one `login` saved, then `v1`. Env: `AVO_API_VERSION` |
| `--verbose`                    | every request                    | Log each request and response line to stderr                                             |
| `--format table\|json`         | every response                   | Output format. Default `table`; `json` prints the body exactly as the server sent it     |
| `--fields <a,b,c>`             | `list`, `get`, `create`, `update` | Which fields to show, comma-separated, in that order. Columns on `list`, rows elsewhere |
| `-d, --data <json\|@path\|->`  | `create`, `update`               | Required. Fields to write, as one JSON object. `@path` reads it from a file, `-` from stdin |
| `--view <name>`                | `schema`                         | Which view's fields. `create` (default) and `update` list what a write may send; `index` and `show` what a record reads back. Needs a resource |
| `--page <n>`                   | `list`                           | Page number, starting at 1                                                               |
| `--per-page <n>`               | `list`                           | Records per page. Default: the app's Avo setting                                         |
| `--sort <field>`               | `list`                           | Field to sort by                                                                         |
| `--dir asc\|desc`              | `list`                           | Sort direction. Needs `--sort`                                                           |

`login` and `logout` are the two commands that take no `RESOURCE`:

- **`login`** takes the connection flags and `--verbose`.
- Without a terminal, `--host` and `--token` (or their env variables) are required, and the API version falls back to `v1`.
- **`logout`** takes no flags.
