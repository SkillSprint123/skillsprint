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
        booleanParam(name: 'FULL_RELEASE', defaultValue: false, description: 'Build all four nanos from configured Git sources')
        string(name: 'GIT_SSH_CREDENTIALS', defaultValue: '', description: 'Jenkins Credentials ID: SSH key with access to all repositories')
        string(name: 'GIT_KNOWN_HOSTS', defaultValue: '', description: 'Jenkins Credentials ID: secret file with verified SSH host keys for the Git host')
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
                sh 'npm run build:prod'
                script { currentBuild.description = 'Root only; the four nanos are not included' }
            }
        }
        stage('release') {
            when { expression { params.FULL_RELEASE } }
            steps {
                script {
                    if (!params.GIT_SSH_CREDENTIALS?.trim() || !params.GIT_KNOWN_HOSTS?.trim()) {
                        error('Specify Credentials IDs for SSH and verified known_hosts')
                    }
                }
                sshagent(credentials: [params.GIT_SSH_CREDENTIALS]) {
                    withCredentials([file(credentialsId: params.GIT_KNOWN_HOSTS, variable: 'KNOWN_HOSTS_FILE')]) {
                        withEnv(["GIT_SSH_COMMAND=ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=\"${env.KNOWN_HOSTS_FILE}\""]) {
                            sh 'npm run build:release'
                        }
                    }
                }
                script { currentBuild.description = 'Combined artifact: root and four nanos' }
            }
        }
        stage('archive') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: false
            }
        }
        // Add publishing once the deployment command has been agreed.
    }
}
