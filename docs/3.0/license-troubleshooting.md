# License troubleshooting

There might be times when the configurations isn't up to date and you'd like to troubleshoot it. There are a couple of things you can do to perform a self-diagnostics session.

## Check the license status page

Every Avo app has the license status page where you can see a few things about your license and the response from the license checking server.

Go to `https://yourapp.com/avo/avo_private/status`. If you mounted Avo under a different path (like `admin`) it will be `https://yourapp.com/admin/avo_private/status`.

In order to see that page your user has to be an an admin in Avo. Follow [this guide](./authentication#user-roles) to mark your user as an admin.

This should tell you if the license authenticated correctly, what is your used license key and what was the response from our checking server.

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
