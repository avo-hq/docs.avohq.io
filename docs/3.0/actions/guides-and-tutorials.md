# WIP
this section is under construction
## Helpers

### `link_arguments`

The `link_arguments` method is used to generate the arguments for an action link.

You may want to dynamically generate an action link. For that you need the action class and a resource instance (with or without record hydrated). Call the action's class method `link_arguments` with the resource instance as argument and it will return the `[path, data]` that are necessary to create a proper link to a resource.

Let's see an example use case:

```ruby{4-,16} [Current Version]
# app/avo/resources/city.rb
class Avo::Resources::City < Avo::BaseResource
  field :name, as: :text, name: "Name (click to edit)", only_on: :index do
    path, data = Avo::Actions::City::Update.link_arguments(
      resource: resource,
      arguments: {
        cities: Array[resource.record.id],
        render_name: true
      }
    )

    link_to resource.record.name, path, data: data
  end
end
```


<Image src="/assets/img/actions/action_link.gif" width="684" height="391" alt="actions link demo" />


## Guides

### StimulusJS

Please follow our extended [StimulusJS guides](./../stimulus-integration.html#use-stimulus-js-in-a-tool) for more information.

### Passing Params to the Action Show Page
When navigation to an action from a resource <Index /> or <Show /> views, it's sometimes useful to pass parameters to an action.

One particular example is when you'd like to populate a field in that action with some particular value based on that param.

```ruby
class Action
  def fields
    field :some_field, as: :hidden, default: -> { if previous_param == yes ? :yes : :no}
  end
end
```
Consider the following scenario:

1. Navigate to `https://main.avodemo.com/avo/resources/users`.
2. Add the parameter `hey=ya` to the URL: `https://main.avodemo.com/avo/resources/users?hey=ya`
3. Attempt to run the dummy action.
4. After triggering the action, verify that you can access the `hey` parameter.
5. Ensure that the retrieved value of the `hey` parameter is `ya`.

**Implementation**

To achieve this, we'll reference the `request.referer` object and extract parameters from the URL. Here is how to do it:

```ruby
class Action
  def fields
    # Accessing the parameters passed from the parent view
    field :some_field, as: :hidden, default: -> {
      # Parsing the request referer to extract parameters
      parent_params = URI.parse(request.referer).query.split("&").map { |param| param.split("=")}.to_h.with_indifferent_access
      # Checking if the `hei` parameter equals `ya`
      if parent_params[:hey] == 'ya'
        :yes
      else
        :no
      end
    }
  end
end
```
Parse the `request.referer` to extract parameters using `URI.parse`.
Split the query string into key-value pairs and convert it into a hash.
Check if the `hey` parameter equals `ya`, and set the default value of `some_field` accordingly.
