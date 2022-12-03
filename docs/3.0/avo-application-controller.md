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

```ruby{5-7,9-11,15-18}
# app/controllers/concerns/multitenancy.rb
module Multitenancy
  extend ActiveSupport::Concern

  included do
    before_action :multitenancy_detector
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
