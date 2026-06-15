const fs = require('fs');
const path = require('path');

/**
 * File List Generator
 * Scans the DOWNLOAD folder and generates files.json
 * 
 * Usage: node generate-files.js
 */

const DOWNLOAD_FOLDER = path.join(__dirname, 'DOWNLOAD');
const JSON_OUTPUT = path.join(__dirname, 'files.json');
const JS_OUTPUT = path.join(__dirname, 'files.js');

function generateFileList() {
    console.log('Scanning DOWNLOAD folder...');
    
    if (!fs.existsSync(DOWNLOAD_FOLDER)) {
        console.error(`Error: Folder ${DOWNLOAD_FOLDER} not found!`);
        const empty = { files: [] };
        fs.writeFileSync(JSON_OUTPUT, JSON.stringify(empty, null, 2));
        fs.writeFileSync(JS_OUTPUT, `window.downloadFilesData = ${JSON.stringify(empty)};`);
        return;
    }
    
    const files = fs.readdirSync(DOWNLOAD_FOLDER)
        .filter(item => {
            const fullPath = path.join(DOWNLOAD_FOLDER, item);
            return fs.statSync(fullPath).isFile();
        })
        .map(filename => {
            const fullPath = path.join(DOWNLOAD_FOLDER, filename);
            const stats = fs.statSync(fullPath);
            
            return {
                name: filename,
                size: stats.size,
                date: stats.mtime.toISOString(),
                path: `DOWNLOAD/${encodeURIComponent(filename)}`
            };
        });
    
    // Sort by name
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    const output = {
        generatedAt: new Date().toISOString(),
        totalFiles: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        files: files
    };
    
    // 1. Generate files.json (for fetch / API use)
    fs.writeFileSync(JSON_OUTPUT, JSON.stringify(output, null, 2));
    
    // 2. Generate files.js (for direct browser include without fetch)
    const jsContent = `// Auto-generated file list - do not edit manually
// Generated: ${output.generatedAt}
window.downloadFilesData = ${JSON.stringify(output, null, 2)};
`;
    fs.writeFileSync(JS_OUTPUT, jsContent);
    
    console.log(`Success! Generated files for ${files.length} files.`);
    console.log(`Total size: ${formatBytes(output.totalSize)}`);
    console.log(`JSON output: ${JSON_OUTPUT}`);
    console.log(`JS output: ${JS_OUTPUT}`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run
if (require.main === module) {
    generateFileList();
}

module.exports = { generateFileList };
