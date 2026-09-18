import type { PuckData } from '../puck/config'
import raw from './initial-data.json'

/**
 * Conteúdo inicial da página. É a fonte de verdade que vai dentro do .zip
 * exportado — ao publicar/salvar no editor, este arquivo é regravado com o
 * estado atual, então o código reflete exatamente o que foi editado visualmente.
 */
export const initialData = raw as unknown as PuckData

export default initialData
