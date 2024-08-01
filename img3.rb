require 'nokogiri'

# Define the base directory
BASE_DIR = 'docs/3.0'

# Recursively find all markdown files in the directory
def find_markdown_files(dir)
  Dir.glob("#{dir}/**/*.md")
end

# Process a single markdown file
def process_markdown_file(file_path)
  puts "Processing file: #{file_path}"

  content = File.read(file_path)
  modified_content = content.dup

  # Parse the content with Nokogiri to find image tags
  doc = Nokogiri::HTML.fragment(content)
  image_tags = doc.css('image')
  puts "Found #{image_tags.size} <image> tags in #{file_path}"

  image_tags.each do |img|
    src = img['src']
    alt = img['alt'] || ''
    width = img['width']
    height = img['height']

    new_tag = "<Image src=\"#{src}\" width=\"#{width}\" height=\"#{height}\" alt=\"#{alt}\" />"
    original_tag = img.to_html
    modified_content.gsub!(original_tag, new_tag)
    puts "Updated <image> to <Image /> in file #{file_path}"
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
