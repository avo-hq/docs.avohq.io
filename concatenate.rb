#!/usr/bin/env ruby

# Check if a folder path is provided
if ARGV.empty?
  puts "Usage: #{$PROGRAM_NAME} folder_path"
  exit
end

folder_path = ARGV[0]
output_file = './docs/3.0/everything.md'

begin
  # Initialize an empty string to hold the concatenated content
  concatenated_content = ''

  # Read all .md files from the given folder and its subdirectories
  Dir.glob(File.join(folder_path, '**', '*.md')).each do |file|
    # Read the content of each file and append it to the concatenated_content
    concatenated_content += File.read(file) + "\n\n"
  end

  # Write the concatenated content to a new file
  File.write(output_file, concatenated_content)
  puts "All Markdown files have been concatenated into #{output_file}"
rescue StandardError => e
  puts "An error occurred: #{e.message}"
end
