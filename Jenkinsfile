pipeline {
    agent any

    stages {       
        stage('Prepare Docker and Deploy') { 
            steps {
                echo 'Building Docker Compose services...'
                sh 'sudo docker compose build hc-nginx'
                    
                echo 'Stopping and removing old containers...'
                sh 'sudo docker compose down hc-nginx'
                    
                echo 'Starting new containers...'
                sh 'sudo docker compose up -d hc-nginx'
            }
        }
    }
}