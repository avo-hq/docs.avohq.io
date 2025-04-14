# Attachment Policy Extension for Pundit

When using Pundit, it's common to define permissions for each attachment action (e.g., upload, delete, download) individually. This can lead to repetitive code like:

```ruby
def upload_logo?
  update?
end

def delete_logo?
  update?
end

def download_logo?
  update?
end
```

To streamline this process, you can extend your `ApplicationPolicy` with a helper method that dynamically handles attachment permissions.

## Step 1: Add the `method_missing` Helper to `ApplicationPolicy`

This method intercepts calls to undefined policy methods that follow a specific pattern and delegates them to a predefined permission mapping:

```ruby
def method_missing(method_name, *args)
  if method_name.to_s =~ /^(upload|delete|download)_(.+)\?$/
    action = Regexp.last_match(1).to_sym
    attachment = Regexp.last_match(2).to_sym

    return attachment_concerns[attachment][action] if attachment_concerns.key?(attachment) &&
                                                      attachment_concerns[attachment].key?(action)
  end

  super
end
```

## Step 2: Define `attachment_concerns` in Your Policy

In each model-specific policy, define the permitted actions for each attachment:

```ruby
def attachment_concerns
  {
    logo: {
      upload: update?,
      delete: update?,
      download: update?
    }
  }
end
```

With this setup, calls to `upload_logo?`, `delete_logo?`, or `download_logo?` will be automatically resolved based on the configuration in `attachment_concerns`, reducing boilerplate and improving maintainability.
