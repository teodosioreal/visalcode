# PC Leve: Linux no pendrive para o seu EliteBook

O PC Leve é um sistema baseado no Debian que **roda direto do pendrive**, sem mexer no HD.
O seu Windows 7 continua lá, intacto. É só tirar o pendrive e ligar o computador normalmente.

**O que vem nele:**
- Firefox (navegador) em português, mais um botão para instalar o Google Chrome
- Menu Iniciar, gerenciador de arquivos, leitor de PDF e visualizador de fotos
- Ícone de Wi-Fi, volume, bateria e relógio na barra de baixo
- Desligar e reiniciar pelo menu Iniciar
- Teclado ABNT2 (com Ç) e horário de Brasília
- Entra sozinho, sem pedir senha
- **Persistência:** favoritos, senhas e downloads continuam salvos depois de desligar

**O que você precisa:**
- Um pendrive de **8 GB ou mais**. Prefira um de 16 GB. **Tudo o que estiver nele será apagado.**
- O arquivo `pc-leve-trixie-amd64.iso`

---

## 1. Gravar no pendrive pelo Windows (Rufus)

> ⚠️ **No Windows 7 use o Rufus 3.22.** As versões 4.x não funcionam mais no Windows 7.
> Baixe em https://github.com/pbatard/rufus/releases/tag/v3.22 (arquivo `rufus-3.22.exe`).
> Em Windows 10 ou 11, pode usar a versão mais nova, em https://rufus.ie

1. Coloque o pendrive e **feche qualquer janela do pendrive**.
2. Abra o Rufus. Se o Windows perguntar se quer permitir, clique em **Sim**.
3. Em **Dispositivo**, confira se aparece **o seu pendrive**. Olhe o nome e o tamanho.
   **Se aparecer outra coisa, pare.** Na dúvida, tire os outros pendrives e HDs externos.
4. Clique em **SELECIONAR** e escolha o arquivo `pc-leve-trixie-amd64.iso`.
5. Em **Tamanho da partição persistente**, arraste a barrinha. Isso é o espaço onde ficam
   salvos os seus favoritos, senhas e downloads. Exemplo: num pendrive de 16 GB, use 10 GB ou mais.
6. Deixe assim:
   - **Esquema de partição:** MBR
   - **Sistema de destino:** BIOS ou UEFI
   - **Sistema de arquivos:** FAT32
7. Clique em **INICIAR**.
8. O Rufus vai fazer algumas perguntas. Responda assim:
   - **"Baixar arquivos adicionais?"** Responda **Sim**. Precisa de internet.
   - **"Gravar em modo Imagem ISO ou modo Imagem DD?"** Escolha **modo Imagem ISO (Recomendado)**.
     Se escolher DD, a persistência não funciona.
   - **"Todos os dados serão destruídos"** Clique em **OK**. Antes, confirme que é o pendrive certo.
9. Espere a barra ficar verde e aparecer **PRONTO**. Feche o Rufus.

## 2. Gravar no pendrive pelo Linux

> ⚠️ **Cuidado:** se você errar o nome do dispositivo, **o HD inteiro é apagado.**

1. **Sem** o pendrive conectado, abra o Terminal e rode:
   ```
   lsblk -d -o NAME,SIZE,MODEL
   ```
2. Agora **conecte o pendrive** e rode o mesmo comando de novo.
   A linha **nova** é o pendrive. Exemplo: `sdb  14.9G  SanDisk Cruzer`.
   O nome dele é `/dev/sdb`. O seu pode ser diferente!
3. Grave a ISO. Troque `sdX` pelo nome que você achou:
   ```
   sudo dd if=pc-leve-trixie-amd64.iso of=/dev/sdX bs=4M status=progress conv=fsync
   ```
4. Crie a área de persistência no espaço que sobrou do pendrive:
   ```
   sudo fdisk /dev/sdX
   ```
   Dentro do fdisk, digite na ordem: `n`, Enter, `p`, Enter, Enter, Enter, Enter e por último `w`.
   Se ele perguntar sobre remover assinatura ("signature"), responda `N`.
5. Veja o nome da partição nova com `lsblk /dev/sdX`. Normalmente é a última, por exemplo `sdb3`.
   Depois formate e ative a persistência:
   ```
   sudo mkfs.ext4 -L persistence /dev/sdX3
   sudo mkdir -p /mnt/p && sudo mount /dev/sdX3 /mnt/p
   echo "/ union" | sudo tee /mnt/p/persistence.conf
   sudo umount /mnt/p
   ```

## 3. Ligar o computador pelo pendrive

**No HP EliteBook:**
1. Desligue o notebook e coloque o pendrive.
2. Ligue e **aperte F9 várias vezes**. Aparece o **menu de boot**.
   Em alguns modelos, aperte **Esc** primeiro e depois **F9**.
3. Escolha o pendrive. Ele aparece como **USB Hard Drive** ou com o nome da marca dele.
4. Aparece o menu do PC Leve. Espere 5 segundos ou aperte **Enter**.
5. Em cerca de 1 a 2 minutos, a área de trabalho aparece. Pronto!

**Em outros computadores**, a tecla do menu de boot costuma ser:

| Marca | Menu de boot | Configuração (BIOS) |
|---|---|---|
| HP | F9 (ou Esc) | F10 |
| Dell | F12 | F2 |
| Lenovo | F12 | F1 ou F2 |
| Acer | F12 | F2 ou Del |
| Asus | Esc ou F8 | F2 ou Del |
| Positivo | F7 ou F12 | Del |
| PC de mesa (montado) | F8, F11 ou F12 | Del |

**Para o pendrive entrar sempre primeiro**, mude a ordem de boot:
1. Ligue e aperte **F10**, no caso da HP, para entrar na BIOS.
2. Procure **System Configuration** e depois **Boot Options** (ou **Boot Order**).
3. Coloque **USB Hard Drive** em primeiro lugar. Normalmente se usa F5/F6 ou as setas.
4. Salve e saia: **F10** e depois **Yes**.

Sem o pendrive conectado, o computador liga o Windows normalmente.

## 4. Usando o dia a dia

- **Navegar:** clique no ícone do Firefox, na área de trabalho ou na barra de baixo.
- **Wi-Fi:** clique no ícone de rede, ao lado do relógio, escolha a sua rede e digite a senha.
- **Instalar o Chrome:** com a internet funcionando, dê dois cliques em **Instalar Google Chrome**,
  na área de trabalho. Ele fica salvo graças à persistência.
- **Desligar:** abra o menu Iniciar (canto inferior esquerdo) e clique em **Sair**, depois **Desligar**.
  **Sempre desligue por aqui antes de tirar o pendrive**, senão você pode perder o que salvou.
- **Se pedir senha** (quase nunca acontece): usuário `usuario`, senha `live`.

## 5. Problemas comuns

**O computador não liga pelo pendrive (vai direto para o Windows)**
- Confira se você apertou a tecla certa (F9 na HP) **logo que ligou**. Aperte várias vezes.
- Use uma porta USB **diretamente no notebook**, sem hub ou extensão. Teste outra porta.
- Na BIOS (F10), em **System Configuration**, depois **Boot Options**, confira se **USB Boot**
  está **Enabled** (ligado).
- Se a BIOS tiver **Legacy Support**, deixe **Enabled**.
- Grave o pendrive de novo. Às vezes a gravação falha. Teste também outro pendrive.

**Liga, mas a tela fica preta ou trava**
- No menu do PC Leve, escolha a opção **failsafe** (modo de segurança).

**O Wi-Fi não aparece**
- Muitos EliteBooks têm uma **tecla ou botão de Wi-Fi** (ícone de antena, às vezes em F12).
  Se a luz estiver laranja ou vermelha, aperte para ligar.
- Na BIOS (F10), procure **Wireless** ou **Built-in Device Options** e confira se o Wi-Fi está ligado.
- Teste com **cabo de rede**. Ele funciona sozinho, sem configurar nada.
- Se nada disso resolver: abra o menu Iniciar, depois **Ferramentas do Sistema**, depois **QTerminal**,
  e digite `lspci | grep -i net`. Mande uma foto do resultado para quem te ajuda. O nome da placa
  mostra qual peça falta.

**Os favoritos e senhas não ficaram salvos**
- No Rufus, a gravação precisa ser em **modo Imagem ISO**, com a barrinha de persistência maior que zero.
- Sempre desligue pelo menu (**Sair**, depois **Desligar**). Não tire o pendrive com o computador ligado.

**A hora está errada**
- Conecte na internet. O relógio acerta sozinho em poucos segundos.

---

## Para quem quiser gerar a ISO do zero

Num computador com **Debian 13** (ou com Docker), rode:
```
sudo ./build.sh            # 64 bits (padrão)
sudo ARQ=i386 ./build.sh   # 32 bits (Debian 12, só Firefox)
```
A ISO aparece na pasta `saida/`. Demora de 20 a 60 minutos e precisa de uns 10 GB livres.
O script **não grava nada em pendrive**. Ele só cria o arquivo `.iso`.
