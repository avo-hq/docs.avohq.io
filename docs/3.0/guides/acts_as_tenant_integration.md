# Acts As Tenant Integration

Recipe [contributed](https://github.com/avo-hq/docs.avohq.io/pull/218) by [SahSantoshh](https://github.com/sahsantoshh).

There are different ways to achieve multi-tenancy in an application.
We already have a doc which describes about [Multitenancy](../multitenancy.md) with Avo.
Here we will deep dive in integrating [Acts As Tenant](https://github.com/ErwinM/acts_as_tenant) which supports row-level multitenancy with Avo.
In this implementation we will be setting tenant to subdomain.

:::info
Check out the [acts_as_tenant](https://github.com/ErwinM/acts_as_tenant) documentation for reference.
:::

## Installation
___

To use it, add it to your Gemfile:

:::code-group
```ruby [Gemfile]{3}
gem 'acts_as_tenant'
```
:::

## Tenant
___

Let's create model for tenant. We are using _Account_ as our tenant.

**Account Migration and Model class**

:::code-group
```ruby [db/migrate/random_number_create_accounts.rb]{3}
# Migration
class CreateAccounts < ActiveRecord::Migration[7.1]
  def change
    create_table :accounts do |t|
      t.string :name
      t.string :subdomain

      t.timestamps
    end

    add_index :accounts, :subdomain, unique: true
    add_index :accounts, :created_at
  end
end
```
```ruby [app/models/account.rb]{3}
# Account model handles Tenant management
class Account < ApplicationRecord
  MAX_SUBDOMAIN_LENGTH = 20

  validates :name, :subdomain, presence: true
  validates_uniqueness_of :name, :subdomain, case_sensitive: false
  validates_length_of :subdomain, :name, maximum: MAX_SUBDOMAIN_LENGTH

end
```
:::

## Scope models
___

Now let's add users to Account. Here I am assuming to have an existing user model which is used for _Authentication_.
Similarly we can scope other models.

:::code-group
```ruby [db/migrate/random_number_add_account_to_users.rb]{3}
class AddAccountToUsers < ActiveRecord::Migration
  def up
    add_column :users, :account_id, :integer # if we have existing user set null to true then update the data using seed
    add_index  :users, :account_id
  end
end
```
```ruby [app/models/account.rb]{3}
# Authentication
class User < ActiveRecord::Base
  acts_as_tenant(:account)
end
```
:::

## Setting the current tenant
___

There are three ways to set the current tenant but we be using the subdomain to lookup the current tenant.
Since Avo has it's own _Application Controller_ so there is no point in setting the tenant in Rails default _Application Controller_ but we will set it there as well just to be safe site and also we might have some other pages other than Admin Dashboard supported by Avo.

:::code-group
```ruby [app/controllers/concerns/multitenancy.rb]{3}
# Multitenancy, to set the current account/tenant.
module Multitenancy
  extend ActiveSupport::Concern

  included do
    prepend_before_action :set_current_account
  end

  def set_current_account
    hosts = request.host.split('.')

    # just to make sure we are using subdomain path
    subdomain = (hosts[0] if hosts.length > 2)

    # We only allow users to login from their account specific subdomain not outside of it.
    sign_out(current_user) if subdomain.blank?

    current_account = Account.find_by(subdomain:)
    sign_out(current_user) if current_account.blank?

    # set tenant for Avo and ActAsTenant
    ActsAsTenant.current_tenant = current_account
    Avo::Current.tenant = current_account
    Avo::Current.tenant_id = current_account.id
  end
end
```

```ruby [config/initializers/avo.rb]{3}
Avo.configure do |config|
  # configuration values
end

Rails.configuration.to_prepare do
  Avo::ApplicationController.include Multitenancy
end
```
:::

Now, whenever we navigate to https://sahsantoshh.example.com/ the tenant & the tenant_id will be set to **sahsantoshh**.


## Move existing data to model

We might have to many users and other records which needs to be associated with Account.
For example, we will only move users record to the account

:::code-group
```ruby [db/seeds.rb]{3}
# Create default/first account where we want to associate exiting data
account = Account.find_or_create_by!(name: 'Nepal', subdomain: 'sahsantoshh')

User.unscoped.in_batches do |relation|
  relation.update_all(account_id: account.id)
  sleep(0.01) # throttle
end
```
:::

Now run the seed command to update existing records
