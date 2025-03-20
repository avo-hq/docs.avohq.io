---
outline: [2,3]
---

# Multi-language URLs

Implementing multi-language URLs is a common use-case. Using a route scope block in Avo allows you to seamlessly adapt your application to support multiple languages, enhancing the user experience. This recipe will guide you through the steps to configure a locale scope, ensuring your application dynamically sets and respects the user's preferred language. Let's dive in!

## 1. Mount Avo within a `:locale` scope

Using a locale scope is an effective way to set the locale for your users.

```ruby{3-5}
# config/routes.rb
Rails.application.routes.draw do
  scope ":locale" do
    mount_avo
  end
end
```

## 2. Apply the `locale` Scope

To properly handle localization within Avo, you'll need to ensure the `locale` parameter is respected throughout the request which we'll do by overriding the `set_avo_locale` method in your `Avo::ApplicationController` as follows:

<!-- @include: ./../common/application_controller_eject_notice.md -->

```ruby{4-6}
# app/controllers/avo/application_controller.rb
module Avo
  class ApplicationController < BaseApplicationController
    def set_avo_locale(&action)
      I18n.with_locale(params[:locale], &action)
    end
  end
end
```

This implementation uses `I18n.with_locale` to set the desired locale for the duration of the request, ensuring consistent localization behavior across Avo's interface and that it won't impact the other non-Avo parts of your app.
