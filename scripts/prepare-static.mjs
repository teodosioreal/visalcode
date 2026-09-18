// Roda depois do build (npm run build) e monta a pasta "hospedagem-estatica/",
// pronta para subir por FTP/Gerenciador de Arquivos em qualquer hospedagem
// compartilhada (ex: Hostinger) — sem precisar de Node rodando no servidor.
import { cpSync, existsSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const src = join(root, '.output', 'public')
const out = join(root, 'hospedagem-estatica')

if (!existsSync(src)) {
  console.error('Pasta .output/public não encontrada. Rode "npm run build" primeiro.')
  process.exit(1)
}

rmSync(out, { recursive: true, force: true })
cpSync(src, out, { recursive: true })

const shell = join(out, '_shell.html')
const index = join(out, 'index.html')
if (existsSync(shell)) {
  renameSync(shell, index)
}

// O app tem mais de uma rota (/, /flows) mas só existe um index.html — sem
// isso, acessar/recarregar /flows direto (fora de um clique dentro do app)
// dá 404 em hospedagem Apache comum, já que não existe uma pasta "flows/".
writeFileSync(
  join(out, '.htaccess'),
  [
    'RewriteEngine On',
    'RewriteCond %{REQUEST_FILENAME} !-f',
    'RewriteCond %{REQUEST_FILENAME} !-d',
    'RewriteRule ^ index.html [L]',
    '',
  ].join('\n'),
)

console.log(`\nPronto! Pasta "hospedagem-estatica/" gerada.`)
console.log('Suba TODO o conteúdo dela (index.html + assets/) para a pasta pública')
console.log('do seu domínio na hospedagem (ex: public_html na Hostinger).')
