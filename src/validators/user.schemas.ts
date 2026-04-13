import { pipe, z } from 'zod';

const objectIdRegex = /^[a-f0-9]{24}$/i;

const emailSchema = pipe(
    z.string().trim().toLowerCase().max(320),
    z.email('Invalid email address'),
);

export const createUserBodySchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    email: emailSchema,
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must be at most 72 characters (bcrypt limit)'),
});

export const updateUserBodySchema = z
    .object({
        name: z.string().trim().min(1).max(200).optional(),
        email: emailSchema.optional(),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(72, 'Password must be at most 72 characters (bcrypt limit)')
            .optional(),
    })
    .refine(
        (data) =>
            data.name !== undefined ||
            data.email !== undefined ||
            data.password !== undefined,
        { message: 'At least one of name, email, or password is required' },
    );

export const userIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid user id'),
});
