import multer from 'multer';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import type { NextFunction, Request, Response } from 'express';

const uploadsDir = path.resolve(process.cwd(), 'uploads', 'profile-pictures');

const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

const storage = multer.diskStorage({
    destination: async (_req, _file, callback) => {
        try {
            await mkdir(uploadsDir, { recursive: true });
            callback(null, uploadsDir);
        } catch (error) {
            callback(error as Error, uploadsDir);
        }
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname) || '.bin';
        const safeExtension = extension.replace(/[^.\w]/g, '').toLowerCase();
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
        callback(null, filename);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        if (allowedMimeTypes.has(file.mimetype)) {
            callback(null, true);
            return;
        }

        callback(
            new multer.MulterError(
                'LIMIT_UNEXPECTED_FILE',
                'Only jpg, png, webp, and gif files are allowed',
            ),
        );
    },
});

export const uploadProfilePicture = (req: Request, res: Response, next: NextFunction) => {
    upload.single('profilePicture')(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Profile picture size must be at most 2MB' });
            }
            return res.status(400).json({ message: 'Only jpg, png, webp, and gif files are allowed' });
        }

        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        next();
    });
};

export const profilePictureUploadsDir = uploadsDir;
