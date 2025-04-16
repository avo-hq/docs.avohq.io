# Custom errors

Actions such as create, update, attach, etc... will not be completed if the record contains any errors. This ensures that only valid data is processed and saved, maintaining the integrity of your application. Custom validations can be added to your models to enforce specific rules and provide meaningful error messages to users.

## Adding Custom Errors

To add custom errors, you can define a validation method in your model. If the validation fails it adds an error to the record. These errors will prevent the action from completing and will be displayed as notifications to the user.

## In a Simple Record

Consider a simple `User` model where you want to enforce a custom validation rule, such as ensuring that the user's age is over a certain value.

```ruby
# app/models/user.rb
class User < ApplicationRecord
  validate :age_must_be_over_18

  private

  def age_must_be_over_18
    # Add a custom error to the record if age is less than 18.
    if age < 18
      errors.add(:age, "must be over 18.")
    end
  end
end
```

In this example, the `age_must_be_over_18` method checks if the user's age is less than 18. If so, it adds an error to the `age` attribute with a custom message. This error prevents any further Avo action on the record and notifies the user of the issue.

## In a Join Table

Consider a join table `TeamMembership` which links `Team` and `User` models. You might want to add a custom validation to ensure some business logic is enforced.

```ruby
# app/models/team_membership.rb
class TeamMembership < ApplicationRecord
  belongs_to :team
  belongs_to :user

  validate :custom_validation

  private

  def custom_validation
    if user.banned?
      errors.add(:user, "is banned.")
    end
  end
end
```

In this example, the `custom_validation` method is called whenever a `TeamMembership` record is validated. If the conditions in this method are not met, an error is added to the `user` attribute with a custom message. This error prevents any further Avo action on the record and notifies the user of the issue.
