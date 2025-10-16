# Handle 404 responses and redirections in Avo

When Rails raises an `ActiveRecord::RecordNotFound` exception, by default, Avo will let Rails do its thing and send the user on the default 404 page.

There might be cases where you want to handle 404 responses in Avo. You can do that by rescuing the exception and redirecting the user to a custom page.

:::info
Make sure your `Avo::ApplicationController` is ejected by running this command:

```bash
rails generate avo:eject --controller application_controller
```
:::

```ruby
class Avo::ApplicationController
  rescue_from ActiveRecord::RecordNotFound, with: -> { redirect_to Avo.configuration.root_path, notice: t("avo.no_item_found") }
end
```
