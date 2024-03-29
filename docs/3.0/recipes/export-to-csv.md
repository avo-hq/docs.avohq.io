# Export to CSV action

Even if we don't have a dedicated export to CSV feature, you may create an action that will take all the selected records and export a CSV file for you.

Below you have an example which you can take and customize to your liking. It even give you the ability to use custom user-selected attributes.

```ruby
# app/avo/actions/export_csv.rb
class Avo::Actions::ExportCsv < Avo::BaseAction
  self.name = "Export CSV"
  self.no_confirmation = false
  self.standalone = true

  def fields
    # Add more fields here for custom user-selected columns
    field :id, as: :boolean
    field :created_at, as: :boolean
  end

  def handle(records:, fields:, resource:, **args)
    # uncomment if you want to download all the records if none was selected
    # records = resource.model_class.all if records.blank?

    return error "No record selected" if records.blank?

    # uncomment to get all the models' attributes.
    # attributes = get_attributes_from_record records.first

    # uncomment to get some attributes
    # attributes = get_some_attributes

    attributes = get_attributes_from_fields fields

    # uncomment to get all the models' attributes if none were selected
    # attributes = get_attributes_from_record records.first if attributes.blank?

    file = CSV.generate(headers: true) do |csv|
      csv << attributes

      records.each do |record|
        csv << attributes.map do |attr|
          record.send(attr)
        end
      end
    end

    download file, "#{resource.plural_name}.csv"
  end

  def get_attributes_from_record(record)
    record.class.columns_hash.keys
  end

  def get_attributes_from_fields(fields)
    fields.select { |key, value| value }.keys
  end

  def get_some_attributes
    ["id", "created_at"]
  end
end
```

![](/assets/img/recipes/export-to-csv/export-to-csv.gif)

