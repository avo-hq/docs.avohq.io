---
feedbackId: 1168
---

# Testing

:::info
We know the testing guides aren't very detailed, and some testing helpers are needed. So please send your feedback [here](https://github.com/avo-hq/avo/discussions/1168).
:::

Testing is an essential aspect of your app. Most Avo DSLs are Ruby classes, so regular testing methods should apply.

## Allow the license check host in your test suite

Avo 4 verifies your license by making an outbound request to `clerk-1.avohq.io` (falling back to `clerk-2.avohq.io`). This request runs in every environment, including `test`.

If your test suite blocks outbound network connections — for example with [WebMock](https://github.com/bblimke/webmock) or [VCR](https://github.com/vcr/vcr) `disable_net_connect!` — the license check is blocked and otherwise-unrelated tests fail with an error like:

```
WebMock::NetConnectNotAllowedError:
  Real HTTP connections are disabled. Unregistered request:
  POST https://clerk-1.avohq.io/api/v4/licenses/check with body '...'
```

:::info New in Avo 4
Avo 3 validated licenses through the legacy HQ endpoint and didn't trip this. Avo 4 validates through `clerk-*.avohq.io`, so an app that never had this problem on Avo 3 can start failing tests right after upgrading.
:::

The fix is to add Avo's license check hosts to your allow list. Add them to your **existing** `disable_net_connect!` call so you keep whatever options you already have:

```ruby
# spec/rails_helper.rb, spec/spec_helper.rb, or test/test_helper.rb
WebMock.disable_net_connect!(
  allow_localhost: true,
  allow: ["clerk-1.avohq.io", "clerk-2.avohq.io"] # [!code ++]
)
```

If you use **VCR**, ignore the same hosts:

```ruby
VCR.configure do |config|
  config.ignore_hosts "clerk-1.avohq.io", "clerk-2.avohq.io"
end
```

This only applies when you explicitly disable outbound connections in the test environment. If your tests already permit real HTTP requests, no change is needed.

## Testing helpers

We prepared a few testing helpers for you to use in your apps. They will help with opening/closing datepickers, choosing the date, saving the records, add/remove tags, and also select a lot of elements throughout the UI.

You can find them all [here](https://github.com/avo-hq/avo/blob/main/lib/avo/test_helpers.rb),

## Testing Actions

Given this `Avo::Actions::ReleaseFish`, this is the `spec` that tests it.

```ruby

class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.name = "Release fish"
  self.message = "Are you sure you want to release this fish?"

  def fields
    field :message, as: :textarea, help: "Tell the fish something before releasing."
  end

  def handle(query:, fields:, **_)
    query.each(&:release)

    succeed "#{query.count} fish released with message '#{fields[:message]}'."
  end
end

```

```ruby
require 'rails_helper'

RSpec.feature Avo::Actions::ReleaseFish, type: :feature do
  let(:fish) { create :fish }
  let(:current_user) { create :user }
  let(:resource) { Avo::Resources::User.new.hydrate model: fish }

  it "tests the dummy action" do
    args = {
      fields: {
        message: "Bye fishy!"
      },
      current_user: current_user,
      resource: resource,
      query: [fish]
    }

    action = described_class.new(resource: resource, user: current_user, view: :edit)

    expect(action).to receive(:succeed).with "1 fish released with message 'Bye fishy!'."
    expect(fish).to receive(:release)

    action.handle **args
  end
end
```
