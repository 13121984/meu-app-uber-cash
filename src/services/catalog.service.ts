
import fs from 'fs/promises';
import path from 'path';

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
        return fileContent ? JSON.parse(fileContent) : {};
    } catch (error) {
        if (error instanceof SyntaxError) {
             console.error("Error parsing catalog.json, returning empty object:", error);
             return {};
        }
        // If file doesn't exist or other read error
        return {};
    }
}

export async function getCatalog(): Promise<Catalog> {
  const data = await readCatalogFile();
  
  const mergeCatalogs = (defaults: CatalogItem[], saved: CatalogItem[] = []): CatalogItem[] => {
      const savedMap = new Map(saved.map(item => [item.name, item]));
      const finalItems: CatalogItem[] = [];
      const usedNames = new Set<string>();

      defaults.forEach(defaultItem => {
          const savedItem = savedMap.get(defaultItem.name);
          finalItems.push({
              name: defaultItem.name,
              isDefault: defaultItem.isDefault, 
              active: savedItem?.active ?? defaultItem.active, 
          });
          usedNames.add(defaultItem.name);
      });

      saved.forEach(savedItem => {
          if (!usedNames.has(savedItem.name)) {
              finalItems.push({
                  ...savedItem,
                  isDefault: false,
              });
          }
      });
      
      return finalItems;
  };
  
  const finalCatalog = {
      earnings: mergeCatalogs(defaultCatalog.earnings, data.earnings),
      fuel: mergeCatalogs(defaultCatalog.fuel, data.fuel)
  };
  
  // Ensure the file is created with default data if it was missing or corrupt
  try {
    await fs.access(dataFilePath);
    // If access is fine, we do nothing.
  } catch {
    await saveCatalog(finalCatalog);
  }

  return finalCatalog;
}

export async function saveCatalog(catalog: Catalog): Promise<{ success: boolean, error?: string }> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(catalog, null, 2), 'utf8');
    
    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar catálogo.";
    return { success: false, error: errorMessage };
  }
}
