
"use server";

import fs from 'fs/promises';
import path from 'path';
import { getUserDataPath } from './storage.service';
import type { AppTheme } from '@/types/settings';

// --- Tipos e Interfaces ---

export type Plan = 'basic' | 'pro' | 'autopilot';

export interface SecurityAnswer {
  question: string;
  answer: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  color: string;
  plate?: string; // Placa é opcional, diferencial para premium
}

export interface TaximeterRates {
    startingFare: number;
    ratePerKm: number;
    ratePerMinute: number;
}

export interface AnalyzerRates {
    ratePerKm: number;
    ratePerHour: number;
}

export interface UserPreferences {
    reportChartOrder?: string[];
    dashboardCardOrder?: string[];
    lastFreebieChangeDate?: string; // Data da última troca de card/gráfico gratuito
    taximeterRates?: TaximeterRates;
    analyzerRates?: AnalyzerRates;
    lastTaximeterUse?: string; // Data do último uso do taxímetro para usuários gratuitos
    colorTheme?: string; // ex: 'orange', 'blue'
    theme?: AppTheme;
}

export interface User {
  id: string; // Nome de usuário
  passwordHash: string; 
  plan: Plan; // Substitui isPremium
  securityAnswers: SecurityAnswer[];
  vehicles: Vehicle[];
  preferences: UserPreferences;
}

// --- Caminho do Arquivo ---

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// --- Funções de Leitura/Escrita ---

async function getUsers(): Promise<User[]> {
  try {
    await fs.access(usersFilePath);
    const fileContent = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(fileContent);
  } catch {
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
    await fs.writeFile(usersFilePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
}

async function saveUsers(users: User[]): Promise<void> {
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

// --- Funções Auxiliares de Criptografia (Simulada) ---

const createHash = (password: string) => `hashed_${password}`;
const verifyPassword = (password: string, hash: string) => createHash(password) === hash;

// --- Funções de Serviço ---

/**
 * Função simulada para obter o usuário ativo.
 * Em um app real, isso viria de uma sessão, cookie, etc.
 * Por enquanto, estamos pegando o primeiro usuário como o "logado".
 */
export async function getActiveUser(): Promise<User | null> {
    const users = await getUsers();
    // A lógica de login/logout no cliente irá determinar qual usuário está realmente ativo.
    // Esta função é um placeholder para o servidor. Para o propósito de pré-renderização,
    // podemos assumir um usuário ou nenhum. Vamos assumir o primeiro como padrão.
    return users.length > 0 ? users[0] : null;
}


export async function signup(userId: string, password: string, securityAnswers: SecurityAnswer[]): Promise<{ success: boolean, error?: string }> {
    const users = await getUsers();

    if (users.find(u => u.id.toLowerCase() === userId.toLowerCase())) {
        return { success: false, error: 'Este nome de usuário já está em uso.' };
    }
    
    if (securityAnswers.length < 2 || !securityAnswers[0].question || !securityAnswers[0].answer || !securityAnswers[1].question || !securityAnswers[1].answer) {
        return { success: false, error: 'É necessário fornecer duas perguntas e respostas de segurança.' };
    }

    const newUser: User = {
        id: userId,
        passwordHash: createHash(password),
        plan: 'basic', // Todo novo usuário começa como básico
        securityAnswers,
        vehicles: [],
        preferences: { // Preferências padrão
            reportChartOrder: [],
            dashboardCardOrder: [],
            colorTheme: 'orange', // Cor padrão
            theme: 'dark' // Tema padrão
        },
    };

    users.push(newUser);
    await saveUsers(users);
    
    // Create user-specific data directory on signup
    await getUserDataPath(userId);

    return { success: true };
}

export async function login(userId: string, password: string): Promise<{ success: boolean; user?: User, error?: string }> {
    const users = await getUsers();
    const user = users.find(u => u.id.trim().toLowerCase() === userId.trim().toLowerCase());

    if (!user) {
        return { success: false, error: 'Usuário ou senha inválidos.' };
    }

    const isPasswordCorrect = verifyPassword(password, user.passwordHash);

    if (!isPasswordCorrect) {
        return { success: false, error: 'Usuário ou senha inválidos.' };
    }
    
    // Retorna o objeto de usuário completo no login
    return { success: true, user: user };
}


export async function getUserById(userId: string): Promise<User | null> {
    if (!userId) return null;
    const users = await getUsers();
    return users.find(u => u.id === userId) || null;
}

export async function updateUser(userId: string, updatedData: Partial<User>): Promise<{ success: boolean, user?: User, error?: string }> {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, error: 'Usuário não encontrado.' };
    }

    users[userIndex] = { ...users[userIndex], ...updatedData };
    await saveUsers(users);

    return { success: true, user: users[userIndex] };
}

export async function updateUserPreferences(userId: string, updatedPreferences: Partial<UserPreferences>): Promise<{ success: boolean, user?: User, error?: string }> {
    const user = await getUserById(userId);
    if (!user) return { success: false, error: "Usuário não encontrado." };

    const newPreferences = { ...user.preferences, ...updatedPreferences };
    
    return await updateUser(userId, { preferences: newPreferences });
}


// --- Funções de Recuperação de Senha ---

export async function getUserSecurityQuestions(userId: string): Promise<{ success: boolean, questions?: string[], error?: string }> {
    const user = await getUserById(userId);
    if (!user || !user.securityAnswers || user.securityAnswers.length < 2) {
        return { success: false, error: 'Usuário não encontrado ou sem perguntas de segurança.' };
    }
    return { success: true, questions: user.securityAnswers.map(sa => sa.question) };
}

export async function verifySecurityAnswers(userId: string, answers: string[]): Promise<{ success: boolean, error?: string }> {
    const user = await getUserById(userId);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    
    const storedAnswers = user.securityAnswers.map(sa => sa.answer.toLowerCase().trim());
    const providedAnswers = answers.map(a => a.toLowerCase().trim());

    if (storedAnswers.length !== providedAnswers.length || !storedAnswers.every((val, index) => val === providedAnswers[index])) {
        return { success: false, error: 'Uma ou mais respostas estão incorretas.' };
    }
    
    return { success: true };
}

export async function resetPassword(userId: string, newPassword: string): Promise<{ success: boolean, error?: string }> {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: 'Usuário não encontrado.' };
    }

    users[userIndex].passwordHash = createHash(newPassword);
    await saveUsers(users);

    return { success: true };
}

// --- Funções de Gerenciamento de Veículo ---

export async function addVehicle(userId: string, vehicle: Omit<Vehicle, 'id'>): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = await getUserById(userId);
    if (!user) return { success: false, error: "Usuário não encontrado." };

    // Usuário Básico só pode ter 1 veículo. Pro e Autopilot podem ter mais.
    const isProOrHigher = user.plan === 'pro' || user.plan === 'autopilot';
    if (!isProOrHigher && user.vehicles.length >= 1) {
        return { success: false, error: "Usuários do plano Básico podem cadastrar apenas um veículo." };
    }

    const newVehicle: Vehicle = {
        ...vehicle,
        id: Date.now().toString(),
    };

    const updatedUser = {
        ...user,
        vehicles: [...user.vehicles, newVehicle]
    };
    
    return await updateUser(userId, updatedUser);
}

export async function deleteVehicle(userId: string, vehicleId: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = await getUserById(userId);
    if (!user) return { success: false, error: "Usuário não encontrado." };

    const updatedVehicles = user.vehicles.filter(v => v.id !== vehicleId);

     const updatedUser = {
        ...user,
        vehicles: updatedVehicles
    };
    
    return await updateUser(userId, updatedUser);
}
