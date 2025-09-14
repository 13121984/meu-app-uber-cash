
'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * Sanitizes a user ID to be used as a directory name.
 * Prevents directory traversal attacks and invalid characters.
 * @param userId - The user ID to sanitize.
 * @returns A safe string for use as a directory name.
 */
function sanitizeUserId(userId: string): string {
    if (!userId) return '';
    // Replace spaces and special characters with a hyphen, and remove anything that isn't alphanumeric or a hyphen.
    return userId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Returns the absolute path to a user's specific data directory, creating it if it doesn't exist.
 * @param userId - The ID of the user.
 * @returns The path to the user's data directory.
 */
export async function getUserDataPath(userId: string): Promise<string> {
    if (!userId) {
        throw new Error("User ID is required.");
    }
    const sanitizedId = sanitizeUserId(userId);
    const userDirPath = path.join(process.cwd(), 'data', 'user-data', sanitizedId);
    await fs.mkdir(userDirPath, { recursive: true });
    return userDirPath;
}

/**
 * Writes data to a specific JSON file within a user's data directory.
 * @param userId - The ID of the user.
 * @param fileName - The name of the file (e.g., 'work-days.json').
 * @param data - The JSON-serializable data to write.
 */
export async function saveFile<T>(userId: string, fileName: string, data: T): Promise<void> {
    const userPath = await getUserDataPath(userId);
    const filePath = path.join(userPath, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Reads data from a specific JSON file within a user's data directory.
 * If the file doesn't exist, it creates it with the default content and returns the default content.
 * @param userId - The ID of the user.
 * @param fileName - The name of the file (e.g., 'work-days.json').
 * @param defaultContent - The default content to use if the file doesn't exist.
 * @returns The parsed JSON data from the file.
 */
export async function getFile<T>(userId: string, fileName: string, defaultContent: T): Promise<T> {
    const userPath = await getUserDataPath(userId);
    const filePath = path.join(userPath, fileName);
    try {
        await fs.access(filePath);
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent) as T;
    } catch {
        await saveFile(userId, fileName, defaultContent);
        return defaultContent;
    }
}
