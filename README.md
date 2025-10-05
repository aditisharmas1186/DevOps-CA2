# 🚀 DevOps CA2 – Group 11  
**Submitted by:** Aryan Malkani, Himani Arora, Yogita Beniwal, Gargi Mittal  

---

## 🧠 **Overview**
This project demonstrates a complete DevOps pipeline including:
1. **CI/CD with GitHub Actions**
2. **Configuration Management using Ansible**
3. **Containerization & Deployment using Docker + Kubernetes**
4. **Monitoring using Prometheus and Grafana**

---

## ⚙️ **Task 1 – GitHub Actions CI/CD**
- Implemented automated CI/CD using GitHub Actions workflow.  
- Each push triggers build, test, and deployment stages.  
- Docker image is automatically built and pushed to **GitHub Container Registry**.

🖼️ *Screenshot:*  
`images_of_tasks/task_1_githubactions.jpeg`

---

## 🧩 **Task 2 – Ansible Configuration Management**
- Created **inventory.ini** and **site.yml** for provisioning environments.  
- Automated dependency installation and Docker setup.

🖼️ *Screenshot:*  
`images_of_tasks/task_2_ansible.jpeg`

---

## 🐳 **Task 3 – Dockerization & Kubernetes Deployment**
- Dockerized the project using a custom `Dockerfile`.  
- Built and pushed image to GitHub Packages.  
- Deployed on Kubernetes using `namespace.yaml`, `deployment.yaml`, and `service.yaml`.

🖼️ *Screenshots:*  
- Docker Build and Push → `images_of_tasks/task_3_dockerize.jpeg`  
- Kubernetes Pods Running → `images_of_tasks/task_3_kubernetes_working.jpeg`  
- Image on GitHub Packages → `images_of_tasks/task_3_packages_from_github_for_docker.jpeg`

---

## 📊 **Task 4 – Monitoring with Prometheus & Grafana**
- Installed Prometheus and Grafana using Helm charts.  
- Verified Prometheus scrape targets (status: **UP**)  
- Imported Grafana dashboards to monitor uptime, latency, and resource usage.

🖼️ *Screenshots:*  
- Installation commands → `images_of_tasks/task_4_commands_to_install_grafana_prometheus.jpeg`  
- Prometheus Targets → `images_of_tasks/task_4_prometheus.jpeg`  
- Grafana Dashboard → `images_of_tasks/task_4_grafana.jpeg`

---

## 🧠 **Conclusion**
All components (CI/CD, Ansible, Docker, Kubernetes, Prometheus, Grafana) are successfully integrated and verified.  
The pipeline demonstrates **end-to-end automation, containerized deployment, and real-time monitoring** in a DevOps environment.

---

## 💻 **Commands Summary**

### Deploy App on Kubernetes
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
