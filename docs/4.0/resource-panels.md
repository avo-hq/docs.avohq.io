# Resource panels
<br>
<Image src="/assets/img/4_0/resource-panels/panel.png" dark-src="/assets/img/4_0/resource-panels/panel-dark.png" width="1440" height="900" alt="An Avo resource show page with the sidebar navigation visible and a panel in the main content area listing record fields." prompt="Avo resource show page panel with header title and a body card listing record fields" />

Panels are the backbone of Avo's display infrastructure. Most of the information that's on display is wrapped inside a panel. They help maintain a consistent design throughout Avo's pages. They are also available as a view component `Avo::PanelComponent` for custom tools, and you can make your own pages using it.

When using the fields DSL for resources, all fields declared in the root will be grouped into a "main" panel, but you can add your panels.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true

    panel name: "User information", description: "Some information about this user" do
      field :first_name, as: :text, required: true, placeholder: "John"
      field :last_name, as: :text, required: true, placeholder: "Doe"
      field :active, as: :boolean, name: "Is active", show_on: :show
    end
  end
end
```
<Image src="/assets/img/4_0/resource-panels/root-and-panel.png" dark-src="/assets/img/4_0/resource-panels/root-and-panel-dark.png" width="1976" height="842" alt="An Avo show page with the record title and action buttons in the header, a main panel card with ID and User Email fields, and a named User information panel with First name, Last name, and Is active." prompt="User show page with root id and User Email fields plus a named User information panel with description, first name, last name, and Is active fields" />

You can customize the panel `name` and panel `description`.

## What is the Main Panel?
The Main Panel is the primary container for fields in a resource. It typically includes the resource's title, action buttons, and fields that are part of the resource's core data. You can think of it as the central hub for managing and displaying the resource's information.

The Main Panel is automatically created by Avo based on your resource's field definitions. However, you can also customize it to meet your specific requirements.


## How does Avo compute panels?
By default Avo's field organization occurs behind the scenes, leveraging multiple panels to simplify the onboarding process and reduce complexity when granular customization is not needed.

When retrieving the fields, the first step involves categorizing them based on whether or not they have their own panel. Fields without their own panels are referred to as "standalone" fields. Notably, most association fields, such as `field :users, as: :has_many`, automatically have their dedicated panels.

During the Avo's grouping process, we ensure that the fields maintain the order in which they were declared.

Once the groups are established, we check whether the main panel has been explicitly declared within the resource. If it has been declared, this step is skipped. However, if no main panel declaration exists, we compute a main panel and assign the first group of standalone fields to it. This ensures that the field arrangement aligns with your resource's structure and maintains the desired order.

## Computed panels vs Manual customization
Let's focus on the `fields` method for the next examples. In these examples, we demonstrate how to achieve the same field organization using both computed panels and manual customization. Each example have the code that makes Avo compute the panels and also have an example on how to intentionally declare the panels in order to achieve the same result.

:::code-group
```ruby [Computed]
def fields
  field :id, as: :id
  field :name, as: :text
  field :user, as: :belongs_to
  field :type, as: :text
end
```

```ruby [Customized]
def fields
  main_panel do
    field :id, as: :id
    field :name, as: :text
    field :user, as: :belongs_to
    field :type, as: :text
  end
end
```
:::

On this example Avo figured out that a main panel was not declared and it computes one with all standalone fields.

<Image src="/assets/img/4_0/resource-panels/computed-main.png" dark-src="/assets/img/4_0/resource-panels/computed-main-dark.png" width="1976" height="554" alt="An Avo show page with a single computed main panel containing ID, Name, User, and Type fields." prompt="Show page with a single computed main panel containing id, name, user, and type fields" />

<br>

Now let's add some field that is not standalone between `name` and `user` fields.

:::code-group
```ruby{5} [Computed]
def fields
  field :id, as: :id
  field :name, as: :text

  field :reviews, as: :has_many

  field :user, as: :belongs_to
  field :type, as: :text
end
```

```ruby [Customized]
def fields
  main_panel do
    field :id, as: :id
    field :name, as: :text
  end

  field :reviews, as: :has_many

  panel do
    field :user, as: :belongs_to
    field :type, as: :text
  end
end
```
:::

Since the field that has it owns panel was inserted between a bunch of standalone fields Avo will compute a main panel for the first batch of standalone fields (`id` and `name`) and will compute a simple panel for the remaining groups of standalone fields (`user` and `type`)

<Image src="/assets/img/4_0/resource-panels/split-panels.png" dark-src="/assets/img/4_0/resource-panels/split-panels-dark.png" width="1976" height="996" alt="An Avo show page with a computed main panel for ID and Name, a Reviews has_many association panel, and a second panel for User and Type." prompt="Show page with a computed main panel for id and name, a reviews has_many panel, and a simple panel for user and type fields" />

<br>

With these rules on mind we have the ability to keep the resource simple and also to fully customize it, for example, if we want to switch the computed main panel with the computed panel we can declare them in the desired order.

```ruby
def fields
  panel do
    field :user, as: :belongs_to
    field :type, as: :text
  end

  field :reviews, as: :has_many

  main_panel do
    field :id, as: :id
    field :name, as: :text
  end
end
```

<Image src="/assets/img/4_0/resource-panels/custom-order.png" dark-src="/assets/img/4_0/resource-panels/custom-order-dark.png" width="1976" height="996" alt="An Avo show page with panels in custom order: User and Type first, a Reviews has_many panel, then the main panel with ID and Name." prompt="Show page with panels in custom order: user and type panel first, reviews has_many panel, then main panel with id and name" />

By using the `main_panel` and `panel` method, you can manually customize the organization of fields within your resource, allowing for greater flexibility and control.

## Index view fields

By default, only the fields declared in the root and the fields declared inside `main_panel` will be visible on the `Index` view.

```ruby{4-8}
class Avo::Resources::User < Avo::BaseResource
  def fields
    # Only these fields will be visible on the `Index` view
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true
    field :name, as: :text, only_on: :index do
      "#{record.first_name} #{record.last_name}"
    end

    # These fields will be hidden on the `Index` view
    panel name: "User information", description: "Some information about this user" do
      field :first_name, as: :text, required: true, placeholder: "John"
      field :last_name, as: :text, required: true, placeholder: "Doe"
      field :active, as: :boolean, name: "Is active", show_on: :show
    end
  end
end
```

<Image src="/assets/img/4_0/resource-panels/index-view.png" dark-src="/assets/img/4_0/resource-panels/index-view-dark.png" width="2344" height="758" alt="An Avo index table listing ID, User Email, and Name columns while panel-only fields stay off the index view." prompt="Users index table showing only root and main_panel fields with panel fields hidden" />

<Option name="`visible`">

The `visible` option allows you to dynamically control the visibility of a panel and all its children based on certain conditions.

This option is particularly useful when you need to show or hide entire sections of your resource at once without having to do it for each field.

Example:
```ruby
panel name: "User information", visible: -> { resource.record.enabled? } do
  field :first_name, as: :text
  field :last_name, as: :text
end
```
</Option>
