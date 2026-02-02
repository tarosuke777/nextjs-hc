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
    
    post {
        // ビルド成功時に実行
        success {
            echo 'Build succeeded! Sending notification...'
            sh """
                curl -X POST -H "Content-Type: application/json" \
                -d '{"content":"✅ ビルド成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}", "channelId":"1"}' \
                http://home-web-nginx/hc/ap/messages/webhook
            """
        }
        
        // ビルド失敗時に実行
        failure {
            echo 'Build failed! Sending notification...'
            sh """
                curl -X POST -H "Content-Type: application/json" \
                -d '{"content":"❌ ビルド失敗: ${env.JOB_NAME} #${env.BUILD_NUMBER}", "channelId":"1"}' \
                http://home-web-nginx/hc/ap/messages/webhook
            """
        }
    }
}