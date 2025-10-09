 # Electronic Health Record (EHR) System  
*A Containerized, Monitored, and Automated Healthcare Application*

## Overview  
This project implements a **cloud-native Electronic Health Record (EHR)** is a cloud-native healthcare application designed to digitize and streamline patient data management. System that securely manages patient data and appointments.  
The project demonstrates the implementation of a complete DevOps lifecycle using modern technologies such as Node.js, MongoDB, Docker, Kubernetes, Ansible, Prometheus, Grafana, and GitHub Actions. Through containerization, automation, orchestration, and monitoring, the system ensures reliability, scalability, and efficient deployment. This project not only highlights technical integration but also emphasizes the importance of automation and observability in healthcare IT solutions.


## Features  

- **Frontend (EHR Web UI)** – Built with HTML/CSS/JS, accessible via NodePort service.  
- **Backend (Express.js API)** – Handles patient and appointment data with REST APIs.  
- **Database (MongoDB)** – Stores patient and appointment records persistently.  
- **Containerization (Docker)** – Each component runs in isolated containers.  
- **Orchestration (Kubernetes)** – Deploys and scales the application automatically.  
- **Automation (Ansible)** – Automates environment setup and deployment.  
- **CI/CD (GitHub Actions)** – Builds and pushes Docker images automatically.  
- **Monitoring (Prometheus + Grafana)** – Collects metrics and visualizes application health.



### Key Components
| Component | Description |
|------------|--------------|
| **Frontend Service** | User interface for patient and appointment management |
| **Backend Service** | REST API built with Express.js |
| **MongoDB Service** | Database for persistent data storage |
| **Prometheus** | Metrics collection from backend |
| **Grafana** | Visualization dashboard for monitoring |
| **Ansible** | Environment provisioning and setup |
| **GitHub Actions** | CI/CD automation for build and deploy |



## Tech Stack  

| Category | Technologies |
|-----------|---------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Containerization** | Docker |
| **Orchestration** | Kubernetes (Minikube) |
| **Monitoring** | Prometheus, Grafana |
| **Automation** | Ansible |
| **CI/CD** | GitHub Actions |
| **Version Control** | Git + GitHub |


## Setup and Deployment  

### 1. Clone the Repository
git clone https://github.com/🟩your-username/CA2-507-508.git
cd CA2-507-508

### 2. Build and Push Docker Images 
docker build -t madhuraaher0547/ehr-backend:latest ./backend
docker build -t madhuraaher0547/ehr-frontend:latest ./frontend
docker push madhuraaher0547/ehr-backend:latest
docker push madhuraaher0547/ehr-frontend:latest

### 3. Deploy to Kubernetes
kubectl apply -f k8s/

### 4. Deploy to Kubernetes
kubectl apply -f monitoring/

### 5. Access Services
| Service         | URL                                              |
| --------------- | ------------------------------------------------ |
| **Frontend UI** | [http://localhost:30080](http://localhost:30080) |
| **Prometheus**  | [http://localhost:30900](http://localhost:30900) |
| **Grafana**     | [http://localhost:32000](http://localhost:32000) |

### 6. Monitoring Overview
Prometheus

Collects metrics from /metrics endpoint of backend.
Target Job: ehr-backend-service.default.svc.cluster.local:5000

Grafana
Visualizes metrics such as:
CPU Usage
Memory Usage
HTTP Request Count
Uptime and Response Time

### 6. Automation
Ansible
Used to install Docker, clone repo, and run containers automatically.
ansible-playbook -i inventory.ini playbook.yml --ask-become-pass

### 6. GitHub Actions
Workflow .github/workflows/docker.yml builds and pushes Docker images to Docker Hub whenever code is pushed to main.

<<<<<<< HEAD
=======
---

## Screenshots
| Description | Screenshot |
|--------------|-------------|
| **Architecture Diagram** | ![Architecture](DevOps%20SS/Architecture%20Diagram.png) |
| **CI/CD Pipeline Flow** | ![Pipeline](DevOps%20SS/CI:CD%20Pipeline%20Flow.png) |
| **Prometheus Target UP** | ![Prometheus](DevOps%20SS/Prometheus%20target%20UP.png) |
| **Grafana Dashboard** | ![Grafana](DevOps%20SS/Grafana%20Dashboard.png) |
| **Frontend UI** | ![Frontend](DevOps%20SS/EHR1.png) |


## Challenges Faced
- **Kubernetes Networking & MongoDB Connectivity:** Initial difficulty with service DNS resolution and environment variables.  
- **Prometheus Target Discovery Errors:** Adjusted job names and full DNS to resolve metrics scraping issues.  
- **CI/CD Authentication Issues:** Encountered Docker Hub token errors during automated pushes.  


## Learnings & Outcomes
- Hands-on understanding of the **complete DevOps lifecycle** — from development to deployment.  
- Mastered **CI/CD pipelines, container orchestration, and monitoring** in real-world workflow.  
- Learned to **debug and integrate** multiple tools like Docker, Kubernetes, and Prometheus cohesively.


## Contributors
- **Madhura Aher (23070122507)**
- **Mayank Verma (23070122508)**
- **Suyash Jagtap (23070122514)**
  


 
>>>>>>> 7c714f5 (Update README.md)

