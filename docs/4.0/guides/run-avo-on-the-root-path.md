# Run Avo on the root path

You might want to run avo on the root path on your app.
We've seen plenty of users use this strategy.

This is as simple as changing the `root_path` from the `avo.rb` initializer to `/`.

```ruby{5}
Avo.configure do |config|
  # other pieces of configuration

  # Change the path to `/` to make it the root path
  config.root_path = '/'
end
```

I used these commands to create a new repo and change the path.

```bash
rails new avo-root-path
cd avo-root-path
bin/rails app:template LOCATION='https://avohq.io/app-template'
sed -i '' "s|config.root_path = '/avo'|config.root_path = '/'|" config/initializers/avo.rb
```
