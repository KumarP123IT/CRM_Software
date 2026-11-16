// Konvo deploy pipeline — runs ON the VPS (built-in node) where /opt/konvo
// and the docker socket live. No agents/cloud needed.
//
// Jenkins job setup:
//   New Item → Pipeline → Definition: "Pipeline script from SCM"
//   SCM: Git → repo URL → Credentials: SSH Username with private key
//        (use the same deploy key that's on the VPS clone)
//   Script Path: Jenkinsfile
//   Build Triggers: "Poll SCM" every 5 min — or add a GitHub webhook instead.
//
// The live copy at /opt/konvo is a git clone; deploy.sh does `git pull`
// there using the clone's own deploy key — Jenkins never touches it.

pipeline {
    agent any

    triggers {
        // Fallback trigger: check GitHub every 5 minutes.
        // Remove this block if you use the webhook instead.
        pollSCM('H/5 * * * *')
    }

    environment {
        KONVO_DIR = '/opt/konvo'
    }

    stages {
        stage('Checkout (change detection only)') {
            steps {
                // Required so pollSCM can see new commits. The actual deploy
                // happens in /opt/konvo via deploy.sh's own `git pull`.
                checkout scm
            }
        }

        stage('Deploy') {
            steps {
                dir("${KONVO_DIR}") {
                    sh 'bash deploy.sh'
                }
            }
        }
    }

    post {
        failure {
            echo 'Deploy failed — check: docker compose -f /opt/konvo/docker-compose.yml logs --tail=100'
        }
        success {
            echo 'Deployed OK'
        }
    }
}
