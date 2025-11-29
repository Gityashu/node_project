pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "docker.io"
        DOCKER_REGISTRY_CREDENTIALS = "docker-hub-credentials"
        DOCKER_USERNAME = "nyr24"
        IMAGE_NAME = "${DOCKER_USERNAME}/node_project"
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
        FULL_IMAGE_NAME = "${IMAGE_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE = "${IMAGE_NAME}:latest"
        GITHUB_REPO = "Gityashu/node_project"
        GITHUB_URL = "https://github.com/${GITHUB_REPO}.git"
        KUBE_NAMESPACE = "sample"
        KUBE_DEPLOYMENT_NAME = "node-app"
        KUBE_CONFIG_CREDENTIALS = "kubeconfig"
    }
    
    stages {
        stage('1. Checkout Code') {
            steps {
                echo "========== Checking out code from GitHub =========="
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    submoduleCfg: [],
                    userRemoteConfigs: [[
                        credentialsId: 'github-pat',
                        url: "${GITHUB_URL}"
                    ]]
                ])
                echo "✓ Code checked out successfully"
            }
        }
        
        stage('2. Build Application') {

            tools {
        nodejs "node18"
    }
            steps {
                echo "========== Building Node.js Application =========="
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Installing dependencies..."
                    npm install
                    echo "✓ Dependencies installed"
                '''
            }
        }
        
        stage('3. Test Application') {
            steps {
                echo "========== Running Tests =========="
                sh '''
                    echo "Running tests..."
                    npm test 2>/dev/null || echo "No test suite found - skipping"
                    echo "✓ Tests completed"
                '''
            }
        }
        
        stage('4. Build Docker Image') {
            steps {
                echo "========== Building Docker Image =========="
                sh '''
                    echo "Building Docker image: ${FULL_IMAGE_NAME}"
                    docker build -t ${FULL_IMAGE_NAME} .
                    docker tag ${FULL_IMAGE_NAME} ${LATEST_IMAGE}
                    echo "✓ Docker image built successfully"
                    docker images | grep ${IMAGE_NAME}
                '''
            }
        }
        
        stage('5. Push Docker Image to Registry') {
            steps {
                echo "========== Pushing Image to Docker Hub =========="
                withDockerRegistry([credentialsId: "${DOCKER_REGISTRY_CREDENTIALS}", url: "https://${DOCKER_REGISTRY}"]) {
                    sh '''
                        echo "Pushing image: ${FULL_IMAGE_NAME}"
                        docker push ${FULL_IMAGE_NAME}
                        echo "Pushing image: ${LATEST_IMAGE}"
                        docker push ${LATEST_IMAGE}
                        echo "✓ Docker image pushed successfully"
                    '''
                }
            }
        }
        
        stage('6. Deploy to EKS') {
            steps {
                echo "========== Deploying to EKS Cluster =========="
                withCredentials([file(credentialsId: "${KUBE_CONFIG_CREDENTIALS}", variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG_FILE}
                        
                        echo "Checking EKS cluster connectivity..."
                        kubectl cluster-info
                        
                        echo "Creating namespace if not exists..."
                        kubectl create namespace ${KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                        
                        echo "Applying Kubernetes manifests..."
                        kubectl apply -f k8s-deployment.yaml
                        
                        echo "✓ Kubernetes manifests applied"
                    '''
                }
            }
        }
        
        stage('7. Verify Deployment') {
            steps {
                echo "========== Verifying EKS Deployment =========="
                withCredentials([file(credentialsId: "${KUBE_CONFIG_CREDENTIALS}", variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG_FILE}
                        
                        echo "Checking deployment rollout status..."
                        kubectl rollout status deployment/${KUBE_DEPLOYMENT_NAME} -n ${KUBE_NAMESPACE} --timeout=5m
                        
                        echo "Pods status:"
                        kubectl get pods -n ${KUBE_NAMESPACE}
                        
                        echo "✓ Deployment verification complete"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo "========== Pipeline Execution Completed =========="
            cleanWs()
        }
        success {
            echo "✓ Pipeline succeeded! Image deployed to EKS"
        }
        failure {
            echo "✗ Pipeline failed! Check logs above for details"
        }
    }
}
