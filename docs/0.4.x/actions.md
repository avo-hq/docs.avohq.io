# Actions

[[toc]]

Avo actions allow you to perform specific tasks on one or more of your records. For example, you might want to mark a user as inactive and optionally send a message that may be customized by the person that wants to run the action.

Once you attach an action to a resource using `use_action` it may be ran using the **Actions** dropdown.

<img :src="$withBase('/assets/img/actions/actions-dropdown.jpg')" alt="Actions dropdown" class="border mb-4" />

## Overview

Avo actions use two main methods. `handle` and `fields`.

```ruby{9-16,20-21}
module Avo
  module Actions
    class MarkInactive < Action
      def name
        'Mark inactive'
      end

      def handle(request, models, fields)
        models.each do |model|
          model.update active: false

          model.notify fields['message'] if fields['notify_user']
        end

        succeed 'Done!'
        reload
      end

      fields do
        boolean :notify_user
        textarea :message, default: 'Your account has been marked as inactive.'
      end
    end
  end
end
```

In the `fields` method, you may declare extra fields just as you do it in resources. The `fields` method is optional. You may have options that don't have any fields attached.

```ruby
fields do
  boolean :notify_user
  textarea :message, default: 'Your account has been marked as inactive.'
end
```

<img :src="$withBase('/assets/img/actions.jpg')" alt="Avo actions" class="border mb-4" />

The `handle` method is where the magic happens. This is where you put your action logic. In this method, you will have access to the current `request`, the selected `models` and, the values passed to the `fields`.

```ruby
def handle(request, models, fields)
  models.each do |model|
    model.update active: false

    model.notify fields['message'] if fields['notify_user']
  end

  succeed 'Done!'
  reload
end
```

## Registering actions

To use an action, you need to declare it on the resource using the `use_action` method.

```ruby{13}
module Avo
  module Resources
    class User < Resource
      def initialize
        @title = :name
        @search = [:id, :first_name, :last_name]
      end

      fields do
        id
      end

      use_action Avo::Actions::MarkInactive
    end
  end
end
```

## Action responses

After an action runs, you may use a few methods to respond to the user. You may respond with just a message or with a message and an action.

### Message responses

You will have two message response methods at your disposal `succeed` and `fail`. These will render out green or red alerts to the user.


```ruby{8}
def handle(request, models, fields)
  models.each do |model|
    model.update active: false

    model.notify fields['message'] if fields['notify_user']
  end

  fail "Can't mark inactive! The user is an admin."
  reload
end
```

<img :src="$withBase('/assets/img/actions/actions-succeed-message.jpg')" alt="Avo succeed message" class="border inline-block mr-2" />
<img :src="$withBase('/assets/img/actions/actions-fail-message.jpg')" alt="Avo fail message" class="border inline-block" />

### Action responses

After you notify the user about what happened through a message, you may want to execute an action like `reload` (default action) or `redirect_to`. You may use message and action responses together.

```ruby{8-9}
def handle(request, models, fields)
  models.each do |model|
    model.update active: false

    model.notify fields['message'] if fields['notify_user']
  end

  fail "Can't mark inactive! The user is an admin."
  reload
end
```

The available action responses are:

#### `reload`

When you use `reload`, a full-page reload will be triggered.

```ruby{7}
def handle(request, models, fields)
  models.each do |project|
    project.update active: false
  end

  succeed 'Done!'
  reload
end
```

#### `redirect_to`

`redirect_to` will execute a [Vue route push](https://router.vuejs.org/guide/essentials/navigation.html#router-push-location-oncomplete-onabort) that will navigate to a new path of your app.

```ruby{7}
def handle(request, models, fields)
  models.each do |project|
    project.update active: false
  end

  succeed 'Done!'
  redirect_to '/projects'
end
```

#### `download`

`download` will start a file download to your specified `path` and `filename`.

```ruby{11}
def handle(request, models, fields)
  models.each do |project|
    project.update active: false

    report_path = project.report_path
    report_filename = project.report_filename
  end

  succeed 'Done!'
  if report_path.present? and report_filename.present?
    download report_path, report_filename
  end
end
```

## Customization

### Customize the message

You may pass a `message` to the action if there are no fields present.

```ruby
def message
  'Are you sure you want to mark this user as inactive?'
end
```

<img :src="$withBase('/assets/img/actions/actions-message.jpg')" alt="Avo message" class="border mb-4" />

### Customize the buttons

You may also have custom labels for the action buttons.

```ruby
def confirm_text
  'Mark inactive'
end

def cancel_text
  'Not yet'
end
```

<img :src="$withBase('/assets/img/actions/actions-button-labels.jpg')" alt="Avo button labels" class="border mb-4" />






