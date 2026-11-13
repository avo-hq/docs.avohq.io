---
license: addon
addon_link: https://avohq.io/addons/authorization
outline: [2, 3]
api_docs: ./authorization-api.html
---

# Authorization

Authorization decides what each user can see and do in Avo: which resources show up in the sidebar, which buttons appear on a record, which records a list returns, and which fields a user can reach. Avo reads these answers from policy classes, using [Pundit](https://github.com/varvet/pundit) by default.

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def update?
    user.admin?
  end

  def destroy?
    user.admin?
  end
end
```

Authorization is off until you [set the authorization client](#set-up-authorization). Once it's on, a resource without a policy, or an action whose policy method is missing, is denied. That strictness is controlled by [`explicit_authorization`](./authorization-api.html#explicit_authorization).

## Set up authorization

Add Pundit to your `Gemfile`. Avo doesn't pull it in for you.

```ruby
# Gemfile
gem "pundit"
```

If Pundit is new to the app, run `bin/rails g pundit:install` to generate `ApplicationPolicy`.

Then tell Avo to use it. The initializer Avo generates sets [`authorization_client`](./authorization-api.html#authorization_client) to `nil`, which turns authorization off, so change that line to `:pundit`:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_client = nil # [!code --]
  config.authorization_client = :pundit # [!code ++]
end
```

While the client is `nil`, Avo doesn't call your policies, and anyone who can sign in to Avo can reach everything. If your initializer has no `authorization_client` line, Avo uses `:pundit`.

Policies receive the current user, so make sure Avo knows who that is. `current_user` is usually right; see [the authentication guide](./authentication.html#customize-the-current-user-method) if yours differs.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_user
end
```

:::info Action Policy and other libraries
If your app authorizes with Action Policy, Avo has a built-in client for it. See [Use Action Policy](#use-action-policy). For another library, see [Use a different authorization library](#use-a-different-authorization-library).
:::

## Write a policy

Generate a policy for each model Avo shows:

```bash
bin/rails g pundit:policy Post
```

Each method answers one question for the current `user` and `record`. Avo calls the standard CRUD methods plus a few of its own:

| Method | Controls |
| --- | --- |
| [`index?`](./authorization-api.html#index) | The sidebar entry and the <Index /> view |
| [`show?`](./authorization-api.html#show) | The view button and the <Show /> view |
| [`new?`](./authorization-api.html#new) / [`create?`](./authorization-api.html#create) | The "Create new" button, and saving a new record |
| [`edit?`](./authorization-api.html#edit) / [`update?`](./authorization-api.html#update) | The edit button, and saving changes |
| [`destroy?`](./authorization-api.html#destroy) | The delete button and deleting |
| [`act_on?`](./authorization-api.html#act_on) | The actions dropdown, and running actions |
| [`reorder?`](./authorization-api.html#reorder) | The [record reordering](./record-reordering.html) controls |
| [`search?`](./authorization-api.html#search) | The resource search input |
| [`preview?`](./authorization-api.html#preview) | The [preview field](./fields/preview.html) endpoint |

A policy that answers all of them:

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def new?
    create?
  end

  def create?
    user.admin?
  end

  def edit?
    true
  end

  def update?
    user.admin?
  end

  def destroy?
    user.admin?
  end

  def act_on?
    user.admin?
  end

  def reorder?
    user.admin?
  end

  def search?
    true
  end

  def preview?
    true
  end
end
```

`create?` runs when the form is saved, so `record` already holds the submitted values. Use that if the answer depends on what the user typed.

`update?` runs twice on a save. <VersionReq package="avo" version="4.3.8" /> Avo asks it on the record as loaded from the database, then again with the submitted values filled in, and both have to allow the write. A rule like `record.user_id == user.id` has to hold for the record as it exists, so submitting a new `user_id` can't make a record pass its own check. A [`react_on`](./field-options-api.html#react_on) re-render of an open edit form asks `edit?` the same way.

If you use the [menu editor](./menu-editor.html), `index?` doesn't hide its items. Add the check to the item's [`visible`](./menu-editor.html#item-visibility) block instead.

## Authorize association controls

The buttons on an association panel are answered by the **parent's** policy, with methods named after the association: `{action}_{association}?`. For a `Post` that `has_many :comments`:

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def view_comments?
    true
  end

  def create_comments?
    user.admin?
  end

  def attach_comments?
    user.admin?
  end

  def detach_comments?
    record.user_id == user.id
  end

  def show_comments?
    true
  end

  def edit_comments?
    record.user_id == user.id
  end

  def destroy_comments?
    user.admin?
  end

  def act_on_comments?
    user.admin?
  end

  def reorder_comments?
    user.admin?
  end
end
```

:::warning
Match the association's pluralization. For `has_many :comments`, write `detach_comments?`, not `detach_comment?`.
:::

Methods for panel-level controls (`view_`, `create_`, `attach_`, `act_on_`) get the parent `Post` as `record`. Methods for row controls (`show_`, `edit_`, `detach_`, `destroy_`, `reorder_`) get each `Comment`. The [association policy methods](./authorization-api.html#association-policy-methods) reference lists which is which.

If you want to hide the whole comments panel, use `view_comments?`. If you want to hide only the view button on each row, use `show_comments?`.

Most of these methods only control buttons. Access to the comment's own pages is still decided by `CommentPolicy`, so if `CommentPolicy#edit?` allows it, a user can reach the edit page by URL even when `edit_comments?` hides the button. Likewise, running an action from the comments panel also needs `CommentPolicy#act_on?` for each selected comment, whatever `act_on_comments?` allows.

`view_comments?` is the exception: it also answers the requests behind the panel.

- **The association's show route.** <VersionReq package="avo" version="4.3.4" /> `/resources/posts/:id/comments/:comment_id` renders one comment's show page. A `has_one` panel loads its frame from it, and for a `has_many` it is reachable by URL. It asks `view_comments?`, then `CommentPolicy#show?` for the comment, and looks a `has_many` row up inside `CommentPolicy::Scope`, so a comment the scope doesn't hold is not found. Before that, anyone who could see the post could open any of its comments ([GHSA-x65r-p6hf-94hv](https://github.com/avo-hq/avo/security/advisories/GHSA-x65r-p6hf-94hv)).
- **The requests that list the association.** <VersionReq package="avo" version="4.3.8" /> The panel's rows, its search, a [`summarizable`](./field-options-api.html#summarizable) column's chart, and [scope](./scopes.html) counts all ask `view_comments?`. Each has to name the resource the association field lists with, its [`use_resource`](./associations/has_many.html#use_resource) when the field sets one, and answers `404` otherwise ([GHSA-5qcq-2vq9-62hj](https://github.com/avo-hq/avo/security/advisories/GHSA-5qcq-2vq9-62hj)).

### Reuse another policy for an association

Often the answer for `edit_comments?` is the same as `CommentPolicy#edit?`. Include `Avo::Authorization::Concerns::PolicyHelpers` in `ApplicationPolicy` and inherit the association's rules from its own policy with [`inherit_association_from_policy`](./authorization-api.html#inherit_association_from_policy):

```ruby
# app/policies/application_policy.rb
class ApplicationPolicy
  include Avo::Authorization::Concerns::PolicyHelpers
end
```

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  inherit_association_from_policy :comments, CommentPolicy

  def destroy_comments?
    false
  end
end
```

Every `*_comments?` method now delegates to `CommentPolicy`, except the ones you define yourself, like `destroy_comments?` above.

For a single method, delegate by hand:

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def edit_comments?
    Pundit.policy!(user, record).edit?
  end
end
```

Keeping the two sets of rules separate is sometimes what you want. If `ContractPolicy#edit?` lets admins edit any contract, `UserPolicy#edit_contracts?` can still hide the edit button when those contracts are listed on a user.

## Authorize file attachments

File fields get three methods each, named after the field id: [`upload_{FIELD_ID}?`](./authorization-api.html#upload_FIELD_ID), [`download_{FIELD_ID}?`](./authorization-api.html#download_FIELD_ID), and [`delete_{FIELD_ID}?`](./authorization-api.html#delete_FIELD_ID).

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def upload_cover_photo?
    user.admin?
  end

  def download_cover_photo?
    true
  end

  def delete_cover_photo?
    user.admin?
  end
end
```

If several fields share the same rule, define them in a loop:

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  [:cover_photo, :audio].each do |file|
    [:upload, :download, :delete].each do |action|
      define_method "#{action}_#{file}?" do
        true
      end
    end
  end
end
```

The same methods authorize file fields in [actions](./actions.html) that run on the resource. An action on `Avo::Resources::Post` with `field :cover_photo, as: :file` checks `PostPolicy#upload_cover_photo?`.

## Limit which records a user sees

Add a [`Scope`](./authorization-api.html#Scope) to the policy to filter the records on the <Index />, <Show />, and <Edit /> views:

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.admin?
        scope.all
      else
        scope.where(published: true)
      end
    end
  end
end
```

The scope also filters the rows of `has_many` and `has_and_belongs_to_many` association panels, using the policy of the resource the panel lists, not the parent's. A post's comments panel shows only what `CommentPolicy::Scope` returns, or the scope of the policy that resource sets with [`authorization_policy`](./authorization-api.html#authorization_policy). The panel's [buttons](#authorize-association-controls) still ask the parent's policy. A `has_one` panel isn't filtered: the associated resource's `show?` decides whether its record shows.

The field's [`scope` option](./associations/has_many.html#add-scopes-to-associations) runs on the query the policy scope already narrowed, so use it only to narrow further. If you added `scope: -> { Pundit.policy_scope(parent, query) }` from an earlier version of this page, remove it: it passes the post where Pundit expects the user.

## Hide fields from a user

A policy can name which of a resource's fields a user may reach. A withheld field isn't rendered anywhere Avo draws it and can't be set from anywhere.

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def blacklisted_fields
    user.admin? ? [] : [:budget, :internal_notes]
  end
end
```

A non-admin never sees `budget` on the index table, the show page, the edit form, in global search, in a `record_link`, through the [REST API](./rest-api.html), in the [AI chat](./ai.html), or over [MCP](./mcp.html). They can't set it with a hand-built form submission either, because it's gone from the permitted params too.

### Allow or deny fields

Declare [`blacklisted_fields`](./authorization-api.html#blacklisted_fields) to deny specific fields, [`whitelisted_fields`](./authorization-api.html#whitelisted_fields) to allow only specific fields, or both. The allowlist applies first and the denylist subtracts from it, so a denial on `ApplicationPolicy` survives an allowlist on a subclass:

```ruby
# app/policies/application_policy.rb
class ApplicationPolicy
  # Nobody reaches api_secret through Avo, whatever a subclass allows.
  def blacklisted_fields
    [:api_secret]
  end
end
```

```ruby
# app/policies/user_policy.rb
class UserPolicy < ApplicationPolicy
  def whitelisted_fields
    user.admin? ? :all : [:id, :name, :email]
  end
end
```

List field ids, not column names. `:price` covers both columns behind a money field and `:author` covers `author_id` for a `belongs_to`. An id that matches no field on the current view is ignored, so `ApplicationPolicy` can deny a field only some resources have.

If a list can't be resolved, Avo raises instead of showing everything. See the [errors](./authorization-api.html#field-list-errors) it raises.

A policy that declares neither list restricts nothing, whatever `explicit_authorization` says.

:::info A policy that refuses a nil user
Some policies raise in their constructor when there is no current user (`raise Pundit::NotAuthorizedError, "must be logged in" if user.nil?`), and a resource built in a job, a mailer, a rake task or a model spec has no user. When the policy declares neither list there is nothing to read from it, so `avo-authorization` swallows that error and the answer is "no restriction". <VersionReq package="avo-authorization" version="4.2.2" />

Declare a list and the error propagates, because resolution never falls open. Hand those call sites a user, or let the constructor accept a nil user and have the list answer restrictively for it. The list's own body never runs when the constructor raises first.
:::

### What a withheld field is withheld from

Denied means invisible and unsettable, from one list. A withheld field is:

- Not rendered on the <Index />, <Show /> and <Edit /> views, including inside a `panel`, `tabs` or `sidebar` block, and not offered as a dynamic filter.
- Not in the permitted params, so a form post naming it doesn't set it. Nested forms inherit this.
- Not used as a record's title. Global search results, breadcrumbs, `record_link` fields and association pickers name the record by its id when its title attribute is withheld.
- Not in the [REST API](./rest-api.html)'s responses, and not settable through it.
- Not returned, named or written by the [AI assistant](./ai.html)'s tools or over the [MCP server](./mcp.html). Columns with no declared field are never exposed to those surfaces either.
- Not in the changeset an [audit trail](./audit-logging.html) row previews. The stored row is unchanged.
- Not writable by dragging a card on a [kanban board](./kanban-boards.html) grouped by it.

### Trust each interface differently

If a user should see more in the admin panel than through the API or an AI client, branch on [`Avo::Current.interface`](./authorization-api.html#interface):

```ruby
# app/policies/user_policy.rb
class UserPolicy < ApplicationPolicy
  def blacklisted_fields
    # The panel is behind SSO; a leaked API token or a connected AI client is not.
    case Avo::Current.interface
    when :ui then []
    else [:home_address, :date_of_birth]
    end
  end
end
```

### Combine with `visible:`

The policy removes fields first, then any `visible:` block narrows what's left. Nothing on the resource can bring back a field the policy withholds. Use `visible:` for rules about the record, such as a field that only makes sense in one state, and the policy for rules about who's asking.

### Limits

- **Without a client, it's inert.** While [`authorization_client`](./authorization-api.html#authorization_client) is `nil`, or left unset on a license without the `avo-authorization` add-on, every policy check is skipped, these lists included, so they aren't a security boundary. A client your initializer sets on a license without the add-on refuses every resource instead; see [When the license lapses](#when-the-license-lapses).
- **Only Avo's surfaces.** `record.ssn` in a custom partial, a `self.search[:item]` block, a background job or raw SQL reads the attribute regardless.
- **A column no field declares can't be governed.** To govern a column, declare a field for it.
- **"May see but may not write"** isn't expressible in one list. See [Let a user see a field but not change it](#let-a-user-see-a-field-but-not-change-it).
- **Kanban's read side.** The column a card sits in discloses the value of the board's grouping property. A drag that would write a withheld field is refused, but the board still renders.

## Let a user see a field but not change it

Put the rule in a policy method and call it from the field's `disabled` option:

```ruby
# app/policies/product_policy.rb
class ProductPolicy < ApplicationPolicy
  def amount?
    user.admin?
  end
end
```

```ruby
# app/avo/resources/product.rb
field :amount,
  as: :money,
  currencies: %w[USD],
  disabled: -> { !@resource.authorization.authorize_action(:amount?, raise_exception: false) }
```

## Use a different policy for a resource

Avo finds the policy from the resource's model. If two resources share a model but need different rules, set [`authorization_policy`](./authorization-api.html#authorization_policy) on the resource:

```ruby
# app/avo/resources/photo_comment.rb
class Avo::Resources::PhotoComment < Avo::BaseResource
  self.model_class = "Comment"
  self.authorization_policy = PhotoCommentPolicy
end
```

## Rename the policy methods Avo calls

If your app already uses `index?`, `show?` and friends for something else, map Avo to its own methods with [`authorization_methods`](./authorization-api.html#authorization_methods):

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_methods = {
    index: "avo_index?",
    show: "avo_show?",
    edit: "avo_edit?",
    new: "avo_new?",
    update: "avo_update?",
    create: "avo_create?",
    destroy: "avo_destroy?",
    search: "avo_search?"
  }
end
```

Avo now calls `avo_index?` for the <Index /> view.

## Handle missing policies

By default, a missing policy class or method denies the action. If you'd rather allow it, turn off [`explicit_authorization`](./authorization-api.html#explicit_authorization):

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.explicit_authorization = false
end
```

It also takes a lambda, if strictness should depend on who's asking:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.explicit_authorization = -> { !current_user.admin? }
end
```

If you want a missing policy class to fail loudly instead, set [`raise_error_on_missing_policy`](./authorization-api.html#raise_error_on_missing_policy). Avo raises `Avo::NoPolicyError` instead of silently allowing or denying.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.raise_error_on_missing_policy = true
end
```

:::warning
With `explicit_authorization` on, adding a policy with only `destroy?` denies every other method, so the resource disappears from the sidebar. Define every method whose control you want to show.
:::

## When the license lapses

Your policies run only while your license includes the `avo-authorization` add-on. If your initializer sets [`authorization_client`](./authorization-api.html#authorization_client) and the license doesn't include the add-on, Avo fails closed instead of skipping your policies:

- every resource is refused, and lists come back empty;
- show and edit pages answer `404`;
- a banner in the panel explains why.

That covers a lapsed or downgraded license, and a development, test or CI environment that runs without your license key. The [license status page](./license-troubleshooting.html#check-the-license-status-page) stays reachable, so you can check the license from the panel.

If your initializer has no `authorization_client` line (Avo then uses `:pundit`), or sets it to `nil`, an unlicensed app skips your policies instead, and anyone who can sign in to Avo can reach everything.

### When the license can't be validated

A license Avo can't confirm is a different case from one without the add-on. Once the [grace period](./licensing.html#when-the-license-can-t-be-validated) ends, or when no valid answer was ever held, Avo pauses the whole admin with a "Temporarily unavailable" page. No policy is skipped, because no page is served. <VersionReq package="avo-licensing" version="4.4.0" />

If you set [`run_community_admin_without_valid_license`](./customization-api.html#run_community_admin_without_valid_license) to `true`, the admin keeps running instead, and your policies are not applied. Anyone who can sign in to Avo can reach everything, so turn it on only if that is acceptable for your app. A valid license that lacks `avo-authorization` still fails closed when your initializer sets a client, with the setting on or off.

:::tip
If every resource is refused at once, check the license before the policies.
:::

## Debug a denied action

When a [developer user](./authentication.html#check-if-a-user-is-an-developer) triggers a denial, Avo logs it. In development, the entry includes the global ids of the user and the record:

```bash
web     | [Avo->] Unauthorized action 'reorder?' for 'UserPolicy'
web     | user: gid://dummy/User/20
web     | record: gid://dummy/User/31
```

Load either one in a console with `GlobalID::Locator.locate("gid://dummy/User/20")`.

In production, the entry names only the policy and the action:

```bash
web     | [Avo->] Unauthorized action 'act_on?' for 'UserPolicy'
```

## Use Action Policy

<VersionReq package="avo-authorization" version="4.5.0.beta.1" />

If your app authorizes with [Action Policy](https://github.com/palkan/action_policy), set [`authorization_client`](./authorization-api.html#authorization_client) to `:action_policy`. Avo ships the client, so you don't write an adapter.

```ruby
# Gemfile
gem "action_policy"
```

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_client = :action_policy
end
```

:::warning Beta
The Action Policy client ships in the `avo-authorization` `4.5.0.beta.1` prerelease and is tested with `action_policy` `0.7.8`. Bundler installs a prerelease only when the `Gemfile` asks for one:

```ruby
# Gemfile
source "https://packager.dev/avo-hq/" do
  gem "avo-authorization", ">= 4.5.0.beta.1"
end
```

[avo-ai](./ai.html) ships its own policies, written for Pundit, so avo-ai's pages don't work under this client yet.
:::

If Action Policy is new to the app, run `bin/rails g action_policy:install` to generate `ApplicationPolicy`. If the `action_policy` gem isn't in the bundle, Avo raises `Avo::MissingGemError`.

Avo looks policies up at the top level, as it does with Pundit, so `Post` gets `PostPolicy`. It asks them the same [resource](#write-a-policy), [association](#authorize-association-controls) and [file](#authorize-file-attachments) rules. [`explicit_authorization`](./authorization-api.html#explicit_authorization), [`raise_error_on_missing_policy`](./authorization-api.html#raise_error_on_missing_policy) and a resource's [`authorization_policy`](./authorization-api.html#authorization_policy) work as they do with Pundit. The sections below cover what an Action Policy policy writes differently.

### Scope records with `relation_scope`

Where a Pundit policy has a `Scope` class, an Action Policy policy has a `relation_scope`. Avo uses it wherever it would use the Pundit `Scope`, as [Limit which records a user sees](#limit-which-records-a-user-sees) describes.

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  relation_scope do |relation|
    next relation if user.admin?

    relation.where(published: true)
  end
end
```

A policy without a `relation_scope` behaves like a Pundit policy without a `Scope`. Avo doesn't filter the records, or raises `Avo::NoPolicyError` when `raise_error_on_missing_policy` is on.

### Field lists and inherited association rules

[`whitelisted_fields`](./authorization-api.html#whitelisted_fields) and [`blacklisted_fields`](./authorization-api.html#blacklisted_fields) work the same on an Action Policy policy, and so does [`inherit_association_from_policy`](./authorization-api.html#inherit_association_from_policy). Include the helpers in `ApplicationPolicy` as you would with Pundit:

```ruby
# app/policies/application_policy.rb
class ApplicationPolicy < ActionPolicy::Base
  include Avo::Authorization::Concerns::PolicyHelpers

  def blacklisted_fields
    [:api_secret]
  end
end
```

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  inherit_association_from_policy :comments, CommentPolicy
end
```

The inherited rules go through Action Policy, so `CommentPolicy`'s aliases and pre-checks apply to them.

### Authorize association controls with `alias_rule`

A rule you name in `alias_rule` counts as defined for `explicit_authorization`, the same as a method.

Avo checks an association rule (`view_comments?`, `attach_comments?`, `detach_comments?`, `create_comments?`, `act_on_comments?` and the rest) only when the policy defines it as a method or names it in `alias_rule`. Action Policy's `default_rule` (`manage?`) and `pre_check` never make a missing association rule exist. With `explicit_authorization = true`, a control whose rule is missing is hidden. With `false`, it's allowed, whatever `manage?` says.

Resource and file rules are different. Avo asks the policy for them directly, so Action Policy resolves them as it does anywhere else in your app, `default_rule` and pre-checks included.

To send association rules through `manage?` and your pre-checks too, alias them:

```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  alias_rule :view_comments?, :attach_comments?, to: :manage?
end
```

### Authorize without a signed-in user

`ActionPolicy::Base` declares `authorize :user` without `allow_nil`, so a check with no user fails with `ActionPolicy::AuthorizationContextMissing`. If your app authorizes without a user, for example in an API request or a background job, allow a nil user in `ApplicationPolicy` and handle it in your rules:

```ruby
# app/policies/application_policy.rb
class ApplicationPolicy < ActionPolicy::Base
  authorize :user, allow_nil: true
end
```

Field lists treat that error the way they treat a Pundit policy that refuses a nil user. See [Allow or deny fields](#allow-or-deny-fields).

### Keep policies under the `Avo` namespace

Avo looks up `PostPolicy`, not `Avo::PostPolicy`. If your Avo policies live under `Avo::`, as earlier versions of this page advised, subclass the client and point Action Policy's namespace lookup at `Avo`:

```ruby
# app/services/namespaced_action_policy_client.rb
class NamespacedActionPolicyClient < Avo::Authorization::Clients::ActionPolicyClient
  def authorization_namespace
    ::Avo
  end

  def authorization_strict_namespace
    true
  end
end
```

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_client = "NamespacedActionPolicyClient"
end
```

Avo now uses `Avo::PostPolicy` for `Post`. Because `authorization_strict_namespace` returns `true`, Action Policy doesn't fall back to a top-level `PostPolicy` when `Avo::PostPolicy` is missing.

### Pass more context than the user

The client hands each policy the `user`. If your policies need more, such as the current account, subclass the client and declare it with `authorize`:

```ruby
# app/services/account_action_policy_client.rb
class AccountActionPolicyClient < Avo::Authorization::Clients::ActionPolicyClient
  authorize :account, through: :current_account

  def current_account
    Current.account
  end
end
```

```ruby
# app/policies/application_policy.rb
class ApplicationPolicy < ActionPolicy::Base
  authorize :account
end
```

Then set `config.authorization_client = "AccountActionPolicyClient"`. `current_account` runs in the client, not in a controller, so read the account from wherever the request stored it, such as a `Current` attributes class.

## Use a different authorization library

Avo has built-in clients for Pundit and [Action Policy](#use-action-policy). For any other library, write a class that adapts it and point [`authorization_client`](./authorization-api.html#authorization_client) at its name:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_client = "CustomAuthorizationClient"
end
```

The client implements `authorize`, `policy`, `policy!` and `apply_policy`. The [client contract](./authorization-api.html#client-contract) has the signatures. Three rules keep it working:

- `authorize` raises `Avo::NotAuthorizedError` on denial. Avo ignores its return value, so a client that returns `false` allows the action.
- Every method accepts keyword arguments it doesn't use, through `**`. Avo passes keys such as `policy_class:` and `raise_exception:`.
- Avo passes the rule as a String, such as `"index?"`. Convert it if your library looks rules up by Symbol.

If you also want [field lists](#hide-fields-from-a-user), add the two optional [field methods](./authorization-api.html#permitted_field_ids) to the client.

## Manage roles with Rolify

See [the Rolify integration guide](./guides/rolify-integration.html) to add role management with Avo.
