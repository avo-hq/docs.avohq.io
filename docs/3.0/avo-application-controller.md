# `Avo::ApplicationController`

## On extending the `ApplicationController`

You may sometimes want to add functionality to Avo's `ApplicationController`. That functionality may be setting attributes to `Current` or multi-tenancy scenarios.

When you need to do that, you may feel the need to override it with your own version. That means you go into the source code, find `AVO_REPO/app/controllers/avo/application_controller.rb`, copy the whole thing into your own `YOUR_APP/app/controllers/avo/application_controller.rb` file inside your app, and add your own piece of functionality.

```ruby{10,14-16}
# Copied from Avo to `app/controllers/avo/application_controller.rb`
module Avo
  class ApplicationController < ::ActionController::Base
    include Pagy::Backend
    include Avo::ApplicationHelper
    include Avo::UrlHelpers

    protect_from_forgery with: :exception
    around_action :set_avo_locale
    before_action :multitenancy_detector

    # ... more Avo::ApplicationController methods

    def multitenancy_detector
      # your logic here
    end
  end
end
```

That will work just fine until the next time we update it. After that, we might add a method, remove one, change the before/after actions, update the helpers and do much more to it.
**That will definitely break your app the next time when you upgrade Avo**. Avo's private controllers are still considered private APIs that may change at any point. These changes will not appear in the changelog or the upgrade guide.

## Responsibly extending the `ApplicationController`

There is a right way of approaching this scenario using Ruby modules or concerns.

First, you create a concern with your business logic; then you include it in the parent `Avo::ApplicationController` like so:

```ruby{6-8,11-13,18}
# app/controllers/concerns/multitenancy.rb
module Multitenancy
  extend ActiveSupport::Concern

  included do
    before_action :multitenancy_detector
    # or
    prepend_before_action :multitenancy_detector
  end

  def multitenancy_detector
    # your logic here
  end
end

# configuration/initializers/avo.rb
Rails.configuration.to_prepare do
  Avo::ApplicationController.include Multitenancy
end
```

With this technique, the `multitenancy_detector` method and its `before_action` will be included safely in `Avo::ApplicationController`.

:::info
If you'd like to add a `before_action` before all of Avo's before actions, use `prepend_before_action` instead. That will run that code first and enable you to set an account or do something early on.
:::

## Override `ApplicationController` methods

Sometimes you don't want to add methods but want to override the current ones.

For example, you might want to take control of the `Avo::ApplicationController.fill_record` method and add your own behavior.

TO do that you should change a few things in the approach we mentioned above. First we want to `prepend` the concern instead of `include` it and next, if we want to run a class method, we used `prepended` instead of `included`.


```ruby{5-8,10-12,14-17,23}
# app/controllers/concerns/application_controller_overrides.rb
module ApplicationControllerOverrides
  extend ActiveSupport::Concern

  # we use the `prepended` block instead of `included`
  prepended do
    before_action :some_hook
  end

  def some_hook
    # your logic here
  end

  def fill_record
    # do some logic here
    super
  end
end

# configuration/initializers/avo.rb
Rails.configuration.to_prepare do
  # we will prepend instead of include
  Avo::ApplicationController.prepend ApplicationControllerOverrides
end
```

**Related:**
  - [Multitenancy](./multitenancy)
