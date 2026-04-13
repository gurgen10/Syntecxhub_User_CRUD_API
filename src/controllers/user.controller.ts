import type { Request, Response } from 'express';
import { hashPassword } from '../lib/password.js';
import User from '../models/user.model.js';

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

export { getUsers, getUserById, createUser, deleteUser, updateUser };
