---
betaStatus: "Open Beta"
license: addon
addon_link: https://avohq.io/addons/http-resource
outline: [2, 3]
api_docs: ./http-resource-api.html
---

# HTTP Resource

An **HTTP Resource** is a resource backed by an HTTP endpoint instead of an Active Record model. Point it at an external API and Avo will list, show, create, update, and delete records through that API — no database table required.

```ruby
# app/avo/resources/author.rb
class Avo::Resources::Author < Avo::Core::Resources::Http
  self.http_adapter = {
    endpoint: "https://api.openalex.org/authors",
    parse_collection: -> { response["results"] },
    parse_count: -> { response["meta"]["count"] }
  }

  def fields
    field :id, as: :id
    field :display_name
  end
end
```

With only `endpoint` configured, Avo assumes the response body *is* the collection (or record) and reads the total count from `response["total"]`. The parsing options exist to adapt APIs that wrap their payloads differently.

## Install the gem

Add `avo-http_resource` to your Gemfile:

```ruby
# Gemfile
gem "avo-http_resource", source: "https://packager.dev/avo-hq/"
```

Then run `bundle install`. The HTTP Resource becomes available as a new resource type.

## Generate a resource

Pass the `--http` flag to the resource generator:

```bash
bin/rails generate avo:resource Author --http
```

## Parse the API response

Most APIs wrap their data — a `results` key for the collection, a `meta` object for counts. Configure the three parsing procs to tell Avo where things live:

- [`parse_collection`](./http-resource-api.html#parse_collection) returns the array of records from the index response.
- [`parse_record`](./http-resource-api.html#parse_record) returns a single record from the show response.
- [`parse_count`](./http-resource-api.html#parse_count) returns the total number of records, used for pagination.

```ruby
# app/avo/resources/author.rb
self.http_adapter = {
  endpoint: "https://api.openalex.org/authors",
  parse_collection: -> { response["results"] },
  parse_record: -> { response },
  parse_count: -> { response["meta"]["count"] }
}
```

Each proc runs in an [`Avo::ExecutionContext`](execution-context) with access to `raw_response` (the `HTTParty::Response`), `response` (the parsed body), and `headers` (the response headers), so you can dig into nested structures or inspect status codes as needed.

:::info Pagination
Avo pages the API for you — index requests always include `page` and `per_page` query parameters.
:::

## Send authentication headers

Provide [`headers`](./http-resource-api.html#headers) to send credentials or any other header with every request:

```ruby
# app/avo/resources/author.rb
self.http_adapter = {
  endpoint: "https://api.openalex.org/authors",
  headers: {
    "Authorization" => "Bearer #{ENV.fetch("API_KEY")}"
  }
}
```

If the headers must be computed at request time — rotating tokens, per-user credentials — pass a proc returning the hash instead.

## Map sorting and filtering to query params

If you want Avo's sorting UI (or any UI state) forwarded to the API, build the query string with [`query_params`](./http-resource-api.html#query_params). The proc has access to controller `params`, and its result is merged into the request's query string:

```ruby
# app/avo/resources/author.rb
self.http_adapter = {
  endpoint: "https://api.openalex.org/authors",
  query_params: -> {
    if params[:sort_by].present? && params[:sort_direction].present?
      { sort: "#{params[:sort_by]}:#{params[:sort_direction]}" }
    else
      {}
    end
  }
}
```

## Customize the backing model

Avo generates an `ActiveModel` class for each HTTP Resource behind the scenes. Use [`model_class_eval`](./http-resource-api.html#model_class_eval) to define extra behavior on it — for example, obfuscating the ID used in URLs:

```ruby
# app/avo/resources/author.rb
self.http_adapter = {
  endpoint: "https://api.openalex.org/authors",
  model_class_eval: -> {
    define_method :to_param do
      Base64.encode64(id)
    end
  }
}
```

## Handle API errors

When the API returns an error, raise `Avo::HttpError` inside any parsing proc:

```ruby
parse_collection: -> {
  raise Avo::HttpError.new response["message"] if response["error"].present?
  response["results"]
}
```

The controller rescues the exception and displays the message as a flash error in the UI, so users get meaningful feedback instead of a broken page.

## Customize create, update, and destroy

Out of the box, the HTTP controller persists changes through the resource's client — `POST` to the endpoint on create, `PATCH` to `endpoint/:id` on update, and `DELETE` to `endpoint/:id` on destroy. The default implementation looks like this:

```ruby
def save_record
  # Perform either a create or update request based on the current controller action
  @response = @resource.client.send(action_name, @record)

  # Should return true if the operation succeeded, false otherwise
  @response.success?
end

def destroy_model
  # Perform a DELETE request to remove the record via the external API
  @response = @resource.client.delete(@record.id)
end
```

If your API needs different paths, extra parameters, or conditional logic, override these methods in the resource's controller:

- `save_record` must return a **boolean** indicating whether the operation succeeded.
- Inspect `action_name` (`"create"` or `"update"`) to tell the two operations apart.

```ruby
# app/controllers/avo/authors_controller.rb
class Avo::AuthorsController < Avo::Core::Controllers::Http
  def save_record
    auth_headers = {
      "Authorization" => "Bearer #{ENV.fetch("API_KEY")}"
    }

    response = if action_name == "create"
      MyCustomApi.post("/authors", body: @record.as_json, headers: auth_headers)
    else
      MyCustomApi.patch("/authors/#{@record.id}", body: @record.as_json, headers: auth_headers)
    end

    response.success?
  end
end
```

## Debug console

HTTP Resources ship with an interactive debug console for inspecting exactly what your resource sends and receives. Visit `<avo_root>/http-resource/debug` (e.g. `/avo/http-resource/debug`), pick a resource and an action (`index`, `show`, `count`, `create`, `update`, or `delete`), and fire the request.

For each run you can inspect:

- the sent URL, query params, and (masked) request headers
- the raw response alongside the parsed result
- the request timing
- the output of your `parse_collection`, `parse_record`, and `parse_count` blocks

Errors are surfaced inline per stage — a failed request and a failing `parse_*` block are reported separately — so a broken adapter never crashes the page.

The console is gated behind the `avo-http_resource` license feature and Avo's developer/admin access, the same gate as Avo's own debug tools. On top of that, it only lists — and only runs against — resources the current user is authorized to access, honoring each resource's [authorization policy](authorization). If you use Avo's authorization, a user can never reach a resource from the console that their policy would otherwise hide; if you don't configure authorization, only the developer/admin gate applies.

:::warning
The `create`, `update`, and `delete` actions hit your real external API. From the console they require an explicit confirmation before running.
:::

### Add it to the sidebar

To surface the console as a tool in the sidebar's **Tools** section, add a sidebar item partial to your app at `app/views/avo/sidebar/items/_http_resource_debugger.html.erb`:

```erb
<%= render Avo::Sidebar::LinkComponent.new(
  label: "HTTP debugger",
  path: File.join(avo.root_path, "http-resource", "debug"),
  icon: "tabler/outline/api"
) %>
```

### JSON API

The same diagnostics are available as JSON for scripting or agent use. `POST` to `<avo_root>/http-resource/debug/run.json` with the params `resource`, `probe_action`, `id`, `page`, `limit`, `query`, `body`, and `confirm`. Write actions (`create`, `update`, `delete`) require `confirm=1` since they hit the real external API.

## Full example

Every adapter option at once, against the [OpenAlex](https://openalex.org) API:

```ruby
# app/avo/resources/author.rb
class Avo::Resources::Author < Avo::Core::Resources::Http
  self.http_adapter = {
    endpoint: "https://api.openalex.org/authors",
    parse_collection: -> {
      raise Avo::HttpError.new response["message"] if response["error"].present?
      response["results"]
    },
    parse_record: -> {
      raise Avo::HttpError.new response["message"] if response["error"].present?
      response
    },
    parse_count: -> { response["meta"]["count"] },
    model_class_eval: -> {
      define_method :to_param do
        Base64.encode64(id)
      end
    },
    headers: {
      "Authorization" => "Bearer #{ENV.fetch("API_KEY")}"
    },
    query_params: -> {
      if params[:sort_by].present? && params[:sort_direction].present?
        { sort: "#{params[:sort_by]}:#{params[:sort_direction]}" }
      else
        {}
      end
    }
  }

  def fields
    field :id, as: :id
    field :display_name
    field :cited_by_count, name: "Total citations"
    field :works_count, name: "Total works"
  end
end
```
