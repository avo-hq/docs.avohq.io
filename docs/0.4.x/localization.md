# Localization

Avo leverages Rails powerful I18n translations module. When you run `bin/rails avo:install` Rails will generate for you the `avo.en.yml` translation file. This file will automatically be injected into the I18n translations module.

## Localizing resources

Let's say you want to localize a resource. All you need to do is add a `@translation_key` property in the resource initializer. This will tell Avo to use that translation key to localize this resource. This will change the labels of that resource everywhere in Avo.


```ruby{7}
# app/avo/resources/user.rb
module Avo
  module Resources
    class User < Resource
      def initialize
        @title = :name
        @translation_key = 'avo.resource_translations.user'
        @search = [:id, :first_name, :last_name]
        @includes = :posts
        @has_devise_password = true
      end
    end
  end
end
```

```yml{6-10}
# avo.en.yml
en:
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


```ruby{12}
# app/avo/resources/project.rb
module Avo
  module Resources
    class Project < Resource
      def initialize
        @title = :name
      end
      fields do
        id
        # ... other fields
        files :files, translation_key: 'avo.field_translations.file'
      end
    end
  end
end
```

```yml{6-10}
# avo.en.yml
en:
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

Setting the locale for Avo is simple. Just use the `config.locale = 'en-US'` config attribute.


```ruby{2}
Avo.configure do |config|
  config.locale = 'en-US'
end
```