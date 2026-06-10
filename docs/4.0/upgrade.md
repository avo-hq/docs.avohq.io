# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

## Upgrade to 4.0.0.beta.45

<Option name="`explicit_authorization` now defaults to `true`">

### Breaking Change

The default value of `config.explicit_authorization` changed from `false` to `true`.

With explicit authorization enabled, Avo no longer falls back to a permissive default when a policy method is missing — any action whose policy method isn't defined is treated as **not authorized**. This is a safer default, but it can hide records, fields, or actions that were previously visible if your policies are incomplete.

### Action Required

**Review your policies** to make sure every action you expect to be available has a corresponding policy method defined. Pay special attention to resources that rely on the previous permissive fallback.

### Maintaining Previous Behavior

If you want to keep the old behavior, set the option back to `false` in your initializer:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.explicit_authorization = false
end
```

See the [authorization documentation](./authorization.html) for more details on how explicit authorization works.

</Option>
