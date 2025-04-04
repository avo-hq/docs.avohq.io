---
version: '4.0'
betaStatus: Unreleased
outline: deep
---

# HTTP Resources

## Overview

An **HTTP Resource** is a flexible resource that can be backed by an **endpoint** request. Unlike traditional resources tied to Active Record models, HTTP Resources allow dynamic interaction with external APIs and non-persistent data sources.

:::warning ⚠️ Limitations

- The HTTP Resource does **not support sorting** at this time.

**Please note that these limitations stem from the current implementation and may evolve in future releases.**

:::

## Installing the gem

To enable HTTP Resource functionality in your Avo project, you need to include the `avo-http_resource` gem.

Add it to your Gemfile:

```ruby
gem "avo-http_resource", source: "https://packager.dev/avo-hq/"
```

Then install it:

```bash
bundle install
```

Once the gem is installed, HTTP Resources will be available as a new type of resource, enabling you to connect seamlessly with external APIs and custom data endpoints, no Active Record necessary.

## Creating an HTTP Resource

You can generate an HTTP Resource using the `--http` flag in the generator:

```bash
bin/rails generate avo:resource Author --http
```

## Parsing Data from an Endpoint

To wire an HTTP Resource to a data source, you must configure several attributes. Below is a breakdown of the supported options, each with an illustrative example.

```ruby
# app/avo/resources/author.rb
class Avo::Resources::Author < Avo::Core::Resources::Http
  # The base URL for your external API
  self.endpoint = "https://api.openalex.org/"

  # A key used to namespace or organize resources logically
  self.endpoint_key = "authors"

  # How to extract the list of records from the API response
  self.parse_collection = -> {
    raise Avo::HttpError.new response["message"] if response["error"].present?
    response["results"]
  }

  # How to extract a single record from the API response
  self.parse_record = -> {
    raise Avo::HttpError.new response["message"] if response["error"].present?
    response
  }

  # How to extract the total count of records (useful for pagination)
  self.parse_count = -> { response["meta"]["count"] }

  # Optional: custom method to find a record if the ID is encoded or non-standard
  self.find_record_method = -> { query.find Base64.decode64(id) }

  # Optional: redefines model behavior to obfuscate the ID via Base64
  self.model_class_eval = -> {
    define_method :to_param do
      Base64.encode64(id)
    end
  }

  def fields
    field :id, as: :id
    field :display_name
    field :cited_by_count, name: "Total citations"
    field :works_count, name: "Total works"
  end
end
```

### Option Reference

Here’s a brief reference for the main configuration options:

| Option              | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `endpoint`          | Base URL for the external API                                               |
| `endpoint_key`      | Logical key to distinguish resource type                                    |
| `parse_collection`  | Proc that returns the array of records                                      |
| `parse_record`      | Proc that returns a single record                                           |
| `parse_count`       | Proc that returns the total number of records                              |
| `model_class_eval`  | Optional: proc to define extra model behavior, often used for `to_param`   |

All HTTP Resource options accept a **proc** (i.e., a lambda or block). These procs are executed in a rich runtime context that gives you full access to the HTTP response and metadata around the request.

Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context), including:

- `raw_response` — the raw `HTTParty::Response` response object
- `response` — the parsed body from `raw_response` (`raw_response.parsed_response`)
- `headers` — the headers from the response, available via `raw_response.headers`

This contextual access empowers you to define your resource’s behavior with a high degree of precision. Whether you're extracting deeply nested structures or implementing nuanced error handling, the execution context provides all the necessary components to **structure your parsing logic with clarity and control**.

## Handling API Errors Gracefully

When interacting with external APIs, it's important to handle error responses gracefully. Avo provides a custom exception, `Avo::HttpError`, for this exact purpose.

You can raise this error within your parsing procs like so:

```ruby
raise Avo::HttpError.new response["message"] if response["error"].present?
```

This signals to Avo that the API returned an error, and the HTTP controller will automatically **rescue** the exception and **display the message as a flash error in the UI**. This allows you to surface meaningful error feedback to users without breaking the experience or having to manually handle exceptions across the interface.

This pattern ensures your integration remains **resilient** and **intuitive**, providing a seamless user experience even when interacting with unreliable or unpredictable external data sources.

## Controlling Create, Update, and Destroy Behavior

By default, the HTTP Resource controller provides built-in methods to handle **creation**, **updates**, and **deletion** of records through your API client. These methods are designed to be flexible and easy to override when you need custom behavior.

### Default Implementation

```ruby
class Avo::Core::Controllers::Http
  def save_record
    # Perform either a create or update request based on the current controller action
    response = @resource.client.send(action_name, @record)

    # Should return true if the operation succeeded, false otherwise
    response.success?
  end

  def destroy_model
    # Perform a DELETE request to remove the record via the external API
    @resource.client.delete(@record.id)
  end
end
```

### Customizing the Behavior

If your external API requires additional parameters, or conditional logic, you can override these methods in your custom controller.

- `save_record` should return a **boolean**, indicating whether the create or update operation was successful.
- You can determine if the operation is a **create** or an **update** by inspecting the `action_name`, which will be `"create"` or `"update"` respectively.

### Example Override


```ruby
# app/controllers/avo/authors_controller.rb
class Avo::AuthorsController < Avo::Core::Controllers::Http
  def save_record
    if action_name == "create"
      response = MyCustomApi.post("/authors", body: @record.to_json, headers: auth_headers)
    else
      response = MyCustomApi.put("/authors/#{@record.id}", body: @record.to_json, headers: auth_headers)
    end

    response.status == 200
  end
end
```

This approach grants you complete control over how HTTP Resources interact with your external services, allowing seamless integration, even with APIs that have unconventional or highly specific requirements.
