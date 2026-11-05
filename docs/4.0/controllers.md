---
license: community
outline: [2, 3]
api_docs: ./controllers-api.html
demoVideo: "https://youtu.be/peKt90XhdOg?t=11"
---

# Resource controllers

In order to benefit from Rails' amazing REST architecture, Avo generates a controller alongside every resource. Each generated controller inherits from `Avo::ResourcesController`, which inherits from `Avo::BaseController` — that's where every CRUD action lives.

```ruby
# app/controllers/avo/courses_controller.rb
class Avo::CoursesController < Avo::ResourcesController
end
```

Generally speaking you don't need to touch these controllers — everything works out of the box with configuration added to the resource file. When you need more granular control over what happens in an action, override one of the hook methods below in your generated controller, similar to how [devise](https://github.com/heartcombo/devise#controller-filters-and-helpers:~:text=You%20can%20also%20override%20after_sign_in_path_for%20and%20after_sign_out_path_for%20to%20customize%20your%20redirect%20hooks) lets you override `after_sign_in_path_for`.

Every hook comes in three flavors per action (`create`, `update`, `destroy`): a redirect path, success/failure messages, and success/failure responses. The [API reference](./controllers-api.html) documents each one with its default behavior.

## Change where the user is redirected

If you only want to send the user to the <Index /> or <Edit /> view after saving, you don't need the controller at all — set [`self.after_create_path`](./resources-api.html#self.after_create_path) or [`self.after_update_path`](./resources-api.html#self.after_update_path) on the resource:

```ruby
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  self.after_create_path = :index
end
```

For anything more custom, override [`after_create_path`](./controllers-api.html#after_create_path), [`after_update_path`](./controllers-api.html#after_update_path), or [`after_destroy_path`](./controllers-api.html#after_destroy_path) in the controller:

```ruby
# app/controllers/avo/courses_controller.rb
class Avo::CoursesController < Avo::ResourcesController
  def after_create_path
    "/avo/resources/users"
  end
end
```

:::warning The defaults do more than redirect to the record
The default paths handle cases you may want to keep: `after_create_path` redirects back to the parent record when the record was created through an association, and `after_update_path` honors the `return_to` and `referrer` params. Guard your override so those flows still work:

```ruby
# app/controllers/avo/courses_controller.rb
def after_update_path
  return super if params[:return_to].present?

  "/avo/resources/courses"
end
```
:::

## Customize the flash messages

Override the `*_success_message` and `*_fail_message` methods to change what the user sees after each action:

```ruby
# app/controllers/avo/courses_controller.rb
class Avo::CoursesController < Avo::ResourcesController
  def create_success_message
    "Course saved. Off you go! 🚀"
  end

  def destroy_fail_message
    "This course could not be removed."
  end
end
```

There's one per outcome: [`create_success_message`](./controllers-api.html#create_success_message), [`create_fail_message`](./controllers-api.html#create_fail_message), [`update_success_message`](./controllers-api.html#update_success_message), [`update_fail_message`](./controllers-api.html#update_fail_message), [`destroy_success_message`](./controllers-api.html#destroy_success_message), and [`destroy_fail_message`](./controllers-api.html#destroy_fail_message).

## Return a custom response

When changing the path or message isn't enough — you want a different format, extra headers, or a completely different render — override the `*_action` methods:

```ruby
# app/controllers/avo/courses_controller.rb
class Avo::CoursesController < Avo::ResourcesController
  def create_success_action
    return super if params[:via_belongs_to_resource_class].present?

    respond_to do |format|
      format.html { redirect_to "/dashboard", flash: {success: create_success_message} }
    end
  end
end
```

:::warning The default responses handle Turbo flows
The default `*_action` implementations do more than redirect: `create_success_action` closes the modal and updates the field when a record is created through a `belongs_to` modal, `destroy_success_action` reloads the Turbo Frame when deleting from an association list, and the fail actions render a `turbo_stream` format. Fall back to `super` for the cases you're not customizing — see each method's default behavior in the [API reference](./controllers-api.html#create-methods).
:::

## Change how records are saved or destroyed

Avo persists records with `@record.save!` and removes them with `@record.destroy!`. To use a different mechanism — soft deletes, a service object, extra bookkeeping — override [`save_record_action`](./controllers-api.html#save_record_action) or [`destroy_record_action`](./controllers-api.html#destroy_record_action):

```ruby
# app/controllers/avo/courses_controller.rb
class Avo::CoursesController < Avo::ResourcesController
  def destroy_record_action
    @record.archive!
  end
end
```

Errors raised inside these methods are caught and surfaced on the record, so the regular fail actions and messages kick in.

Both methods go through the resource by default, calling its `save_record(record)` and `destroy_record(record)`. Define those on the resource when the change belongs to it under every controller, as a [writable array resource](./array-resource.html#create-edit-and-delete) does. <VersionReq version="4.3.0" />

## Use the parent record

<VersionReq version="4.2.11" />

When a record is created, shown, or edited through another one, like a comment created from a post's comments panel, Avo loads that parent from the `via_*` params. After calling `super`, it's in `@via_record` and its resource is in `@via_resource`:

```ruby
# app/controllers/avo/comments_controller.rb
class Avo::CommentsController < Avo::ResourcesController
  def new
    super

    # Prefill the form when the comment is created from a post
    @record.body = "Re: #{@via_record.name}" if @via_record.is_a?(Post)
  end
end
```

Both are `nil` when there is no parent. See [`via_record`](./controllers-api.html#via_record) to read them from any other hook.
