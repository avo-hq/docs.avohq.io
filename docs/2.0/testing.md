# Testing

:::info
We are aware that the testing guides aren't very
:::

Testing is an important aspect of your app. Most Avo DSLs are Ruby classes, so regular testing methods should apply.

## Testing Actions

Given this `DummyAction`, this is the `spec` that tests it.

```ruby
class DummyAction < Avo::BaseAction
  self.name = "Dummy action"
  self.standalone = true
  self.visible = ->(resource:, view:) do
    if resource.is_a? UserResource
      view == :index
    else
      true
    end
  end

  def handle(**args)
    # Do something here

    succeed "Success response ✌️"
    warn "Warning response ✌️"
    inform "Info response ✌️"
    fail "Error response ✌️"
  end
end
```

```ruby
require 'rails_helper'
RSpec.feature DummyAction, type: :feature do
  let(:user) { create :user }
  let(:current_user) { user }
  let(:resource) { UserResource.new.hydrate model: user }

  it "tests the dummy action" do
    args = {
      current_user: current_user,
      resource: resource,
      models: [user]
    }

    action = described_class.new(model: user, resource: resource, user: current_user, view: :edit)

    expect(action).to receive(:succeed).with "Success response ✌️"
    expect(action).to receive(:warn).with "Warning response ✌️"
    expect(action).to receive(:inform).with "Info response ✌️"
    expect(action).to receive(:fail).with "Error response ✌️"

    action.handle **args
  end
end
```
