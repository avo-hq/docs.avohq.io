---
license: community
next:
  text: 'Field options'
  link: '/3.0/field-options'
---

# HTML attributes

Using the `html` option you can attach `style`, `classes`, and `data` attributes. The `style` attribute adds the `style` tag to your element, `classes` adds the `class` tag, and the `data` attribute the `data` tag to the element you choose.

Pass the `style` and `classes` attributes as strings, and the `data` attribute a Hash.

```ruby{4-11}
field :name, as: :text, html: {
  edit: {
    wrapper: {
      style: "background: red; text: white;" # string
      classes: "absolute h-[41px] w-full" # string
      data: {
        action: "input->resource-edit#toggle",
        resource_edit_toggle_target_param: "skills_tags_wrapper",
      } # Hash
    }
  }
}
```


## Declare the fields from the outside in

When you add these attributes, you need to think from the outside in. So first the `view` (`index`, `show`, or `edit`), next the element to which you add the attribute (`wrapper`, `label`, `content` or `input`), and then the attribute `style`, `classes`, or `data`.

**The `edit` value will be used for both the `Edit` and `New` views.**

There are two notations through which you can attach the attributes; `object` or `block` notation.

## The `object` notation

This is the simplest way of attaching the attribute. You usually use this when you want to add _static_ content and params.

```ruby{3-9}
field :has_skills,
  as: :boolean,
  html: {
    edit: {
      wrapper: {
        classes: "hidden"
      }
    }
  }
```

In this example, we're adding the `hidden` class to the field wrapper on the `Edit` and `New` views.

## The `block` notation

You can use the' block' notation if you need to do a more complex transformation to add your attributes. You'll have access to the `params`, `current_user`, `record`, and `resource` variables. It's handy in multi-tenancy scenarios and when you need to scope out the information across accounts.

```ruby{3-18}
field :has_skills,
  as: :boolean,
  html: -> do
    edit do
      wrapper do
        classes do
          "hidden"
        end
        data do
          if current_user.admin?
            {
              action: "click->admin#do_something_admin"
            }
          else
            {
              record: record,
              resource: resource,
            }
          end
        end
      end
    end
  end
```

For the `data`, `style`, and `classes` options, you may use the `method` notation alongside the block notation for simplicity.

```ruby{6,7}
field :has_skills,
  as: :boolean,
  html: -> do
    edit do
      wrapper do
        classes("hidden")
        data({action: "click->admin#do_something_admin"})
      end
    end
  end
```

## Where are the attributes added?

You can add attributes to the wrapper element for the `index`, `show`, or `edit` blocks.

<Option name="Index field wrapper">

```ruby
field :name, as: :text, html: {
  index: {
    wrapper: {}
  }
}
```

<Image src="/assets/img/stimulus/index-field-wrapper.jpg" width="1642" height="864" alt="Index field wrapper" />

</Option>

<Option name="Show field wrapper">

```ruby
field :name, as: :text, html: {
  show: {
    wrapper: {}
  }
}
```

<Image src="/assets/img/stimulus/show-field-wrapper.jpg" width="763" height="331" alt="Show field wrapper" />

</Option>
<Option name="Show label target">

```ruby
field :name, as: :text, html: {
  show: {
    label: {}
  }
}
```

<Image src="/assets/img/stimulus/show-label-target.jpg" width="763" height="331" alt="Show label target" />

</Option>
<Option name="Show content target">

```ruby
field :name, as: :text, html: {
  show: {
    content: {}
  }
}
```

<Image src="/assets/img/stimulus/show-content-target.jpg" width="763" height="331" alt="Show content target" />

</Option>
<Option name="Edit field wrapper">

```ruby
field :name, as: :text, html: {
  edit: {
    wrapper: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-field-wrapper.jpg" width="1634" height="766" alt="Edit field wrapper" />

</Option>
<Option name="Edit label target">

```ruby
field :name, as: :text, html: {
  edit: {
    label: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-label-target.jpg" width="763" height="331" alt="Edit label target" />

</Option>
<Option name="Edit content target">

```ruby
field :name, as: :text, html: {
  edit: {
    content: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-content-target.jpg" width="763" height="331" alt="Edit content target" />

</Option>
<Option name="Edit input target">

```ruby
field :name, as: :text, html: {
  edit: {
    input: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-input-target.jpg" width="1646" height="784" alt="Index field wrapper" />


</Option>
