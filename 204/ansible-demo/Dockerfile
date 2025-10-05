# ansible-demo/Dockerfile
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y openssh-server sudo python3 python3-apt python3-venv git curl \
 && mkdir /var/run/sshd

# create a demo user 'ansible' with password 'ansible' (we'll also install our public key)
RUN useradd -m -s /bin/bash ansible \
 && echo 'ansible:ansible' | chpasswd \
 && usermod -aG sudo ansible

# copy the public key into user's authorized_keys (you'll place ansible_demo.pub next to Dockerfile)
COPY ansible_demo.pub /tmp/ansible_demo.pub
RUN mkdir -p /home/ansible/.ssh \
 && cat /tmp/ansible_demo.pub > /home/ansible/.ssh/authorized_keys \
 && chown -R ansible:ansible /home/ansible/.ssh \
 && chmod 700 /home/ansible/.ssh \
 && chmod 600 /home/ansible/.ssh/authorized_keys \
 && rm /tmp/ansible_demo.pub

EXPOSE 22
CMD ["/usr/sbin/sshd","-D"]
