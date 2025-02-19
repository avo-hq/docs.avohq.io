# Multitenancy

Multitenancy is a very talked-about subject. We're not going to go very deep into how to achieve it on the database level, but will talk a little bit about how it's supported in Avo.

## Breakdown

Usually, with multitenancy you add a new layer just one level below authentication. You don't have just a user to think about, but now that user might act on the behalf of a tenant. That tenant can be an `Account` or a `Team`, or any other model you design in your database.

So now, the mission is to pinpoint which tenant is the user acting for. Because Avo has such an integrated experience and we use our own `ApplicationController`, you might think it's difficult to add that layer, when in fact it's really not. There are a couple of steps to do.

:::info
We'll use the `foo` tenant id from now on.
:::

## Route-based tenancy

There are a couple of strategies here, but the a common one is to use route-based tenancy. That means that your user uses a URL like `https://example.com/foo/` and the app should know to scope everything to that `foo` tenant.

We need to do a few things:

#### 1. Set the proper routing pattern

Mount Avo under the `tenant_id` scope

```ruby
# config/routes.rb
Rails.application.routes.draw do
  scope "/:tenant_id" do
    mount_avo
  end
end
```

#### 2. Set the tenant for each request

:::code-group
```ruby [config/initializers/avo.rb]{6}
Avo.configure do |config|
  # configuration values
end

Rails.configuration.to_prepare do
  Avo::ApplicationController.include Multitenancy
end
```
```ruby [app/controllers/concerns/multitenancy.rb]
module Multitenancy
  extend ActiveSupport::Concern

  included do
    prepend_before_action :set_tenant
  end

  def set_tenant
    Avo::Current.tenant_id = params[:tenant_id]
    Avo::Current.tenant = Account.find params[:tenant_id]
  end
end
```
:::

Now, whenever you navigate to `https://example.com/lol` the tenant the `tenant_id` will be set to `lol`.

## Session-based tenancy

Using a session-based tenancy strategy is a bit simpler as we don't meddle with the routing.

:::warning
The code below shows how it's possible to do session-based multitenancy but your use-case or model names may vary a bit.
:::

We need to do a few things:

#### 1. Set the tenant for each request
:::code-group
```ruby [config/initializers/avo.rb]{6}
Avo.configure do |config|
  # configuration values
end

Rails.configuration.to_prepare do
  Avo::ApplicationController.include Multitenancy
end
```
```ruby [app/controllers/concerns/multitenancy.rb]
module Multitenancy
  extend ActiveSupport::Concern

  included do
    prepend_before_action :set_tenant
  end

  def set_tenant
    Avo::Current.tenant = Account.find session[:tenant_id] || current_user.accounts.first
  end
end
```
:::

#### 2. Add an account switcher

Somewhere in a view on a navbar or sidebar add an account switcher.

:::code-group
```erb [app/views/avo/session_switcher.html.erb]
<% current_user.accounts.each do |account| %>
  <%= link_to account.name, switch_account_path(account.id), class: class_names({"underline": session[:tenant_id].to_s == account.id.to_s}), data: {turbo_method: :put} %>
<% end %>
```

```ruby [app/controllers/avo/switch_accounts_controller.rb]
class Avo::SwitchAccountsController < Avo::ApplicationController
  def update
    # set the new tenant in session
    session[:tenant_id] = params[:id]

    redirect_back fallback_location: root_path
  end
end
```
:::
