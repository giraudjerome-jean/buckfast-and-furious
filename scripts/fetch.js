// Ready-to-deploy placeholder script.
// This project package is designed to be connected to a daily automation
// on GitHub Actions or another scheduler. Replace the mocked item below
// with your preferred retrieval method or have a developer plug it in.

const fs = require('fs');
const path = require('path');

const archivePath = path.join(__dirname, '..', 'data', 'archive.json');
const archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

const today = new Date();
const dd = String(today.getUTCDate()).padStart(2, '0');
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dateLabel = `${dd} ${months[today.getUTCMonth()]} ${today.getUTCFullYear()}`;

const newEntry = {
  dateLabel,
  source: 'Source name',
  tag: 'Incident / Category',
  title: 'Replace with the daily Buckfast headline',
  summary: 'Replace with a short original summary.',
  excerpt: 'Replace with a very short source excerpt…',
  url: 'https://example.com/article'
};

if (!archive.find(item => item.url === newEntry.url)) {
  archive.unshift(newEntry);
  fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
}
