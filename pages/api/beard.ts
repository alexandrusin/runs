import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type Data = {
    photos: string[] | null;
    error?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    try {
        const photosDir = path.join(process.cwd(), 'public', 'beard');
        const allFilenames = fs.readdirSync(photosDir);

        // Filter filenames to include only those starting with "beard-"
        const beardFilenames = allFilenames.filter(name => name.startsWith('beard-'));

        // Sort filenames numerically based on the number after "beard-"
        const sortedFilenames = beardFilenames.sort((a, b) => {
            const numA = parseInt(a.split('-')[1].split('.')[0]); // Adjust to extract number before file extension
            const numB = parseInt(b.split('-')[1].split('.')[0]);
            return numA - numB;
        });

        const photos = sortedFilenames.map(file => `/beard/${file}`);
        res.status(200).json({ photos });
    } catch (error) {
        res.status(500).json({ photos: null, error: 'Failed to read photos directory.' });
    }
}
