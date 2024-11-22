---
outline: [2,3]
---

# Multi-language URLs

Implementing multi-language URLs is a common use-case. Using a route scope block in Avo allows you to seamlessly adapt your application to support multiple languages, enhancing the user experience. This recipe will guide you through the steps to configure a locale scope, ensuring your application dynamically sets and respects the user's preferred language. Let's dive in!

## 1. Mount Avo within a `:locale` scope

<!-- @include: ./../common/mount_avo_under_locale_scope_common.md-->

## 2. Apply the `locale` Scope

To properly handle localization within Avo, you'll need to ensure the `locale` parameter is respected throughout the request.

:::info
If you've already ejected the `Avo::ApplicationController`, you can skip the ejection step below.
:::

### Eject the `Avo::ApplicationController`

Run the following command to eject the `Avo::ApplicationController`:

```bash
rails generate avo:eject --controller application_controller
```

This command generates a customizable version of the `Avo::ApplicationController`, allowing you to override default behaviors.

### Override the `set_avo_locale` method

Next, override the `set_avo_locale` method to ensure that the `locale` parameter is applied throughout the request lifecycle. Update your controller as follows:

```ruby{5-7}
# app/controllers/avo/application_controller.rb

module Avo
  class ApplicationController < BaseApplicationController
    def set_avo_locale(&action)
      I18n.with_locale(params[:locale], &action)
    end
  end
end
```

This implementation uses `I18n.with_locale` to set the desired locale for the duration of the request, ensuring consistent localization behavior across Avo's interface.
