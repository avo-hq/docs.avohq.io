---
version: '2.14'
demoVideo: https://youtu.be/peKt90XhdOg?t=11
---

# Resource controllers

In order to benefit from Rails' amazing REST architecture, Avo generates a controller alongside every resource.
Generally speaking you don't need to touch those controllers. Everything just works out of the box with configurations added to the resource file.

However, sometimes you might need more granular control about what is happening in the controller actions or their callbacks. In that scenario you may take over and override that behavior.

## Request-Response lifecycle

Each interaction with the CRUD UI results in a request - response cycle. That cycle passes through the `BaseController`. Each auto-generated controller for your resource inherits from `ResourcesController`, which inherits from `BaseController`.

```ruby
class Avo::CoursesController < Avo::ResourcesController
end
```

In order to make your controllers more flexible, there are several overridable methods similar to how [devise](https://github.com/heartcombo/devise#controller-filters-and-helpers:~:text=You%20can%20also%20override%20after_sign_in_path_for%20and%20after_sign_out_path_for%20to%20customize%20your%20redirect%20hooks) overrides `after_sign_in_path_for` and `after_sign_out_path_for`.

## Create methods
For the `create` method, you can modify the `after_create_path`, the messages, and the actions both on success or failure.

<Option name="`after_create_path`">
Overriding this method, you can tell Avo what path to follow after a record was created with success.

```ruby
def after_create_path
  "/avo/resources/users"
end
```
</Option>

<Option name="`create_success_action`">
Override this method to create a custom response when a record was created with success.

```ruby
def create_success_action
  respond_to do |format|
    format.html { redirect_to after_create_path, notice: create_success_message}
  end
end
```
</Option>

<Option name="`create_fail_action`">
Override this method to create a custom response when a record failed to be created.

```ruby
def create_fail_action
  respond_to do |format|
    flash.now[:error] = create_fail_message
    format.html { render :new, status: :unprocessable_entity }
  end
end
```
</Option>

<Option name="`create_success_message`">
Override this method to change the message the user receives when a record was created with success.

```ruby
def create_success_message
  "#{@resource.name} #{t("avo.was_successfully_created")}."
end
```
</Option>

<Option name="`create_fail_message`">
Override this method to change the message the user receives when a record failed to be created.

```ruby
def create_fail_message
  t "avo.you_missed_something_check_form"
end
```
</Option>

## Update methods
For the `update` method, you can modify the `after_update_path`, the messages, and the actions both on success or failure.

<Option name="`after_update_path`">
Overriding this method, you can tell Avo what path to follow after a record was updated with success.

```ruby
def after_update_path
  "/avo/resources/users"
end
```
</Option>

<Option name="`update_success_action`">
Override this method to create a custom response when a record was updated with success.

```ruby
def update_success_action
  respond_to do |format|
    format.html { redirect_to after_update_path, notice: update_success_message }
  end
end
```
</Option>

<Option name="`update_fail_action`">
Override this method to create a custom response when a record failed to be updated.

```ruby
def update_fail_action
  respond_to do |format|
    flash.now[:error] = update_fail_message
    format.html { render :edit, status: :unprocessable_entity }
  end
end
```
</Option>

<Option name="`update_success_message`">
Override this method to change the message the user receives when a record was updated with success.

```ruby
def update_success_message
  "#{@resource.name} #{t("avo.was_successfully_updated")}."
end
```
</Option>

<Option name="`update_fail_message`">
Override this method to change the message the user receives when a record failed to be updated.

```ruby
def update_fail_message
  t "avo.you_missed_something_check_form"
end
```
</Option>

## Destroy methods
For the `destroy` method, you can modify the `after_destroy_path`, the messages, and the actions both on success or failure.

<Option name="`after_destroy_path`">
Overriding this method, you can tell Avo what path to follow after a record was destroyed with success.

```ruby
def after_update_path
  "/avo/resources/users"
end
```
</Option>

<Option name="`destroy_success_action`">
Override this method to create a custom response when a record was destroyed with success.

```ruby
def destroy_success_action
  respond_to do |format|
    format.html { redirect_to after_destroy_path, notice: destroy_success_message }
  end
end
```
</Option>

<Option name="`destroy_fail_action`">
Override this method to create a custom response when a record failed to be destroyed.

```ruby
def destroy_fail_action
  respond_to do |format|
    format.html { redirect_back fallback_location: params[:referrer] || resources_path(resource: @resource, turbo_frame: params[:turbo_frame], view_type: params[:view_type]), error: destroy_fail_message }
  end
end
```
</Option>

<Option name="`destroy_success_message`">
Override this method to change the message the user receives when a record was destroyed with success.

```ruby
def destroy_success_message
  t("avo.resource_destroyed", attachment_class: @attachment_class)
end
```
</Option>

<Option name="`destroy_fail_message`">
Override this method to change the message the user receives when a record failed to be destroyed.

```ruby
def destroy_fail_message
  @errors.present? ? @errors.join(". ") : t("avo.failed")
end
```
</Option>


