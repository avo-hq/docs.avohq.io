---
feedbackId: 3860
---

# How to Use [Phlex](https://www.phlex.fun/) Components in Avo

Avo uses [ViewComponent](https://viewcomponent.org/) to render fields, resources, and other parts of the UI. However, that doesn't mean you can't use [Phlex](https://www.phlex.fun/) components in your Avo views.

The initialization process between the two is quite similar allowing a smooth transition between them. You just need to configure the component you want to use for a given field or resource on a specific view, and Avo will take care of the rest.

This guide walks you through how to use [Phlex](https://www.phlex.fun/) components inside your Avo views.

> _Note: This guide assumes you already have Phlex installed in your app._

## Step 1: Create a [Phlex](https://www.phlex.fun/) component

Let's start with a simple [Phlex](https://www.phlex.fun/) component for a field. This component uses the same Tailwind CSS classes as the default Avo field component, and includes an additional message about the field.

You can make your components as simple or as complex as you'd like, this is just an example.

:::warning
All Tailwind CSS classes used in this guide are already included in Avo's design system and available in its pre-purged assets. If you plan to customize the appearance beyond what's shown here, consider setting up the [TailwindCSS integration](./../tailwindcss-integration.md).
:::

```ruby
# app/components/phlex_component.rb
class PhlexComponent < Phlex::HTML
  def initialize(field:, **)
    @field = field
  end

  def view_template
    div class: "flex items-center px-6 py-4" do
      span class: "font-semibold text-gray-500 text-sm w-64 uppercase" do
        @field.name
      end
      span class: "text-gray-900" do
        @field.value
      end
      span class: "text-gray-300 mx-3" do
        "|"
      end
      span class: "mr-1" do
        "ℹ️"
      end
      span class: "text-sm text-gray-500 italic" do
        "This is a unique course link. Share it with enrolled users."
      end
    end
  end
end
```

---

## Step 2: Use the component in your field declaration

With the [`components`](./../fields/components.md) option, you can specify the component to be used for the `show` view of a field.

```ruby{10-12}
# app/avo/resources/course_link.rb
class Avo::Resources::CourseLink < Avo::BaseResource
  self.title = :link
  self.model_class = ::Course::Link

  def fields
    field :id, as: :id
    field :link,
      as: :text,
      components: {
        show_component: PhlexComponent
      }
    field :course, as: :belongs_to, searchable: true
  end
end
```

<Image src="/assets/img/guides/phlex/phlex_component.png" width="1278" height="335" alt="Phlex component" />

:::tip
While this example uses a field, the same pattern applies to resources. You can use the [`components`](./../resources#self.components) option to customize the component for the `index`, `show`, `edit`, and `new` views.
:::

## Conclusion

Even though Avo relies on [ViewComponent](https://viewcomponent.org/) under the hood, you're free to use [Phlex](https://www.phlex.fun/) components in your Avo views.

This guide covered a basic example, but [Phlex](https://www.phlex.fun/) is capable of much more. Check out the [official Phlex documentation](https://www.phlex.fun/introduction/) to learn how to build more advanced components.

If you have questions, suggestions, or feedback, join the conversation in the [Feedback: Using Phlex Components in Avo Views](https://github.com/avo-hq/avo/discussions/3860).
