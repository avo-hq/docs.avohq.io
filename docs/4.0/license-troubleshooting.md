# License troubleshooting

There might be times when the configurations isn't up to date and you'd like to troubleshoot it. There are a couple of things you can do to perform a self-diagnostics session.

## Check the license status page

Every Avo app has the license status page where you can see a few things about your license and the response from the license checking server.

Go to `https://yourapp.com/avo/avo_private/status`. If you mounted Avo under a different path (like `admin`) it will be `https://yourapp.com/admin/avo_private/status`.

In order to see that page your user has to be an an admin in Avo. Follow [this guide](./authentication#user-roles) to mark your user as an admin.

This should tell you if the license authenticated correctly and what was the response from our checking server. The license key is hidden by default for security — set [`exclude_from_status`](./customization-api.html#exclude_from_status) to `[]` in your Avo initializer if you need to see it on the status page.

## Frequent issues

<Option name="License key not properly set on the server">

The most frequent scenario is to not have the license key set on the server.
If you use environment variables to register it in your app you should make sure your key is properly set on your production server.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.license_key = ENV["AVO_LICENSE_KEY"]
end
```

In order to check that, use the status page described above.

</Option>

<Option name="License check blocked in the test suite">

Avo 4 verifies the license through an outbound request to `clerk-1.avohq.io` (falling back to `clerk-2.avohq.io`). If your test suite disables outbound network connections (for example with WebMock or VCR `disable_net_connect!`), that request is blocked and unrelated tests fail with `WebMock::NetConnectNotAllowedError`.

Add the license check hosts to your allow list:

```ruby
WebMock.disable_net_connect!(
  allow_localhost: true,
  allow: ["clerk-1.avohq.io", "clerk-2.avohq.io"]
)
```

See [Testing → Allow the license check host in your test suite](./testing.html#allow-the-license-check-host-in-your-test-suite) for the full details.

</Option>
