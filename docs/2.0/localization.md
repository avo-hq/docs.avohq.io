# Localization (i18n)

[[toc]]

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        Localization is a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">Pro</a> feature
      </div>
    </div>
  </div>
</div>


Avo leverages Rails powerful I18n translations module. When you run `bin/rails avo:install` Rails will generate for you the `avo.en.yml` translation file. This file will automatically be injected into the I18n translations module.

## Localizing resources

Let's say you want to localize a resource. All you need to do is add a `self.translation_key` class attribute in the `Resource` file. This will tell Avo to use that translation key to localize this resource. This will change the labels of that resource everywhere in Avo.

```ruby{4}
# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  self.title = :name
  self.translation_key = 'avo.resource_translations.user'
end
```

```yml{6-10}
# avo.es.yml
es:
  avo:
    dashboard: 'Dashboard'
    # ... other translation keys
    resource_translations:
      user:
        zero: 'usuarios'
        one: 'usuario'
        other: 'usuarios'
```

## Localizing fields

Similarly, you can even localize fields. All you need to do is add a `translation_key:` option on the field declaration.


```ruby{7}
# app/avo/resources/project_resource.rb
class ProjectResource < Avo::BaseResource
  self.title = :name

  field :id, as: :id
  # ... other fields
  field :files, as: :files, translation_key: 'avo.field_translations.file'
end
```

```yml{6-10}
# avo.es.yml
es:
  avo:
    dashboard: 'Dashboard'
    # ... other translation keys
    field_translations:
      file:
        zero: 'archivos'
        one: 'archivo'
        other: 'archivos'
```

## Setting the locale

Setting the locale for Avo is simple. Just use the `config.locale = :en` config attribute. Default is `nil` and it will fallback to whatever you have configured in `application.rb`.

```ruby{2}
Avo.configure do |config|
  config.locale = :en # default is nil
end
```

This will change the locale only for Avo requests. The rest of your app will still use your locale set in `application.rb`. If you wish to change the locale for the whole app you can use the `set_locale=pt-BR` param. That will set the default locale until you restart your server.

If you wish to change the locale only for one request use the `force_locale=pt-BR` param. This will set the locale for that request and will keep the `force_locale` param while you navigate Avo. Remove that param when you want to go back to your configured `default_locale`.

Check out our guide for [multilingual records](recipes/multilingual-content).

## Re-generate the locale

When updating Avo please run `bin/rails generate avo:locales` to re-generate the locales file.

## FAQ

If you try to localize your resources and fields and it doesn't seem to work please be aware of the following.

### Advanced localization is a Pro feature

Localizing strings in Avo will still work using Rails' `I18n` mechanism, but localizing fileds and resources require a `Pro` or above license.

The reasoning behind this is that deep localization is a more advanced feature that usually falls in the commercial realm. If you create commercial products or apps for clients, and make revenue using Avo, we'd love to get your support to be able to maintain it and ship new features going forward.

### The I18n.t method defaults to the name of that field/resource

Internally the localization works like so `I18n.t(translation_key, count: 1, default: default)` where the `default` is the computed field/resource name. So check the structure of you translation keys.

```yml
# config/locales/avo.pt-BR.yml
pt-BR:
  avo:
    field_translations:
      file:
        zero: 'arquivos'
        one: 'arquivo'
        other: 'arquivos'
    resource_translations:
      user:
        zero: 'usuários'
        one: 'usuário'
        other: 'usuários'
```
