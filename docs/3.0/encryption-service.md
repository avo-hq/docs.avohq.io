# Execution context

[`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) it's used internally by Avo when is needed to encrypt sensible params.

One example is the select all feature, where we pass the query, encrypted, through params.

## How does the [`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) work?

The `EncryptionService` is an service that can be called anywhere on the app.

### Public methods

:::option `encrypt`
Used to encrypt data
:::

:::option `decrypt`
Used to decrypt data
:::

<br><br>

### Mandatory arguments:

:::option `message`
Object to be encrypted
:::

:::option `purpose`
A symbol with the purpose of encryption, can be anything, it just ***need to match when decrypting***.
:::

<br><br>

### Optional arguments
This service uses [`ActiveSupport::MessageEncryptor`](https://api.rubyonrails.org/v5.2.3/classes/ActiveSupport/MessageEncryptor.html) as encryptor so [`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) accepts any argument specified on [`ActiveSupport::MessageEncryptor` documentation](https://api.rubyonrails.org/v5.2.3/classes/ActiveSupport/MessageEncryptor.html)

## Usage example

### Basic text:
```ruby
secret_encryption = Avo::Services::EncryptionService.encrypt(message: "Secret string", purpose: :demo)
# "x+rnETtClF2cb80PtYzlULnVB0vllf+FvwoqBpPbHWa8q6vlml5eRWrwFMcYrjI6--h2MiT1P5ctTUjwfQ--k2WsIRknFVE53QwXADDDJw=="

Avo::Services::EncryptionService.decrypt(message: secret_encryption, purpose: :demo)
# "Secret string"
```

### Objects with custom serializer:
```ruby
secret_encryption = Avo::Services::EncryptionService.encrypt(message:Course::Link.first, purpose: :demo, serializer: Marshal)
# "1UTtkhu9BDywzz8yl8/7cBZnOoM1wnILDJbT7gP+zz8M/t1Dve4QTFQP5nfHZdYK9KvFDwkizm8DTHyNZdixDtCO/M7yNMlzL8Mry1RQ3AF0qhhTzFeqb5UqyQv/Cuq+NWvQ+GXv3gFckXaNqsFSX5yDccEpRDpyNkYT4MFxOa+8hVR4roebkNKB89lb73anBDTHsTAd37y2LFiv2YaiFguPQ/...

Avo::Services::EncryptionService.decrypt(message: secret_encryption, purpose: :demo, serializer: Marshal)
# #<Course::Link:0x00007fd28dc44c00 id: 1, link: "http://ortiz.com/cher_mohr", course_id: 1, created_at: Thu, 07 Dec 2023 11:05:13.779644000 UTC +00:00, updated_at: Thu, 07 Dec 2023 11:05:13.779644000 UTC +00:00, position: 1>
```

## Secret key base
:::warning
[`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) fetches a secret key base to be used on the encrypt / decrypt process. Make sure that you have it defined in any of the following:

`ENV["SECRET_KEY_BASE"] || Rails.application.credentials.secret_key_base || Rails.application.secrets.secret_key_base`
:::
