# Ansible Configuration Management for Autonomous AI Tutor Orchestrator

This Ansible playbook automates the deployment and configuration of the Autonomous AI Tutor Orchestrator application across different environments.

## 📋 Overview

The Ansible setup provides:
- **System Configuration**: Updates, package installation, user management
- **Application Deployment**: Docker container orchestration
- **Monitoring Setup**: Node Exporter for system metrics
- **Service Management**: Systemd service configuration
- **Log Management**: Log rotation configuration

## 🏗️ Architecture

```
Environment
├── Web Servers (Application)
├── Database Servers (Optional)
├── Monitoring Servers (Metrics Collection)
└── Load Balancers (Optional)
```

## 🚀 Quick Start

### Prerequisites

1. **Install Ansible**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure SSH Access**:
   - Ensure SSH keys are set up for target hosts
   - Update `inventory.ini` with your target host IPs

3. **Update Inventory**:
   ```ini
   [web_servers]
   your-server-1 ansible_host=192.168.1.100
   your-server-2 ansible_host=192.168.1.101

   [all:vars]
   docker_image=your-registry/your-image:latest
   ```

### Deploy Application

```bash
# Run the complete playbook
ansible-playbook -i inventory.ini playbook.yml

# Run specific tags
ansible-playbook -i inventory.ini playbook.yml --tags "docker,app"

# Run in check mode (dry run)
ansible-playbook -i inventory.ini playbook.yml --check

# Run with verbose output
ansible-playbook -i inventory.ini playbook.yml -v
```

## 📁 File Structure

```
ansible/
├── ansible.cfg          # Ansible configuration
├── inventory.ini        # Host inventory with variables
├── playbook.yml         # Main playbook
├── requirements.txt     # Ansible dependencies
├── templates/           # Jinja2 templates
│   ├── .env.j2         # Application environment
│   ├── docker-compose.yml.j2  # Container orchestration
│   ├── tutor-orchestrator.service.j2  # Systemd service
│   ├── logrotate.j2    # Log rotation config
│   └── node-exporter.service.j2  # Monitoring service
└── README.md           # This file
```

## 🎯 Available Tags

- `packages`: System package installation
- `docker`: Docker setup and configuration
- `app`: Application deployment and configuration
- `monitoring`: Prometheus Node Exporter setup
- `users`: User and group management
- `services`: Systemd service configuration

## ⚙️ Configuration Variables

### Application Variables
- `app_name`: Name of the application
- `app_port`: Port for the application
- `docker_image`: Docker image to deploy

### Environment Variables
- `python_version`: Python version to install
- `pip_packages`: Python packages to install

## 🔧 Customization

### Adding New Packages
Edit `playbook.yml` and add to the package list:

```yaml
- name: Install custom packages
  package:
    name:
      - your-package-name
    state: present
```

### Environment Variables
Edit `inventory.ini` to add custom variables:

```ini
[all:vars]
custom_var=value
your_api_key=your_key_here
```

### Custom Templates
Add new templates to `templates/` directory and reference in playbook:

```yaml
- name: Create custom config
  template:
    src: templates/custom-config.j2
    dest: /etc/custom-config.conf
```

## 🔍 Verification

### Check Application Status
```bash
# Check service status
sudo systemctl status tutor-orchestrator

# Check container status
sudo docker ps

# Check logs
sudo tail -f /opt/autonomous-tutor-orchestrator/logs/tutor-orchestrator.log
```

### Test Application
```bash
# Health check
curl http://localhost:8000/health

# API documentation
curl http://localhost:8000/docs
```

### Monitor System Metrics
```bash
# Node Exporter metrics
curl http://localhost:9100/metrics
```

## 🚨 Troubleshooting

### Common Issues

1. **SSH Connection Failed**:
   - Verify SSH keys are in `~/.ssh/authorized_keys`
   - Check `ansible_host` IPs in inventory

2. **Permission Denied**:
   - Ensure `become: yes` in playbook
   - Check sudo configuration

3. **Package Installation Failed**:
   - Update package cache: `ansible -m apt -a "update_cache=yes" all`
   - Check internet connectivity

4. **Docker Issues**:
   - Verify Docker service: `sudo systemctl status docker`
   - Check user permissions: `groups $USER`

### Debug Mode
```bash
# Enable debug logging
ansible-playbook -i inventory.ini playbook.yml -vvv

# Test connectivity
ansible -i inventory.ini all -m ping
```

## 📊 Monitoring Integration

The setup includes Node Exporter for system metrics collection. These metrics can be consumed by:

- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Alertmanager** for alerting

## 🔒 Security Considerations

- Change default passwords in production
- Use SSH keys instead of passwords
- Regularly update the system and containers
- Monitor logs for security events
- Use firewalls to restrict access

## 📈 Scaling

To scale across multiple servers:

1. Update `inventory.ini` with additional hosts
2. Use `serial: 1` in playbook for rolling updates
3. Consider load balancer configuration
4. Set up centralized logging

## 🤝 Contributing

1. Test changes in a development environment
2. Update documentation for new features
3. Follow Ansible best practices
4. Use meaningful commit messages

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Ansible logs with `-vvv` flag
3. Verify inventory and variable configuration
4. Test connectivity with `ansible -m ping all`
