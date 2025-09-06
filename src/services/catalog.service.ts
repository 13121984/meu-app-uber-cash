
"use server";

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export interface CatalogItem {
  name: string;
  active: boolean;
  isDefault: boolean; // Cannot be deleted if true
}

export interface Catalog {
  earnings: CatalogItem[];
  fuel: CatalogItem[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'catalog.json');

const defaultCatalog: Catalog = {
  earnings: [
    { name: "Uber Cash", active: true, isDefault: true },
    { name: "99 Pop", active: true, isDefault: true },
    { name: "Particular", active: true, isDefault: true },
    { name: "Ganhos Extras", active: true, isDefault: true },
  ],
  fuel: [
    { name: "Etanol", active: true, isDefault: true },
    { name: "Gasolina Aditivada", active: true, isDefault: true },
    { name: "GNV", active: true, isDefault: true },
  ]
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
  
  // Merge with default to ensure all default items are present
  const mergedEarnings = [...defaultCatalog.earnings];
  const mergedFuel = [...defaultCatalog.fuel];

  const defaultEarningNames = new Set(defaultCatalog.earnings.map(i => i.name));
  const defaultFuelNames = new Set(defaultCatalog.fuel.map(i => i.name));

  if (data.earnings && Array.isArray(data.earnings)) {
    data.earnings.forEach((item: CatalogItem) => {
        const existingIndex = mergedEarnings.findIndex(i => i.name === item.name);
        if (existingIndex > -1) {
            // Update existing default item with saved state
            mergedEarnings[existingIndex].active = item.active;
        } else if (!defaultEarningNames.has(item.name)) {
            // Add custom item
            mergedEarnings.push({ ...item, isDefault: false });
        }
    });
  }
  
  if (data.fuel && Array.isArray(data.fuel)) {
     data.fuel.forEach((item: CatalogItem) => {
        const existingIndex = mergedFuel.findIndex(i => i.name === item.name);
        if (existingIndex > -1) {
            mergedFuel[existingIndex].active = item.active;
        } else if (!defaultFuelNames.has(item.name)) {
            mergedFuel.push({ ...item, isDefault: false });
        }
    });
  }

  return {
      earnings: mergedEarnings,
      fuel: mergedFuel
  };
}

/**
 * Salva o catálogo de categorias no arquivo local.
 */
export async function saveCatalog(catalog: Catalog): Promise<{ success: boolean, error?: string }> {
  try {
    await ensureDataFile();
    await fs.writeFile(dataFilePath, JSON.stringify(catalog, null, 2), 'utf8');
    
    // Revalidate all relevant paths that might use this catalog data
    revalidatePath('/configuracoes/catalogos');
    revalidatePath('/registrar', 'layout');

    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar catálogo.";
    return { success: false, error: errorMessage };
  }
}
