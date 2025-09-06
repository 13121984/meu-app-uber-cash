
"use server";

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export interface Catalog {
  earnings: string[];
  fuel: string[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'catalog.json');

const defaultCatalog: Catalog = {
  earnings: ["Uber Cash", "99 Pop", "Particular", "Ganhos Extras"],
  fuel: ["Etanol", "Gasolina Aditivada", "GNV"]
};

async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(defaultCatalog, null, 2), 'utf8');
  }
}

/**
 * Busca o catálogo de categorias do arquivo local.
 */
export async function getCatalog(): Promise<Catalog> {
  await ensureDataFile();
  const fileContent = await fs.readFile(dataFilePath, 'utf8');
  const data = JSON.parse(fileContent);
  // Garante que ambas as chaves existam
  return {
      earnings: data.earnings || [],
      fuel: data.fuel || []
  };
}

/**
 * Salva o catálogo de categorias no arquivo local.
 */
export async function saveCatalog(catalog: Catalog): Promise<{ success: boolean, error?: string }> {
  try {
    await ensureDataFile();
    await fs.writeFile(dataFilePath, JSON.stringify(catalog, null, 2), 'utf8');
    
    revalidatePath('/configuracoes');
    revalidatePath('/registrar', 'layout');

    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar catálogo.";
    return { success: false, error: errorMessage };
  }
}
