---
license: community
outline: [2, 3]
---

# Custom errors

Actions such as create, update, and attach won't complete if the record is invalid. Avo runs your model's validations on every write, so any error you add through the standard `ActiveModel` API — a `validate` method, a `validates` rule, or `errors.add` — stops the action and is surfaced back in the UI. This lets you enforce business rules and give users meaningful messages without any Avo-specific configuration.

With no custom validations, Avo simply saves the record. The moment a validation adds an error, the write is aborted and the error is shown.

## Add a custom error

Define a validation in your model and add an error when a rule is broken. Consider a `User` model that must reject anyone under 18:

```ruby
# app/models/user.rb
class User < ApplicationRecord
  validate :age_must_be_over_18

  private

  def age_must_be_over_18
    errors.add(:age, "must be over 18.") if age.to_i < 18
  end
end
```

When the validation fails, Avo cancels the create/update and shows the message. Because the error is attached to the `age` attribute, it renders inline under the `age` field on the form.

### Errors on a join record

Validations on join models are enforced the same way when you attach through an association. Consider a `TeamMembership` join table linking `Team` and `User`:

```ruby
# app/models/team_membership.rb
class TeamMembership < ApplicationRecord
  belongs_to :team
  belongs_to :user

  validate :user_not_banned

  private

  def user_not_banned
    errors.add(:user, "is banned.") if user.banned?
  end
end
```

If the rule fails during an attach, Avo aborts the operation and copies the join record's error onto the record you're editing so it's shown in the UI.

## Where errors appear

How an error surfaces depends on the attribute you attach it to:

- **Attribute errors** — `errors.add(:age, "…")` renders inline under the matching field on the form.
- **Base errors** — `errors.add(:base, "…")` (and any error whose attribute has no field on the form) renders as an alert banner at the top of the view.

Avo also catches exceptions raised outside validation during a save or destroy — a foreign-key constraint on delete, or a failure in an `after_save` callback, for example. The exception message is added as a `:base` error and shown as an alert, so the action fails gracefully instead of 500-ing.

:::info Developer backtrace
When a non-validation exception is caught, developers additionally see the full backtrace in the alert. This is gated on `Avo::Current.user_is_developer?`, so end users only ever see the message.
:::
