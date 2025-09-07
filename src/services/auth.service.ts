
"use server";

import fs from 'fs/promises';
import path from 'path';

// In a real application, passwords should NEVER be stored in plain text.
// We would use libraries like 'bcrypt' to hash passwords.
// For this project, we'll keep it simple but be aware of the vulnerability.

export interface User {
  id: string;
  passwordHash: string; // We will store a simple "hash" (id + password)
  isPremium?: boolean;
}

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    await fs.access(usersFilePath);
    const fileContent = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(fileContent);
  } catch {
    // If the file doesn't exist, create it with an empty array
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
    await fs.writeFile(usersFilePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
}

async function saveUsers(users: User[]): Promise<void> {
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

// Simulates a simple "hash". DO NOT USE IN PRODUCTION.
const createHash = (password: string) => `hashed_${password}`;
const verifyPassword = (password: string, hash: string) => createHash(password) === hash;


export async function signup(userId: string, password: string): Promise<{ success: boolean, error?: string }> {
    const users = await getUsers();

    if (users.find(u => u.id.toLowerCase() === userId.toLowerCase())) {
        return { success: false, error: 'Este nome de usuário já está em uso.' };
    }

    const newUser: User = {
        id: userId,
        passwordHash: createHash(password),
        isPremium: false, // Every new user starts as non-premium
    };

    users.push(newUser);
    await saveUsers(users);

    return { success: true };
}

export async function login(userId: string, password: string): Promise<{ success: boolean; user?: Omit<User, 'passwordHash'>, error?: string }> {
    const users = await getUsers();
    const user = users.find(u => u.id.toLowerCase() === userId.toLowerCase());

    if (!user) {
        return { success: false, error: 'Usuário ou senha inválidos.' };
    }

    const isPasswordCorrect = verifyPassword(password, user.passwordHash);

    if (!isPasswordCorrect) {
        return { success: false, error: 'Usuário ou senha inválidos.' };
    }

    const { passwordHash, ...userToReturn } = user;
    return { success: true, user: userToReturn };
}
