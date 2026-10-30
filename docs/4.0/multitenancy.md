---
license: community
outline: [2, 3]
---

# Multitenancy

<VersionReq version="4.3.10" />

Multitenancy adds a layer just below authentication: a signed-in user acts on behalf of a tenant, an `Account`, a `Team` or any other model you design. Tell Avo which tenants the current user may act for, and it resolves the tenant on every request, renders an account switcher at the bottom of the sidebar and handles switching.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.tenancy = {
    tenants: -> { current_user.accounts }
  }
end
```

Avo stores the picked account in the session and sets [`Avo::Current.tenant`](./avo-current#tenant) and [`Avo::Current.tenant_id`](./avo-current#tenant_id) before authorization and resource queries run. Nothing changes until you set `config.tenancy`.

:::warning Setting the tenant does not filter the data
Avo only resolves the tenant. Scope your data with it, or every account keeps seeing every record.
:::

A [policy scope](./authorization.html#limit-which-records-a-user-sees) covers the index, the show and edit pages, search and associations in one place.

```ruby
# app/policies/project_policy.rb
class ProjectPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(account: Avo::Current.tenant)
    end
  end
end
```

Without the authorization add-on, scope both the index and single-record lookups on the resource. [`index_query`](./resources-api.html#self.index_query) alone leaves another account's record reachable by its id.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.index_query = -> { query.where(account: Avo::Current.tenant) }
  self.find_record_method = -> { query.where(account: Avo::Current.tenant).find(id) }
end
```

## Return the user's accounts

`tenants:` returns the accounts the current user may act for, as an Active Record relation. It runs in the request, with `current_user`, `params` and `request` available.

Avo only ever looks a tenant up through that relation. An id from the session, the switcher or the URL that is not in it never resolves, so a user can't reach an account they don't belong to by changing an id.

Order the relation if the default account matters. A user without a stored pick lands on its first record.

```ruby
# config/initializers/avo.rb
config.tenancy = {
  tenants: -> { current_user.accounts.order(:name) }
}
```

## Switch accounts from the sidebar

With the session strategy, the default, Avo renders an account switcher at the bottom of the sidebar, above the user menu. It lists the user's accounts, marks the current one and hides itself when the user has only one.

Picking an account sends a `PATCH` with Rails' CSRF token and reloads the whole page. Avo then:

- refuses an id that is not in `tenants:` with a `404` and keeps the current account;
- clears the saved filters and page numbers, which point into the old account;
- lands on the current resource's index, or the Avo root, never back on a record from the old account.

The switcher shows each account's `name`. Pass `title:` to call another method.

```ruby
# config/initializers/avo.rb
config.tenancy = {
  tenants: -> { current_user.organizations },
  title: :display_name
}
```

## What Avo checks on every request

- **Membership.** The stored account is looked up through `tenants:` again on every request. Remove a membership and the user moves to another of their accounts on the next request.
- **The user.** The session remembers which user picked the account. Signing in as someone else, or impersonating them, starts from that user's own first account.
- **No account.** When `tenants:` is empty, Avo renders a "No account to show" page with a `403` instead of the admin. It never renders the admin with a `nil` tenant, which many apps would read as "every account".

If super admins should see every account, make that an explicit choice in `tenants:`. They still act for one account at a time.

```ruby
# config/initializers/avo.rb
config.tenancy = {
  tenants: -> { current_user.super_admin? ? Account.all : current_user.accounts }
}
```

## Put the tenant in the URL

To keep the tenant in the URL, `https://example.com/42/...`, mount Avo under a `tenant_id` segment, keep the segment in every URL Avo generates and use the `:route` strategy.

```ruby
# config/routes.rb
Rails.application.routes.draw do
  scope "/:tenant_id" do
    mount_avo
  end
end
```

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.default_url_options = [:tenant_id]

  config.tenancy = {
    tenants: -> { current_user.accounts },
    strategy: :route
  }
end
```

Avo looks `params[:tenant_id]` up through `tenants:` and responds with a `404` when the user doesn't belong to that account. There is no switcher in this mode; link to another account's URL instead.

:::warning
Skip `config.default_url_options = [:tenant_id]` and every link Avo generates drops the tenant segment.
:::

## Record account switches

Every switch emits a `switch_tenant.avo` event with the `user`, the account it came `from` and the account it went `to`. Subscribe to it to write an audit trail.

```ruby
# config/initializers/tenant_audit.rb
ActiveSupport::Notifications.subscribe("switch_tenant.avo") do |event|
  Rails.logger.info "#{event.payload[:user].email} switched from #{event.payload[:from]&.id} to #{event.payload[:to].id}"
end
```

## Known limits

- Tabs share one session. A form opened under one account and submitted after switching accounts in another tab is submitted under the new account. Scope record lookups by `Avo::Current.tenant` so updates to the old account's records are not found.
- The switcher loads every account `tenants:` returns. It filters the list once there are more than eight.

## Set the tenant yourself

`config.tenancy` covers most apps. When you need something else, such as a subdomain per tenant, leave it unset and set `Avo::Current.tenant` and `tenant_id` in a `before_action` that you include into `Avo::ApplicationController`. Look the tenant up through the user's own accounts, never by the raw id. For subdomains, see the [Acts As Tenant integration](./guides/acts_as_tenant_integration).

## See also

- [`Avo::Current`](./avo-current): the `tenant_id` and `tenant` attributes.
- [Integrate with Acts As Tenant](./guides/acts_as_tenant_integration): subdomain and row-level multitenancy with the [`acts_as_tenant`](https://github.com/ErwinM/acts_as_tenant) gem.
