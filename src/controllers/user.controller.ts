import type { Request, Response } from 'express';
import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { hashPassword } from '../lib/password.js';
import User from '../models/user.model.js';
import { profilePictureUploadsDir } from '../middleware/profilePictureUpload.js';

const deleteStoredProfilePicture = async (filename?: string | null) => {
    if (!filename) {
        return;
    }

    const filePath = path.resolve(profilePictureUploadsDir, filename);

    try {
        await unlink(filePath);
    } catch (error: unknown) {
        const code = (error as { code?: string }).code;
        if (code !== 'ENOENT') {
            throw error;
        }
    }
};

const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
};

const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
}

const createUser = async (req: Request, res: Response) => {
    try {
        const hashedPassword = await hashPassword(req.body.password);
        const user = await User.create({ ...req.body, password: hashedPassword });
        res.status(200).json(user);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await deleteStoredProfilePicture(user.profilePicture?.filename);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
}

const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { password, ...rest } = req.body as {
            password?: string;
            name?: string;
            email?: string;
        };
        const updatePayload =
            password !== undefined
                ? { ...rest, password: await hashPassword(password) }
                : rest;
        const user = await User.findByIdAndUpdate(id, updatePayload, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
}

const uploadUserProfilePicture = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Profile picture file is required' });
        }

        const user = await User.findById(id);

        if (!user) {
            await deleteStoredProfilePicture(file.filename);
            return res.status(404).json({ message: 'User not found' });
        }

        const previousFilename = user.profilePicture?.filename;
        user.profilePicture = {
            originalName: file.originalname,
            filename: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            url: `/api/users/${id}/profile-picture`,
            uploadedAt: new Date(),
        };
        await user.save();
        await deleteStoredProfilePicture(previousFilename);

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
};

const getUserProfilePicture = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user || !user.profilePicture?.filename) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }

        const filePath = path.resolve(profilePictureUploadsDir, user.profilePicture.filename);
        res.sendFile(filePath, (error) => {
            if (!error) {
                return;
            }

            const statusCode = (error as { statusCode?: number }).statusCode;
            if (statusCode === 404) {
                return res.status(404).json({ message: 'Profile picture not found' });
            }

            return res.status(500).json({ message: 'Internal server error' });
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
};

const deleteUserProfilePicture = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingFilename = user.profilePicture?.filename;
        if (!existingFilename) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }

        await deleteStoredProfilePicture(existingFilename);
        user.profilePicture = undefined;
        await user.save();

        res.status(200).json({ message: 'Profile picture deleted successfully' });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ message });
    }
};

export {
    getUsers,
    getUserById,
    createUser,
    deleteUser,
    updateUser,
    uploadUserProfilePicture,
    getUserProfilePicture,
    deleteUserProfilePicture,
};
