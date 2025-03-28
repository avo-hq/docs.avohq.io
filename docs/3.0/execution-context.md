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

    attr_accessor :target, :context, :params, :view_context, :current_user, :request

    def initialize(**args)
      # If target don't respond to call, handle will return target
      # In that case we don't need to initialize the others attr_accessors
      return unless (@target = args[:target]).respond_to? :call

      args.except(:target).each do |key,value|
        singleton_class.class_eval { attr_accessor "#{key}" }
        instance_variable_set("@#{key}", value)
      end

      # Set defaults on not initialized accessors
      @context      ||= Avo::Current.context
      @params       ||= Avo::Current.params
      @view_context ||= Avo::Current.view_context
      @current_user ||= Avo::Current.current_user
      @request      ||= Avo::Current.request
    end

    delegate :authorize, to: Avo::Services::AuthorizationService

    # Return target if target is not callable, otherwise, execute target on this instance context
    def handle
      target.respond_to?(:call) ? instance_exec(&target) : target
    end
  end
end

# Use it like so.
SOME_BLOCK = -> {
  "#{record.first_name} #{record.last_name}"
}

Avo::ExecutionContext.new(target: &SOME_BLOCK, record: User.first).handle
```

This means you could throw any type of object at it and it it responds to a `call` method wil will be called with all those objects.

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

<Option name="Custom variables">

You can pass any variable to the `ExecutionContext` and it will be available in that block.
This is how we can expose `view`, `record`, and `resource` in the computed field example.

```ruby
Avo::ExecutionContext.new(target: &SOME_BLOCK, record: User.first, view: :index, resource: resource).handle
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
