const fs = require('fs');
const path = require('path');

const archivePath = path.join(__dirname, '..', 'data', 'archive.json');
const archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

const today = new Date();
const dd = String(today.getUTCDate()).padStart(2, '0');
const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
const yyyy = today.getUTCFullYear();
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dateLabel = `${dd} ${months[today.getUTCMonth()]} ${yyyy}`;
const dailyId = `${yyyy}-${mm}-${dd}`;

const newEntry = {
  dateLabel,
  source: 'Daily update',
  tag: 'Pending / Source',
  title: `Daily Buckfast entry — ${dailyId}`,
  summary: 'Automatic daily slot created. Replace this with a real sourced article when your retrieval source is connected.',
  excerpt: 'Source not yet connected…',
  url: `https://example.com/buckfast/${dailyId}`
};

if (!archive.find(item => item.url === newEntry.url)) {
  archive.unshift(newEntry);
  fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
  console.log('Daily entry added.');
} else {
  console.log('Entry already exists for today.');
}
