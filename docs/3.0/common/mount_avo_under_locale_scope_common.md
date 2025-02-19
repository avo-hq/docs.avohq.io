Using a locale scope is an effective way to set the locale for your users.

```ruby{4-6}
# config/routes.rb

Rails.application.routes.draw do
  scope ":locale" do
    mount_avo
  end
end
```
