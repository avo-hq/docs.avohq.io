# Multilingual content

This is not an official feature yet but until we add it with all the bells and whistles you can use this guide to monkey patch it into your app.

We pushed some code to take in the `set_locale` param and set the `I18n.locale` and `I18n.default_locale` so all subsequent requests will use that locale. **That will change the locale for your whole app. Even to the front-office**.

If you don't want to change the locale for the whole app you can use `force_locale` that will change the locale for that request only. It will also append `force_locale` to all your links going forward.

```ruby
def set_default_locale
  I18n.locale = params[:set_locale] || I18n.default_locale

  I18n.default_locale = I18n.locale
end

# Temporary set the locale
def set_force_locale
  if params[:force_locale].present?
    initial_locale = I18n.locale.to_s.dup
    I18n.locale = params[:force_locale]
    yield
    I18n.locale = initial_locale
  else
    yield
  end
end
```

## Install the mobility gem

Follow the install instructions [here](https://github.com/shioyama/mobility#installation). A brief introduction below (but follow their guid for best results)

 - add the gem to your `Gemfile` `gem 'mobility', '~> 1.2.5'`
 - `bundle install`
 - install mobility `rails generate mobility:install`
 - update the backend (like in the guide) `backend :key_value, type: :string`
 - add mobility to your model `extend Mobility`
 - add translatable field `translates :name`
 - 🙌 that's it. The content should be translatable now.

## Add the language switcher

**Before v 2.3.0**

First you need to eject the `_profile_dropdown` partial using this command `bin/rails generate avo:eject :profile_dropdown`. In that partail add the languages you need to support like so:

```erb
<!-- Before -->
<% destroy_user_session_path = "destroy_#{Avo.configuration.current_user_resource_name}_session_path".to_sym %>

<div <% if main_app.respond_to?(destroy_user_session_path) %> data-controller="toggle-panel" <% end %>>
  <a href="javascript:void(0);" class="flex items-center cursor-pointer font-semibold text-gray-700" data-action="click->toggle-panel#togglePanel">
    <% if _current_user.respond_to?(:avatar) &&  _current_user.avatar.present? %>
      <%= image_tag _current_user.avatar, class: "h-12 rounded-full border-4 border-white mr-1" %>
    <% end %>
    <% if _current_user.respond_to?(:name) && _current_user.name.present? %>
      <%= _current_user.name %>
    <% elsif _current_user.respond_to?(:email) && _current_user.email.present? %>
      <%= _current_user.email %>
    <% else %>
      Avo user
    <% end %>
    <% if main_app.respond_to?(destroy_user_session_path) %>
      <%= svg 'chevron-down', class: "ml-1 h-4" %>
    <% end %>
  </a>

  <% if main_app.respond_to?(destroy_user_session_path) %>
    <div class="hidden absolute inset-auto right-0 mr-6 mt-0 py-4 bg-white rounded-xl min-w-[200px] shadow-context" data-toggle-panel-target="panel">
      <%= button_to t('avo.sign_out'), main_app.send(:destroy_user_session_path), method: :delete, form: { "data-turbo" => "false" }, class: "appearance-none bg-white text-left cursor-pointer text-green-600 font-semibold hover:text-white hover:bg-green-500 block px-4 py-1 w-full" %>
    </div>
  <% end %>
</div>
```

```erb
<!-- After -->
<% destroy_user_session_path = "destroy_#{Avo.configuration.current_user_resource_name}_session_path".to_sym %>

<div <% if main_app.respond_to?(destroy_user_session_path) %> data-controller="toggle-panel" <% end %>>
  <a href="javascript:void(0);" class="flex items-center cursor-pointer font-semibold text-gray-700" data-action="click->toggle-panel#togglePanel">
    <% if _current_user.respond_to?(:avatar) &&  _current_user.avatar.present? %>
      <%= image_tag _current_user.avatar, class: "h-12 rounded-full border-4 border-white mr-1" %>
    <% end %>
    <% if _current_user.respond_to?(:name) && _current_user.name.present? %>
      <%= _current_user.name %>
    <% elsif _current_user.respond_to?(:email) && _current_user.email.present? %>
      <%= _current_user.email %>
    <% else %>
      Avo user
    <% end %>
    <% if main_app.respond_to?(destroy_user_session_path) %>
      <%= svg 'chevron-down', class: "ml-1 h-4" %>
    <% end %>
  </a>

  <% if main_app.respond_to?(destroy_user_session_path) %>
    <div class="hidden absolute inset-auto right-0 mr-6 mt-0 py-4 bg-white rounded-xl min-w-[200px] shadow-context" data-toggle-panel-target="panel">
      <!-- Add this 👇 -->
      <% classes = "appearance-none bg-white text-left cursor-pointer text-green-600 font-semibold hover:text-white hover:bg-green-500 block px-4 py-1 w-full" %>

      <% if I18n.locale == :en %>
        <%= link_to "Switch to Portuguese", { set_locale: 'pt-BR' }, class: classes %>
      <% else %>
        <%= link_to "Switch to English", { set_locale: 'en' }, class: classes %>
      <% end %>
      <!-- Add this 👆 -->

      <%= button_to t('avo.sign_out'), main_app.send(:destroy_user_session_path), method: :delete, form: { "data-turbo" => "false" }, class: classes %>
    </div>
  <% end %>
</div>
```

Feel free to customize the dropdown as much as you need it to and add as many locales as you need.

**After v2.3.0**

Use the `profile_menu` to add the language switching links.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link "Switch to Portuguese", path: "?set_locale=pt-BR"
    link "Switch to English", path: "?set_locale=en"
  }
end
```

**After v2.10**

The `set_locale` param will change the locale for the entire website (for you and your customers). If you need to change it just for the current visit, use `force_locale`. This will switch the locale for that request only not for your customers. It will also add the `force_locale` param to each link going forward making it easy to update all the multi-lingual content you have.

**After v2.11**

A change was pushed to take into account the `locale` from the initializer. This will change the locale for Avo requests.

```ruby{2}
Avo.configure do |config|
  config.locale = :en # default is nil
end
```

## Workflow

You will now be able to edit the attributed you marked as translatable (eg: `name`) in the locale you are in (default is `en`). Next you can go to the navbar on the top and switch to a new locale. The switch will then allow you to edit the record in that locale, and so on.

## Support

This is the first iteration of multilingual content. It's obvious that this could be done in a better way and we'll add that better way in the future, but until then you can use this method to edit your multilingual content.

Thanks!
