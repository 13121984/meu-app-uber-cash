
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

// CORREÇÃO: Ajustado para refletir a regra de negócio do plano gratuito.
// Apenas as categorias mais essenciais são marcadas como 'isDefault'.
const defaultCatalog: Catalog = {
  earnings: [
    { name: "99 Pop", active: true, isDefault: true },
    { name: "Uber Cash", active: true, isDefault: true },
    { name: "Particular", active: true, isDefault: false },
    { name: "Ganhos Extras", active: true, isDefault: false },
    { name: "MD Drivers", active: true, isDefault: false },
    { name: "In Driver", active: true, isDefault: false },
    { name: "Outros", active: true, isDefault: false },
    { name: "Uber Confort", active: false, isDefault: false },
    { name: "Uber Black", active: false, isDefault: false },
  ],
  fuel: [
    { name: "GNV", active: true, isDefault: true },
    { name: "Etanol", active: true, isDefault: true },
    { name: "Gasolina Aditivada", active: true, isDefault: false },
    { name: "Gasolina Comum", active: true, isDefault: false },
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
  
  // Esta função de merge garante que o 'isDefault' venha sempre da fonte da verdade (defaultCatalog)
  // e que a ordem seja preservada.
  const mergeCatalogs = (defaults: CatalogItem[], saved: CatalogItem[]): CatalogItem[] => {
      const savedMap = new Map(saved.map(item => [item.name, item]));
      const finalItems: CatalogItem[] = [];
      const usedNames = new Set<string>();

      // Primeiro, percorre os itens padrão, usando o estado salvo se existir
      defaults.forEach(defaultItem => {
          const savedItem = savedMap.get(defaultItem.name);
          finalItems.push({
              ...defaultItem, // isDefault vem daqui
              active: savedItem?.active ?? defaultItem.active, // `active` é salvo
          });
          usedNames.add(defaultItem.name);
      });

      // Adiciona itens salvos que não são padrão (customizados)
      saved.forEach(savedItem => {
          if (!usedNames.has(savedItem.name)) {
              finalItems.push({
                  ...savedItem,
                  isDefault: false, // Garante que itens customizados não sejam marcados como padrão
              });
          }
      });
      
      return finalItems;
  };
  
  const finalEarnings = mergeCatalogs(defaultCatalog.earnings, data.earnings || []);
  const finalFuel = mergeCatalogs(defaultCatalog.fuel, data.fuel || []);

  return {
      earnings: finalEarnings,
      fuel: finalFuel
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
