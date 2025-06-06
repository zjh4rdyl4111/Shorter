import fs from 'fs';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'database.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { originalUrl, customAlias, description } = req.body;
  if (!originalUrl) {
    return res.status(400).json({ message: 'originalUrl is required' });
  }

  try {
    const fileData = fs.existsSync(dbFilePath) ? fs.readFileSync(dbFilePath, 'utf8') : '[]';
    const links = JSON.parse(fileData);

    let alias = customAlias || Math.random().toString(36).substring(2, 8);
    while (links.find(link => link.alias === alias)) {
      alias = Math.random().toString(36).substring(2, 8);
    }

    const newId = links.length > 0 ? Math.max(...links.map(link => link.id)) + 1 : 1;
    const shortUrl = `${process.env.BASE_URL || 'https://your-vercel-domain.vercel.app'}/${alias}`;

    const newLink = {
      id: newId,
      originalUrl,
      alias,
      shortUrl,
      description: description || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      clicks: 0
    };

    links.push(newLink);
    fs.writeFileSync(dbFilePath, JSON.stringify(links, null, 2), 'utf8');
    res.status(201).json(newLink);
  } catch (error) {
    console.error('Error writing to database.json:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
