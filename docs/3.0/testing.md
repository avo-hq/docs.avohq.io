---
feedbackId: 1168
---

# Testing

:::info
We know the testing guides aren't very detailed, and some testing helpers are needed. So please send your feedback [here](https://github.com/avo-hq/avo/discussions/1168).
:::

Testing is an essential aspect of your app. Most Avo DSLs are Ruby classes, so regular testing methods should apply.

## Testing Actions

Given this `ReleaseFish`, this is the `spec` that tests it.

```ruby
class ReleaseFish < Avo::BaseAction
  self.name = "Release fish"
  self.message = "Are you sure you want to release this fish?"

  field :message, as: :textarea, help: "Tell the fish something before releasing."

  def handle(**args)
    args[:models].each do |model|
      model.release
    end

    succeed "#{args[:models].count} fish released with message '#{args[:fields][:message]}'."
  end
end

```

```ruby
require 'rails_helper'

RSpec.feature ReleaseFish, type: :feature do
  let(:fish) { create :fish }
  let(:current_user) { create :user }
  let(:resource) { UserResource.new.hydrate model: fish }

  it "tests the dummy action" do
    args = {
      fields: {
        message: "Bye fishy!"
      },
      current_user: current_user,
      resource: resource,
      models: [fish]
    }

    action = described_class.new(model: fish, resource: resource, user: current_user, view: :edit)

    expect(action).to receive(:succeed).with "1 fish released with message 'Bye fishy!'."
    expect(fish).to receive(:release)

    action.handle **args
  end
end
```
