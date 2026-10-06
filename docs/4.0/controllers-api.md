---
license: community
outline: [2, 3]
guide: ./controllers.html
prev:
  text: "Resource controllers"
  link: "./controllers.html"
next: false
---

# Resource controllers API

Per-method reference for the overridable hooks in Avo's resource controllers. For task-oriented documentation and worked examples, see the [Resource controllers guide](./controllers.html).

All hooks are overridden in the controller Avo generates for each resource:

```ruby
class Avo::CoursesController < Avo::ResourcesController
  # overrides go here
end
```

Each snippet below shows the method's default behavior — start from it when overriding. Calling `super` runs the default implementation.

## Create methods

<Option name="`after_create_path`" headingSize="3">

The path the user is redirected to after a record was created with success.

```ruby
def after_create_path
  "/avo/resources/users"
end
```

- **Default behavior:** when the record was created through an association, redirects to the parent record's page. Otherwise honors the resource's [`self.after_create_path`](./resources-api.html#self.after_create_path) option, falling back to the new record's <Show /> view (or <Edit />, when `config.resource_default_view` is `:edit`).

:::warning
Overriding this method replaces the associated-record redirect. Return `super` when `params[:via_relation_class]` and `params[:via_record_id]` are present if you want to keep that behavior.
:::

</Option>

<Option name="`create_success_action`" headingSize="3">

The response rendered when a record was created with success.

```ruby
def create_success_action
  if params[:via_belongs_to_resource_class].present?
    respond_to do |format|
      format.turbo_stream do
        # The dialog's own frame: modal_frame, or modal_frame_nested and deeper when it was opened from another dialog.
        modal_frame_id = helpers.current_modal_frame_id || Avo::MODAL_FRAME_ID.to_s

        render turbo_stream: [
          turbo_stream.update(modal_frame_id, ""),
          turbo_stream.avo_update_belongs_to(
            relation_name: params[:via_relation],
            target_name: params[:via_belongs_to_target_name],
            frame_id: modal_frame_id,
            target_record_id: @record.to_param,
            target_resource_label: @resource.record_title,
            target_resource_class: @record.class.name
          )
        ]
      end
    end
    return
  end

  respond_to do |format|
    format.html { redirect_to after_create_path, flash: {success: create_success_message} }
  end
end
```

- **Default behavior:** when the record was created through a `belongs_to` modal (`params[:via_belongs_to_resource_class]` is present), renders Turbo Streams that close that dialog and select the new record in the field that opened it. Otherwise redirects to [`after_create_path`](#after_create_path) with the success flash.

:::warning
Keep the `super` guard for the `belongs_to`-modal branch — dropping it breaks the "Create new record" flow inside `belongs_to` fields.
:::

:::info
A "Create new" dialog can open another one on top of it, so the stream clears only the current dialog's frame instead of removing `Avo::MODAL_FRAME_ID`. `target_name` and `frame_id` make sure the new record lands in the field that opened the dialog, not in a field with the same name in the dialog underneath. Both are optional; without them every field for `relation_name` is updated.
:::

</Option>

<Option name="`create_fail_action`" headingSize="3">

The response rendered when a record failed to be created.

```ruby
def create_fail_action
  flash.now[:error] = create_fail_message

  respond_to do |format|
    format.html { render :new, status: :unprocessable_content }
    format.turbo_stream { render "create_fail_action" }
  end
end
```

- **Default behavior:** flashes [`create_fail_message`](#create_fail_message) and re-renders the form. On Rails older than 7.1 the status is `:unprocessable_entity` instead of `:unprocessable_content`.

</Option>

<Option name="`create_success_message`" headingSize="3">

The flash message shown when a record was created with success.

```ruby
def create_success_message
  "#{@resource.name} #{t("avo.was_successfully_created")}."
end
```

- **Default:** "Course was successfully created."

</Option>

<Option name="`create_fail_message`" headingSize="3">

The flash message shown when a record failed to be created.

```ruby
def create_fail_message
  t "avo.you_missed_something_check_form"
end
```

- **Default:** "You might have missed something. Please check the form."

</Option>

## Update methods

<Option name="`after_update_path`" headingSize="3">

The path the user is redirected to after a record was updated with success.

```ruby
def after_update_path
  "/avo/resources/users"
end
```

- **Default behavior:** returns `params[:return_to]` when present, then `params[:referrer]` when present. Otherwise honors the resource's [`self.after_update_path`](./resources-api.html#self.after_update_path) option, falling back to the record's <Show /> view (or <Edit />, when `config.resource_default_view` is `:edit`).

:::warning
Overriding this method disables the `return_to` mechanism Avo uses to send users back where they came from. Return `super` when `params[:return_to]` is present to keep it.
:::

</Option>

<Option name="`update_success_action`" headingSize="3">

The response rendered when a record was updated with success.

```ruby
def update_success_action
  respond_to do |format|
    format.html { redirect_to after_update_path, flash: {success: update_success_message} }
  end
end
```

- **Default behavior:** redirects to [`after_update_path`](#after_update_path) with the success flash.

</Option>

<Option name="`update_fail_action`" headingSize="3">

The response rendered when a record failed to be updated.

```ruby
def update_fail_action
  flash.now[:error] = update_fail_message

  respond_to do |format|
    format.html { render :edit, status: :unprocessable_content }
    format.turbo_stream { render "update_fail_action" }
  end
end
```

- **Default behavior:** flashes [`update_fail_message`](#update_fail_message) and re-renders the form. On Rails older than 7.1 the status is `:unprocessable_entity` instead of `:unprocessable_content`.

</Option>

<Option name="`update_success_message`" headingSize="3">

The flash message shown when a record was updated with success.

```ruby
def update_success_message
  "#{@resource.name} #{t("avo.was_successfully_updated")}."
end
```

- **Default:** "Course was successfully updated."

</Option>

<Option name="`update_fail_message`" headingSize="3">

The flash message shown when a record failed to be updated.

```ruby
def update_fail_message
  t "avo.you_missed_something_check_form"
end
```

- **Default:** "You might have missed something. Please check the form."

</Option>

## Destroy methods

<Option name="`after_destroy_path`" headingSize="3">

The path the user is redirected to after a record was destroyed with success.

```ruby
def after_destroy_path
  "/avo/resources/users"
end
```

- **Default behavior:** returns `params[:referrer]` when present, otherwise the resource's <Index /> view.

</Option>

<Option name="`destroy_success_action`" headingSize="3">

The response rendered when a record was destroyed with success.

```ruby
def destroy_success_action
  return super if params[:turbo_frame]

  flash[:notice] = destroy_success_message

  respond_to do |format|
    format.html { redirect_to after_destroy_path }
  end
end
```

- **Default behavior:** flashes [`destroy_success_message`](#destroy_success_message); when the delete happened inside a Turbo Frame (an association list, for example) it reloads that frame via Turbo Streams, otherwise it redirects to [`after_destroy_path`](#after_destroy_path).

:::warning
Keep the `super` guard for the `params[:turbo_frame]` branch — dropping it breaks deleting records from association lists.
:::

</Option>

<Option name="`destroy_fail_action`" headingSize="3">

The response rendered when a record failed to be destroyed.

```ruby
def destroy_fail_action
  flash[:error] = destroy_fail_message

  respond_to do |format|
    format.turbo_stream { render turbo_stream: turbo_stream.avo_flash_alerts }
  end
end
```

- **Default behavior:** flashes [`destroy_fail_message`](#destroy_fail_message) and renders it as a Turbo Stream alert, without leaving the current page.

</Option>

<Option name="`destroy_success_message`" headingSize="3">

The flash message shown when a record was destroyed with success.

```ruby
def destroy_success_message
  t("avo.resource_destroyed", attachment_class: @attachment_class)
end
```

- **Default:** "Record destroyed"

</Option>

<Option name="`destroy_fail_message`" headingSize="3">

The flash message shown when a record failed to be destroyed.

```ruby
def destroy_fail_message
  errors = @record.errors.full_messages
  errors.present? ? errors.join(". ") : t("avo.failed")
end
```

- **Default:** the record's validation errors joined together, or "Something went wrong" when there are none.

</Option>

## Persistence methods

<Option name="`save_record_action`" headingSize="3">

The method that persists the record on `create` and `update`.

```ruby
def save_record_action
  @resource.save_record(@record)
end
```

- **Default behavior:** calls the resource's [`save_record`](./resources-api.html#save_record), which runs `@record.save!`. Exceptions raised here are caught, logged, and added to the record's errors, which triggers the fail action and message.

:::info
Override this when the change belongs to one controller. When it belongs to the resource under every controller — the admin panel, the [REST API](./rest-api.html), your own controllers — define [`save_record(record)`](./resources-api.html#save_record) on the resource instead. <VersionReq version="4.2.12" />
:::

</Option>

<Option name="`destroy_record_action`" headingSize="3">

The method that removes the record on `destroy`.

```ruby
def destroy_record_action
  @resource.destroy_record(@record)
end
```

- **Default behavior:** calls the resource's [`destroy_record`](./resources-api.html#destroy_record), which runs `@record.destroy!`. Exceptions raised here (a foreign key constraint, for example) are caught, logged, and added to the record's errors, which triggers the fail action and message. Override it to soft-delete or archive instead.

:::info
Override this when the delete belongs to one controller. When it belongs to the resource under every controller, define [`destroy_record(record)`](./resources-api.html#destroy_record) on the resource instead. <VersionReq version="4.2.12" />
:::

</Option>

## Parent record methods

<Option name="`via_record`" headingSize="3">

<VersionReq version="4.2.11" />

The parent record the current one is created, shown, or edited through, like the post a comment is created from.

```ruby
def via_record
  set_via_resource_and_record
  @via_record
end
```

- **Default behavior:** finds the parent from `params[:via_record_id]` with the parent resource's [`find_record_method`](./resources-api.html#self.find_record_method) on first use, then keeps it in `@via_record`. Returns `nil` when the request has no parent.
- **In actions:** `new`, `show`, and `edit` load it before they return, so `@via_record` is set after `super`. In other hooks, call `via_record`.

</Option>

<Option name="`via_resource`" headingSize="3">

The parent record's resource, hydrated with [`via_record`](#via_record).

```ruby
def via_resource
  set_via_resource_and_record
  @via_resource
end
```

- **Default behavior:** uses the resource named by `params[:via_resource_class]`. When only `params[:via_relation_class]` is present, uses the resource for that model. Kept in `@via_resource`. Returns `nil` when the request has no parent.

</Option>
