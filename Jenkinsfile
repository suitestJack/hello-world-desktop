pipeline {
    agent {
        docker {
            image 'hello-world-desktop-dev:latest'
            args '-u aigang'
        }
    }

    environment {
        JIRA_URL   = 'https://thesuitestthing.atlassian.net'
        JIRA_EMAIL = 'jack+agents@thesuitestthing.com'
        JIRA_TOKEN = credentials('jira-token')
        GH_CRED    = credentials('github-token')
        GH_TOKEN   = "${GH_CRED_PSW}"
    }

    stages {
        stage('Resolve ticket') {
            steps {
                script {
                    // Branch convention: feature/HWD2-42-short-description (see frontend-agent.md)
                    def m = (env.BRANCH_NAME =~ /([A-Z][A-Z0-9]*-[0-9]+)/)
                    env.JIRA_TICKET = m ? m[0][1] : ''
                }
            }
        }

        stage('Install (frontend)') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Type-check & build (frontend)') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Check (Rust backend)') {
            // cargo check, not cargo build/tauri build: verifies the native side
            // compiles without needing a display. Full `tauri build` produces
            // installers and is deferred until a distribution target is chosen.
            steps {
                dir('src-tauri') {
                    sh 'cargo check'
                }
            }
        }

        // No test framework is configured yet (see CLAUDE.md) — the stages
        // above are the current quality gate: frontend type-check + native compile.

        stage('Deploy to dev') {
            // Runs after auto-merge to dev branch
            when { branch 'dev' }
            steps {
                // TODO: add packaging/publish once a distribution target is decided
                // (e.g. GitHub Releases with platform installers, an updater feed)
                echo 'Deploying to dev environment'
            }
        }

        stage('Promote to beta') {
            // Triggered by Jira Done webhook via Generic Webhook Trigger plugin
            when { triggeredBy 'GenericTrigger' }
            steps {
                // TODO: add packaging/publish once a distribution target is decided
                echo 'Promoting to beta environment'
            }
        }

        stage('Deploy to prod') {
            // Runs after manual beta -> prod PR merge
            when { branch 'prod' }
            steps {
                // TODO: add packaging/publish once a distribution target is decided
                echo 'Deploying to prod environment'
            }
        }
    }

    post {
        success {
            script {
                if (env.BRANCH_NAME ==~ /feature\/.*|bugfix\/.*|chore\/.*/) {
                    // Tests passed on a feature branch — auto-merge to dev and move ticket to In Review
                    sh 'gh pr merge --squash --auto'
                    if (env.JIRA_TICKET) {
                        jiraTransitionByName(env.JIRA_TICKET, 'In Review')
                    }
                }
            }
        }
        failure {
            script {
                if (env.BRANCH_NAME ==~ /feature\/.*|bugfix\/.*|chore\/.*/ && env.JIRA_TICKET) {
                    // Build failed — comment on the ticket and move back to In Progress
                    jiraCommentAndTransition(
                        env.JIRA_TICKET,
                        "Pipeline failed. Build log: ${env.BUILD_URL}\n\nPlease review and fix.",
                        'In Progress'
                    )
                }
            }
        }
    }
}

// Looks up the numeric transition ID by its display name at run time (IDs are
// workflow-specific and not stable across projects/instances, so they can't
// be hardcoded) and applies it. No-ops if the named transition isn't available
// from the ticket's current status.
def jiraTransitionByName(String ticket, String transitionName) {
    withEnv(["TICKET=${ticket}", "TRANSITION_NAME=${transitionName}"]) {
        sh '''
            set -e
            TID=$(curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" -H "Accept: application/json" \
                "$JIRA_URL/rest/api/3/issue/$TICKET/transitions" \
                | jq -r --arg name "$TRANSITION_NAME" '.transitions[] | select(.name==$name) | .id')
            if [ -n "$TID" ]; then
                curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" -H "Content-Type: application/json" \
                    -X POST "$JIRA_URL/rest/api/3/issue/$TICKET/transitions" \
                    -d "{\\"transition\\":{\\"id\\":\\"$TID\\"}}"
            fi
        '''
    }
}

def jiraCommentAndTransition(String ticket, String commentBody, String transitionName) {
    withEnv(["TICKET=${ticket}", "COMMENT_BODY=${commentBody}", "TRANSITION_NAME=${transitionName}"]) {
        sh '''
            set -e
            curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" -H "Content-Type: application/json" \
                -X POST "$JIRA_URL/rest/api/3/issue/$TICKET/comment" \
                -d "$(jq -n --arg body "$COMMENT_BODY" \
                    '{body:{type:"doc",version:1,content:[{type:"paragraph",content:[{type:"text",text:$body}]}]}}')"

            TID=$(curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" -H "Accept: application/json" \
                "$JIRA_URL/rest/api/3/issue/$TICKET/transitions" \
                | jq -r --arg name "$TRANSITION_NAME" '.transitions[] | select(.name==$name) | .id')
            if [ -n "$TID" ]; then
                curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" -H "Content-Type: application/json" \
                    -X POST "$JIRA_URL/rest/api/3/issue/$TICKET/transitions" \
                    -d "{\\"transition\\":{\\"id\\":\\"$TID\\"}}"
            fi
        '''
    }
}
