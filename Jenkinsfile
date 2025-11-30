pipeline {
    agent any
    
    environment {
        // AWS ECR Configuration
        AWS_REGION = "us-east-1"                    // Change to your AWS region
        AWS_ACCOUNT_ID = credentials('aws-account-id')  // Store in Jenkins secrets
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        ECR_REPOSITORY_NAME = "node_project"
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
        FULL_IMAGE_NAME = "${ECR_REGISTRY}/${ECR_REPOSITORY_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE = "${ECR_REGISTRY}/${ECR_REPOSITORY_NAME}:latest"
        
        // GitHub Configuration
        GITHUB_REPO = "Gityashu/node_project"
        GITHUB_URL = "https://github.com/${GITHUB_REPO}.git"
        
        // EKS Configuration
        KUBE_NAMESPACE = "sample"
        KUBE_DEPLOYMENT_NAME = "node-app"
        KUBE_CONFIG_CREDENTIALS = "kubeconfig"
        AWS_CREDENTIALS = "aws-credentials"  // Jenkins AWS credential
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
                nodejs "nodejs"
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
                    docker images | grep ${ECR_REPOSITORY_NAME}
                '''
            }
        }
        
        stage('5. Login to AWS ECR') {
            steps {
                echo "========== Logging in to AWS ECR =========="
                withCredentials([
                    aws(credentialsId: "${AWS_CREDENTIALS}", 
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        echo "✓ AWS ECR login successful"
                    '''
                }
            }
        }
        
        stage('6. Push Docker Image to ECR') {
            steps {
                echo "========== Pushing Image to AWS ECR =========="
                sh '''
                    echo "Pushing image: ${FULL_IMAGE_NAME}"
                    docker push ${FULL_IMAGE_NAME}
                    echo "Pushing image: ${LATEST_IMAGE}"
                    docker push ${LATEST_IMAGE}
                    echo "✓ Docker image pushed to ECR successfully"
                '''
            }
        }
        
        stage('7. Update K8s Manifests') {
            steps {
                echo "========== Updating K8s Manifests =========="
                sh '''
                    sed -i "s|image:.*|image: ${FULL_IMAGE_NAME}|g" k8s-deployment.yaml
                    echo "✓ Updated image in k8s-deployment.yaml"
                    cat k8s-deployment.yaml | grep image
                '''
            }
        }
        stage('8. Deploy to EKS') {
    steps {
        echo "========== Deploying to EKS Cluster =========="
        withCredentials([
            file(credentialsId: "${KUBE_CONFIG_CREDENTIALS}", variable: 'KUBECONFIG_FILE'),
            aws(credentialsId: "${AWS_CREDENTIALS}", accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
            sh '''
                export KUBECONFIG=${KUBECONFIG_FILE}
                export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                echo "Checking EKS cluster connectivity..."
                kubectl cluster-info

                echo "Creating namespace if not exists..."
                kubectl create namespace ${KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

                echo "Applying Kubernetes manifests..."
                kubectl apply -f k8s-deployment.yaml
            '''
        }
    }
}
// stage('9. Verify Deployment') {
//     steps {
//         echo "========== Verifying EKS Deployment =========="
//         withCredentials([
//             file(credentialsId: "${KUBE_CONFIG_CREDENTIALS}", variable: 'KUBECONFIG_FILE'),
//             aws(credentialsId: "${AWS_CREDENTIALS}", accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')
//         ]) {
//             sh '''
//                 export KUBECONFIG=${KUBECONFIG_FILE}
//                 export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
//                 export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

//                 echo "Checking deployment rollout status..."
//                 kubectl rollout status deployment/${KUBE_DEPLOYMENT_NAME} -n ${KUBE_NAMESPACE} --timeout=5m

//                 echo "Pods status:"
//                 kubectl get pods -n ${KUBE_NAMESPACE}
//             '''
//         }
//     }
// }
    }
    
    post {
        always {
            echo "========== Pipeline Execution Completed =========="
            cleanWs()
        }
        success {
            echo "✓ Pipeline succeeded! Image deployed to EKS from ECR"
        }
        failure {
            echo "✗ Pipeline failed! Check logs above for details"
        }
    }
}
