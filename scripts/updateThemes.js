const fs = require('fs');
const path = require('path');

// Paths
const themesPath = path.join(__dirname, '..', 'api', 'config', 'themes.json');
const outputPath = path.join(__dirname, '..', 'THEMES.md');

// Parameters
const username = 'github';
const count = 10;

// Read themes.json
const themes = JSON.parse(fs.readFileSync(themesPath, 'utf-8'));

// Generate Markdown content
let content = `# Available Themes

This document showcases the available themes dynamically generated from the themes.json configuration file.

| Theme Name | Preview |
|------------|---------|
`;

for (const themeName of Object.keys(themes)) {
  content += `| ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} | ![${themeName}](https://github-licenses-stats.vercel.app/api/top-licenses?theme=${themeName}&username=${username}&count=${count}) |
`;
}

content += `\n> **Note:** This file is generated dynamically. Run the update script to refresh it when new themes are added.\n`;

// Write to THEMES.md
fs.writeFileSync(outputPath, content, 'utf-8');

console.log('THEMES.md has been updated successfully.');
