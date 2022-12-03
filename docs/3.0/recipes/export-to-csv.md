# Export to CSV action

Even if we don't have a dedicated export to CSV feature, you may create an action that will take all the selected records and export a CSV file for you.

Below you have an example which you can take and customize to your liking. It even give you the ability to use custom user-selected attributes.

```ruby
# app/avo/actions/export_csv.rb
class ExportCsv < Avo::BaseAction
  self.name = "Export CSV"
  self.may_download_file = true

  # Add more fields here for custo user-selected columns
  field :id, as: :boolean
  field :created_at, as: :boolean

  def handle(models:, resource:, fields:, **)
    columns = models.first.class.columns_hash.keys
    # Uncomment below to use the user-selected fields
    # columns = get_columns_from_fields(fields)

    return error "No record selected" if models.blank?

    file = CSV.generate(headers: true) do |csv|
      csv << columns

      models.each do |record|
        csv << columns.map do |attr|
          record.send(attr)
        end
      end
    end

    download file, "#{resource.plural_name}.csv"
  end

  def get_columns_from_fields(fields)
    fields.select { |key, value| value }.keys
  end
end
```

![](/assets/img/recipes/export-to-csv/export-to-csv.gif)

