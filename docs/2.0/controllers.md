# Controller options
Each interaction with the CRUD UI results in a request - response cycle. That cycle passes through the `BaseController`. Each auto-generated controller for your resource inherits from `ResourcesController`, which inherits from `BaseController`.

```ruby
class Avo::CoursesController < Avo::ResourcesController
end
```

In order to make your controllers more flexible, there are several overridable methods similar to how [devise](https://github.com/heartcombo/devise#controller-filters-and-helpers:~:text=You%20can%20also%20override%20after_sign_in_path_for%20and%20after_sign_out_path_for%20to%20customize%20your%20redirect%20hooks) overrides `after_sign_in_path_for` and `after_sign_out_path_for`.

## Create methods
For the `create` method, you can modify the `after_create_path`, the messages, and the actions both on success or failure.

### `after_create_path`
Overriding this method, you can tell Avo what path to follow when `create` succeed.

### `create_success_action` / `create_fail_action`
Overriding these methods, you can build a custom response when `create` succeeds or fails.

```ruby
def create_success_action
  respond_to do |format|
    format.html { redirect_to after_create_path, notice: create_success_message}
  end
end
```

### `create_success_message` / `create_fail_message`
Overriding these methods, you can tell Avo what message to display when `create` succeeds or fails.

```ruby
def create_success_message
  "#{@resource.name} #{t("avo.was_successfully_created")}."
end
```

## Update methods
For the `update` method, you can modify the `after_update_path`, the messages, and the actions both on success or failure.

### `after_update_path`
Overriding this method, you can tell Avo what path to follow when `update` succeed.

### `update_success_action` / `update_fail_action`
Overriding these methods, you can build a custom response when `update` succeeds or fails.

```ruby
def update_success_action
  respond_to do |format|
    format.html { redirect_to after_update_path, notice: update_success_message }
  end
end
```

### `update_success_message` / `update_fail_message`
Overriding these methods, you can tell Avo what message to display when `update` succeeds or fails.

```ruby
def update_success_message
  "#{@resource.name} #{t("avo.was_successfully_updated")}."
end
```

## Destroy methods
For the `destroy` method, you can modify the `after_destroy_path`, the messages, and the actions both on success or failure.

### `after_destroy_path`
Overriding this method, you can tell Avo what path to follow when `destroy` succeeds.

### `destroy_success_action` / `destroy_fail_action`
Overriding these methods, you can build a custom response when `destroy` succeeds or fails.

```ruby
def destroy_success_action
  respond_to do |format|
    format.html { redirect_to after_destroy_path, notice: destroy_success_message }
  end
end
```

### `destroy_success_message` / `destroy_fail_message`
Overriding these methods, you can tell Avo what message to display when `destroy` succeeds or fails.

```ruby
def destroy_success_message
  t("avo.resource_destroyed", attachment_class: @attachment_class)
end
```


