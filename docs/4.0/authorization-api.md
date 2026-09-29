---
license: addon
addon_link: https://avohq.io/addons/authorization
outline: [2, 3]
guide: ./authorization.html
prev:
  text: "Authorization"
  link: "./authorization.html"
next: false
---

# Authorization API

Per-option reference for authorization: the initializer options, the resource option, every policy method Avo calls, and the client contract. For task-oriented documentation and worked examples, see the [Authorization guide](./authorization.html).

Configuration options go in `config/initializers/avo.rb`:

```ruby
Avo.configure do |config|
  config.authorization_client = :pundit
  config.explicit_authorization = true
end
```

Policy methods go in the policy class for the resource's model, for example `app/policies/post_policy.rb`.

## Configuration

<Option name="`authorization_client`" headingSize="3">

The client Avo uses to answer authorization checks.

```ruby
config.authorization_client = "Avo::ActionPolicyAuthorizationClient"
```

| Value | Behavior |
| --- | --- |
| `:pundit` | Uses the built-in Pundit client. Requires `gem "pundit"` in the `Gemfile`. |
| `nil` | Uses the built-in nil client, which applies no policies. |
| `String` | The class name of a custom client that implements the [client contract](#client-contract). |

- **Type:** `Symbol`, `String`, or `nil`
- **Default:** `:pundit`

</Option>

<Option name="`explicit_authorization`" headingSize="3">

How a missing policy class or policy method is treated.

```ruby
config.explicit_authorization = true
```

| Value | Behavior |
| --- | --- |
| `true` | A missing policy class or method denies the action. |
| `false` | A missing policy class or method allows the action. |
| `Proc` | Evaluated per request; a truthy result behaves like `true`, a falsy one like `false`. |

```ruby
config.explicit_authorization = -> {
  current_user.access_to_admin_panel? && !current_user.admin?
}
```

- **Type:** `Boolean` or `Proc`
- **Default:** `true`
- **Context:** the `Proc` runs in an [`Avo::ExecutionContext`](./execution-context.html)

:::info
Doesn't affect [field lists](#field-lists). A policy that declares neither `whitelisted_fields` nor `blacklisted_fields` restricts no fields, whatever this option says.
:::

</Option>

<Option name="`raise_error_on_missing_policy`" headingSize="3">

Raises `Avo::NoPolicyError` when a resource has no policy class, instead of applying [`explicit_authorization`](#explicit_authorization). It doesn't apply to a missing policy method.

```ruby
config.raise_error_on_missing_policy = true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`authorization_methods`" headingSize="3">

Maps the actions Avo authorizes to the policy methods it calls. Keys not in the Hash fall back to the action name.

```ruby
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
```

- **Type:** `Hash` of action `Symbol` to method name `String`
- **Default:** `{index: "index?", show: "show?", edit: "edit?", new: "new?", update: "update?", create: "create?", destroy: "destroy?"}`

</Option>

## Resource options

<Option name="`authorization_policy`" headingSize="3">

The policy class for the resource. When unset, the policy is inferred from the resource's model.

```ruby
class Avo::Resources::PhotoComment < Avo::BaseResource
  self.model_class = "Comment"
  self.authorization_policy = PhotoCommentPolicy
end
```

- **Type:** `Class`
- **Default:** `nil`

</Option>

## Resource policy methods

Called with the current `user` and the `record` (or the model class when there is no record yet). Return truthy to allow.

<Option name="`index?`" headingSize="3">

Controls the resource's sidebar entry in the auto-generated menu and access to the <Index /> view.

- **Type:** `Boolean`

:::info
Not used by the [menu editor](./menu-editor.html). Items there are hidden through their [`visible`](./menu-editor.html#item-visibility) block.
:::

</Option>

<Option name="`show?`" headingSize="3">

Controls the view button on the resource row and access to the <Show /> view.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-show.webp" dark-src="/assets/img/4_0/authorization/policy-show-dark.webp" width="3150" height="1100" alt="An Avo Posts index table with the View (eye) icon in a row's action controls highlighted, the control the show? policy governs." prompt="View (eye) icon highlighted on a resource row on the Index view" />

</Option>

<Option name="`new?`" headingSize="3">

Controls the `Create new {model}` button on the <Index /> view and on association panels, and access to the `/new` page. The `/new` page check doesn't raise on denial.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-new.webp" dark-src="/assets/img/4_0/authorization/policy-new-dark.webp" width="2032" height="834" alt="The Posts Index view with the “Create new post” button highlighted in the top-right of the header, illustrating the resource the Pundit new? policy controls." prompt="Create new post button highlighted on the Index view" />

</Option>

<Option name="`create?`" headingSize="3">

Controls whether a new record can be saved, from the `/new` page and from association create actions. Checked only on save, so `record` holds the submitted form values.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-create.webp" dark-src="/assets/img/4_0/authorization/policy-create-dark.webp" width="1960" height="988" alt="The Avo post create form, trimmed to the Name, Body and Status fields, with the Save button in the top-right action bar highlighted." prompt="Save button highlighted on the resource create form" />

</Option>

<Option name="`edit?`" headingSize="3">

Controls the edit button on the resource row and access to the <Edit /> view.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-edit.webp" dark-src="/assets/img/4_0/authorization/policy-edit-dark.webp" width="3150" height="1100" alt="An Avo Posts index table with the Edit (pencil) icon in a row's action controls highlighted, the control the edit? policy governs." prompt="Edit (pencil) icon highlighted on a resource row on the Index view" />

</Option>

<Option name="`update?`" headingSize="3">

Controls whether changes to a record can be saved. `record` holds the submitted form values.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-update.webp" dark-src="/assets/img/4_0/authorization/policy-update-dark.webp" width="1960" height="722" alt="The Avo resource edit form with the Save button highlighted, illustrating the Pundit update? policy that controls whether a user can save changes." prompt="Save button highlighted on the resource edit form" />

</Option>

<Option name="`destroy?`" headingSize="3">

Controls the delete button and whether a record can be deleted. Per-file deletion is controlled by [`delete_{FIELD_ID}?`](#delete_FIELD_ID).

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-destroy.webp" dark-src="/assets/img/4_0/authorization/policy-destroy-dark.webp" width="3150" height="1100" alt="An Avo Posts index table with the Delete (trash) icon in a row's action controls highlighted, the control the destroy? policy governs." prompt="Delete (trash) icon highlighted on a resource row on the Index view" />

</Option>

<Option name="`act_on?`" headingSize="3">

Controls the actions button on the <Index /> view.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-act-on.webp" dark-src="/assets/img/4_0/authorization/policy-act-on-dark.webp" width="2032" height="850" alt="The Posts Index view with the “Actions” button highlighted in the header controls bar, illustrating the control the Pundit act_on? policy governs." prompt="Actions button highlighted on the Index view" />

</Option>

<Option name="`reorder?`" headingSize="3">

Controls the [record reordering](./record-reordering.html) controls on the <Index /> view.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-reorder.webp" dark-src="/assets/img/4_0/authorization/policy-reorder-dark.webp" width="2032" height="758" alt="An Avo Course links index table with a row's record reordering controls (drag handle and up, down, to-top, to-bottom arrows) highlighted, the controls the reorder? policy governs." prompt="Record reordering controls highlighted on the Index view" />

</Option>

<Option name="`search?`" headingSize="3">

Controls the [resource search input](./search.html#enable-search-for-a-resource) at the top of the <Index /> view.

- **Type:** `Boolean`

<Image src="/assets/img/4_0/authorization/policy-search.webp" dark-src="/assets/img/4_0/authorization/policy-search-dark.webp" width="2032" height="834" alt="The Posts Index view with the resource search input highlighted at the top of the page, illustrating the input the Pundit search? policy controls." prompt="Resource search input highlighted on the Index view" />

</Option>

<Option name="`preview?`" headingSize="3">

Controls access to the endpoint the [preview field](./fields/preview.html) calls.

- **Type:** `Boolean`

:::info
Doesn't hide the preview field itself. Use the field's `visible` option for that.
:::

<Image src="/assets/img/4_0/authorization/policy-preview.webp" dark-src="/assets/img/4_0/authorization/policy-preview-dark.webp" width="2032" height="758" alt="Preview field trigger highlighted on a team row in the Index view" prompt="Preview field trigger highlighted on a resource row on the Index view" />

</Option>

## Association policy methods

Defined on the **parent** resource's policy. `{association}` is the association name exactly as declared, including its pluralization: `has_many :comments` gives `attach_comments?`, not `attach_comment?`.

`record` is either the parent record or the associated row record, depending on the method:

| Method | `record` |
| --- | --- |
| `attach_`, `create_`, `act_on_`, `view_`, `reorder_` | The parent record |
| `detach_`, `show_`, `edit_`, `destroy_` | The associated row record |

<Option name="`view_{association}?`" headingSize="3">

Controls whether the association panel is displayed on the parent record.

- **Type:** `Boolean`
- **`record`:** the parent record

</Option>

<Option name="`attach_{association}?`" headingSize="3">

Controls the `Attach {model}` button.

- **Type:** `Boolean`
- **`record`:** the parent record

<Image src="/assets/img/4_0/authorization/attach.webp" dark-src="/assets/img/4_0/authorization/attach-dark.webp" width="2032" height="1010" alt="The Team members association Index view with the “Attach team member” button highlighted — the control the attach_{association}? policy governs." />

</Option>

<Option name="`detach_{association}?`" headingSize="3">

Controls the detach button on each associated row.

- **Type:** `Boolean`
- **`record`:** the associated row record

<Image src="/assets/img/4_0/authorization/detach.webp" dark-src="/assets/img/4_0/authorization/detach-dark.webp" width="2032" height="1010" alt="The Team members association Index view with the Detach (unlink) icon in an associated record row’s action controls highlighted, the control the detach_{association}? policy governs." />

</Option>

<Option name="`create_{association}?`" headingSize="3">

Controls the `Create new {model}` button on the association panel.

- **Type:** `Boolean`
- **`record`:** the parent record

<Image src="/assets/img/4_0/authorization/create.webp" dark-src="/assets/img/4_0/authorization/create-dark.webp" width="2032" height="1010" alt="The Team members association Index view with the “Create new team member” header button highlighted, the control the create_{association}? policy governs." />

</Option>

<Option name="`show_{association}?`" headingSize="3">

Controls the view button on each associated row.

- **Type:** `Boolean`
- **`record`:** the associated row record

:::warning
Doesn't control access to the associated record's <Show /> view. That's decided by the associated record's own policy.
:::

<Image src="/assets/img/4_0/authorization/show.webp" dark-src="/assets/img/4_0/authorization/show-dark.webp" width="2032" height="1010" alt="The Team members association Index view with the View (eye) icon in an associated record row’s action controls highlighted, the control the show_{association}? policy governs." />

</Option>

<Option name="`edit_{association}?`" headingSize="3">

Controls the edit button on each associated row.

- **Type:** `Boolean`
- **`record`:** the associated row record

:::warning
Doesn't control access to the associated record's <Edit /> view. That's decided by the associated record's own policy.
:::

<Image src="/assets/img/4_0/authorization/edit.webp" dark-src="/assets/img/4_0/authorization/edit-dark.webp" width="2032" height="1010" alt="The Team members association Index view with the Edit (pencil) icon in an associated record row’s action controls highlighted, the control the edit_{association}? policy governs." />

</Option>

<Option name="`destroy_{association}?`" headingSize="3">

Controls the delete button on each associated row.

- **Type:** `Boolean`
- **`record`:** the associated row record

<Image src="/assets/img/4_0/authorization/destroy.webp" dark-src="/assets/img/4_0/authorization/destroy-dark.webp" width="2032" height="1010" alt="The Team members association Index view with the Delete (trash) icon in an associated record row’s action controls highlighted, the control the destroy_{association}? policy governs." />

</Option>

<Option name="`act_on_{association}?`" headingSize="3">

Controls the `Actions` dropdown on the association panel.

- **Type:** `Boolean`
- **`record`:** the parent record

<Image src="/assets/img/4_0/authorization/actions.webp" dark-src="/assets/img/4_0/authorization/actions-dark.webp" width="2032" height="1010" alt="The Team members association Index view with the “Actions” header dropdown button highlighted, the control the act_on_{association}? policy governs." />

</Option>

<Option name="`reorder_{association}?`" headingSize="3">

Controls the [record reordering](./record-reordering.html) controls on a `has_many` association panel.

- **Type:** `Boolean`
- **`record`:** the parent record

<Image src="/assets/img/4_0/authorization/policy-reorder-assoc.webp" dark-src="/assets/img/4_0/authorization/policy-reorder-assoc-dark.webp" width="2032" height="680" alt="A Course links association Index (on the Course Show page) with a row's record-reordering controls (drag handle and up, down, to-top, to-bottom arrows) highlighted, the controls the reorder_{association}? policy governs." prompt="Record reordering controls highlighted on an associated record row on the association Index view" />

</Option>

<Option name="`inherit_association_from_policy`" headingSize="3">

Class method that defines the association methods above by delegating to another policy. Available after including `Avo::Authorization::Concerns::PolicyHelpers`.

```ruby
class PostPolicy < ApplicationPolicy
  include Avo::Authorization::Concerns::PolicyHelpers

  inherit_association_from_policy :comments, CommentPolicy
end
```

| Defined method | Delegates to |
| --- | --- |
| `create_comments?` | `CommentPolicy#create?` |
| `edit_comments?` | `CommentPolicy#edit?` |
| `update_comments?` | `CommentPolicy#update?` |
| `destroy_comments?` | `CommentPolicy#destroy?` |
| `show_comments?` | `CommentPolicy#show?` |
| `reorder_comments?` | `CommentPolicy#reorder?` |
| `act_on_comments?` | `CommentPolicy#act_on?` |
| `attach_comments?` | `CommentPolicy#attach?` |
| `detach_comments?` | `CommentPolicy#detach?` |
| `view_comments?` | `CommentPolicy#index?` |

Each delegate is called as `CommentPolicy.new(user, record)`. A method defined in the policy after the call overrides the generated one.

- **Arguments:** `association_name` (`Symbol`), `policy_class` (`Class`)

</Option>

## Attachment policy methods

`{FIELD_ID}` is the file field's id. `user` and `record` are available. The same methods authorize file fields on [actions](./actions.html) that run on the resource.

<Option name="`upload_{FIELD_ID}?`" headingSize="3">

Controls whether a file can be uploaded to the field.

- **Type:** `Boolean`

</Option>

<Option name="`download_{FIELD_ID}?`" headingSize="3">

Controls whether the field's file can be downloaded.

- **Type:** `Boolean`

</Option>

<Option name="`delete_{FIELD_ID}?`" headingSize="3">

Controls whether the field's file can be deleted.

- **Type:** `Boolean`

</Option>

## Policy scope

<Option name="`Scope`" headingSize="3">

Nested policy class whose `resolve` method filters the records on the <Index />, <Show />, and <Edit /> views. `scope` is the query being run.

```ruby
class PostPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      user.admin? ? scope.all : scope.where(published: true)
    end
  end
end
```

- **Type:** `Class` with a `resolve` method returning a relation
- **Applies to:** the resource's own views. Not applied to association panels; use the association field's [`scope` option](./associations/has_many.html#add-scopes-to-associations).

</Option>

## Field lists

Policy methods that name which of the resource's fields a user may reach. A withheld field is neither rendered nor settable on any Avo surface. See [Hide fields from a user](./authorization.html#hide-fields-from-a-user) for what that covers.

Both lists hold **field ids**, not column names. An id matching no field the resource declares on the current view is ignored. When both are declared, the allowlist resolves first and the denylist subtracts from it. A `private` declaration counts as declared.

<Option name="`whitelisted_fields`" headingSize="3">

The only field ids this user may reach.

```ruby
def whitelisted_fields
  user.admin? ? :all : [:id, :name, :email]
end
```

- **Type:** `:all`, `:none`, or `Array` of field id `Symbol`s
- **Default:** `:all` when undeclared

</Option>

<Option name="`blacklisted_fields`" headingSize="3">

Field ids this user may not reach.

```ruby
def blacklisted_fields
  user.admin? ? [] : [:budget, :internal_notes]
end
```

- **Type:** `:all`, `:none`, or `Array` of field id `Symbol`s
- **Default:** `:none` when undeclared

</Option>

<Option name="`Avo::Current.interface`" id="interface" headingSize="3">

The surface the current request came through. Readable in field list methods and anywhere else `Avo::Current` is, including a field's `visible:` block.

| Value | Set by |
| --- | --- |
| `:ui` | The admin panel |
| `:api` | [`avo-api`](./rest-api.html) |
| `:ai` | [`avo-ai`](./ai.html) |
| `:mcp` | [`avo-mcp_server`](./mcp.html) |

- **Type:** `Symbol`
- **Default:** `:ui`

</Option>

### Field list errors

A list that can't be resolved raises rather than falling back to no restriction. Every error subclasses `Avo::Authorization::FieldResolver::Error`:

| Error | Raised when |
| --- | --- |
| `InvalidDeclarationError` | A method returns something other than `:all`, `:none` or an `Array`. `nil` counts. |
| `ResolutionFailedError` | A method raised while being read. |

## Client contract

Methods a custom [`authorization_client`](#authorization_client) implements. The built-in `:pundit` client follows the same contract.

Every method must accept keyword arguments it doesn't use, usually through `**`. Avo passes keys such as `policy_class:`, `raise_exception:` and `resource_class:`, and a method that doesn't accept them raises `ArgumentError`, which a UI check can swallow as a denial.

:::warning Raise on denial
`authorize` must raise on denial. Avo ignores its return value, so a client that returns `false` authorizes the action. When Avo passes `raise_exception: false`, it still expects the client to raise, and turns the exception into `false` itself.
:::

<Option name="`authorize`" headingSize="3">

Checks whether `user` can perform `action` (for example `"index?"`) on `record`. Called for sidebar items, buttons, menu visibility, and controller requests.

```ruby
def authorize(user, record, action, policy_class: nil, **)
  Pundit.authorize(user, record, action, policy_class: policy_class)
rescue Pundit::NotDefinedError => error
  raise Avo::NoPolicyError, error.message
rescue Pundit::NotAuthorizedError => error
  raise Avo::NotAuthorizedError, error.message
end
```

- **Arguments:** `user`, `record`, `action`, `policy_class:`, `**`
- **Raises:** `Avo::NotAuthorizedError` on denial, `Avo::NoPolicyError` when the policy is missing

</Option>

<Option name="`policy`" headingSize="3">

Returns the policy instance for a record or model class, or `nil` when none exists.

```ruby
def policy(user, record, **)
  Pundit.policy(user, record)
end
```

- **Arguments:** `user`, `record`, `**`
- **Returns:** a policy instance or `nil`

</Option>

<Option name="`policy!`" id="policy_bang" headingSize="3">

Returns the policy instance for a record or model class, raising when none exists.

```ruby
def policy!(user, record, **)
  Pundit.policy!(user, record)
rescue Pundit::NotDefinedError => error
  raise Avo::NoPolicyError, error.message
end
```

- **Arguments:** `user`, `record`, `**`
- **Raises:** `Avo::NoPolicyError` when the policy is missing

</Option>

<Option name="`apply_policy`" headingSize="3">

Scopes a query to the records `user` may see. Called on the <Index />, <Show />, and <Edit /> views.

```ruby
def apply_policy(user, model, policy_class: nil, **)
  scope_from_policy_class = scope_for_policy_class(policy_class)

  if scope_from_policy_class.present?
    scope_from_policy_class.new(user, model).resolve
  else
    Pundit.policy_scope!(user, model)
  end
rescue Pundit::NotDefinedError => error
  raise Avo::NoPolicyError, error.message
end
```

- **Arguments:** `user`, `model` (a relation or model class), `policy_class:`, `**`
- **Returns:** the scoped query
- **Raises:** `Avo::NoPolicyError` when the policy is missing

</Option>

<Option name="`permitted_field_ids`" headingSize="3">

Optional. Returns the subset of `declared_field_ids` this user may reach, for reads and writes alike. A client that implements neither this nor [`field_reachable?`](#field_reachable) imposes no field restriction.

```ruby
def permitted_field_ids(user, record, declared_field_ids:, policy_class: nil)
  resolved = policy_class ? policy_class.new(user, record) : policy(user, record)
  return declared_field_ids if resolved.nil?

  Avo::Authorization::FieldResolver.new(
    policy: resolved,
    declared_field_ids: declared_field_ids
  ).permitted_field_ids
end
```

- **Arguments:** `user`, `record`, `declared_field_ids:` (`Array` of `Symbol`s), `policy_class:` (the resource's [`authorization_policy`](#authorization_policy), if set)
- **Returns:** `Array` of field id `Symbol`s
- **Raises:** on resolution failure. Returning the full list on error falls open.

</Option>

<Option name="`field_reachable?`" headingSize="3">

Optional. Returns whether one field id survives the policy's lists, for callers that resolve a single field, such as a record title in a search result or an association picker.

```ruby
def field_reachable?(user, record, field_id, declared_field_ids: [], policy_class: nil)
  resolved = policy_class ? policy_class.new(user, record) : policy(user, record)
  return true if resolved.nil?

  Avo::Authorization::FieldResolver.new(
    policy: resolved,
    declared_field_ids: declared_field_ids
  ).reaches?(field_id)
end
```

- **Arguments:** `user`, `record`, `field_id`, `declared_field_ids:` (empty when the resource hasn't detected its fields), `policy_class:`
- **Returns:** `Boolean`

</Option>
