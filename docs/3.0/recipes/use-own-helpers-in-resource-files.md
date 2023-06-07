# Use own helpers in Resource files

## TL;DR

Run `rails app:template LOCATION='https://railsbytes.com/script/V2Gsb9'`

## Details

A common pattern is to have some helpers defined in your app to manipulate your data. You might need those helpers in your `Resource` files.

#### Example:

Let's say you have a `Post` resource and you'd like to show a stripped-down version of your `body` field. So in your `posts_helper.rb` file you have the `extract_excerpt` method that sanitizes the body and truncates it to 120 characters.

```ruby
# app/helpers/posts_helper.rb
module PostsHelper
  def extract_excerpt(body)
    ActionView::Base.full_sanitizer.sanitize(body).truncate 120
  end
end
```

Now, you'd like to use that helper inside one of you computed fields.

```ruby
class PostResource < Avo::BaseResource
  field :excerpt, as: :text do |model|
    extract_excerpt model.body
  end
end
```

Initially you'll get an error similar to `undefined method 'extract_excerpt' for #<Avo::Fields::TextField>`. That's because the compute field executes that method in a scope that's different from your application controller, thus not having that method present.

## The solution

The fix is to include the helper module in the `BaseField` and we can do that using this snippet somewhere in the app (you can add it in `config/initializers/avo.rb`).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # Usual Avo config
end

module FieldExtensions
  # Include a specific helper
  include PostsHelper
end

Rails.configuration.to_prepare do
  Avo::Fields::BaseField.include FieldExtensions
end
```

Or you can go wild and include all helpers programatically.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # Usual Avo config
end

module FieldExtensions
  # Include all helpers
  helper_names = ActionController::Base.all_helpers_from_path Rails.root.join("app", "helpers")
  helpers = ActionController::Base.modules_for_helpers helper_names
  helpers.each do |helper|
    send(:include, helper)
  end
end

Rails.configuration.to_prepare do
  Avo::Fields::BaseField.include FieldExtensions
end
```

Now you can reference all helpers in your `Resource` files.
