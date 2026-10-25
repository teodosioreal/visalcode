#!/usr/bin/env python3
"""Testa a ISO do PC Leve no QEMU e tira fotos da tela.

Uso: testar-qemu.py <arquivo.iso> <pasta-das-fotos>

1. Liga em modo BIOS (Legacy) com 2 GB de RAM e Wi-Fi/rede simulada.
2. Fotografa o menu de boot e a área de trabalho.
3. Abre o Firefox num site (prova que a rede e o navegador funcionam).
4. Abre o terminal e mostra o estado da rede e do relógio.
5. Liga em modo UEFI e fotografa o menu de boot.
"""
import os
import socket
import subprocess
import sys
import time

ISO, FOTOS = sys.argv[1], sys.argv[2]
os.makedirs(FOTOS, exist_ok=True)
KVM = ["-enable-kvm", "-cpu", "host"] if os.access("/dev/kvm", os.W_OK) else []
print("KVM:", "sim" if KVM else "não (vai ser lento)", flush=True)

# Teclado do sistema testado é ABNT2: a tecla "/" do teclado americano
# (nome "slash" no QEMU) digita ";" no ABNT2.
TECLAS = {" ": "spc", "-": "minus", ".": "dot", ";": "slash", "\n": "ret"}


class Qemu:
    def __init__(self, nome, extra):
        self.nome = nome
        self.sock = f"/tmp/qemu-{nome}.sock"
        if os.path.exists(self.sock):
            os.remove(self.sock)
        cmd = ["qemu-system-x86_64", *KVM, "-m", "2048", "-smp", "2",
               "-cdrom", ISO, "-boot", "d", "-vga", "std",
               "-nic", "user,model=e1000", "-display", "none",
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
        png = ppm[:-4] + ".png"
        subprocess.run(["convert", ppm, png], check=False)
        os.remove(ppm)
        print("foto:", png, flush=True)

    def digitar(self, texto):
        for c in texto:
            k = TECLAS.get(c, c)
            self.cmd(f"sendkey {k}")
            time.sleep(0.05)

    def desligar(self):
        self.cmd("quit")
        self.proc.wait(timeout=30)


espera = 1 if KVM else 4   # sem KVM tudo é ~4x mais lento

# --- Teste 1: BIOS Legacy ---------------------------------------------------
vm = Qemu("bios", [])
time.sleep(3)
vm.foto("01-menu-boot-bios")
time.sleep(150 * espera)
vm.foto("02-area-de-trabalho")

vm.cmd("sendkey alt-f2")            # abre o "Executar" do LXQt
time.sleep(3)
vm.digitar("firefox-esr example.com\n")
time.sleep(60 * espera)
vm.foto("03-firefox")

vm.cmd("sendkey ctrl-alt-t")        # abre o terminal
time.sleep(8 * espera)
vm.digitar("nmcli device; timedatectl; free -h; zramctl\n")
time.sleep(5)
vm.foto("04-terminal-rede")
vm.desligar()

# --- Teste 2: UEFI ----------------------------------------------------------
ovmf = next((p for p in ["/usr/share/ovmf/OVMF.fd",
                         "/usr/share/OVMF/OVMF_CODE.fd"] if os.path.exists(p)), None)
if ovmf:
    vm = Qemu("uefi", ["-bios", ovmf])
    time.sleep(15 * espera)
    vm.foto("05-menu-boot-uefi")
    vm.desligar()
print("Testes concluídos.")
