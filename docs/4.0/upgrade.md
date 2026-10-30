# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

## Upgrade to `avo` `4.3.11`

<Option name="Session persistence also keeps the sort, the resource table page, and the selected rows">

### Breaking Change

With `config.persistence = { driver: :session }`, the session used to keep only association pagination and static filter selections. It now also keeps the `page` and `per_page` of resource tables (the `per_page` cookie is no longer read), the sort picked from a table header, and the rows checked on a table, which stay in the browser tab. Dynamic filter selections are kept too, with `avo-dynamic_filters` `4.3.2` or newer. A plain visit, such as the sidebar link, lands on the remembered page, sorted and filtered as the user left it, with the rows still checked. Nothing changes without the driver. See [Persist UI state](./customization.html#persist-ui-state).

### Action Required

None, if you want the new state to stick. Check your system specs: one that sorts, pages, or selects rows with the driver on and then expects a plain visit to start fresh now finds that state still there.

### Maintaining Previous Behavior

Turn the new kinds off next to the driver. `pagination` covers resource and association tables together, so association pagination alone can't be kept.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.persistence = {
    driver: :session,
    sorting: false,
    selection: false
  }
end
```

</Option>

## Upgrade to `avo-api` `4.4.0`

<Option name="`belongs_to` and `has_one` ids are the related record's `to_param`">

### Breaking Change

A `belongs_to` or `has_one` field now reads back with the related record's `to_param`, the id in its panel URL, instead of its primary key. It's always a string: `{ "id": "5", "label": "John Doe" }`, not `{ "id": 5, "label": "John Doe" }`. Where a model hides its primary key (friendly_id, a prefixed id, a custom `to_param`), the response carries the slug or prefixed id instead of the key. The OpenAPI document types both ids as strings. See [Field serialization](./rest-api.html#field-serialization).

A `belongs_to` write takes that value back, also on a resource found by slug alone. A record's own `id` field doesn't change.

### Action Required

Update API clients that read these ids as numbers or compare them with numbers. Send back the value a read returns.

</Option>

## Upgrade to `avo` `4.3.9`

<Option name="`act_on?` authorizes running an action, not only the Actions button">

### Breaking Change

Running an action now asks the resource policy's [`act_on?`](./authorization-api.html#act_on) of the record on the page and of each selected record (the model class when there are none, and for **Select all**). If any is denied, the whole run is refused. Before, `act_on?` only hid the Actions button, so a hand-built request could run an action on records the policy denies.

An action run from an association panel is still shown or hidden by the parent's `act_on_{association}?`, and now also needs `act_on?` on each selected child.

### Action Required

None, unless a resource's actions run only from association panels and its policy has no `act_on?`. Under [`explicit_authorization`](./authorization-api.html#explicit_authorization) (the default), those runs are now refused. Define it on the child's policy:

```ruby
# app/policies/comment_policy.rb
class CommentPolicy < ApplicationPolicy
  def act_on? # [!code ++]
    user.admin? # [!code ++]
  end # [!code ++]
end
```

</Option>

<Option name="A refusal with no page to go back to renders a 403 page">

### Breaking Change

A refused request with no page to go back to (an address typed in, a bookmark, a reload) now gets a `403` page in the Avo layout with the "not authorized" message, instead of a redirect to Avo's home page. JSON and Turbo Stream requests get a bare `403`. A request with a page to go back to is still redirected there with the flash.

Before, a refused home page redirected to itself until the browser gave up, and a refusal inside an add-on's own pages raised a `500`.

### Action Required

None, unless a test or client expects the redirect to the home page.

</Option>

## Upgrade to `avo-authorization` `4.3.3`

<Option name="An app with an authorization client and no `avo-authorization` license refuses every resource">

### Breaking Change

When your initializer sets [`authorization_client`](./authorization-api.html#authorization_client) and your license doesn't include the `avo-authorization` add-on, Avo now refuses every resource: lists come back empty, show and edit answer `404`, and a banner explains why. Before, every policy was skipped and every admin reached every record. See [When the license lapses](./authorization.html#when-the-license-lapses).

### Action Required

Check that every environment where your initializer sets a client runs with your license key, test and CI included. Apps with no `authorization_client` line, or with it set to `nil`, are unaffected.

</Option>

## Upgrade to `avo-ai` `4.3.0.beta.8`

<Option name="The assistant reads a record's fields and files only when `show?` allows it">

### Breaking Change

The assistant now asks [`show?`](./authorization-api.html#show) before it reads a record's field values, its files, or its chip fields. A row the user may list but not open comes back with only its id and reference. Before, `index?` and the policy scope were enough.

### Action Required

None, unless users should read rows through the chat that their `show?` refuses. Widen `show?` for them.

</Option>

## Upgrade to `avo-api` `4.3.1`

<Option name="Association fields follow `view_{association}?` and the related policy scope">

### Breaking Change

An association field is now left out of a response when the record's policy refuses `view_<field>?`, or, under [`explicit_authorization`](./authorization-api.html#explicit_authorization) (the default), doesn't define it. Counts and `has_one` ids go through the related resource's `Scope`, so a `has_one` outside it is `null`. A `has_and_belongs_to_many` field is now `{ "count": 12 }`, like a `has_many`, instead of the related rows. See [Field serialization](./rest-api.html#field-serialization).

### Action Required

Define `view_<field>?` for every association field your API clients read, and update clients that read a `has_and_belongs_to_many` field as a list.

```ruby
# app/policies/user_policy.rb
class UserPolicy < ApplicationPolicy
  def view_posts? = true # [!code ++]
end
```

</Option>

## Upgrade to `avo-audit_logging` `4.3.1`

<Option name="Undo needs `update?` on the record">

### Breaking Change

The **Undo change** action now asks the record's policy: [`update?`](./authorization-api.html#update), with the record found through its policy scope, or [`create?`](./authorization-api.html#create) to bring back a destroyed record. Users the policy refuses no longer see the action. The activity's payload also leaves out fields the user's field policy withholds, as the changeset diff already did.

### Action Required

None, unless an STI model records its versions under a base class that has no Avo resource. Undo is hidden for those until you map the base class with [`model_resource_mapping`](./customization-api.html#model_resource_mapping).

</Option>

## Upgrade to `avo-collaboration` `4.3.2`

<Option name="Timeline requests need access to the record and its timeline">

### Breaking Change

Every collaboration request now finds the record through the resource's policy scope and asks `show?` and `collaboration_view_timeline?`. Posting also asks `collaboration_create_entry?`, and deleting asks `collaboration_destroy_entry?`. Before, these methods only hid buttons. A refused request gets a `403`, and a record outside the scope a `404`. See [Authorization](./collaboration.html#authorization).

### Action Required

None. The timeline's buttons already followed these methods.

</Option>

## Upgrade to `avo-dashboards` `4.3.2`

<Option name="A card's URL refuses what its page refuses">

### Breaking Change

A card's own URL now refuses a card of a dashboard whose `authorize` fails, a card hidden by `visible`, and a resource card whose policy refuses `index?` (or `show?` on the record). Before, it served any card by its position. See [Cards visibility](./cards.html#cards-visibility).

### Action Required

None. Cards render on their pages as before.

</Option>

## Upgrade to `avo-dynamic_filters` `4.3.1`

<Option name="A filter applies only the conditions it offers">

### Breaking Change

A condition in the URL that the filter doesn't offer is now ignored, and no pill shows for it. Before, Avo passed any condition to Ransack. That includes `is_present` and `is_blank` on number and select filters, which only text filters offer. See [`conditions`](./dynamic-filters-api.html#conditions).

### Action Required

None, unless a link or bookmark uses a Ransack predicate the filter doesn't list. Add it to the filter's `conditions`, together with the default conditions you want to keep.

</Option>

## Upgrade to `avo-http_resource` `4.3.1`

<Option name="The debug console runs a probe only when the policy allows that action">

### Breaking Change

Each [debug console](./http-resource.html#debug-console) probe now asks the policy method the resource's own page would: `index?` for `index` and `count`, then `show?`, `create?`, `update?`, and `destroy?` for `delete`. A refused probe is reported as not authorized and never sent. Before, `index?` was enough to run every probe, writes to the remote API included.

### Action Required

None, unless the console's users should run write probes. Allow `create?`, `update?`, or `destroy?` for them. These are asked of the model class, so a method that reads the record refuses.

</Option>

## Upgrade to `avo-kanban` `4.3.2`

<Option name="Board routes follow the board policy, and cards their record's policy">

### Breaking Change

Every board route now asks the `Avo::Kanban::BoardPolicy` method behind its button and finds the board through the policy's `Scope`. Removing a card asks `manage_column?`, and resetting a column is now a `POST`. Moving or adding a card updates its record, so it needs the record inside its resource's policy scope, `update?` on it, and a field on that resource that writes the board's property. Cards whose record the scope hides are no longer shown. See [Authorization](./kanban-boards.html#authorization).

### Action Required

- Allow `update?` on the records your users move on a board.
- If a board's property is a virtual attribute with no field, add one to the resource. See [Items without that property](./kanban-boards.html#items-without-that-property).

</Option>

## Upgrade to `avo-mcp_server` `4.3.0.beta.2`

<Option name="Association values follow `view_{association}?` and the related policy scope">

### Breaking Change

The tools now leave out an association the record's policy refuses with `view_<association>?`, or, under [`explicit_authorization`](./authorization-api.html#explicit_authorization) (the default), doesn't define. A `has_one` is read through the associated resource's policy scope and is `null` outside it, and `has_many` ids go through that resource's scope. See [Arguments](./mcp-api.html#arguments).

### Action Required

Define `view_<association>?` for every association MCP clients should read.

</Option>

## Upgrade to `avo-menu` `4.3.1`

<Option name="A menu `action` item shows only when the resource's policy allows `act_on?`">

### Breaking Change

A menu [`action`](./menu-editor-api.html#action) item now shows only when the resource's policy allows [`act_on?`](./authorization-api.html#act_on), as the resource's own Actions dropdown does. Under `explicit_authorization` (the default), a policy without `act_on?` hides it.

### Action Required

None, unless the resource's policy lacks `act_on?`. Define it.

</Option>

<Option name="`all_boards` lists only the boards the board policy's `Scope` returns">

### Breaking Change

[`all_boards`](./menu-editor-api.html#all_boards) now lists only the boards `Avo::Kanban::BoardPolicy::Scope` returns. Before, it listed every board.

### Action Required

None.

</Option>

## Upgrade to `avo-nested` `4.3.2`

<Option name="A nested form writes only the children the user may update or create">

### Breaking Change

Saving a parent with a nested form now asks the child's policies. An existing child is written only when it's inside the child resource's policy scope and `update?` allows it; other rows are skipped. A new child needs the child's `create?` and the parent's `create_<association>?`, and the "Add" button is hidden when `create_<association>?` refuses. Under `explicit_authorization` (the default), a parent policy without `create_<association>?` refuses new rows. See [Nested in Forms](./associations/has_many.html#nested-in-forms).

### Action Required

Define `create_<association>?` on the parent's policy for every nested association users add records to:

```ruby
# app/policies/book_policy.rb
class BookPolicy < ApplicationPolicy
  def create_authors? = user.admin? # [!code ++]
end
```

</Option>

## Upgrade to `avo-notifications` `4.3.1`

<Option name="The notification resource finds records through the current user">

### Breaking Change

The generated notification resource scoped the list to the current user, but not the record lookup. A signed-in user could open, delete or run actions on another user's notification by id. New installs generate a resource that scopes both. See [Notification resource](./notifications.html#notification-resource).

### Steps to Update

If you generated `app/avo/resources/avo_notification.rb` with avo-notifications 4.3.0 or earlier, add the lookup below `index_query`:

```ruby
# app/avo/resources/avo_notification.rb
class Avo::Resources::AvoNotification < Avo::BaseResource
  self.index_query = -> {
    query.for_user(Avo::Current.user).newest_first
  }

  self.find_record_method = -> { # [!code ++]
    query.for_user(Avo::Current.user).find(id) # [!code ++]
  } # [!code ++]
end
```

</Option>

## Upgrade to `avo-record_reordering` `4.3.1`

<Option name="Moving a record needs `reorder?` on its policy">

### Breaking Change

Moving a record now asks [`reorder?`](./authorization-api.html#reorder) on its own policy, from any panel. Association panels still show the controls by `reorder_<association>?`, but the move also needs the record's `reorder?`. After a move, Avo redirects back only to an address inside the app.

### Action Required

Define `reorder?` on the policy of every resource users reorder from an association panel:

```ruby
# app/policies/course_link_policy.rb
class CourseLinkPolicy < ApplicationPolicy
  def reorder? = user.admin? # [!code ++]
end
```

</Option>

## Upgrade to `avo-scopes` `4.3.1`

<Option name="A scope count asks the same policy as the index it counts">

### Breaking Change

A scope's count now asks [`index?`](./authorization-api.html#index), or on an association panel the parent's `view_<association>?`. A refused count renders an empty pill. Before, a user could read the counts of a resource whose index their policy denies.

### Action Required

None. A user who can see the index sees the same counts.

</Option>

## Upgrade to `avo` `4.3.6`

<Option name="Trix uploads on the New form are authorized with `create?`">

### What changed

A [Trix](./fields/trix) field on an Action Text attribute, or on a plain column with `attachments_disabled: false`, now accepts uploads on the `New` form. Those uploads are authorized with the resource policy's `create?`. Uploads on a saved record are still authorized with `update?`, and `attachment_key` uploads with `upload_{FIELD_ID}?`.

Action Text attachments, images and other files, now keep their `sgid` and render on the `Show` view through your app's `active_storage/blobs/_blob.html.erb` partial. Before, non-image files rendered as missing ([#2715](https://github.com/avo-hq/avo/issues/2715)).

### Action Required

None, unless your `create?` policy is looser than `update?` and you want to keep users who can create a record from uploading files before it's saved. Set `attachments_disabled: true` on that field.

</Option>

## `avo-ai`, `avo-mcp_server`, `avo-menu`: an action's `visible` block applies everywhere

<Option name="An action hidden by `self.visible` is hidden from the assistant, MCP clients and the menu">

### What changed

The assistant, the MCP tools and a menu `action` item now check an action's [`self.visible`](./actions-api.html#visible) block as well as its `self.authorize`, the way the panel's Actions dropdown does.

- **The assistant and `list_actions`** leave out an action that is hidden on both the index and a record's page, and refuse to run one that is hidden on the page the run starts from: a record's page for one record, the index otherwise.
- **A menu `action` item** is left out when its action is hidden on the resource's index.

### Action Required

None, unless an action hides itself with `self.visible` but is still meant to run from the assistant, an MCP client or the menu. Move that rule into `self.authorize`, or widen `self.visible`.

</Option>

## `avo`: bulk actions find the selected records through `find_records`

<Option name="`query` is an Array, in the order the records were selected">

### What changed

A bulk action now looks up the records the user selected through the resource's new [`find_records`](./resources-api.html#self.find_record_method), the same lookup the assistant and the MCP tools use.

- **`query` is an Array**, in the order the records were selected. It used to be an `ActiveRecord::Relation` on a resource whose `find_record_method` returns `query.where(...)` for a list of ids, FriendlyId resources included. **Select all** still passes a relation.
- **A `find_record_method` that ignores `query` stays inside the user's policy scope.** The records it returns that the scope doesn't hold drop out of `query`.
- **A `find_record_method` that takes one id at a time works for bulk actions.** Avo asks it once per id when it fails on the whole list.

### Action Required

None, unless a bulk action calls a relation method such as `update_all`, `where` or `find_each` on `query`. Iterate over it instead, or build a relation with `Model.where(id: query.map(&:id))`.

</Option>

## `avo-mcp_server`: records are named by `to_param`

<Option name="Record ids are strings, resolved through the resource's own finder">

### What changed

The MCP tools name every record by its `to_param`, the id in the panel's URL, and find it through the resource's [`find_record_method`](./resources-api.html#self.find_record_method), within the admin's policy scope. They used to use the primary key.

- **Ids are strings.** `list_records`, `search_records`, `show_record` and the write tools return a record's id as `"12"`, not `12`, and so do a `belongs_to`'s id, a `has_many`'s ids, and `run_action`'s `recordIds`. The `id` and `record_ids` arguments take strings; an integer is refused with `value at /id is not a string`.
- **Hidden keys stay hidden.** Where a model hides its primary key (friendly_id, hashids, a prefixed id, a custom `to_param`), tools return the slug or hashid instead of the primary key, and take whatever the resource's finder takes. A record with no title attribute is titled `Post #<to_param>`.
- **A `belongs_to` takes back the id `show_record` gives**, also on a resource found by slug alone.

### Action Required

- **A client, prompt or skill that sends or compares ids as numbers:** treat ids as strings and send back what the tools return.
- **A tool of your own:** declare its id arguments `type: "string"`, pass them to `ToolSupport.find_authorized_record!` as received, and name records by `record.to_param` in what it returns. See [Add tools of your own](./mcp.html#add-tools-of-your-own).

</Option>

## `avo`: attaching a `has_many`, `has_one` or HABTM record follows `attach_scope`

<Option name="The attach modal saves only the records its list offers">

### What changed

The attach modal of a `has_many`, `has_one` or `has_and_belongs_to_many` field listed the records its [`attach_scope`](./associations/has_many.html#attach_scope) returned, but saving looked the chosen record up through the policy scope alone. A record outside a narrowing `attach_scope` could still be attached by sending its id, and one a widening `attach_scope` listed was refused. Saving now goes through the same `attach_scope` as the list, the way a `belongs_to` already did. A record outside it is refused like an id that doesn't exist.

### Action Required

None for the modal's own list, which offers only records inside the `attach_scope`. A [searchable](./associations/searchable) picker backed by a [custom search provider](./search-api.html#custom-search-providers) returns hashes, which the `attach_scope` can't filter, so make that search return only records inside it. Anything that posts ids to the attach endpoint directly gets the same check.

</Option>

## `avo`: a `belongs_to` value that matches no record is a form error

<Option name="The form comes back with the error on the field, and the REST API answers `422`">

### What changed

A `belongs_to` value that matches no record the field may attach, because the record is gone or outside the field's [`attach_scope`](./associations/belongs_to.html#attach_scope), used to answer with a 404 page, and `avo-api` with a `404`. The form now comes back with "is invalid" on that field, and the API answers `422` with the field named in `errors`, the way a validation error does. Nothing is saved.

### Action Required

None, unless an API client reads a `404` from a create or update as "the related record doesn't exist". It gets a `422` now; read its `errors`.

</Option>

## `avo`: a field declared once per view saves through the form's declaration

<Option name="Save rules come from the declaration the form shows">

### What changed

When a resource declares the same field more than once for different views, saving the form now goes through the declaration the form shows. Before, the last declaration wrote the value, whichever view it was for, so the form's `attach_scope`, `update_using` and other save rules could be skipped. See [Show and hide fields on different views](./field-options.html#show-and-hide-fields-on-different-views).

A money field that receives only one of its params now keeps the record's current value for the other, and a polymorphic `belongs_to` that receives only its `<as>_id` keeps the current type. An `<as>_type` sent alone keeps the current record when it is the current type. A new type needs its `<as>_id`, since the current id would name a different record: a linked record sent a new type alone gets "is invalid" on the field, and nothing is saved. Before, an `<as>_id` or a currency sent alone was dropped, an `<as>_type` sent alone cleared the id, and an amount sent alone cleared the currency. The panel's forms always send both; this shows in the [REST API](./rest-api.html), the assistant and MCP clients.

`Avo::BaseResource#fields_by_database_id` is replaced by `fields_by_param`, which maps every form param to the field that writes it.

### Action Required

Search your resources for a field declared more than once. Where the declarations have different save rules, the one on the form now applies. Replace any call to `fields_by_database_id` with `fields_by_param`.

</Option>

## `avo-ai` and `avo-mcp_server`: writes go through the resource's fields

<Option name="Creates and updates run each field's save rules and take the form's names">

### What changed

The assistant and connected MCP clients used to write the values they were given straight onto the model. They now save the way the panel's edit form does, through your fields:

- **Save rules run:** [`update_using`](./field-options-api.html#update_using), a `belongs_to` looked up through its resource's finder and attach scope, a polymorphic field's `types`, and a key-value field's locks.
- **Names are the form's:** a field's id, or the param the form submits. A column a field writes under another name is refused by name: `tag_list` (write `tags`), a money field's `price_cents`, a location's `stored_as` columns, a `for_attribute:` field's attribute. On the MCP server, so is a field the edit form doesn't render, such as a badge.
- **Paired params:** a money field with `enable_currency` takes its amount and currency, either of which sent alone keeps the record's current value for the other. A polymorphic `belongs_to` takes its `_type` and `_id`: an `_id` sent alone keeps the current type, and a `_type` naming another type needs its `_id`.

Undo in the chat still restores the stored row exactly as it was.

### Action Required

- **A client, prompt or skill that writes raw columns:** switch to the names the refusal lists, which are the ones `list_resources` and the edit form use.
- **A tool of your own that writes records:** write through the fields — `Avo::Ai::FieldScope#fill` for the assistant, `FieldSupport.write_record!` for the MCP server. See [Bring your own tool](./ai.html#bring-your-own-tool).
- **An `update_using` that isn't safe to run twice** now also runs on chat and MCP writes, as it does on the panel's.

</Option>

## Upgrade to `avo` `4.3.2`

<Option name="Fields pick up `activerecord.attributes` and `attributes` keys">

### Breaking Change

A field with no `name:` and no `translation_key:` now reads the model's attribute translation — `activerecord.attributes.<model>.<attribute>` (parent classes included), then `attributes.<attribute>` — after Avo's own `avo.resource_translations.<resource>.fields.<attribute>` and `avo.field_translations.<attribute>` keys, and before humanizing its id. These are the keys Rails already uses for form labels and error messages, so a localized app gets translated admin labels with no change to its Ruby. See [Localizing fields](./i18n.html#localizing-fields).

Avo's own keys still win, and so do `name:` and `translation_key:`. A `translation_key:` that points at a missing key still falls back to the humanized id, not to the model's translation.

### Action Required

**Grep your locale files** for `activerecord:` and a top-level `attributes:` key. If you have neither, nothing changes. If you do, every field that was showing a humanized id and matches one of those keys now shows the translation instead. Association fields look up the association name (`user`), not the foreign key (`user_id`).

### Maintaining Previous Behavior

Keep one label as it was with `name:` or `translation_key:` on the field, or turn the lookup off for the whole admin:

```ruby
# config/initializers/avo.rb
config.model_attribute_translations = false
```

</Option>

## Upgrade to `avo` `4.3.1`

<Option name="Selected rows come back when you go back to an index">

### Breaking Change

Going back to an index page now puts back the rows you had selected and where you had scrolled. That happens with the browser's Back button and with the **Go back** link on a record page. Reaching the index any other way, or reloading it, starts with nothing selected, and running an action forgets the selection. Before, **Go back** opened the index at the top with nothing selected. See [Coming back to the index](./select-all.html#coming-back-to-the-index).

### Action Required

None in production. Check your system specs: one that selects rows, opens a record, clicks **Go back** and expects nothing to be selected now finds those rows still checked.

</Option>

<Option name="Badges follow `except_on` and `show_on: :all` on forms">

### Breaking Change

A badge can now render a select on <New /> and <Edit />. It still stays off forms by default. Before, a badge was forced off forms after its visibility options ran, so `except_on: :index` or `show_on: :all` left it display-only there. Now a badge follows those options like every other field, and both put the select on forms. See [Editing the value](./fields/badge.html#editing-the-value).

### Action Required

Search your resources for badges declared with `except_on` or `show_on: :all`. Each one now shows a select on <New /> and <Edit />. The select keeps the record's current value, so saving a form doesn't change it.

### Maintaining Previous Behavior

Add `:forms` to `except_on` to keep the badge display-only.

```ruby
# app/avo/resources/project.rb
field :status, as: :badge, except_on: :index, options: {success: "done"} # [!code --]
field :status, as: :badge, except_on: [:index, :forms], options: {success: "done"} # [!code ++]
```

</Option>

<Option name="`?set_locale=` is stored only for an authenticated request">

### Breaking Change

Avo writes `?set_locale=` into `Avo.configuration.locale` only after your [`authenticate_with`](./authentication.html#authenticate-with-method) block lets the request through. Before, the write happened in an `around_action` that ran first, so a request the block rejected still switched the language for **every user** until the server restarted. A controller that skips Avo's authentication altogether can no longer store it either ([#4893](https://github.com/avo-hq/avo/pull/4893)).

### Action Required

None in production. If a link or script outside the admin reached an Avo URL with `?set_locale=` while signed out to set the language, it no longer has any effect — set [`config.locale`](./customization-api.html#locale) for everyone, or let each user pick their own with the [locale selector](./i18n.html#locale-selector).

:::warning
On earlier versions anyone who could reach an Avo URL could change the admin's language for every user, signed in or not. Upgrade rather than working around it.
:::

</Option>

<Option name="`?set_locale=` deprecated, and unknown locales in both locale params are ignored">

### Breaking Change

`?set_locale=` logs a deprecation warning and will be removed in a future version — it has always changed `Avo.configuration.locale` for the whole process, so it switches the language for every user until the server restarts. Both `?set_locale=` and `?force_locale=` now ignore a value missing from `I18n.available_locales` and move on to the next source. Before, an unknown `set_locale` was stored globally and made `I18n.with_locale` raise `I18n::InvalidLocale` on every later request. See [Setting the locale](./i18n.html#setting-the-locale).

### Action Required

A request carrying a locale your app doesn't list now keeps the configured locale instead of switching, so a spec that asserted a bogus `?force_locale=` renders in that locale needs updating. Everything else keeps working; the warning in the logs is the only new signal.

### Steps to Update

Grep your links, bookmarks and specs for `set_locale`. To change the language for everyone, set it in the initializer; to let each user choose, use the [locale selector](./i18n.html#locale-selector), which stores the choice per browser.

```ruby
# config/initializers/avo.rb
config.locale = :"pt-BR"
```

</Option>

## `avo-mcp_server`: a shipped `count_records` tool

<Option name="An app's own `count_records` tool is no longer served">

### What changed

The server ships a tenth tool, `count_records`, which answers "how many" with a number and no records. See [Tools](./mcp-api.html#tools).

### Action Required

Nothing, unless the app registers its own tool named `count_records` through [`extra_tools`](./mcp-api.html#extra_tools), including a subclass of Avo AI's count tool. The shipped tool now takes that name and the app's is dropped with a log line. Give the app's tool another name to keep serving it.

</Option>

## `avo`: forms ask before you leave with unsaved changes

<Option name="`warn_on_unsaved_changes` is on by default">

### What changed

Avo now asks for confirmation before a user leaves a `New` or `Edit` form with unsaved changes. Saving never asks, and a change that was undone does not count. See [`config.warn_on_unsaved_changes`](./resources-api.html#config.warn_on_unsaved_changes).

### Action Required

None in production. Check your system specs: one that changes a form and then navigates away without saving now meets the confirmation dialog. There are two ways to handle it:

- Accept the dialog in those specs with `accept_custom_alert` from the [testing helpers](./testing.html#testing-helpers).
- Turn the warning off in the test environment only, and keep it on everywhere else.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # Off in the test environment, on everywhere else.
  config.warn_on_unsaved_changes = !Rails.env.test?
end
```

:::info
With the warning off in tests, your specs no longer go through what your users see when they leave a form.
:::

### Maintaining Previous Behavior

Turn it off in every environment.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.warn_on_unsaved_changes = false
end
```

</Option>

## Built-in neutral themes now share one lightness curve

<Option name="Built-in neutral presets keep their tint but use a consistent surface hierarchy">

### What Changed

Slate, Stone, Gray, Zinc, Neutral, Taupe, Mauve, Mist, and Olive now use Brand's lightness at every shade while preserving their original hue and chroma. Dark primary surfaces are also slightly softer. Navbar text continues to use each named preset's original 300 shade for contrast.

Custom palettes supplied through [`neutral_colors`](./appearance-api.html#neutral_colors) are unchanged.

### Action Required

None, unless custom CSS depends on the previous built-in shade values. Review overrides that use `--color-avo-neutral-*` while a named preset is active, and use the [public appearance variables](./appearance-api.html#css-variables) when a surface needs a fixed color.

</Option>

## Field authorization: `avo-authorization` 4.2.1

<Option name="Nothing to add to your policies">

### What changed

A Pundit policy can now name which of a resource's fields a user may reach, with `whitelisted_fields` and `blacklisted_fields`, and every Avo surface honors the answer for reads and writes. See [Field authorization](./authorization.html#hide-fields-from-a-user).

### Action Required

None. Field lists are opt-in: a policy that declares neither restricts nothing, whether `explicit_authorization` is on or off. Behavior changes only once a policy declares a list.

Release `avo-authorization` 4.2.1 together with, or before, `avo-ai` 4.2.0.beta.6 and `avo-mcp_server` 4.2.0.beta.9. Both call code that only 4.2.1 ships.

</Option>

## `avo-api` 4.2.7: `visible:` hides a field from the API too

<Option name="A field whose visible: proc answers false is no longer serialized">

### What changed

The API used to check only a field's `show_on` / `hide_on` options, so a field a `visible:` proc hid from a user in the panel was still in that user's API payload. It is now left out, the same as in the panel.

A failed create, update or delete no longer names a field a policy withholds from the token's owner in `errors`. The failure is reported on `base` instead.

### Action Required

Nothing, unless an API client reads a field that a `visible:` proc hides from the token's owner. Make the proc answer `true` for that user, or the field stays out of the payload.

</Option>

## `avo-ai` 4.2.0.beta.6: the chat reads through the resource's fields

<Option name="A column no field declares is no longer reachable from the chat">

### What changed

The assistant used to read, filter, sort, group and search any column on the model, except password- and token-shaped ones. It now goes through the resource the way the panel does. A column is reachable only when a field the user may reach claims it, and associations are traversed only through an association field. A column no field declares is not returned, filtered, sorted, grouped, searched, written, imported, or named in a schema or an inspector report.

Three things the panel exposes without a field still count:

- **`discreet_information`:** the timestamps and id a resource lists there are readable.
- **`created_at`:** it stays a sort key whenever the column exists.
- **`extra_params`:** the columns a resource opens there are writable.

A model with no Avo resource is never queried or described, and an association check through one is refused.

### Action Required

Declare a field for every column the chat should work with. A field only one role should see still takes a `visible:` proc or, with `avo-authorization`, a policy field list. See [How the assistant works](./ai.html#how-the-assistant-works).

</Option>

## `avo-mcp_server` 4.2.0.beta.9: sorting and errors follow the resource's fields

<Option name="Clients sort by field columns, and errors name only what the admin may see">

### What changed

- **Sorting:** `list_records` sorts only by a column behind a field the admin may reach, or by `created_at`. Any other `sort_by` is refused, with the sortable columns listed.
- **Validation errors:** failed writes name only attributes within the admin's reach. This covers the messages, `requiredAttributes`, `optionalAttributes` and `missingRequiredAttributes`. The server log records which attributes were dropped.
- **`update_record`:** its `changed` list names only readable columns.

### Action Required

Nothing, unless a client sorts by a column with no field. Declare a field for it. See [The MCP server](./mcp.html).

</Option>

## `avo-ai`: the composer limits what it uploads

<Option name="Files over 25 MB, and types the assistant can't use, are refused">

### What changed

The chat composer used to upload any file. It now takes images (PNG, JPEG, GIF, WebP), PDFs and text files — markdown, plain text, CSV, TSV, JSON — up to 25 MB, and refuses anything else as it is added, before it uploads, with a line under the draft saying why. A message sent without the composer is held to the same rule: a file it would have refused is left off the message.

### Action Required

Nothing, unless people upload other files — say, Word documents or videos to attach to records. Allow them under `config.ai.uploads`; see [What the composer accepts](./ai.html#what-the-composer-accepts).

```ruby
config.ai.uploads = {accept: ["*/*"], max_size: 100.megabytes} # [!code highlight]
```

</Option>

<Option name="Protect Rails' direct-upload endpoint">

### What changed

Nothing in Avo — this was always true. The composer uploads through `POST /rails/active_storage/direct_uploads`, which Rails ships without authentication, and the new limits don't cover a request that goes straight to it.

### Action Required

Add your app's authentication and a size check to that endpoint: [Protect the direct-upload endpoint](./ai.html#protect-the-direct-upload-endpoint).

</Option>

## `avo-ai`: records are named by `to_param`

<Option name="Records are named by to_param, not their primary key">

### What changed

The assistant names every record the way Avo's own URLs do: by `to_param`. On a resource that hides its primary keys behind friendly_id, a hashid gem, or its own `to_param`, the slug now appears in the system prompt, in record labels (`Hello world (#hello-world)`), in chip and card links, and in the `reference` the tools hand the model. The tools look an id up through the resource's `find_record_method`, and still accept a primary key. Their `id` parameters are strings.

Resources that keep Rails' default `to_param` see no difference.

### Action Required

Nothing, unless you replaced part of the assistant with your own copy. Check each of these:

- **An ejected `attached_context.txt.erb`.** Name records by `attached_record[:record_param]` and each selected record's `record_param`, not `record_id`, or your prompt keeps the primary key. See [Change how it reads](./ai.html#change-how-it-reads).
- **An ejected write tool** (`update_record`, `delete_record`, `update_records`, `run_action`, `active_storage_attachment`). The model now passes a slug. Look it up with `find_authorized_record_by_param`, and declare the `id` parameter as a string. Diff your copy against the gem's.
- **A tool of your own that returns a `reference`.** Build it from `record.to_param`. A reference built from `record.id` on a slugged resource no longer renders as a chip. See [Bring your own tool](./ai.html#bring-your-own-tool).

</Option>

## Upgrade to `avo-ai` 4.2.0.beta.4

<Option name="Batch updates are undone as one change: run the installer again">

### What changed

The assistant can now [change many records in one confirmation](./ai-what-you-can-ask.html) with the new `update_records` tool, and undo the whole batch from one card. Undo knows which records belong to a batch through a new column, `avo_ai_write_logs.pending_write_id`. A **first** install gets it in the create migration; an app that installed an earlier version does not have it.

### Action Required

```bash
bin/rails generate avo:ai install
bin/rails db:migrate
```

The installer reads your `db/migrate` and writes only the migrations you are missing, so running it again is safe.

Until you migrate nothing breaks: batch updates still work, but the history lists and undoes a batch record by record instead of as one entry.

</Option>

<Option name="A new write tool arrives switched on: update_records">

### What changed

`update_records` is a new shipped tool, and `config.ai.excluded_tools` is a list of what to remove, so every app gets it unless it names it. It writes nothing without the user's click on a confirmation card, under the same policies and field rules as `update_record`.

### Action Required

Nothing, unless your initializer excludes `update_record` to keep the assistant from editing records. Exclude the new tool too, or it can still update them in batches:

```ruby
config.ai.excluded_tools = [:update_record, :update_records] # [!code focus]
```

A batch is capped at 50 records. To change that, set `config.ai.max_update_records` to a number from 1 to 500; anything else raises at boot.

</Option>

<Option name="Typing a confirmation with several cards on screen confirms nothing">

### What changed

A typed "do it" used to confirm the last card when one reply had put several on screen. It now confirms none of them and goes to the assistant as an ordinary message, since it cannot tell which card you meant. With one card waiting, a typed confirmation now also still reaches it after the assistant has only reminded you to click.

### Action Required

Nothing. Click **Confirm** on the card you want.

</Option>

## Upgrade to `avo-audit_logging` 4.3.0

<Option name="Activities record where they came from — run the installer again">

### What changed

An activity now carries an **origin**: `origin`, a short name for whatever acted, and the optional `origin_record` pointing at the thing itself. A change made in the panel has none. A change made through an [MCP connection](./mcp.html#trace-changes-back-to-a-connection), an [API token](./rest-api.html#see-what-a-token-changed) or an [Avo AI chat](./ai.html#tracing-what-it-changed) is marked `mcp_connection`, `api_token` (or `api`) and `ai_chat`, and links back to it — a record's timeline reads *Ada Lovelace through MCP connection*. Until this version an MCP client's changes were deliberately indistinguishable from the admin's own.

The two columns are a new migration. A **first** install writes one migration with them included; an app that installed an earlier version has the table without them.

### Action Required

```bash
bin/rails generate avo:audit_logging upgrade
bin/rails db:migrate
```

`upgrade` reads your `db/migrate` and writes only what is missing — it never touches a migration you have already run. Running `install` again does the same thing.

Until you migrate, nothing breaks: activities keep being recorded, just without an origin, and the **Audit trail** table on a connection's, token's or chat's page is not offered rather than shown empty.

If you have written `Avo::AuditLogging::Activity` yourself — an importer, a job — you can mark those too; see [Mark your own origins](./audit-logging.html#mark-your-own-origins).

</Option>

<Option name="The audit log is off limits to MCP clients, API tokens and the assistant">

### What changed

`Avo::AuditLogging::Activity` is no longer offered as a resource through `avo-mcp_server`'s tools, `avo-api`'s routes and entitlements grid, or the Avo AI assistant, whatever your policies say. An agent or a credential that could delete the record of what it just did would make the log worthless.

### Action Required

Nothing, unless a client of yours was reading `/api/resources/avo_activities` or asking the assistant about activities — those now answer as if the resource did not exist. Read the audit log in the panel instead.

</Option>

## Upgrade to 4.3.0

<Option name="`avo-api` token scopes are now called entitlements">

### Breaking Change

"Scope" already means a policy scope in Avo and an ActiveRecord scope in every app running it, so what an API token is allowed to reach is called an **entitlement** from 4.3.0 on. 4.2.0 is the only version that shipped it under the old name.

The rename reaches the database column, the panel, the `403` body, and the token policy method:

| 4.2.0 | 4.3.0 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `avo_api_tokens.scopes` column | `avo_api_tokens.entitlements` |
| `token.scopes` | `token.entitlements` |
| `edit_scopes?` on your token policy | [`edit_entitlements?`](./rest-api.html#who-may-change-entitlements) |
| `"reason": "token_scope"` in a `403` | `"reason": "token_entitlement"` |
| `scopes_grid` in a form post | `entitlements_grid` |
| The **Scopes** panel | The [**Entitlements**](./rest-api.html#entitle-a-token) panel |

### Action Required

Re-run the tokens generator and migrate. It writes `RenameAvoApiTokenScopes` and skips the create migration you already have:

```bash
rails generate avo_api:tokens
rails db:migrate
```

Then grep your app for the left-hand column above. Two are worth checking before the others:

- **`edit_scopes?` on your token policy.** Nothing asks that method any more, so the question falls back to the [permissive default](./rest-api.html#who-may-change-entitlements) and every panel user may edit entitlements. Rename it.
- **A client branching on `"reason": "token_scope"`.** It now reads `"token_entitlement"` and a branch matching the old string falls through.

Nothing grants or revokes anything on its own: the migration renames a column and every stored grant is carried over untouched.

</Option>

## Upgrade to 4.2.0

<Option name="`super` in a `setup_authentication` override now accepts a valid API token">

### Breaking Change

`avo-api` ships [API tokens](./rest-api.html#authentication). The default `setup_authentication` on `BaseResourcesController` used to raise, closing the API until you replaced it. It now **accepts a request carrying a valid API token**, authenticated as that token's owner, and rejects everything else.

That changes what `super` means inside an existing override.

### Action Required

Grep `app/controllers/avo/api/` for `setup_authentication` and check every override that calls `super`. An override that never calls it is unaffected.

Drop the `super` call to opt out of tokens entirely and leave your own scheme in sole charge:

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
def setup_authentication
  super # [!code --]
  authenticate_with_my_scheme!
end
```

Keep it to accept tokens alongside your scheme — but note a token then reaches everything its owner reaches, since [a token acts as its owner](./rest-api.html#a-token-acts-as-its-owner).

</Option>

<Option name="`avo-api` now ships a migration">

### Breaking Change

The tokens table is new, and the token resource appears in the Avo sidebar by default as soon as the gem is upgraded — before the table exists.

### Action Required

You are already running the API, so your app has the controllers and needs only the table:

```bash
rails generate avo_api:tokens
rails db:migrate
```

Until you do, opening the **API tokens** screen, or sending any request with an `Authorization: Bearer …` header, queries a table that isn't there and errors. Running the generator twice is a no-op rather than an error.

Reach for `rails generate avo_api:install` only on a **first** install — it invokes `avo_api:generate` as well, which regenerates every resource controller and asks to overwrite the ones you have customized. `avo_api:tokens` is the upgrade path and leaves them alone.

If you don't want tokens at all, [replace the authentication hook](./rest-api.html#bring-your-own-authentication) so the token lookup never runs.

</Option>

<Option name="A denied policy method answers `403` JSON instead of a `302` redirect">

### Breaking Change

Policy *methods* (`index?`, `update?`, …) returning `false` raise `Avo::NotAuthorizedError`, which Avo handled with a flash message and a redirect to your root URL — right for the HTML panel, unreadable for a JSON client. The API now renders JSON instead:

```json
{ "error": "Forbidden", "reason": "policy" }
```

A [token scope refusal](./rest-api.html#tell-the-three-refusals-apart) is also a `403`, and `reason` is what tells the two apart.

**Action required:** None for most apps — this replaces a redirect no API client could act on. Two cases to check:

- **A client that read the `302` as "denied"** now gets a `403`. One that followed the redirect and parsed the resulting HTML now gets JSON.
- **A `rescue_from Avo::NotAuthorizedError` you added to your own `BaseResourcesController`** still wins over the gem's, so your response shape is unchanged. Delete it to adopt the gem's, or keep it.

</Option>

<Option name="Tokens can now be scoped, and are unrestricted until they are">

### Breaking Change

None — this is additive. Existing tokens carry no grants, and a token with no grants [reaches everything its owner can](./rest-api.html#entitle-a-token), exactly as before.

**Action required:** None. Worth knowing before you use it: granting a token *anything* restricts it to what you granted, including against resources you deploy later, and removing the last grant leaves a token that refuses everything rather than one that is unrestricted again. **Make unrestricted** in the token's panel is the way back.

Editing grants is gated by a policy method, which — like every other token policy method — [answers yes when no authorization client is configured](./rest-api.html#who-may-change-entitlements).

:::info Renamed in 4.3.0
This shipped as **Scopes**, with an `edit_scopes?` policy method. Both are called *entitlements* from 4.3.0 on — see [Upgrade to 4.3.0](#upgrade-to-4-3-0).
:::

</Option>

## Upgrade to 4.1.15

<Option name="`container_width` values renamed to Tailwind's scale">

### Deprecation

`config.container_width` (and `self.container_width` on Avo Forms pages and forms) used the
words `:large` and `:small`, while every other size option in Avo uses Tailwind's scale —
`size: :sm`, `width: :xl`, `size: :md`. The widths now use that scale too:

| Before   | After |
| -------- | ----- |
| `:large` | `:lg` |
| `:small` | `:md` |
| `:full`  | `:full` (unchanged) |

`:small` became `:md` rather than `:sm` deliberately: it keeps every existing screen at
the width it already had, and frees the narrower names. A new `:sm` (720px, clamping from
768px) ships in the same release for single-column screens — nothing gets it
automatically, it is opt-in.

### Action Required

**None immediately.** The old names are still accepted and mapped for you — they log a
deprecation warning through `Avo.logger` and will be removed in Avo 5. Update them when
convenient:

```ruby
# config/initializers/avo.rb
config.container_width = :small                     # [!code --]
config.container_width = :md                        # [!code ++]

config.container_width = { index: :large }          # [!code --]
config.container_width = { index: :lg }             # [!code ++]
```

```ruby
# app/avo/pages/settings.rb
self.container_width = :large                       # [!code --]
self.container_width = :lg                          # [!code ++]
```

**If you style Avo's container in your own CSS**, this part is *not* aliased — the emitted
class names changed and your overrides need renaming:

| Before                  | After              |
| ----------------------- | ------------------ |
| `.container-large`      | `.container-lg`    |
| `.container-small`      | `.container-md`    |
| `.container-full-width` | `.container-full`  |

</Option>

## Upgrade to 4.1.11

<Option name="`stacked: false` now opts a field out of sidebar and width stacking">

### Breaking Change

A field declared `stacked: false` used to be ignored in the places Avo stacks on its own — inside a `sidebar`, in the record preview, and on any field with a `width` below `100`. The field's own declaration now wins over those defaults, so such a field renders inline. See [`stacked`](./field-options-api.html#stacked).

### Action Required

**If you never pass `stacked: false`**, nothing changes — the defaults are untouched.

**If you do**, the fields that carry it move from stacked to inline. Drop the option to keep them stacked.

```ruby
# app/avo/resources/user.rb
field :name, as: :text, stacked: false # [!code --]
field :name, as: :text # [!code ++]
```

</Option>

## Upgrade to `avo-calendar` `4.0.3`

<Option name="`+N more` no longer opens the week view">

In the month view, the **+N more** toggle under a crowded day now expands that week row in place to reveal every event, with a **Show less** control to fit it back. It previously navigated to that day's week view. See [Read a crowded day](./calendar-view.html#read-a-crowded-day).

**Action required:** None — the behavior change is visual only, and the week view stays one click away in the header's Month/Week toggle.

</Option>

<Option name="Week view becomes a scrollable time grid">

Hour-based events now stretch to their duration — overlapping events share the day column side by side — instead of rendering as fixed chips on their start hour, and the grid scrolls inside the viewport, opening at 07:00 under a pinned day-header row. See [Month and week views](./calendar-view.html#month-and-week-views).

**Action required:** None — the change is visual only. An event without an `ends_at` renders as a one-hour block.

</Option>

## Upgrade to 4.1.10

<Option name="`code` and `easy_mde` collapse their content on `Show`">

The `code` and `easy_mde` fields now render on the <Show /> view through the same collapsible wrapper the rich text fields use: the value is clipped to a short, faded preview with a **More content** link that expands it and a **Less content** link that collapses it back. They previously rendered the full value.

**Action required:** None unless you want the full value visible on load. Pass `always_show: true` on the field to skip the collapsing:

```ruby
# app/avo/resources/product.rb
field :custom_css, as: :code, always_show: true # [!code ++]
```

See [WYSIWYG & Markdown editors](./fields.html#wysiwyg-markdown-editors) for the behavior every editor field now shares.

</Option>

<Option name="Editors render in a bounded, resizable viewport on forms">

On <Edit /> and <New />, every editor field (`trix`, `rhino`, `lexxy`, `markdown`, `easy_mde`, `tip_tap` and `code`) now renders inside a viewport that opens 20rem tall, scrolls its overflow, and can be dragged taller or shorter by its bottom-end handle. Editors previously grew with their content. Each height is stored in the browser's local storage and restored the next time that form renders.

**Action required:** None. If the default size doesn't suit your content, set the heights globally in a [stylesheet you register with Avo](./asset-manager):

```css
/* app/assets/stylesheets/avo_custom.css */
:root {
  --avo-resizable-editor-default-height: 30rem; /* [!code ++] */
  --avo-resizable-editor-min-height: 15rem; /* [!code ++] */
}
```

Note that the `code` field's [`height`](./fields/code.html#height) option now only applies on the <Show /> view — on forms the viewport's height wins.

</Option>

## Upgrade to 4.1.7

<Option name="`config.visible` now controls Media Library access, not just the menu item">

### Breaking Change

`Avo::MediaLibrary.configuration.visible` used to hide the sidebar item and the rich text editor button while leaving every Media Library route reachable by URL. It is now enforced on the routes as well: a user the block returns `false` for gets a 404 from `/media-library` and `/attach-media`.

This closes [GHSA-cff8-4h3c-9r4q](https://github.com/avo-hq/avo/security/advisories/GHSA-cff8-4h3c-9r4q), where any authenticated Avo user could browse, rename and permanently delete every Active Storage blob in the application.

### Action Required

**If you set `config.visible`**, check that it returns `true` for everyone who is meant to use the Media Library, including through the rich text editors. Anyone it rejects now loses access entirely rather than only losing the menu item.

**If you don't set it**, nothing changes on upgrade — `visible` defaults to `true`. That also means the Media Library stays available to every user who can sign in to Avo, so set it if that isn't what you want:

```ruby
# config/initializers/avo.rb
if defined?(Avo::MediaLibrary)
  Avo::MediaLibrary.configure do |config|
    config.visible = -> { Avo::Current.user.is_developer? }
  end
end
```

</Option>


Migrating to TailwindCSS 4? See the [TailwindCSS 4 Migration Guide](./tailwind-4-migration).

## Upgrade to `avo-dashboards` and `avo-scopes` `4.1.2`

<Option name="Cards, dashboards, and scopes resolve their labels from locale keys first">

### Breaking Change

Cards, dashboards, and scopes now derive an i18n key from their class path and look it up **before** falling back to the class attribute, the same way [resources and actions](./i18n.html#how-avo-resolves-a-label) already did:

| Class     | Key Avo looks up                       | Options under it                          |
| --------- | -------------------------------------- | ----------------------------------------- |
| Card      | `avo.card_translations.<class_path>`      | `label`, `description`, `discreet_description` |
| Dashboard | `avo.dashboard_translations.<class_path>` | `name`, `description`                     |
| Scope     | `avo.scope_translations.<class_path>`     | `name`, `description`                     |

If your locale files already define one of those keys, it now wins over `self.label`, `self.name`, or `self.description` — **including when the attribute is a lambda**. The lambda isn't called at all, so anything it computed is dropped, with nothing in the logs.

:::warning A lambda that reads the same key stops running
This bites hardest when the attribute builds a string around the very key Avo now derives:

```ruby
# app/avo/cards/upcoming_metric.rb
self.description = -> {
  I18n.t("avo.card_translations.upcoming_metric.description") + " (#{timeframe})"
}
```

Avo finds `avo.card_translations.upcoming_metric.description`, renders it verbatim, and the ` (#{timeframe})` suffix disappears.
:::

### Action Required

**Grep your locale files** for `card_translations`, `dashboard_translations`, and `scope_translations`. Avo ships nothing under those roots, so if you weren't using them there's nothing to do — a missing key still falls through to your class attribute exactly as before.

If you were using them for your own `I18n.t` lookups, pick one of the three ways out below.

### Steps to Update

**1. Move your own key out of the derived namespace.** The cleanest fix when the class attribute has to keep computing something:

```yaml
# config/locales/avo.en.yml
en:
  avo:
    card_translations:
      upcoming_metric:
        description: Forecasted revenue based on current bookings # [!code --]
        description_text: Forecasted revenue based on current bookings # [!code ++]
```

```ruby
# app/avo/cards/upcoming_metric.rb
self.description = -> {
  I18n.t("avo.card_translations.upcoming_metric.description") + " (#{timeframe})" # [!code --]
  I18n.t("avo.card_translations.upcoming_metric.description_text") + " (#{timeframe})" # [!code ++]
}
```

**2. Point Avo's lookup somewhere else.** `self.translation_key` moves the derived key and leaves your own `I18n.t` call untouched:

```ruby
# app/avo/cards/upcoming_metric.rb
class Avo::Cards::UpcomingMetric < Avo::Cards::MetricCard
  self.translation_key = "avo.card_translations.upcoming_metric_chrome" # [!code ++]
end
```

**3. Override at the registration site.** A value passed to `card` beats the locale key, so one registration can keep a computed description while the others stay translated:

```ruby
# app/avo/dashboards/dashy.rb
card Avo::Cards::UpcomingMetric, description: -> { "#{I18n.t("...")} (#{timeframe})" }
```

Actions have no registration site, so only the first two apply there — see [Upgrade to 4.0.17](#upgrade-to-4-0-17).

See [the key map](./i18n.html#key-map) for every key Avo derives.

</Option>

## Upgrade to 4.1.4

<Option name="The back to top pill is enabled by default">

### Breaking Change

The ["Back to top" pill](./customization.html#send-the-user-back-to-the-top) used to be off by default and only revealed itself when the user scrolled back up. It's now **on by default** and its visibility depends only on how far down the page is scrolled, not on the scroll direction. The [`threshold`](./customization-api.html#back_to_top) default moved from `64` to `400` pixels so the pill stays out of the way on short scrolls.

**Action required:** None, unless you don't want the pill in your app. Every app that doesn't configure `back_to_top` gets it after this upgrade ([#4705](https://github.com/avo-hq/avo/pull/4705)).

### Maintaining Previous Behavior

Turn it off from the initializer. Keys you leave out fall back to the defaults, so `enabled` is enough:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.back_to_top = {enabled: false} # [!code ++]
end
```

The direction-aware reveal is gone for good — `threshold` is now the only thing that decides when the pill shows up.

</Option>

<Option name="`use_browser_timezone` now defaults to `true`">

### Breaking Change

Server-side dates and times now render in [each visitor's own time zone](./customization.html#time-and-currency) by default instead of the app's `Time.zone`. Avo detects the browser's zone via a cookie; the first page a browser loads soft-reloads once through Turbo and shows a one-time alert that times are now displayed in the visitor's zone.

**Action required:** None if per-visitor times are what you want — most apps do. Displayed values only change for users whose browser zone differs from the app zone; nothing about stored data changes.

Since `4.1.8` the option defaults to `false` in the test environment, so browser/system tests are unaffected — the first-load soft reload would otherwise race them. On `4.1.4` through `4.1.7` it is on in test as well; set `config.use_browser_timezone = !Rails.env.test?` if you stay on one of those and your system specs started flaking.

### Maintaining Previous Behavior

Pin every visitor to the app's configured zone:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.use_browser_timezone = false # [!code ++]
end
```

</Option>

## Upgrade to `avo-dashboards` `4.0.9`

<Option name="The per-card refresh control is opt-in">

### Breaking Change

`avo-dashboards` `4.0.8` rendered a [refresh control](./cards.html#refresh-a-card-on-demand) on every card, with no way to remove it — including on `html` and static `partial` cards, where refreshing re-renders identical content. The control is now off by default and turns on per card with [`refresh_button`](./cards-api.html#self.refresh_button), the same name and the same default as the [dashboard-wide control](./dashboards-api.html#self.refresh_button) that shipped alongside it.

**Action required:** None unless you were on `4.0.8` and want the control kept on a card.

### Maintaining Previous Behavior

Turn it back on for each card that should keep it:

```ruby
# app/avo/cards/users_metric.rb
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.refresh_button = true # [!code ++]
end
```

Setting it on a dashboard does not turn it on for that dashboard's cards — the two controls are independent opt-ins under the same name.

</Option>

## Upgrade to 4.0.20

<Option name="Sidebar labels truncate instead of wrapping">

### Breaking Change

The sidebar is now [resizable](./customization.html#resizable-sidebar), and as part of that change sidebar link, section, and group labels render on a single line with an ellipsis when they overflow, instead of wrapping onto multiple lines. The full label shows in a tooltip on hover.

**Action required:** None for most apps. If your navigation relied on long labels wrapping, either shorten the labels or point users at the drag handle to widen the sidebar.

Hosts with an accessibility conformance obligation can disable the drag handle. The off-switch was `config.sidebar_resizable` on `4.0.20` and `4.0.21`; from `4.0.22` it moved into the grouped config as [`sidebar[:resizable]`](./customization-api.html#sidebar) and the old name no longer works.

</Option>

<Option name="`.container-small` is now `max-width`-based">

### Breaking Change

`.container-small` (the wrapper around show and edit pages) used a fixed width; it now fills its container up to a `max-width` so content adapts when the sidebar is wide. If you override `.container-small`'s `width` from your own stylesheets, the new Avo-owned `max-width` now clamps it — override `max-width` instead.

**Action required:** None unless you override `.container-small`.

</Option>

## Upgrade to 4.0.18

<Option name="Resource and field translations are used verbatim">

### Breaking Change

Avo used to humanize every resource and field label it resolved from your locale files. That silently overrode the casing you wrote: `'Payment Intent ID'` rendered as `Payment intent id`, and `'API Products'` rendered as `Api products`.

Avo now renders a resolved translation exactly as written and humanizes only the name it generates for you when no translation is found.

:::warning Lowercase translations now render lowercase
If your locale entries are lowercase, they used to appear capitalized. They will now appear as written.
:::

### Action Required

**Review your locale files.** If every `resource_translations` and `field_translations` entry is already written the way you want it on screen, there's nothing to do.

Avo's own interface strings are unaffected — the "New", "Edit", and "View" labels still render as before.

### Steps to Update

Grep your locale files for `resource_translations` and `field_translations`, and capitalize any entry you want capitalized on screen:

```yaml
# config/locales/avo.pt-BR.yml
pt-BR:
  avo:
    resource_translations:
      user:
        zero: 'usuários' # [!code --]
        one: 'usuário' # [!code --]
        other: 'usuários' # [!code --]
        zero: 'Usuários' # [!code ++]
        one: 'Usuário' # [!code ++]
        other: 'Usuários' # [!code ++]
    field_translations:
      file:
        zero: 'arquivos' # [!code --]
        one: 'arquivo' # [!code --]
        other: 'arquivos' # [!code --]
        zero: 'Arquivos' # [!code ++]
        one: 'Arquivo' # [!code ++]
        other: 'Arquivos' # [!code ++]
```

Nothing else changes: resources and fields without a translation still fall back to the humanized class or attribute name.

See [Localization (i18n)](./i18n) for the full picture.

</Option>

## Upgrade to 4.0.17

<Option name="Action labels resolve from `avo.action_translations` first">

### Breaking Change

Actions now look up `avo.action_translations.<class_path>.{name,message,confirm_button_label,cancel_button_label,description}` **before** falling back to `self.name`, `self.message`, `self.confirm_button_label`, `self.cancel_button_label`, and `self.description`, mirroring how resources already resolved their names.

If your locale files already define one of those keys, it now wins over the class attribute — **including when the attribute is a lambda**, which is then never called, so anything it computed is dropped with nothing in the logs.

### Action Required

**Grep your locale files for `action_translations`.** Avo ships nothing under that root, so if you weren't using it nothing changes: an action with no key still renders its class attribute, and an action with neither still renders its humanized class name.

### Steps to Update

If a key you own collides with an action's derived key, either rename your key, or point Avo's lookup elsewhere with `self.translation_key`:

```ruby
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.translation_key = "avo.action_translations.toggle_inactive_chrome" # [!code ++]
end
```

`avo-dashboards` and `avo-scopes` got the same treatment in their `4.1.2` releases — see [that section](#upgrade-to-avo-dashboards-and-avo-scopes-4-1-2).

See [Localizing actions](./i18n.html#localizing-actions) for the full picture.

</Option>
