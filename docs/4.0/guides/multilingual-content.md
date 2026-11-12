---
license: community
---

# Multilingual content

This is not an official feature yet, but until we add it with all the bells and whistles, you can use this guide to monkey-patch it into your app.

## Install the mobility gem

Follow the install instructions [here](https://github.com/shioyama/mobility#installation). A brief introduction below (but follow their guide for best results)

 - add the gem to your `Gemfile` `gem 'mobility', '~> 1.2.5'`
 - `bundle install`
 - install mobility `rails generate mobility:install`
 - update the backend (like in the guide) `backend :key_value, type: :string`
 - add mobility to your model `extend Mobility`
 - add translatable field `translates :name`
 - 🙌 that's it. The content should be translatable now.

## Add the language switcher

Avo ships a language switcher, the [locale selector](./../i18n.html#locale-selector), in the top navbar. Each user picks their own language, and the choice never changes the language for other users. List the languages your content is translated into:

```ruby
Avo.configure do |config|
  config.locale_selector = [:en, :"pt-BR"]
end
```

To open a single page in another language without changing your selection, add `?force_locale=pt-BR` to the URL.

## Workflow

You will now be able to edit the attributes you marked as translatable (eg: `name`) in the locale you are in (default is `en`). Next, you can go to the navbar on the top and switch to a new locale. The switch will then allow you to edit the record in that locale and so on.

## Support

This is the first iteration of multilingual content. It's obvious that this could be done in a better way, and we'll add that better way in the future, but until then, you can use this method to edit your multilingual content.

Thanks!
