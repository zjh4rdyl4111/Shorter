import fs from 'fs';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'database.json');

export default function handler(req, res) {
  const { alias } = req.query;
  try {
    const fileData = fs.existsSync(dbFilePath) ? fs.readFileSync(dbFilePath, 'utf8') : '[]';
    const links = JSON.parse(fileData);

    const linkIndex = links.findIndex(l => l.alias === alias);
    if (linkIndex !== -1) {
      links[linkIndex].clicks = (links[linkIndex].clicks || 0) + 1;
      fs.writeFileSync(dbFilePath, JSON.stringify(links, null, 2), 'utf8');

      res.writeHead(302, { Location: links[linkIndex].originalUrl });
      res.end();
    } else {
      res.status(404).send('Link not found');
    }
  } catch (error) {
    console.error('Error reading from database.json:', error);
    res.status(500).send('Internal Server Error');
  }
}
