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

def transform_links(content, current_file_dir, link_map)
  # Match markdown links that are relative paths (not starting with http://, https://, or #)
  content.gsub(/\[([^\]]+)\]\(([^#][^)]+)\)/) do |match|
    link_text = $1
    link_path = $2

    # Skip if it's an external link or mailto link
    next match if link_path.start_with?('http://', 'https://', 'mailto:')

    # Handle HTML links
    if link_path.include?('.html')
      # Extract just the filename without extension and convert to anchor
      anchor = File.basename(link_path.split('#').first, '.html').downcase
      link_map[link_path] = "##{anchor}"
      next "[#{link_text}](##{anchor})"
    end

    # Handle markdown links with fragments
    if link_path.include?('#')
      # Extract just the filename without extension and convert to anchor
      anchor = File.basename(link_path.split('#').first, '.md').downcase
      link_map[link_path] = "##{anchor}"
      next "[#{link_text}](##{anchor})"
    end

    # Remove any leading ./ from the link path
    link_path = link_path.sub(/\A\.\//, '')

    # Try both with and without .md extension
    possible_paths = [link_path]
    possible_paths << "#{link_path}.md" unless link_path.end_with?('.md')

    found = false
    result = nil

    possible_paths.each do |path|
      # Get the absolute path of the linked file
      absolute_path = File.expand_path(path, current_file_dir)

      # Skip if it's a directory
      next if File.directory?(absolute_path)

      # If the file exists, add it to our link map
      if File.exist?(absolute_path)
        # Read the file to get its first heading
        linked_content = File.read(absolute_path)
        if linked_content =~ /^#+\s+(.+)$/
          heading = $1.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/(^-|-$)/, '')
          link_map[link_path] = "##{heading}"
          found = true
          result = "[#{link_text}](##{heading})"
          break
        else
          # If no heading found, just use the filename as the anchor
          anchor = File.basename(path, '.md').downcase.gsub(/[^a-z0-9]+/, '-')
          link_map[link_path] = "##{anchor}"
          found = true
          result = "[#{link_text}](##{anchor})"
          break
        end
      end
    end

    if found
      result
    else
      puts "Warning: Linked file not found: #{link_path}"
      puts "  Current file directory: #{current_file_dir}"
      puts "  Tried paths: #{possible_paths.join(', ')}"
      match
    end
  end
end

folder_path = ARGV[0]
# Ensure we don't have duplicate path components
# folder_path = folder_path.gsub(%r{/docs/docs/}, '/docs/')
output_file = './docs/4.0/everything.md'
llmstx_file = './docs/public/llms.txt'

begin
  # Initialize an empty string to hold the concatenated content
  concatenated_content = ''

  # Initialize a hash to track link transformations
  link_map = {}

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

    # Transform links in the content
    processed_content = transform_links(processed_content, File.dirname(file), link_map)

    # Append the processed content
    concatenated_content += processed_content + "\n\n"
  end

  # Write the concatenated content to a new file
  File.write(output_file, concatenated_content)
  puts "All Markdown files have been concatenated into #{output_file}"

  # Write the concatenated content to a new file
  File.write(llmstx_file, concatenated_content)
  puts "All Markdown files have been concatenated into #{llmstx_file}"

  # Print the link map for debugging
  puts "\nLink transformations:"
  link_map.each do |original, transformed|
    puts "#{original} -> #{transformed}"
  end
rescue StandardError => e
  puts "An error occurred: #{e.message}"
end
