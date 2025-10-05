#!/bin/bash

set -e

PLAYBOOK=${1:-"ansible/playbook.yml"}

echo "Running Ansible playbook: $PLAYBOOK"

cd ansible

ansible-inventory --list -i inventory.ini
ansible all -m ping -i inventory.ini
ansible-playbook -i inventory.ini $PLAYBOOK -v
