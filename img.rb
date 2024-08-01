require 'fileutils'
require 'mini_magick'

# Define the base directory
BASE_DIR = 'docs/3.0'

# Recursively find all markdown files in the directory
def find_markdown_files(dir)
  Dir.glob("#{dir}/**/*.md")
end

# Get image dimensions using MiniMagick
def get_image_dimensions(image_path)
  # puts ["get_image_dimensions()->", image_path].inspect
  image = MiniMagick::Image.open(image_path)
  [image.width, image.height]
rescue => e
  puts "Failed to get dimensions for #{image_path}: #{e.message}"
  [nil, nil]
end

# Process a single markdown file
def process_markdown_file(file_path)
  content = File.read(file_path)
  modified_content = content.gsub(/!\[([^\]]*)\]\(([^)]+)\)/) do |match|
    alt_text = $1
    image_src = $2
    puts ["file_path->", file_path, image_src].inspect

    # Determine the full path of the image
    image_path = File.join('docs', 'public', image_src)

    # Get image dimensions
    width, height = get_image_dimensions(image_path)

    # Replace with custom Image component
    if width && height
      puts "Updating image #{image_src} in file #{file_path} with dimensions #{width}x#{height}"
      "<Image src=\"#{image_src}\" width=\"#{width}\" height=\"#{height}\" alt=\"#{alt_text}\" />"
    else
      puts "Skipping image #{image_src} in file #{file_path} due to missing dimensions"
      match # If dimensions couldn't be retrieved, leave the original markdown
    end
  end

  # Write the modified content back to the file only if changes were made
  if content != modified_content
    File.write(file_path, modified_content)
    puts "Updated #{file_path}"
  else
    puts "No changes made to #{file_path}"
  end
end

# Main function to process all markdown files in the directory
def process_all_markdown_files
  markdown_files = find_markdown_files(BASE_DIR)
  puts "Found #{markdown_files.size} markdown files"
  markdown_files.each do |file_path|
    process_markdown_file(file_path)
  end
end

# Run the script
process_all_markdown_files
