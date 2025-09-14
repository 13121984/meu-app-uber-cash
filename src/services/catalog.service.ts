'use server';

import fs from 'fs/promises';
import path from 'path';

export interface CatalogItem {
  name: string;
  active: boolean;
  isDefault: boolean;
}

export interface Catalog {
  earnings: CatalogItem[];
  fuel: CatalogItem[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'catalog.json');

const defaultCatalog: Catalog = {
  earnings: [
    { name: "99 Pop", active: true, isDefault: true },
    { name: "Uber Cash", active: true, isDefault: true },
    { name: "Particular", active: true, isDefault: true },
    { name: "Ganhos Extras", active: true, isDefault: true },
    { name: "MD Drivers", active: true, isDefault: true },
    { name: "In Driver", active: true, isDefault: true },
    { name: "Outros", active: true, isDefault: true },
    { name: "Uber Confort", active: false, isDefault: true },
    { name: "Uber Black", active: false, isDefault: true },
  ],
  fuel: [
    { name: "GNV", active: true, isDefault: true },
    { name: "Etanol", active: true, isDefault: true },
    { name: "Gasolina Aditivada", active: true, isDefault: true },
    { name: "Gasolina Comum", active: true, isDefault: true },
  ]
};

export async function getCatalogData(): Promise<Catalog> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    if (!fileContent.trim()) {
        await fs.writeFile(dataFilePath, JSON.stringify(defaultCatalog, null, 2), 'utf8');
        return defaultCatalog;
    }
    const data = JSON.parse(fileContent);
    return {
        earnings: data.earnings || defaultCatalog.earnings,
        fuel: data.fuel || defaultCatalog.fuel
    };
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(dataFilePath, JSON.stringify(defaultCatalog, null, 2), 'utf8');
        return defaultCatalog;
    }
    console.error("Failed to read or parse catalog.json, returning default. Error:", error);
    return defaultCatalog;
  }
}

export async function saveCatalogData(catalog: Catalog): Promise<{ success: boolean, error?: string }> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(catalog, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar catálogo.";
    return { success: false, error: errorMessage };
  }
}
