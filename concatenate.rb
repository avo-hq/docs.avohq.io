#!/usr/bin/env ruby

# Check if a folder path is provided
if ARGV.empty?
  puts "Usage: #{$PROGRAM_NAME} folder_path"
  exit
end

def remove_frontmatter(content)
  # Remove YAML frontmatter (content between --- markers at the start of the file)
  content.gsub(/\A---\n.*?\n---\n/m, '')
end

def process_includes(content, current_file_dir)
  content.gsub(/<!--\s*@include:\s*(.+?)\s*-->/) do |match|
    include_path = $1.strip
    # Remove any leading ./ from the include path
    include_path = include_path.sub(/\A\.\//, '')

    # Resolve the include path relative to the current file's directory
    absolute_path = File.expand_path(include_path, current_file_dir)

    if File.exist?(absolute_path)
      included_content = File.read(absolute_path)
      # Recursively process includes in the included file, using the new current_file_dir
      process_includes(included_content, File.dirname(absolute_path))
    else
      puts "Warning: Include file not found: #{absolute_path}"
      puts "  Current file directory: #{current_file_dir}"
      puts "  Include path: #{include_path}"
      match
    end
  end
end

folder_path = ARGV[0]
# Ensure we don't have duplicate path components
# folder_path = folder_path.gsub(%r{/docs/docs/}, '/docs/')
output_file = './docs/4.0/everything.md'

begin
  # Initialize an empty string to hold the concatenated content
  concatenated_content = ''

  # Read and prepend the start_of_everything.md file
  start_file = File.join(__dir__, 'start_of_everything.md')
  if File.exist?(start_file)
    concatenated_content = File.read(start_file) + "\n\n"
  else
    puts "Warning: start_of_everything.md not found in root directory"
  end

  # Read all .md files from the given folder and its subdirectories, excluding the common directory and everything.md
  Dir.glob(File.join(folder_path, '**', '*.md'))
    .reject { |file| file.include?('/common/') || file.end_with?('everything.md') }
    .each do |file|
    # Read the content of each file
    content = File.read(file)

    # Remove frontmatter
    content = remove_frontmatter(content)

    # Process includes in the content, using the current file's directory for path resolution
    processed_content = process_includes(content, File.dirname(file))

    # Append the processed content
    concatenated_content += processed_content + "\n\n"
  end

  # Write the concatenated content to a new file
  File.write(output_file, concatenated_content)
  puts "All Markdown files have been concatenated into #{output_file}"
rescue StandardError => e
  puts "An error occurred: #{e.message}"
end
