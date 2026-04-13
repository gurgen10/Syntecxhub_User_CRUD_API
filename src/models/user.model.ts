import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: [320, 'Email is too long'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [128, 'Stored password hash exceeds maximum length'],
        select: false,
    },
}, { timestamps: true });

userSchema.set('toJSON', {
    transform(_doc, ret) {
        const { password: _omit, ...safe } = ret as typeof ret & { password?: string };
        return safe;
    },
});

const User = mongoose.model('User', userSchema);

export default User;