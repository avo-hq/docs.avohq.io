const fs = require('fs');
const path = require('path');

function convertFileContent(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
        }

        // Replace :::option SOME_NAME\nSOME_CONTENT\n::: with <Option name="SOME_NAME">\nSOME_CONTENT\n</Option>
        const newData = data.replace(/:::option\s+([^\n]+)\n([\s\S]*?)\n:::/g, '<Option name="$1">\n$2\n</Option>');

        fs.writeFile(filePath, newData, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file ${filePath}:`, err);
                return;
            }
            console.log(`File converted: ${filePath}`);
        });
    });
}

function processDirectory(directory) {
    fs.readdir(directory, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${directory}:`, err);
            return;
        }

        files.forEach((file) => {
            const fullPath = path.join(directory, file.name);

            if (file.isDirectory()) {
                processDirectory(fullPath);
            } else if (file.isFile() && fullPath.endsWith('.md')) {
                convertFileContent(fullPath);
            }
        });
    });
}

const directory = process.argv[2];
if (!directory) {
    console.error('Please provide a directory path as an argument');
    process.exit(1);
}

processDirectory(directory);
