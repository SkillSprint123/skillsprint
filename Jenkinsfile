pipeline {
    agent {
        docker {
            image 'node:22'
        }
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        HUSKY = '0'
    }

    parameters {
        booleanParam(name: 'FULL_RELEASE', defaultValue: false, description: 'Собрать все четыре нано из настроенных Git-источников')
        string(name: 'BITBUCKET_SSH_CREDENTIALS', defaultValue: '', description: 'Jenkins Credentials ID: SSH-ключ с доступом ко всем репозиториям')
        string(name: 'BITBUCKET_KNOWN_HOSTS', defaultValue: '', description: 'Jenkins Credentials ID: Secret file с проверенными SSH host keys Bitbucket')
    }

    stages {
        stage('install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('checks') {
            steps {
                sh 'npm run check'
            }
        }
        stage('build') {
            when { expression { !params.FULL_RELEASE } }
            steps {
                sh 'npm run build:prod -- --root-only'
                script { currentBuild.description = 'Корень; четыре нано пока не включены' }
            }
        }
        stage('release') {
            when { expression { params.FULL_RELEASE } }
            steps {
                script {
                    if (!params.BITBUCKET_SSH_CREDENTIALS?.trim() || !params.BITBUCKET_KNOWN_HOSTS?.trim()) {
                        error('Укажите Credentials ID для SSH и проверенного known_hosts')
                    }
                }
                sshagent(credentials: [params.BITBUCKET_SSH_CREDENTIALS]) {
                    withCredentials([file(credentialsId: params.BITBUCKET_KNOWN_HOSTS, variable: 'KNOWN_HOSTS_FILE')]) {
                        withEnv(["GIT_SSH_COMMAND=ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=\"${env.KNOWN_HOSTS_FILE}\""]) {
                            sh 'npm run build:release'
                        }
                    }
                }
                script { currentBuild.description = 'Общий артефакт: корень + четыре нано' }
            }
        }
        stage('archive') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: false
            }
        }
        // Добавить публикацию после согласования команды деплоя стенда.
    }
}
