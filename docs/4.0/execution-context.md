---
license: community
---

# Execution context

Avo enables developers to hook into different points of the application lifecycle using blocks.
That functionality can't always be performed in void but requires some pieces of state to set up some context.

Computed fields are one example.

```ruby
field :full_name, as: :text do
  "#{record.first_name} #{record.last_name}"
end
```

In that block we need to pass the `record` so you can compile that value. We send more information than just the `record`, we pass on the `resource`, `view`, `view_context`, `request`, `current_user` and more depending on the block that's being run.

## How does the `ExecutionContext` work?

The `ExecutionContext` is an object that holds some pieces of state on which we execute a lambda function.

```ruby
module Avo
  class ExecutionContext
    attr_accessor :target, :context, :params, :view_context, :current_user, :request, :locale, :main_app, :avo

    # Delegate any missing method to the view context for a more natural experience.
    delegate_missing_to :@view_context

    def initialize(**args)
      # If target doesn't respond to call, handle will return target.
      # In that case we don't need to initialize the other accessors.
      return unless (@target = args[:target]).respond_to? :call

      args.except(:target).each do |key, value|
        singleton_class.class_eval { attr_accessor key }
        instance_variable_set("@#{key}", value)
      end

      # Set defaults on not initialized accessors
      @context      ||= Avo::Current.context
      @current_user ||= Avo::Current.user
      @params       ||= Avo::Current.params
      @request      ||= Avo::Current.request
      @view_context ||= Avo::Current.view_context
      @locale       ||= Avo::Current.locale
      @main_app     ||= @view_context&.main_app
      @avo          ||= @view_context&.avo
    end

    delegate :authorize, to: Avo::Services::AuthorizationService

    # Return target if target is not callable, otherwise execute target on this instance context.
    def handle
      target.respond_to?(:call) ? instance_exec(&target) : target
    end
  end
end

# Use it like so.
SOME_BLOCK = -> {
  "#{record.first_name} #{record.last_name}"
}

Avo::ExecutionContext.new(target: SOME_BLOCK, record: User.first).handle
```

This means you can throw any type of object at it, and if it responds to a `call` method it will be called with all those objects in scope.

## Common objects

<Option name="`target`">

The block you'll pass to be evaluated. It may be anything but will only be evaluated if it responds to a `call` method.

</Option>

<Option name="`context`">

Aliased to [`Avo::Current.context`](./avo-current#context).

</Option>

<Option name="`current_user`">

Aliased to [`Avo::Current.user`](./avo-current#user).

</Option>

<Option name="`view_context`">

Aliased to [`Avo::Current.view_context`](./avo-current#view_context).

</Option>

<Option name="`request`">

Aliased to [`Avo::Current.request`](./avo-current#request).

</Option>

<Option name="`params`">

Aliased to [`Avo::Current.params`](./avo-current#params).

</Option>

<Option name="`locale`">

Aliased to [`Avo::Current.locale`](./avo-current#locale).

</Option>

<Option name="`main_app`">

The route helpers for your host application. Use it to build paths to your own app's routes, e.g. `main_app.post_path(record)`.

</Option>

<Option name="`avo`">

Avo's route helpers. Use it to build paths within the Avo engine.

</Option>

<Option name="Custom variables">

You can pass any variable to the `ExecutionContext` and it will be available in that block.
This is how we can expose `view`, `record`, and `resource` in the computed field example.

```ruby
Avo::ExecutionContext.new(target: SOME_BLOCK, record: User.first, view: :index, resource: resource).handle
```

</Option>

<Option name="`helpers`">

Within the `ExecutionContext` you might want to use some of your already defined helpers. You can do that using the `helpers` object.

```ruby
# products_helper.rb
class ProductsHelper
  # Strips the "CODE_" prefix from the name
  def simple_name(name)
    name.gsub "CODE_", ""
  end
end

field :name, as: :text, format_using: -> { helpers.simple_name(value) }
```

</Option>

<Option name="`include`">

Pass an array of modules to mix into the `ExecutionContext` before the block runs, making their methods available inside it.

```ruby
Avo::ExecutionContext.new(
  target: -> { sanitize "<script>alert('be careful')</script>#{record.name}" },
  record: record,
  include: [ActionView::Helpers::SanitizeHelper]
).handle
```

</Option>

:::info View context methods
The `ExecutionContext` delegates any missing method to the [`view_context`](#view_context), so view helpers (`link_to`, `content_tag`, your app's view helpers, etc.) are callable directly inside the block without going through [`helpers`](#helpers).
:::
