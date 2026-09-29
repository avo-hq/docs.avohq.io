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

With the add-on enabled and nothing else configured, a resource without a policy, or an action whose policy method is missing, is denied. That strictness is controlled by [`explicit_authorization`](./authorization-api.html#explicit_authorization).

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

:::info Pundit alternative
If you'd rather use another library, such as Action Policy, see [Use a different authorization library](#use-a-different-authorization-library).
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
| [`act_on?`](./authorization-api.html#act_on) | The actions dropdown |
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

`create?` and `update?` run when the form is saved, so `record` already holds the submitted values. Use that if the answer depends on what the user typed.

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

Methods for panel-level controls (`view_`, `create_`, `attach_`, `act_on_`) get the parent `Post` as `record`. Methods for row controls (`show_`, `edit_`, `detach_`, `destroy_`) get each `Comment`. The [association policy methods](./authorization-api.html#association-policy-methods) reference lists which is which.

If you want to hide the whole comments panel, use `view_comments?`. If you want to hide only the view button on each row, use `show_comments?`.

These methods only control buttons. Access to the comment's own pages is still decided by `CommentPolicy`, so if `CommentPolicy#edit?` allows it, a user can reach the edit page by URL even when `edit_comments?` hides the button.

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

:::warning
The scope doesn't apply to association panels. `CommentPolicy::Scope` doesn't filter a post's `has_many :comments`. If you want it to, pass the scope through the field's [`scope` option](./associations/has_many.html#add-scopes-to-associations):

```ruby
# app/avo/resources/post.rb
field :comments, as: :has_many, scope: -> { Pundit.policy_scope(parent, query) }
```

:::

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

- **Unlicensed, it's inert.** Without the `avo-authorization` add-on on your license, every policy check is skipped, these lists included. They aren't a security boundary in an unlicensed app.
- **Only Avo's surfaces.** `record.ssn` in a custom partial, a `self.search[:item]` block, a background job or raw SQL reads the attribute regardless.
- **A column no field declares can't be governed.** To govern a column, declare a field for it.
- **"May see but may not write"** isn't expressible in one list. See [Let a user see a field but not change it](#let-a-user-see-a-field-but-not-change-it).
- **Kanban's read side.** The column a card sits in discloses the value of the board's grouping property. A drag that would write a withheld field is refused, but the board still renders.
- **avo-query doesn't participate.** It generates SQL from the schema and can't resolve a policy's lists.

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

## Use a different authorization library

Write a small client class that adapts your library to Avo, and point [`authorization_client`](./authorization-api.html#authorization_client) at it:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_client = "Avo::ActionPolicyAuthorizationClient"
end
```

The client implements `authorize`, `policy`, `policy!` and `apply_policy`, and raises `Avo::NotAuthorizedError` on denial rather than returning `false`. The [client contract](./authorization-api.html#client-contract) has the signatures and rules. Here's a complete [Action Policy](https://github.com/palkan/action_policy) client:

```ruby
# app/services/avo/action_policy_authorization_client.rb
module Avo
  class ActionPolicyAuthorizationClient
    include ::ActionPolicy::Behaviour

    authorize :user
    attr_accessor :user

    def authorize(user, record, action, policy_class: nil, **)
      self.user = user
      authorize!(record, to: action, with: policy_class)
    rescue ActionPolicy::Unauthorized => error
      raise Avo::NotAuthorizedError, error.message
    end

    def policy(user, record, **)
      policy!(user, record)
    rescue Avo::NoPolicyError
      nil
    end

    def policy!(user, record, **)
      self.user = user
      policy_for(record:)
    rescue ActionPolicy::NotFound => error
      raise Avo::NoPolicyError, error.message
    end

    def apply_policy(user, model, policy_class: nil, **)
      policy = if policy_class.present?
        policy_class.new(model, user:)
      else
        policy!(user, model)
      end

      policy.apply_scope(model, type: :active_record_relation)
    end
  end
end
```

Place policies under the `Avo` namespace, or configure Action Policy's lookup to match your app:

```ruby
# app/policies/avo/equipment_policy.rb
module Avo
  class EquipmentPolicy < ApplicationPolicy
    def index?
      true
    end

    def new?
      user.admin?
    end

    def create?
      user.admin?
    end
  end
end
```

If you also want [field lists](#hide-fields-from-a-user), add the two optional [field methods](./authorization-api.html#permitted_field_ids) to the client. More community examples are in [this issue](https://github.com/avo-hq/avo/issues/1922).

## Manage roles with Rolify

See [the Rolify integration guide](./guides/rolify-integration.html) to add role management with Avo.
