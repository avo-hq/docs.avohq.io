require 'nokogiri'
require 'mini_magick'

# Define the base directory
BASE_DIR = 'docs/3.0'

# Recursively find all markdown files in the directory
def find_markdown_files(dir)
  Dir.glob("#{dir}/**/*.md")
end

# Get image dimensions using MiniMagick
def get_image_dimensions(image_path)
  image = MiniMagick::Image.open(image_path)
  [image.width, image.height]
rescue => e
  puts "Failed to get dimensions for #{image_path}: #{e.message}"
  [nil, nil]
end

# Process a single markdown file
def process_markdown_file(file_path)
  puts "Processing file: #{file_path}"

  content = File.read(file_path)
  modified_content = content.dup

  # Parse the content with Nokogiri to find img tags
  doc = Nokogiri::HTML.fragment(content)
  img_tags = doc.css('img')
  puts "Found #{img_tags.size} <img> tags in #{file_path}"

  img_tags.each do |img|
    src = img['src'] || img[':src']
    if src.nil? || src.strip.empty?
      puts "Skipping <img> tag with no src in #{file_path}"
      next
    end

    # If src is a Vue.js :src, unwrap the parentheses
    if src.start_with?("('/") && src.end_with?("')")
      src = src[2..-3]
    elsif src.start_with?('("') && src.end_with?('")')
      src = src[2..-3]
    end

    alt = img['alt'] || ''
    width = img['width']
    height = img['height']

    # Determine the full path of the image
    image_path = File.join('docs', 'public', src)

    # Get image dimensions if not specified
    if width.nil? || height.nil?
      width, height = get_image_dimensions(image_path)
    end

    # Replace with custom Image component if dimensions are available
    if width && height
      new_tag = "<Image src=\"#{src}\" width=\"#{width}\" height=\"#{height}\" alt=\"#{alt}\" />"
      img.replace(new_tag)
      modified_content = doc.to_html
      puts "Updated image #{src} in file #{file_path} with dimensions #{width}x#{height}"
    else
      puts "Skipping image #{src} in file #{file_path} due to missing dimensions"
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
