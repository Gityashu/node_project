<div align="center">

# 🧩 node_project

A container-ready Node.js + Express todo-style web app with EJS views, Docker, Kubernetes manifests, and Jenkins-based CI/CD.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)[web:28]
[![Express](https://img.shields.io/badge/Express.js-minimal-000000?logo=express&logoColor=white)](https://expressjs.com)[web:28]
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)[web:25]
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-blue?logo=kubernetes&logoColor=white)](https://kubernetes.io)[web:25]
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)](https://www.jenkins.io)[web:27]

</div>

---

## 🌐 Demo / Screenshot

> Replace the image below with a real screenshot from your deployment.

<p align="center">
  <img src="views/Screenshot 2025-12-01 112308.png" alt="node_project Screenshot" width="800" />
</p>

---

## 📦 Tech Stack

- Node.js + Express server (`app.js`)
- EJS templates for server-side rendering (`views/`)
- Static assets (CSS, images, JS) in `public/`
- Dockerfile for container image
- Kubernetes manifests for deployment and service (`todo-deployment.yaml`, `todo-service.yaml`, `k8s-deployment.yaml`)
- Jenkinsfile for CI/CD pipeline to build, push, and deploy

---

## 🚀 Getting Started

### 1. Clone and install

git clone https://github.com/Gityashu/node_project.git
cd node_project
npm install

text

### 2. Run locally

npm start

or
node app.js

text

Then open:

- http://localhost:3000

---

## 🐳 Docker

Build image:

docker build -t your-docker-username/node_project:latest .

text

Run container:

docker run -d -p 3000:3000 your-docker-username/node_project:latest

text

Update `your-docker-username` and tag as needed.

---

## ☸️ Kubernetes (e.g., EKS)

1. Make sure your kube-context points to your cluster.  
2. Update image name in `todo-deployment.yaml` / `k8s-deployment.yaml`.  
3. Apply manifests:

kubectl apply -f todo-deployment.yaml
kubectl apply -f todo-service.yaml

text

4. Get the service endpoint:

kubectl get svc

text

Then hit the external LoadBalancer / NodePort URL.

---

## 🔁 CI/CD with Jenkins

- Pipeline steps typically include:
  - Checkout from GitHub
  - Build and push Docker image
  - Deploy to Kubernetes using `kubectl` from Jenkins

Make sure Jenkins has:

- GitHub credentials
- Docker registry credentials
- Kubeconfig / Kubernetes credentials matching what is referenced in `Jenkinsfile`

---
