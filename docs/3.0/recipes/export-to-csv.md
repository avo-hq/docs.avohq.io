# Export to CSV action

Even if we don't have a dedicated export to CSV feature, you may create an action that will take all the selected records and export a CSV file for you.

Below you have an example which you can take and customize to your liking. It even give you the ability to use custom user-selected attributes.

```ruby
# app/avo/actions/export_csv.rb
class Avo::Actions::ExportCsv < Avo::BaseAction
  self.name = "Export csv"
  self.no_confirmation = false

  def handle(**args)
    records, resource = args.values_at(:records, :resource)

    return error "No record selected" if records.blank?

    attributes = get_attributes records.first

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

  def get_attributes(record)
    # return ["id", "created_at"] # uncomment this and fill in for custom model properties

    record.class.columns_hash.keys
  end
end

```

![](/assets/img/recipes/export-to-csv/export-to-csv.gif)

