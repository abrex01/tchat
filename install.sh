#!/bin/sh
sudo apt install git node > /dev/null 2>&1
sudo git clone https://github.com/abrex01/tchat /opt/tchat
sudo mv /opt/tchat/tchat /usr/bin/tchat > /dev/null 2>&1
sudo chmod +x /usr/bin/tchat > /dev/null 2>&1
