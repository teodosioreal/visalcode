// Módulo dedicado apenas ao glob: o Vite não inclui, nos resultados de
// import.meta.glob, o próprio arquivo onde o glob é declarado — por isso
// isso fica separado de exportZip.ts (senão exportZip.ts sumiria do .zip).
export const sourceFiles = import.meta.glob(
  [
    '/src/**/*.{ts,tsx,css,json}',
    '!/src/routeTree.gen.ts',
    '/*.{json,ts,js}',
    '/README.md',
    '/.gitignore',
  ],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>
