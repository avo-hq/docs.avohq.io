---
license: pro
---

# Localization (i18n)

Avo leverages Rails' powerful I18n translations module. When you run `bin/rails avo:install`, Rails will generate for you the `avo.en.yml` translation file. This file will automatically be injected into the I18n translations module.

## Localizing resources

Let's say you want to localize a resource. All you need to do is add a `self.translation_key` class attribute in the `Resource` file. That will tell Avo to use that translation key to localize this resource. That will change the labels of that resource everywhere in Avo.

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.translation_key = 'avo.resource_translations.user'
end
```

```yaml{6-10}
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


```ruby{8}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
    # ... other fields
    field :files, as: :files, translation_key: 'avo.field_translations.file'
  end
end
```

```yaml{6-10}
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

## Localizing buttons label

The `avo.save` configuration applies to all save buttons. If you wish to customize the localization for a specific resource, such as `Avo::Resources::Product`, you can achieve this by:

```yml
---
en:
  avo:
    resource_translations:
      product:
        save: "Save the product!"
```

## Setting the locale

Setting the locale for Avo is simple. Just use the `config.locale = :en` config attribute. Default is `nil` and will fall back to whatever you have configured in `application.rb`.

```ruby{2}
Avo.configure do |config|
  config.locale = :en # default is nil
end
```

That will change the locale only for Avo requests. The rest of your app will still use your locale set in `application.rb`. If you wish to change the locale for the whole app, you can use the `set_locale=pt-BR` param. That will set the default locale until you restart your server.

Suppose you wish to change the locale only for one request using the `force_locale=pt-BR` param. That will set the locale for that request and keep the `force_locale` param while you navigate Avo. Remove that param when you want to go back to your configured `default_locale`.

Check out our guide for [multilingual records](recipes/multilingual-content).

## Re-generate the locale

When updating Avo, please run `bin/rails generate avo:locales` to re-generate the locales file.

## FAQ

If you try to localize your resources and fields and it doesn't seem to work, please be aware of the following.

### Advanced localization is a Pro feature

Localizing strings in Avo will still work using Rails' `I18n` mechanism, but localizing files and resources require a `Pro` or above license.

The reasoning is that deep localization is a more advanced feature that usually falls in the commercial realm. So if you create commercial products or apps for clients and make revenue using Avo, we'd love to get your support to maintain it and ship new features going forward.

### The I18n.t method defaults to the name of that field/resource

Internally the localization works like so `I18n.t(translation_key, count: 1, default: default)` where the `default` is the computed field/resource name. So check the structure of your translation keys.

```yaml
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
