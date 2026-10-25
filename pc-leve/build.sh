#!/usr/bin/env bash
# =============================================================================
#  PC Leve — gera uma ISO "live" do Debian para rodar direto do pendrive
# =============================================================================
#
#  O que este script faz, em linguagem simples:
#    1. Confere se está rodando como administrador (root) num Debian.
#    2. Instala o "live-build", a ferramenta oficial do Debian para criar
#       sistemas que rodam do pendrive.
#    3. Escreve a "receita" do sistema: quais programas entram, idioma,
#       teclado, fuso horário, login automático, otimizações etc.
#    4. Baixa tudo da internet e monta a ISO (leva de 20 a 60 minutos).
#    5. Coloca a ISO pronta na pasta "saida/".
#
#  Como usar (num computador com Debian 12 ou 13):
#       sudo ./build.sh            -> PC 64 bits (Debian 13 "trixie")
#       sudo ARQ=i386 ./build.sh   -> PC 32 bits (Debian 12 "bookworm")
#
#  Se você não estiver num Debian mas tiver o Docker instalado, o script
#  roda sozinho dentro de um "contêiner" Debian.
#
#  Este script NUNCA grava nada em pendrive ou HD. Ele só cria um arquivo .iso.
# =============================================================================

set -euo pipefail   # para na hora se qualquer comando der erro

# -----------------------------------------------------------------------------
# Configurações principais (pode mudar aqui se quiser)
# -----------------------------------------------------------------------------
ARQ="${ARQ:-amd64}"                     # amd64 = 64 bits | i386 = 32 bits
NOME="pc-leve"                          # nome do sistema e do computador
USUARIO="usuario"                       # nome do usuário (entra sozinho)
ESPELHO="${ESPELHO:-http://deb.debian.org/debian/}"
PASTA="$(cd "$(dirname "$0")" && pwd)"
TRABALHO="$PASTA/trabalho"              # onde a ISO é montada (pasta temporária)
SAIDA="$PASTA/saida"                    # onde a ISO pronta fica

# 64 bits usa o Debian mais novo. 32 bits só existe até o Debian 12.
if [ "$ARQ" = "amd64" ]; then
    DISTRO="trixie"; KERNEL="amd64"
elif [ "$ARQ" = "i386" ]; then
    DISTRO="bookworm"; KERNEL="686-pae"
    echo "AVISO: 32 bits usa Debian 12. Só o Firefox ESR funciona (o Chrome"
    echo "       não existe para 32 bits) e o suporte termina em junho de 2028."
else
    echo "ERRO: ARQ precisa ser amd64 ou i386." >&2; exit 1
fi

msg() { echo; echo "==> $*"; }

# -----------------------------------------------------------------------------
# Passo 1: conferências iniciais
# -----------------------------------------------------------------------------
if [ "$(id -u)" -ne 0 ]; then
    echo "ERRO: rode como administrador:  sudo ./build.sh" >&2
    exit 1
fi

if ! grep -q '^ID=debian' /etc/os-release 2>/dev/null; then
    # Não é Debian: tenta usar o Docker para ter um Debian "emprestado".
    if command -v docker >/dev/null 2>&1; then
        msg "Este computador não é Debian. Vou rodar dentro do Docker (debian:trixie)."
        exec docker run --rm --privileged \
            -e ARQ="$ARQ" -e ESPELHO="$ESPELHO" \
            -v "$PASTA":/pc-leve -w /pc-leve debian:trixie ./build.sh
    fi
    echo "ERRO: este script precisa de um Debian (ou do Docker instalado)." >&2
    exit 1
fi

# -----------------------------------------------------------------------------
# Passo 2: instalar as ferramentas de construção
# -----------------------------------------------------------------------------
msg "Instalando o live-build e ferramentas necessárias..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y live-build debootstrap squashfs-tools xorriso \
    isolinux syslinux-common grub-efi-amd64-bin grub-pc-bin mtools dosfstools

# -----------------------------------------------------------------------------
# Passo 3: preparar a pasta de trabalho e a configuração básica
# -----------------------------------------------------------------------------
msg "Preparando a pasta de trabalho em $TRABALHO ..."
mkdir -p "$TRABALHO" "$SAIDA"
cd "$TRABALHO"
lb clean --purge >/dev/null 2>&1 || true
rm -rf config auto

# Opções passadas ao sistema na hora do boot:
#   persistence      -> usa a área "persistence" do pendrive, se existir
#   locales/keyboard -> português do Brasil e teclado ABNT2
#   timezone         -> horário de Brasília (São Paulo)
#   utc=no           -> relógio igual ao do Windows (evita hora errada)
#   username         -> nome do usuário, que entra sem pedir senha
BOOT_OPCOES="boot=live components quiet splash persistence \
locales=pt_BR.UTF-8 keyboard-layouts=br keyboard-model=abnt2 \
timezone=America/Sao_Paulo utc=no username=$USUARIO hostname=$NOME"

msg "Configurando o live-build ($DISTRO, $ARQ)..."
lb config \
    --distribution "$DISTRO" \
    --architecture "$ARQ" \
    --linux-flavours "$KERNEL" \
    --archive-areas "main non-free-firmware" \
    --mirror-bootstrap "$ESPELHO" \
    --mirror-chroot "$ESPELHO" \
    --mirror-binary "$ESPELHO" \
    --debootstrap-options "--variant=minbase" \
    --apt-recommends false \
    --apt-indices false \
    --firmware-binary false \
    --firmware-chroot false \
    --binary-image iso-hybrid \
    --bootloaders "syslinux,grub-efi" \
    --debian-installer none \
    --memtest none \
    --chroot-squashfs-compression-type xz \
    --zsync false \
    --iso-application "PC Leve" \
    --iso-volume "PC_LEVE" \
    --iso-publisher "PC Leve" \
    --bootappend-live "$BOOT_OPCOES" \
    --bootappend-live-failsafe "boot=live components memtest noapic noapm nodma nomce nosmp nosplash vga=788 nomodeset persistence locales=pt_BR.UTF-8 keyboard-layouts=br keyboard-model=abnt2 timezone=America/Sao_Paulo utc=no username=$USUARIO hostname=$NOME"

# -----------------------------------------------------------------------------
# Passo 4: lista de programas
# -----------------------------------------------------------------------------
# "--apt-recommends false" deixa a ISO pequena: entra só o que está listado.
msg "Escrevendo a lista de programas..."

cat > config/package-lists/base.list.chroot <<'EOF'
# --- Núcleo do sistema "live" ---
live-boot
live-config
live-config-systemd
systemd-sysv
udev
kmod
procps
iproute2
user-setup
sudo
nano
less
ca-certificates
wget
systemd-timesyncd
fdisk
e2fsprogs

# --- Idioma, teclado e fuso horário ---
locales
tzdata
keyboard-configuration
console-setup

# --- Otimização: memória comprimida (zram) ---
zram-tools

# --- Sessão gráfica ---
dbus-user-session
libpam-systemd
polkitd
xserver-xorg-core
xserver-xorg-input-libinput
xserver-xorg-video-fbdev
xauth
x11-xserver-utils
x11-xkb-utils
libgl1-mesa-dri
xdg-utils
lightdm
lightdm-gtk-greeter

# --- Ambiente de trabalho LXQt (leve) ---
lxqt-session
lxqt-panel
lxqt-runner
lxqt-config
lxqt-globalkeys
lxqt-notificationd
lxqt-policykit
lxqt-powermanagement
lxqt-qtplugin
lxqt-themes
lxqt-about
openbox
breeze-icon-theme
fonts-dejavu-core
fonts-liberation2
upower

# --- Programas do dia a dia ---
pcmanfm-qt
gvfs
udisks2
lximage-qt
qpdfview
qterminal
pavucontrol-qt

# --- Navegador ---
firefox-esr
firefox-esr-l10n-pt-br
libavcodec-extra

# --- Internet: Wi-Fi e cabo ---
network-manager
wpasupplicant
nm-tray

# --- Som ---
pipewire-pulse
pipewire-alsa
wireplumber

# --- Firmwares (Wi-Fi Intel, Realtek, Broadcom, Atheros e vídeo) ---
firmware-linux-free
firmware-misc-nonfree
firmware-iwlwifi
firmware-realtek
firmware-atheros
firmware-brcm80211
firmware-amd-graphics
EOF

# Microcódigo do processador (corrige falhas do próprio processador).
printf 'intel-microcode\namd64-microcode\n' > config/package-lists/microcode.list.chroot

# -----------------------------------------------------------------------------
# Passo 5: arquivos de configuração que vão dentro do sistema
# -----------------------------------------------------------------------------
msg "Criando os arquivos de configuração do sistema..."
R=config/includes.chroot     # tudo aqui dentro vira "/" no sistema final

# Teclado ABNT2 também na parte gráfica
mkdir -p $R/etc/default
cat > $R/etc/default/keyboard <<'EOF'
XKBMODEL="abnt2"
XKBLAYOUT="br"
XKBVARIANT=""
XKBOPTIONS=""
BACKSPACE="guess"
EOF

# zram: usa metade da RAM como memória comprimida (bom para PC fraco)
cat > $R/etc/default/zramswap <<'EOF'
ALGO=zstd
PERCENT=50
PRIORITY=100
EOF
mkdir -p $R/etc/sysctl.d
cat > $R/etc/sysctl.d/99-pc-leve.conf <<'EOF'
# Usa a memória comprimida (zram) com mais disposição
vm.swappiness=100
vm.vfs_cache_pressure=50
EOF

# Registros do sistema só na memória: menos escrita no pendrive = mais rápido
mkdir -p $R/etc/systemd/journald.conf.d
cat > $R/etc/systemd/journald.conf.d/pc-leve.conf <<'EOF'
[Journal]
Storage=volatile
RuntimeMaxUse=20M
EOF

# Login automático direto no LXQt
mkdir -p $R/etc/lightdm/lightdm.conf.d
cat > $R/etc/lightdm/lightdm.conf.d/50-pc-leve.conf <<EOF
[Seat:*]
autologin-user=$USUARIO
autologin-user-timeout=0
autologin-session=lxqt
user-session=lxqt
EOF

# Touchpad: tocar = clicar, e rolagem natural com dois dedos
mkdir -p $R/etc/X11/xorg.conf.d
cat > $R/etc/X11/xorg.conf.d/40-touchpad.conf <<'EOF'
Section "InputClass"
    Identifier "touchpad"
    MatchIsTouchpad "on"
    Driver "libinput"
    Option "Tapping" "on"
EndSection
EOF

# Firefox: telemetria desligada e em português
mkdir -p $R/etc/firefox/policies
cat > $R/etc/firefox/policies/policies.json <<'EOF'
{
  "policies": {
    "DisableTelemetry": true,
    "DisableFirefoxStudies": true,
    "DisablePocket": true,
    "DontCheckDefaultBrowser": true,
    "RequestedLocales": ["pt-BR"],
    "OverrideFirstRunPage": "",
    "Homepage": { "URL": "https://www.google.com.br", "StartPage": "homepage" }
  }
}
EOF

# Configurações do usuário (copiadas para a pasta pessoal no 1º boot)
mkdir -p $R/etc/skel/.config/lxqt $R/etc/skel/Desktop
cat > $R/etc/skel/.config/lxqt/session.conf <<'EOF'
[General]
window_manager=openbox
leave_confirmation=true
EOF
cat > $R/etc/skel/.config/lxqt/lxqt.conf <<'EOF'
[General]
icon_theme=breeze
EOF

# Atalho na área de trabalho: Firefox
cat > $R/etc/skel/Desktop/firefox-esr.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Navegador Firefox
Exec=firefox-esr %u
Icon=firefox-esr
EOF
chmod +x $R/etc/skel/Desktop/firefox-esr.desktop

# Botão "Ativar salvamento": cria a área de persistência no próprio pendrive.
# Serve para quem gravou o pendrive em modo DD (o Rufus em modo ISO não dá
# boot neste Debian). Mostra o pendrive exato e só grava se a pessoa digitar SIM.
mkdir -p $R/usr/local/bin $R/usr/share/applications
cat > $R/usr/local/bin/ativar-persistencia <<'EOF'
#!/bin/bash
# Cria uma partição "persistence" no espaço livre do pendrive de onde o
# sistema ligou. Nunca mexe em outro disco.
echo "=== Ativar salvamento (persistência) ==="
echo
fim() { echo; read -rp "Aperte Enter para fechar."; exit "${1:-0}"; }

if lsblk -rno LABEL | grep -qx persistence; then
    echo "O salvamento JÁ ESTÁ ativado neste pendrive. Nada a fazer."; fim 0
fi

# Descobre o pendrive de onde o sistema ligou
PART=$(findmnt -no SOURCE /run/live/medium 2>/dev/null)
DISCO=$(lsblk -no PKNAME "$PART" 2>/dev/null | head -1)
if [ -z "$DISCO" ] || [ "$(lsblk -dno TRAN "/dev/$DISCO")" != "usb" ]; then
    echo "Não achei o pendrive de onde o sistema ligou."
    echo "(Isso só funciona quando o sistema liga por um pendrive USB.)"
    fim 1
fi
DISCO="/dev/$DISCO"

# Maior espaço livre no pendrive (em setores de 512 bytes)
read -r INICIO SETORES < <(sudo sfdisk -F -q "$DISCO" 2>/dev/null \
    | awk 'NR>1 {print $1, $3}' | sort -k2 -n | tail -1)
if [ -z "$SETORES" ] || [ "$SETORES" -lt 2097152 ]; then
    echo "O pendrive não tem espaço livre suficiente (precisa de pelo menos 1 GB)."
    fim 1
fi
INICIO=$(( (INICIO + 2047) / 2048 * 2048 ))   # alinha em 1 MB

echo "Vou criar a área de salvamento NESTE pendrive:"
echo
lsblk -d -o NAME,SIZE,MODEL,TRAN "$DISCO"
echo
echo "Espaço livre que será usado: $(( SETORES / 2048 / 1024 )) GB"
echo "O sistema e os seus outros discos NÃO serão alterados."
echo
read -rp "Confere? Digite SIM (maiúsculo) para continuar: " RESP
[ "$RESP" = "SIM" ] || { echo "Cancelado. Nada foi alterado."; fim 0; }

set -e
echo "$INICIO,,L" | sudo sfdisk --append --force --no-reread "$DISCO"
sudo partx -a "$DISCO" 2>/dev/null || sudo partx -u "$DISCO" || true
sleep 2
# Trava de segurança: só formata a partição que começa exatamente no espaço
# livre escolhido (nunca a partição do sistema).
NOVA=""
for p in $(lsblk -rnpo NAME,TYPE "$DISCO" | awk '$2=="part"{print $1}'); do
    [ "$(cat /sys/class/block/$(basename "$p")/start)" = "$INICIO" ] && NOVA="$p"
done
if [ -z "$NOVA" ]; then
    echo "A partição foi criada, mas o sistema ainda não a enxergou."
    echo "Reinicie o computador e clique em 'Ativar salvamento' de novo."
    fim 1
fi
sudo mkfs.ext4 -F -L persistence "$NOVA"
sudo mkdir -p /mnt/persistencia
sudo mount "$NOVA" /mnt/persistencia
echo "/ union" | sudo tee /mnt/persistencia/persistence.conf >/dev/null
sudo umount /mnt/persistencia
echo
echo "PRONTO! Reinicie o computador (menu Iniciar > Sair > Reiniciar)."
echo "Daí em diante, favoritos, senhas, Wi-Fi e downloads ficam salvos."
fim 0
EOF
chmod +x $R/usr/local/bin/ativar-persistencia
cat > $R/usr/share/applications/ativar-persistencia.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Ativar salvamento
Comment=Faz o pendrive guardar favoritos, senhas e downloads
Exec=qterminal -e /usr/local/bin/ativar-persistencia
Icon=drive-removable-media
Categories=System;
EOF
cp $R/usr/share/applications/ativar-persistencia.desktop $R/etc/skel/Desktop/
chmod +x $R/etc/skel/Desktop/ativar-persistencia.desktop

# Só em 64 bits: botão "Instalar Google Chrome"
if [ "$ARQ" = "amd64" ]; then
    mkdir -p $R/usr/local/bin $R/usr/share/applications
    cat > $R/usr/local/bin/instalar-chrome <<'EOF'
#!/bin/bash
# Baixa e instala o Google Chrome. Precisa de internet.
# Com persistência ligada, o Chrome continua instalado depois de desligar.
set -e
echo "=== Instalador do Google Chrome ==="
if command -v google-chrome >/dev/null; then
    echo "O Chrome já está instalado!"; read -rp "Aperte Enter para fechar."; exit 0
fi
echo "Baixando (cerca de 110 MB)..."
wget -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
echo "Instalando..."
sudo apt-get update
sudo apt-get install -y /tmp/chrome.deb
rm -f /tmp/chrome.deb
echo; echo "Pronto! O Chrome está no menu Iniciar > Internet."
read -rp "Aperte Enter para fechar."
EOF
    chmod +x $R/usr/local/bin/instalar-chrome
    cat > $R/usr/share/applications/instalar-chrome.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Instalar Google Chrome
Comment=Baixa e instala o navegador Google Chrome
Exec=qterminal -e /usr/local/bin/instalar-chrome
Icon=system-software-install
Categories=Network;
EOF
    cp $R/usr/share/applications/instalar-chrome.desktop $R/etc/skel/Desktop/
    chmod +x $R/etc/skel/Desktop/instalar-chrome.desktop
fi

# -----------------------------------------------------------------------------
# Passo 6: "ganchos" — ajustes feitos dentro do sistema durante a montagem
# -----------------------------------------------------------------------------
msg "Criando os ajustes finais (ganchos)..."

cat > config/hooks/normal/9000-pc-leve.hook.chroot <<'EOF'
#!/bin/sh
set -e

# Pacotes que só existem em algumas versões do Debian: instala se existirem
# (traduções do LXQt, menu do LXQt, firmware de vídeo Intel etc.)
OPCIONAIS="lxqt-menu-data firmware-intel-graphics qt6-svg-plugins libqt5svg5 \
qt6-translations-l10n qttranslations5-l10n"
OPCIONAIS="$OPCIONAIS $(apt-cache pkgnames | grep -E '^(lxqt|pcmanfm-qt|libfm-qt|lximage-qt|qterminal|pavucontrol-qt|libqtxdg|libqt6xdg|libqt5xdg|nm-tray|qpdfview).*-l10n$' || true)"
for p in $OPCIONAIS; do
    if apt-cache show "$p" >/dev/null 2>&1; then
        apt-get install -y --no-install-recommends "$p" || true
    fi
done

# Só a sessão LXQt aparece (evita entrar no Openbox "puro" por engano)
rm -f /usr/share/xsessions/openbox.desktop

# Ícone de Wi-Fi ao lado do relógio, iniciando junto com o LXQt
if ! ls /etc/xdg/autostart/ 2>/dev/null | grep -qi nm-tray; then
cat > /etc/xdg/autostart/nm-tray.desktop <<EOT
[Desktop Entry]
Type=Application
Name=Wi-Fi
Exec=nm-tray
OnlyShowIn=LXQt;
EOT
fi

# Barra de tarefas: atalho rápido aponta para o Firefox ESR
if [ -f /etc/xdg/lxqt/panel.conf ]; then
    sed -i 's#firefox\.desktop#firefox-esr.desktop#g' /etc/xdg/lxqt/panel.conf
fi

# Firefox: cache na memória (o pendrive fica mais rápido e dura mais)
if [ -f /etc/firefox-esr/firefox-esr.js ]; then
    cat >> /etc/firefox-esr/firefox-esr.js <<EOT
pref("browser.cache.disk.parent_directory", "/tmp/firefox-cache");
pref("browser.sessionstore.interval", 60000);
EOT
fi

# Desliga tarefas de fundo que só gastam recursos num sistema live
for t in apt-daily.timer apt-daily-upgrade.timer man-db.timer e2scrub_all.timer; do
    systemctl disable "$t" 2>/dev/null || true
done
systemctl enable zramswap.service 2>/dev/null || true
systemctl enable NetworkManager.service 2>/dev/null || true

# Libera espaço: documentação e manuais não servem para nada aqui
rm -rf /usr/share/doc/* /usr/share/man/* /usr/share/info/* || true
find /usr/share/locale -mindepth 1 -maxdepth 1 -type d \
    ! -name 'pt_BR' ! -name 'pt' ! -name 'en' ! -name 'en_US' \
    -exec rm -rf {} + || true
apt-get clean
EOF
chmod +x config/hooks/normal/9000-pc-leve.hook.chroot

# Menu de boot: espera 5 segundos e entra sozinho (em vez de esperar para sempre)
cat > config/hooks/normal/9100-menu-boot.hook.binary <<'EOF'
#!/bin/sh
for f in isolinux/isolinux.cfg isolinux/menu.cfg; do
    [ -f "$f" ] && sed -i 's/^timeout .*/timeout 50/' "$f"
done
grep -q '^timeout ' isolinux/isolinux.cfg 2>/dev/null || \
    { [ -f isolinux/isolinux.cfg ] && echo "timeout 50" >> isolinux/isolinux.cfg; }
if [ -f boot/grub/config.cfg ]; then
    sed -i '/^set timeout/d' boot/grub/config.cfg
    echo "set timeout=5" >> boot/grub/config.cfg
fi
exit 0
EOF
chmod +x config/hooks/normal/9100-menu-boot.hook.binary

# -----------------------------------------------------------------------------
# Passo 7: construir!
# -----------------------------------------------------------------------------
msg "Construindo a ISO. Isso demora (20 a 60 minutos). Pode ir tomar um café."
lb build 2>&1 | tee "$SAIDA/build.log"

ISO=$(ls -1 "$TRABALHO"/*.iso 2>/dev/null | head -1 || true)
if [ -z "$ISO" ]; then
    echo "ERRO: a ISO não foi criada. Veja o arquivo $SAIDA/build.log" >&2
    exit 1
fi
FINAL="$SAIDA/$NOME-$DISTRO-$ARQ.iso"
mv "$ISO" "$FINAL"
( cd "$SAIDA" && sha256sum "$(basename "$FINAL")" > "$(basename "$FINAL").sha256" )

msg "PRONTO! ISO criada:"
ls -lh "$FINAL"
echo "Agora siga o README.md para gravar no pendrive."
