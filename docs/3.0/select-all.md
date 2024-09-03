# Select All

The "Select All" feature is designed to enable users to select all queried records and perform actions on the entire selection. This feature is particularly useful when dealing with large datasets, allowing users to trigger actions on all queried records, not just the ones visible on the current page.

## How does it work?

<Image src="/assets/img/3_0/select_all.gif" width="687" height="289" alt="Select all demonstration" />

When a user toggles the "Select all" checkbox, Avo will first check to see if there are more records than just those displayed on that page, and if there are, it will ask if the user if they want to select all the records or not.

This is being done through serializing the query to be unserialized back in the action.

## Serializing the query

The query might include various filters, sorting parameters, and other custom elements. Reconstructing this query at the time of the action request can be complex. Therefore, the system serializes the entire query object into a secure format before sending it with the action request.

- **Security**: To ensure that sensitive data is protected, the serialized query is encrypted before it is transmitted.
- **Efficiency**: This approach allows the system to accurately and efficiently reconstruct the original query when the action is executed, ensuring that all relevant records are included.

:::warning
<VersionReq version="3.12.0" />
If an error occurs during the serialization process, the "Select All" feature is automatically disabled. This safeguard ensures that the page will not crash because of a coding error.
We listed a few reasons on why it might crash below.
:::

## Serialization known issues

In this section, we outline common serialization problems and provide guidance on how to resolve them effectively.

##### `normalize`

If your model includes any `normalize` proc, such as:

```ruby
normalizes :status, with: ->(status) { status }
```

Serialization may fail when a filter is applied to the normalized attribute (e.g., `status` in this example). This can result in the error `TypeError: no _dump_data is defined for class Proc`, which causes the "Select All" feature to be automatically disabled.

For applications created before Rails `7.1`, configuring the `marshalling_format_version` to `7.1` or higher will resolve the issue:

```ruby
# config/application.rb

config.active_record.marshalling_format_version = 7.1
```

More details on [`normalizes` documentation](https://api.rubyonrails.org/classes/ActiveRecord/Normalization/ClassMethods.html#method-i-normalizes).
