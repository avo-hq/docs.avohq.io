# Controller options
Each interaction with the CRUD UI results on a request - response cycle. That cycle pass through the BaseController. Each auto-generated controller for your resource inherits from ResourcesController who inherits from BaseController.

```ruby
class Avo::CoursesController < Avo::ResourcesController
end
```

In order to make your controllers more flexible, there are several overridable methods.

## Create methods
For `create` method you can modify the after create path, the messages and the actions both on success or fail.

### `after_create_path`
Overriding this method, you can tell Avo what path to follow when create succeed.

### `create_success_action` / `create_fail_action`
Overriding these methods, you can build a custom response when create succeed or fail, respectively.

```ruby
def create_success_action
  respond_to do |format|
    format.html { redirect_to after_create_path, notice: create_success_message}
  end
end
```

### `create_success_message` / `create_fail_message`
Overriding these methods, you can tell Avo what message to display when create succeed or fail, respectively.

```ruby
def create_success_message
  "#{@resource.name} #{t("avo.was_successfully_created")}."
end
```

## Update methods
For `update` method you can modify the after update path, the messages and the actions both on success or fail.

### `after_update_path`
Overriding this method, you can tell Avo what path to follow when update succeed.

### `update_success_action` / `update_fail_action`
Overriding these methods, you can build a custom response when update succeed or fail, respectively.

```ruby
def update_success_action
  respond_to do |format|
    format.html { redirect_to after_update_path, notice: update_success_message }
  end
end
```

### `update_success_message` / `update_fail_message`
Overriding these methods, you can tell Avo what message to display when update succeed or fail, respectively.

```ruby
def update_success_message
  "#{@resource.name} #{t("avo.was_successfully_updated")}."
end
```

## Destroy methods
For `destroy` method you can modify the after destroy path, the messages and the actions both on success or fail.

### `after_destroy_path`
Overriding this method, you can tell Avo what path to follow when destroy succeed.

### `destroy_success_action` / `destroy_fail_action`
Overriding these methods, you can build a custom response when destroy succeed or fail, respectively.

```ruby
def destroy_success_action
  respond_to do |format|
    format.html { redirect_to after_destroy_path, notice: destroy_success_message }
  end
end
```

### `destroy_success_message` / `destroy_fail_message`
Overriding these methods, you can tell Avo what message to display when destroy succeed or fail, respectively.

```ruby
def destroy_success_message
  t("avo.resource_destroyed", attachment_class: @attachment_class)
end
```


