# 🚀 DevOps Continuous Assessment 2 (CA2)

## Team Members

| Name | Roll No. | 
|------|-----------|
| Samidha Manjrekar | 22070122176 | 
| Samruddhi Borhade | 22070122177 | 
| Shruti Bist | 22070122206 | 
| Srishti Parulekar | 22070122219 | 

---

## Project Overview

This repository contains all the files and deliverables for **DevOps CA2**, completed as part of the DevOps CA 2.  
The project follows a complete DevOps lifecycle, including **Deployment Strategy**, **Configuration Management**, **Containerization**, **Orchestration**, and **Monitoring**, along with participation in an **external DevOps challenge** (Kaggle Competition).

---

## Directory Structure

### CA2(176-177-206-219)

#### Documentation
- `project_ss.pdf` — Project synopsis/report
- `presentation.pptx` — Final presentation 

#### Kaggle-Comp
- `kaggle.ipynb` — Jupyter notebook used for the Kaggle competition
- `README.md` — Details about the Kaggle competition & baseline model
- `leaderboard.png` — Screenshot of the Kaggle leaderboard as proof of participation
- `submission.csv` — Final Kaggle submission file
- `submission.png` — Screenshot showing successful Kaggle submission

#### Rasoi-Genie

**Subdirectories:**
- `.github/` — Contains GitHub Actions workflow (CI/CD pipeline)
- `ansible/` — Ansible playbooks and inventory for configuration management
- `backend/` — Backend source code (Node.js/Express or similar)
- `frontend/` — Frontend source code (React or similar)
- `k8s/` — Kubernetes manifests for deployment and service configuration

**Files:**
- `.gitignore` — Ignored files for Git tracking
- `grafana-deploy.yaml` — Grafana deployment configuration
- `node-exporter.yaml` — Node Exporter setup for monitoring
- `prometheus-deployment-service.yaml` — Prometheus deployment & service manifest
- `prometheus-namespace-config.yaml` — Namespace and configuration for Prometheus
- `render.yaml` — Rendering configuration file for deployment
- `package.json` — Node.js project dependencies
- `package-lock.json` — Locked dependency versions
- `README.md` — Documentation for Rasoi-Genie project and DevOps implementation

#### Root
- `README.md` — This file, providing an overview of the project directory

---

## Assignment Breakdown

### **Step 1 – Deployment Strategy (1 Mark)**
- Tool: **GitHub Actions**
- Implemented a working CI/CD pipeline to build, test, and deploy the Rasoi-Genie service automatically.
- Workflow file stored under `.github/workflows/`.
- Includes a **pipeline diagram** explaining the automation process.

---

### **Step 2 – Configuration Management & IaC (2 Marks)**
- Tool: **Ansible**
- Configures the runtime environment (installing Node.js, dependencies, users, and app setup).
- Includes:
  - `ansible/playbook.yml`
  - `ansible/inventory.txt`
- Demonstrates **Infrastructure as Code (IaC)** for consistent environment setup.

---

### **Step 3 – Containerization & Orchestration (1.5 Marks)**
- Tool: **Docker + Kubernetes**
- Backend and frontend services are Dockerized.
- Kubernetes manifests are located in the `k8s` folder.
- Demonstrates **rolling updates** and **rollback strategies**.
- Includes screenshots and YAML configurations for:
  - Deployment
  - Services
  - Namespace setup

---

### **Step 4 – Monitoring & Logging (2 Marks)**
- Tools: **Prometheus + Grafana**
- Configured monitoring stack with:
  - `prometheus-deployment-service.yaml`
  - `grafana-deploy.yaml`
  - `node-exporter.yaml`
- Grafana dashboard displays:
  - Uptime
  - CPU & Memory Usage
  - Error Rates
  - Request Latency
- Dashboard screenshot included in the documentation.

---

### **Step 5 – Reflection & Report (1.5 Marks)**
- **Documentation Folder** includes:
  - `project_ss.pdf` – Report covering architecture, CI/CD pipeline, challenges, and lessons learned.
  - `presentation.pptx` – Final slides for evaluation.
- Focuses on **DevOps pipeline flow**, **architecture**, and **team reflections**.

---

### **Step 6 – Bonus (Kaggle Challenge)**
- Challenge: **Store Sales – Time Series Forecasting (Kaggle)**
- Proof of participation and leaderboard screenshots stored in `Kaggle-Comp/`.
- Achieved successful submission and leaderboard ranking.
- Integrated ML workflow demonstrates real-world DevOps + MLOps synergy.

---

## Deliverables Summary

| Step | Deliverable | Folder |
|------|--------------|--------|
| Step 1 | CI/CD Workflow | `.github/workflows/` |
| Step 2 | Ansible Playbook | `ansible/` |
| Step 3 | K8s YAMLs | `k8s/` |
| Step 4 | Monitoring YAMLs | Root directory |
| Step 5 | Documentation & PPT | `Documentation/` |
| Step 6 | Kaggle Challenge Proof | `Kaggle-Comp/` |

---

## 🧾 References
- [Kaggle: Store Sales - Time Series Forecasting](https://www.kaggle.com/competitions/store-sales-time-series-forecasting)
