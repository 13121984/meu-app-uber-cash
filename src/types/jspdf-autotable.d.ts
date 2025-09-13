// This file is to extend the jsPDF type definitions to include the autoTable plugin.
// It prevents TypeScript errors when calling doc.autoTable.

import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: ((options: any) => jsPDF) & {
      previous: { finalY: number };
    };
  }
}
