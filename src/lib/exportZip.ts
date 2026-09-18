import JSZip from 'jszip'
import fileSaver from 'file-saver'
import type { Data } from '@puckeditor/core'
import type { Props } from '../puck/config'
import { sourceFiles } from './sourceManifest'
// import.meta.glob nunca inclui o arquivo onde ele é declarado (sourceManifest.ts),
// então seu conteúdo é lido aqui, de fora, via import ?raw comum.
import sourceManifestOwnSource from './sourceManifest.ts?raw'

const { saveAs } = fileSaver

const DATA_FILE_PATH = '/src/data/initial-data.json'
const MANIFEST_FILE_PATH = 'src/lib/sourceManifest.ts'

export async function exportProjectZip(currentData: Data<Props>) {
  const zip = new JSZip()
  zip.file(MANIFEST_FILE_PATH, sourceManifestOwnSource)

  for (const [path, content] of Object.entries(sourceFiles)) {
    const relativePath = path.replace(/^\//, '')
    if (path === DATA_FILE_PATH) {
      // Grava o estado atual do editor no lugar do conteúdo de exemplo,
      // assim o projeto baixado já nasce com as edições visuais feitas.
      zip.file(relativePath, JSON.stringify(currentData, null, 2))
    } else {
      zip.file(relativePath, content)
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  saveAs(blob, `visual-builder-projeto-${stamp}.zip`)
}
