# License troubleshooting

There might be times when the configurations isn't up to date and you'd like to troubleshoot it. There are a couple of things you can do to perform a self-diagnostics session.

## Check the license status page

Every Avo app has the license status page where you can see a few things about your license and the response from the license checking server.

Go to `https://yourapp.com/avo/status`. If you mounted Avo under a different path (like `admin`) it will be `https://yourapp.com/admin/status`.

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

<Option name="Every admin page is blocked with a Temporarily unavailable notice">

Avo could not validate the license, so `avo-licensing` serves a **Temporarily unavailable** page in place of every Avo page, and a `503` for non-HTML requests. A license the server reports as locked, ended, lapsed, or tied to another URL blocks right away. From `avo-licensing` `4.4.0`, a check that only fails to complete — the key isn't set in this environment, or the server can't reach the check hosts — blocks too, once the grace period runs out.

Work through it in this order:

1. Open the [status page](#check-the-license-status-page) and read the reason it gives.
2. Check `config.license_key` resolves to a key in this environment, not only in development.
3. Check the server can reach `clerk-1.avohq.io` and `clerk-2.avohq.io`.
4. Press **Refresh license**, or **Clear cached response** and then refresh, since Avo caches the license response between checks.

The first successful check unblocks the app. A reference code starting with `ERR-` on the page means the license itself is locked, ended, lapsed, or registered to another URL — resolve that on the [Avo HQ Licenses](https://avohq.io/licenses) page. A valid license that simply lacks an add-on never blocks the app; that add-on is just off.

To get the admin back before the license is fixed, [`run_community_admin_without_valid_license`](./customization-api.html#run_community_admin_without_valid_license) keeps the Community edition running with the paid add-ons off and authorization policies not applied. Read [Licensing → Keep the admin running when the license cannot be validated](./licensing.html#keep-the-admin-running-when-the-license-cannot-be-validated) before you set it.

</Option>

<Option name="The sidebar status indicator is amber">

Amber is not a license failure — it's a running trial that needs attention: no payment method is on file, the subscription behind it was cancelled, or it's an Avo 4 trial beside your Avo 3 subscription that you haven't migrated to yet. Access continues until the date the status page reports.

The status page names which one applies and lists the steps. See [Licensing → Fix a trial at risk](./licensing.html#fix-a-trial-at-risk) for the full picture.

From `avo-licensing` `4.4.0`, amber also covers a license check that is failing while the app still runs on its last valid answer. The status page says when it started failing and when the next attempt is; fix the key, the network, or the hosts before the grace period ends, or the admin is blocked.

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
