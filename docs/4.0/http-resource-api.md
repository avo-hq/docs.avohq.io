---
betaStatus: "Open Beta"
license: addon
addon_link: https://avohq.io/addons/http-resource
outline: [2, 3]
guide: ./http-resource.html
prev:
  text: "HTTP Resource"
  link: "./http-resource.html"
next: false
---

# HTTP Resource API

Per-option reference for the `http_adapter` hash. For task-oriented documentation and worked examples, see the [HTTP Resource guide](./http-resource.html).

All options are passed as a Hash to `self.http_adapter` in the resource file:

```ruby
class Avo::Resources::Author < Avo::Core::Resources::Http
  self.http_adapter = {
    # options listed below
  }
end
```

## Request options

<Option name="`endpoint`" headingSize="3">

The base URL of the external API. Avo derives every request from it:

| Operation | Request                            |
| --------- | ---------------------------------- |
| Index     | `GET endpoint?page=…&per_page=…`   |
| Show      | `GET endpoint/:id`                 |
| Create    | `POST endpoint`                    |
| Update    | `PATCH endpoint/:id`               |
| Destroy   | `DELETE endpoint/:id`              |

```ruby
self.http_adapter = {
  endpoint: "https://api.openalex.org/authors"
}
```

- **Type:** String
- **Default:** `nil`

:::warning String only
Unlike the other adapter options, `endpoint` is used verbatim — it does not accept a proc and is not evaluated through `Avo::ExecutionContext`.
:::

:::info Request behavior
Index requests always carry `page` and `per_page` query parameters — the names are not configurable. Use [`query_params`](#query_params) to send additional parameters. Requests time out after 10 seconds and raise an error.
:::

</Option>

<Option name="`headers`" headingSize="3">

Headers sent with every request. Accepts a plain Hash or a proc returning one — the value is resolved through [`Avo::ExecutionContext`](execution-context), so a proc can compute headers at request time (rotating tokens, per-user credentials).

```ruby
self.http_adapter = {
  headers: {
    "Authorization" => "Bearer #{ENV.fetch("API_KEY")}"
  }
}
```

- **Type:** Hash, or Proc returning a Hash
- **Default:** `{}`

</Option>

<Option name="`query_params`" headingSize="3">

A proc returning a Hash that is merged into the index request's query string, on top of the built-in `page` and `per_page` parameters. The proc is evaluated through [`Avo::ExecutionContext`](execution-context), with access to controller `params` when available — useful to map Avo's sorting and filtering UI to the API's query parameters.

```ruby
self.http_adapter = {
  query_params: -> {
    if params[:sort_by].present? && params[:sort_direction].present?
      { sort: "#{params[:sort_by]}:#{params[:sort_direction]}" }
    else
      {}
    end
  }
}
```

- **Type:** Proc returning a Hash
- **Default:** `-> { {} }`

:::info Legacy alias
The key `sort_params` is still honored as a legacy alias for `query_params`. Use `query_params` in new code.
:::

</Option>

## Response parsing

The three parsing procs are evaluated through [`Avo::ExecutionContext`](execution-context). Within them, you gain access to all attributes of the execution context, including:

- `raw_response` — the raw `HTTParty::Response` object
- `response` — the parsed body (`raw_response.parsed_response`)
- `headers` — the response headers (`raw_response.headers`)

Raise [`Avo::HttpError`](./http-resource.html#handle-api-errors) inside any of them to surface an API error as a flash message.

<Option name="`parse_collection`" headingSize="3">

Extracts the array of records from the index response.

```ruby
self.http_adapter = {
  parse_collection: -> { response["results"] }
}
```

- **Type:** Proc returning an Array of Hashes
- **Default:** `-> { response }` — the response body is the collection

</Option>

<Option name="`parse_record`" headingSize="3">

Extracts a single record from the show response.

```ruby
self.http_adapter = {
  parse_record: -> { response }
}
```

- **Type:** Proc returning a Hash
- **Default:** `-> { response }` — the response body is the record

</Option>

<Option name="`parse_count`" headingSize="3">

Extracts the total number of records, used for pagination.

```ruby
self.http_adapter = {
  parse_count: -> { response["meta"]["count"] }
}
```

- **Type:** Proc returning an Integer
- **Default:** `-> { response["total"] }`

</Option>

## Model customization

<Option name="`model_class_eval`" headingSize="3">

A proc evaluated with `instance_exec` inside the dynamically generated model class backing the resource. Use it to define or override model behavior — most commonly `to_param`.

```ruby
self.http_adapter = {
  model_class_eval: -> {
    define_method :to_param do
      Base64.encode64(id)
    end
  }
}
```

- **Type:** Proc
- **Default:** `-> {}`

:::warning No response access
`model_class_eval` runs in the model class body, not in the request/response execution context — `response`, `raw_response`, and `headers` are not available inside it.
:::

</Option>
