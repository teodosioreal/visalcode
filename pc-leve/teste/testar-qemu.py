#!/usr/bin/env python3
"""Testa a ISO do PC Leve no QEMU e tira fotos da tela.

Uso: testar-qemu.py <arquivo.iso> <pasta-das-fotos>

1. BIOS Legacy, como CD: menu de boot, área de trabalho, Firefox num site
   (prova que rede e navegador funcionam) e terminal com rede/relógio/zram.
2. Pendrive virtual (ISO gravada "em modo DD" num disco USB de 4 GB):
   ativa o salvamento, reinicia, cria um arquivo, reinicia de novo e
   confere se o arquivo continua lá.
3. UEFI: menu de boot.
"""
import os
import shutil
import socket
import subprocess
import sys
import time

ISO, FOTOS = sys.argv[1], sys.argv[2]
os.makedirs(FOTOS, exist_ok=True)
KVM = ["-enable-kvm", "-cpu", "host"] if os.access("/dev/kvm", os.W_OK) else []
print("KVM:", "sim" if KVM else "não (vai ser lento)", flush=True)
ESPERA = 1 if KVM else 4   # sem KVM tudo é ~4x mais lento

# O sistema testado usa teclado ABNT2. Nomes de teclas do QEMU (layout
# americano) que produzem cada caractere no ABNT2:
TECLAS = {" ": "spc", "-": "minus", ".": "dot", ",": "comma", ";": "slash",
          "\n": "ret", "_": "shift-minus", "=": "equal"}


class Qemu:
    def __init__(self, nome, extra):
        self.sock = f"/tmp/qemu-{nome}.sock"
        if os.path.exists(self.sock):
            os.remove(self.sock)
        cmd = ["qemu-system-x86_64", *KVM, "-m", "2048", "-smp", "2",
               "-vga", "std", "-nic", "user,model=e1000", "-display", "none",
               "-monitor", f"unix:{self.sock},server,nowait", *extra]
        self.proc = subprocess.Popen(cmd)
        for _ in range(50):
            if os.path.exists(self.sock):
                break
            time.sleep(0.2)

    def cmd(self, texto):
        s = socket.socket(socket.AF_UNIX)
        s.connect(self.sock)
        s.recv(4096)
        s.sendall((texto + "\n").encode())
        time.sleep(0.3)
        s.close()

    def foto(self, nome):
        ppm = os.path.join(FOTOS, nome + ".ppm")
        self.cmd(f"screendump {ppm}")
        time.sleep(1)
        subprocess.run(["convert", ppm, ppm[:-4] + ".png"], check=False)
        os.remove(ppm)
        print("foto:", nome, flush=True)

    def digitar(self, texto):
        for c in texto:
            if c in TECLAS:
                k = TECLAS[c]
            elif c.isupper():
                k = "shift-" + c.lower()
            else:
                k = c
            self.cmd(f"sendkey {k}")
            time.sleep(0.05)

    def executar(self, comando):
        """Abre o "Executar" do LXQt (Alt+F2) e roda um comando."""
        self.cmd("sendkey alt-f2")
        time.sleep(3)
        self.digitar(comando + "\n")

    def terminal(self, comandos, espera=8):
        self.executar("qterminal")
        time.sleep(8 * ESPERA)
        self.digitar(comandos + "\n")
        time.sleep(espera)

    def reiniciar(self):
        self.cmd("system_reset")
        time.sleep(150 * ESPERA)

    def desligar(self):
        self.cmd("quit")
        self.proc.wait(timeout=30)


# --- Teste 1: BIOS Legacy, como CD ------------------------------------------
vm = Qemu("bios", ["-cdrom", ISO, "-boot", "d"])
time.sleep(3)
vm.foto("01-menu-boot-bios")
time.sleep(150 * ESPERA)
vm.foto("02-area-de-trabalho")
vm.executar("firefox-esr example.com")
time.sleep(60 * ESPERA)
vm.foto("03-firefox")
vm.terminal("nmcli device; timedatectl; free -h; zramctl")
vm.foto("04-terminal-rede-relogio-memoria")
vm.desligar()

# --- Teste 2: pendrive virtual com salvamento -------------------------------
usb = "/tmp/pendrive.img"
shutil.copy(ISO, usb)
os.truncate(usb, 4 * 1024**3)
pendrive = ["-drive", f"if=none,id=usb,format=raw,file={usb}",
            "-device", "usb-ehci,id=ehci",
            "-device", "usb-storage,bus=ehci.0,drive=usb,bootindex=0"]
vm = Qemu("usb", pendrive)
time.sleep(150 * ESPERA)
vm.foto("05-pendrive-area-de-trabalho")
vm.executar("qterminal -e ativar-persistencia")
time.sleep(10 * ESPERA)
vm.foto("06-ativar-salvamento-confirmacao")
vm.digitar("SIM\n")
time.sleep(30 * ESPERA)
vm.foto("07-ativar-salvamento-pronto")
vm.digitar("\n")
time.sleep(3)
vm.reiniciar()
vm.terminal("touch arquivo-salvo; lsblk -o NAME,LABEL,MOUNTPOINTS")
vm.foto("08-salvamento-ativo")
vm.digitar("sync\n")
time.sleep(5)
vm.reiniciar()
vm.terminal("ls; lsblk -o NAME,LABEL,MOUNTPOINTS")
vm.foto("09-depois-de-reiniciar-arquivo-continua")
vm.desligar()
os.remove(usb)

# --- Teste 3: UEFI ----------------------------------------------------------
codigo = "/usr/share/OVMF/OVMF_CODE_4M.fd"
if os.path.exists(codigo):
    shutil.copy("/usr/share/OVMF/OVMF_VARS_4M.fd", "/tmp/ovmf_vars.fd")
    vm = Qemu("uefi", [
        "-machine", "q35",
        "-drive", f"if=pflash,format=raw,readonly=on,file={codigo}",
        "-drive", "if=pflash,format=raw,file=/tmp/ovmf_vars.fd",
        "-cdrom", ISO])
    time.sleep(12 * ESPERA)
    vm.foto("10-menu-boot-uefi")
    time.sleep(140 * ESPERA)
    vm.foto("11-area-de-trabalho-uefi")
    vm.desligar()
print("Testes concluídos.")
