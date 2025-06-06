---
license: advanced
feedbackId: 3930
---

# Bulk destroy action using customizable controls

In this guide, we'll explore how to implement a customizable bulk destroy action in Avo. This allows to delete multiple records at once while providing users with a clear, informative interface that shows exactly what will be deleted. The implementation includes a confirmation message with a scrollable list of records to be deleted and clear warning messages about the permanent nature of this action.

The bulk destroy action is particularly useful when you need to:
- Delete multiple records simultaneously
- Show users exactly which records will be affected
- Provide clear warnings about the irreversible nature of the action
- Handle the deletion process with proper error handling

<Image src="/assets/img/guides/bulk_destroy/bulk_destroy_image.png" width="1937" height="1031" alt="Bulk destroy action" />

## Bulk destroy action

```ruby
# app/avo/actions/bulk_destroy.rb
class Avo::Actions::BulkDestroy < Avo::BaseActionAdd commentMore actions
  self.name = "Bulk Destroy"
  self.message = -> {
    tag.div do
      safe_join([
        "Are you sure you want to delete these #{query.count} records?",
        tag.div(class: "text-sm text-gray-500 mt-2 mb-2 font-bold") do
          "These records will be permanently deleted:"
        end,
        tag.ul(class: "ml-4 overflow-y-scroll max-h-64") do
          safe_join(query.map do |record|
            tag.li(class: "text-sm text-gray-500") do
              "- #{::Avo.resource_manager.get_resource_by_model_class(record.class).new(record:).record_title}"
            end
          end)
        end,
        tag.div(class: "text-sm text-red-500 mt-2 font-bold") do
          "This action cannot be undone."
        end
      ])
    end
  }

  def handle(query:, **)
    query.each(&:destroy!)
    succeed "Deleted #{query.count} records"
  rescue => e
    fail "Failed to delete #{query.count} records: #{e.message}"
  end
end
```

## Register it on all resources with except list

Once you've defined your bulk destroy action, you might want to make it available across multiple resources while excluding specific ones. This approach allows you to implement the action globally while maintaining control over where it can be used. The following configuration adds the bulk destroy functionality to your base resource class with a customized appearance and selective implementation.

Related docs:

- [Extending Avo::BaseResource](https://docs.avohq.io/3.0/resources.html#extending-avo-baseresource)
- [Customizable controls](https://docs.avohq.io/3.0/customizable-controls.html)

```ruby
# app/avo/base_resource.rb
class Avo::BaseResource < Avo::Resources::Base
  self.index_controls = -> {
    # Don't show bulk destroy for these resources
    return default_controls if resource.class.in?([
      Avo::Resources::User,
      Avo::Resources::Post,
      Avo::Resources::Product,
      Avo::Resources::Person,
      Avo::Resources::Spouse,
      Avo::Resources::Movie,
      Avo::Resources::Fish,
    ])

    bulk_title = tag.span(class: "text-xs") do
      safe_join([
        "Delete all selected #{resource.plural_name.downcase}",
        tag.br,
        "Select at least one #{resource.singular_name.downcase} to run this action"
      ])
    end.html_safe

    action Avo::Actions::BulkDestroy,
      icon: "heroicons/solid/trash",
      color: "red",
      label: "",
      style: :outline,
      title: bulk_title

    default_controls
  }
end
```

## Feedback

We value your experience with this bulk destroy implementation! Whether you've successfully implemented it, made improvements, or encountered challenges, your feedback helps the community. Here's how you can contribute:

- **Success stories**: Share how you've implemented this in your project and what benefits it brought to your workflow
- **Improvements**: Tell us if you've enhanced this implementation with additional features or better error handling
- **Questions**: Ask about specific use cases or implementation details you're unsure about
- **Troubleshooting**: If you're experiencing issues, describe your setup and the problems you're encountering
- **Customizations**: Share how you've adapted this to better suit your specific needs
- **Alternative approaches**: If you've implemented bulk destroy differently, we'd love to hear about your solution

You can share your feedback through [Feedback: Bulk destroy action using customizable controls](https://github.com/avo-hq/avo/discussions/3930).

