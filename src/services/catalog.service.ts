
"use server";

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export interface CatalogItem {
  name: string;
  active: boolean;
  isDefault: boolean; // Cannot be deleted by any user if true
}

export interface Catalog {
  earnings: CatalogItem[];
  fuel: CatalogItem[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'catalog.json');

// Defines the base, non-deletable categories.
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

async function readCatalogFile(): Promise<Partial<Catalog>> {
    try {
        await fs.access(dataFilePath);
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        if (!fileContent) {
            return {};
        }
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist or is invalid JSON, return empty object
        return {};
    }
}

/**
 * Busca o catálogo de categorias do arquivo local.
 */
export async function getCatalog(): Promise<Catalog> {
  const data = await readCatalogFile();
  
  const mergeCatalogs = (defaults: CatalogItem[], saved: CatalogItem[] = []): CatalogItem[] => {
      const savedMap = new Map(saved.map(item => [item.name, item]));
      const finalItems: CatalogItem[] = [];
      const usedNames = new Set<string>();

      // 1. Iterate through the hardcoded defaults
      defaults.forEach(defaultItem => {
          const savedItem = savedMap.get(defaultItem.name);
          finalItems.push({
              name: defaultItem.name,
              // isDefault is the source of truth from the hardcoded list
              isDefault: defaultItem.isDefault, 
              // active state is preserved from the user's saved data, otherwise use default
              active: savedItem?.active ?? defaultItem.active, 
          });
          usedNames.add(defaultItem.name);
      });

      // 2. Add custom items created by premium users that are not in the default list
      saved.forEach(savedItem => {
          if (!usedNames.has(savedItem.name)) {
              finalItems.push({
                  ...savedItem,
                  isDefault: false, // Ensure custom items are never default
              });
          }
      });
      
      return finalItems;
  };
  
  const finalCatalog = {
      earnings: mergeCatalogs(defaultCatalog.earnings, data.earnings),
      fuel: mergeCatalogs(defaultCatalog.fuel, data.fuel)
  };

  // If the file was empty, write the defaults back to it
  if (!data.earnings && !data.fuel) {
      await saveCatalog(finalCatalog);
  }

  return finalCatalog;
}


/**
 * Salva o catálogo de categorias no arquivo local.
 */
export async function saveCatalog(catalog: Catalog): Promise<{ success: boolean, error?: string }> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(catalog, null, 2), 'utf8');
    
    // Revalidate all relevant paths that might use this catalog data
    revalidatePath('/configuracoes', 'layout');
    revalidatePath('/registrar', 'layout');
    revalidatePath('/dashboard');
    revalidatePath('/relatorios');

    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar catálogo.";
    return { success: false, error: errorMessage };
  }
}
