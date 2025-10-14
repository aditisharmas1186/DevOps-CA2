pipeline {
    agent any
    environment {
        // Set PATH to include Python if not already in the default path
        PATH = "/usr/bin/python3:$PATH"
    }
    tools {
    nodejs "nodejs" // match the name you gave above
    }
    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Python & Pip') {
            steps {
                script {
                    // Install Python 3 and pip if they are not already installed
                    sh '''
                    apt-get update -y
                    apt-get install -y python3 python3-pip
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Install the dependencies from the requirements.txt file
                    sh '''
                    pip3 install -r requirements.txt
                    '''
                }
            }
        }

        stage('Run SonarQube Analysis') {
            steps {
                script {
                    // Make sure SonarQube is set up in your Jenkins instance
                    // This step assumes that SonarQube is already configured in Jenkins
                    sonarScanner 'SonarQubeScanner' // Replace with your SonarQube tool name if different
                }
            }
        }

        stage('Run Tests') {
            steps {
                // Example of running tests (replace with your actual test command)
                sh 'pytest'
            }
        }

        stage('Deploy') {
            steps {
                // Add your deployment steps here (e.g., deploying to production/staging)
                echo 'Deploying application...'
            }
        }
    }

    post {
        always {
            cleanWs() // Clean workspace after build to avoid issues in the next build
        }
        success {
            echo 'Build was successful!'
        }
        failure {
            echo 'Build failed.'
        }
    }
}
