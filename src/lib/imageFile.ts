const MAX_DIMENSION = 1400
const JPEG_QUALITY = 0.82

/**
 * Redimensiona (se necessário) e converte uma imagem enviada pelo usuário em
 * uma data URL, pra guardar direto no fluxo (localStorage/JSON) sem precisar
 * de link externo nem de um servidor pra hospedar o arquivo.
 */
export function fileToOptimizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Não foi possível abrir a imagem.'))
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const width = Math.round(img.width * scale)
        const height = Math.round(img.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(reader.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        const keepPng = file.type === 'image/png' || file.type === 'image/gif'
        const dataUrl = keepPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', JPEG_QUALITY)
        resolve(dataUrl)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function dataUrlSizeLabel(dataUrl: string): string {
  const kb = Math.round((dataUrl.length * 0.75) / 1024)
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}
