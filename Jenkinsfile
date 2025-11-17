/* groovylint-disable CompileStatic, DuplicateStringLiteral, LineLength, NestedBlockDepth, NoDef, UnnecessaryGetter, VariableTypeRequired */
// Jenkinsfile (Declarativo)
pipeline {
    agent {
        node {
            label 'docker-builds'
        }
    }

    environment {
        // Configurações Git
        GIT_CREDENTIALS_ID = 'jenkins_gitlab_xixo'
        GIT_REPO_URL = 'https://gitlab.com/xmaiconx/synaxe/services/gestaoconsultorio.git'
        GIT_USER_EMAIL = 'jenkins@synaxe.com.br'
        GIT_USER_NAME = 'Jenkins CI'

        // Configurações Docker Registry
        NEXUS_HOST = 'nexus.iablue.com.br'
        NEXUS_CREDENTIALS_ID = 'nexus_jenkins'
        NEXUS_DOCKER_REGISTRY_HOST = "${NEXUS_HOST}"
        NEXUS_DOCKER_PUBLISH_REPO = 'docker-mp'

        // Configurações NPM Registry (não usado mais, mas mantido para compatibilidade)
        NEXUS_NPM_PUBLISH_REGISTRY_URL = "http://${NEXUS_HOST}/repository/npm-mp/"
        NEXUS_NPM_INSTALL_REGISTRY_URL = "http://${NEXUS_HOST}/repository/npm-mp-group/"

        // Configurações da Aplicação - Apenas Backend
        // Frontend é deployado no Cloudflare Pages automaticamente via Git
        BACKEND_IMAGE_NAME = 'gc-backend'

        // Configurações Portainer (opcional - se usar Swarm/Stack)
        PORTAINER_URL = 'https://painel.iablue.com.br'
        PORTAINER_CREDENTIALS_ID = 'portainer_token'
        BACKEND_STACK_ID = '50'  // Ajustar conforme necessário
    }

    tools {
        nodejs 'nodejs-lts'
        git 'git'
        dockerTool 'docker'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        skipDefaultCheckout true
        disableConcurrentBuilds()
        skipStagesAfterUnstable()
    }

    stages {
        stage('Preparar') {
            steps {
                script {
                    // Criar workspace efêmero usando BUILD_ID único e timestamp
                    def sanitizedJobName = env.JOB_NAME.replaceAll('[^a-zA-Z0-9\\-_]', '-')
                    def timestamp = new Date().format('yyyyMMdd-HHmmss')
                    env.TEMP_WORKSPACE = "/tmp/jenkins-workspace-${sanitizedJobName}-${env.BUILD_ID}-${timestamp}"
                    echo "Criando workspace efêmero: ${env.TEMP_WORKSPACE}"
                    
                    // Limpar possíveis workspaces antigos antes de criar o novo
                    try {
                        sh "find /tmp -maxdepth 1 -name 'jenkins-workspace-${sanitizedJobName}-*' -type d -mtime +1 -exec rm -rf {} + || true"
                        echo "Limpeza de workspaces antigos concluída"
                    } catch (Exception e) {
                        echo "Aviso: Não foi possível limpar workspaces antigos: ${e.getMessage()}"
                    }
                    
                    // Garantir que o diretório existe e é único
                    sh "mkdir -p '${env.TEMP_WORKSPACE}'"
                    sh "chmod 755 '${env.TEMP_WORKSPACE}'"
                    
                    // Validar workspace virtual
                    try {
                        sh "chmod +x scripts/validate-jenkins-workspace.sh || true"
                        sh "TEMP_WORKSPACE='${env.TEMP_WORKSPACE}' scripts/validate-jenkins-workspace.sh"
                        echo "✅ Workspace virtual validado com sucesso"
                    } catch (Exception e) {
                        echo "⚠️  Validação do workspace falhou: ${e.getMessage()}"
                        echo "Continuando com workspace básico..."
                    }
                    
                    // Captura timestamp de início do build
                    env.BUILD_START_TIME = "${System.currentTimeMillis()}"
                    echo "Build started at timestamp: ${env.BUILD_START_TIME}"
                    echo "Workspace isolation: ${env.TEMP_WORKSPACE}"
                    
                    slackSend(
                        channel: 'ai-pipeline',
                        color: 'warning',
                        message: "🚀 Build iniciado: *${env.JOB_NAME}* - #${env.BUILD_ID} \n🔗 <${env.BUILD_URL}|Detalhes do Build>\n📄 <${env.BUILD_URL}console|Ver logs>"
                    )
                }
            }
        }

        stage('Checkout') {
            steps {
                script {
                    dir(env.TEMP_WORKSPACE) {
                        def effectiveBranchToCheckout = env.BRANCH_NAME
                        echo "Branch to checkout: ${effectiveBranchToCheckout}"

                        if (effectiveBranchToCheckout == null || effectiveBranchToCheckout.trim().isEmpty()) {
                            error "Branch name is empty or null"
                        }

                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: effectiveBranchToCheckout]],
                            userRemoteConfigs: [[
                                url: env.GIT_REPO_URL,
                                credentialsId: env.GIT_CREDENTIALS_ID
                            ]],
                            extensions: [
                                [$class: 'CloneOption', shallow: false, noTags: false, timeout: 30],
                                [$class: 'LocalBranch', localBranch: effectiveBranchToCheckout.startsWith('origin/') ? effectiveBranchToCheckout.substring('origin/'.length()) : effectiveBranchToCheckout]
                            ]
                        ])

                        sh "git config --global user.email '${env.GIT_USER_EMAIL}'"
                        sh "git config --global user.name '${env.GIT_USER_NAME}'"
                    }
                }
            }
        }

        stage('Check Commit for CI Skip and Force Build') {
                    steps {
                        script {
                            dir(env.TEMP_WORKSPACE) {
                                env.DO_SKIP_CI = 'false'
                                env.FORCE_DOCKER_BUILD = 'false'
                                try {
                                    def commitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim().toLowerCase()
                                    echo "Commit message: ${commitMessage}"
                                    
                                    // Verificar se deve pular CI (mais padrões comuns)
                                    if (commitMessage.contains('[skip ci]') || commitMessage.contains('[ci skip]') ||
                                        commitMessage.contains('***no_ci***') || commitMessage.contains('[no ci]') ||
                                        commitMessage.contains('skipci') || commitMessage.contains('skip ci') ||
                                        commitMessage.contains('skip-ci') || commitMessage.contains('ci-skip')) {
                                        echo 'Commit contains skip CI directive. Skipping CI stages and workspace cleanup.'
                                        env.DO_SKIP_CI = 'true'
                                    }
                                    
                                    // Verificar se deve forçar build de imagens Docker
                                    if (commitMessage.contains('[force docker]') || commitMessage.contains('[docker force]') ||
                                        commitMessage.contains('[build docker]') || commitMessage.contains('[docker build]')) {
                                        echo 'Commit contains force docker build tag. Will force Docker image build and push.'
                                        env.FORCE_DOCKER_BUILD = 'true'
                                    }
                                    
                                    echo "DO_SKIP_CI set to: ${env.DO_SKIP_CI}"
                                    echo "FORCE_DOCKER_BUILD set to: ${env.FORCE_DOCKER_BUILD}"
                                } catch (e) {
                                    echo "Could not get commit message: ${e.getMessage()}"
                                    env.DO_SKIP_CI = 'false'
                                    env.FORCE_DOCKER_BUILD = 'false'
                                }
                            }
                        }
                    }
                }

        stage('Setup Environment & NPM Auth') {
            when {
                expression { env.DO_SKIP_CI == 'false' }
            }
            steps {
                echo 'Configurando ambiente Node.js e autenticação Nexus...'

                withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS_ID, usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
                    script {
                        dir(env.TEMP_WORKSPACE) {
                            def rawToken = "${NEXUS_USER}:${NEXUS_PASSWORD}"
                            def nexusAuthTokenBase64 = sh(script: "echo -n '${rawToken}' | base64", returnStdout: true).trim()
                            def nexusUser = NEXUS_USER

                            // 
                                // registry=https://registry.npmjs.org/
                            def npmrcContent = """
                                registry=https://registry.npmjs.org/
                                @ia-blue:registry=${env.NEXUS_NPM_INSTALL_REGISTRY_URL}
                                //${env.NEXUS_HOST}/repository/npm-mp-group/:_auth=${nexusAuthTokenBase64}
                                //${env.NEXUS_HOST}/repository/npm-mp/:_auth=${nexusAuthTokenBase64}
                                install-strategy=hoisted
                            """
                            writeFile file: '.npmrc', text: npmrcContent
                            echo 'Arquivo .npmrc gerado para o build (credenciais ocultadas):'
                            sh "cat .npmrc | sed 's/_auth=.*\$/_auth=**HIDDEN**/'"
                        }
                    }
                }
            }
        }

        stage('Install Dependencies') {
            when {
                expression { env.DO_SKIP_CI == 'false' }
            }
            steps {
                script {
                    dir(env.TEMP_WORKSPACE) {
                        echo 'Instalando dependências com suporte completo a plataformas...'
                        // sh 'npm install --include=optional --legacy-peer-deps'
                        sh 'npm ci --include=optional'
                        
                        echo 'Verificando estrutura final dos binários...'
                        sh 'ls -la node_modules/turbo/bin/ || echo "Diretório bin não encontrado"'
                        sh 'find node_modules -name "*turbo*" -type f | head -10'
                        
                        echo 'Testando Turborepo com npx...'
                        sh 'npx turbo --version'
                    }
                }
            }
        }

        stage('Detect Changes') {
            when {
                expression { env.DO_SKIP_CI == 'false' }
            }
            steps {
                script {
                    dir(env.TEMP_WORKSPACE) {
                        echo 'Detectando mudanças no repositório...'
                        
                        // Determinar commits para comparação
                        def baseCommit = 'HEAD~1'
                        
                        if (env.CHANGE_ID) {
                            // Para Pull Requests
                            baseCommit = "origin/${env.CHANGE_TARGET}"
                            echo "Pull Request detectado - comparando com: ${baseCommit}"
                        } else if (env.BRANCH_NAME == 'production' || env.BRANCH_NAME == 'release') {
                            // Para branches de release/production - comparar com commit anterior
                            baseCommit = 'HEAD~1'
                            echo "Branch de ${env.BRANCH_NAME} detectada - comparando com: ${baseCommit}"
                        } else if (env.BRANCH_NAME != 'main') {
                            // Para branches de feature
                            baseCommit = 'origin/main'
                            echo "Branch de feature detectada - comparando com: ${baseCommit}"
                        } else {
                            // Para branch main
                            echo "Branch main detectada - comparando com: ${baseCommit}"
                        }
                        
                        echo "Executando detecção de mudanças: ${baseCommit}..HEAD"
                        
                        // Executar script de detecção de mudanças
                        def exitCode = sh(
                            script: "node scripts/detect-changes.js ${baseCommit} HEAD",
                            returnStatus: true
                        )
                        
                        if (exitCode != 0) {
                            echo 'Nenhuma mudança detectada que requeira build'
                            env.SKIP_BUILD = 'true'
                            return
                        }
                        
                        // Ler resultado da detecção
                        def buildMatrix = readJSON file: 'build-matrix.json'

                        // Apenas backend é buildado no Jenkins
                        // Frontend vai automaticamente para Cloudflare Pages
                        env.BUILD_BACKEND = buildMatrix.shouldBuild['backend'].toString()

                        echo "Build Matrix:"
                        echo "  backend (Docker): ${env.BUILD_BACKEND}"
                        echo "  frontend (Cloudflare Pages): automático via Git"

                        // Gerar versão para backend
                        if (env.BUILD_BACKEND == 'true') {
                            env.BACKEND_VERSION = sh(
                                script: "node scripts/version-manager.js docker-version backend ${env.BRANCH_NAME}",
                                returnStdout: true
                            ).trim()
                            echo "Versão do backend: ${env.BACKEND_VERSION}"
                        }
                    }
                }
            }
        }

        stage('Lint & Build') {
            when {
                allOf {
                    expression { env.DO_SKIP_CI == 'false' }
                    expression { env.SKIP_BUILD != 'true' }
                }
            }
            steps {
                script {
                    dir(env.TEMP_WORKSPACE) {
                        echo 'Running lint and build with Turborepo...'
                        sh 'npx turbo run lint'
                        sh 'npx turbo run build'
                    }
                }
            }
        }

        stage('Build & Push Docker Images') {
            when {
                allOf {
                    expression { env.DO_SKIP_CI == 'false' }
                    expression { env.SKIP_BUILD != 'true' || env.FORCE_DOCKER_BUILD == 'true' }
                    expression { shouldBuildImages() }
                }
            }
            steps {
                script {
                    // Frontend é deployado automaticamente no Cloudflare Pages
                    // Apenas backend precisa de build Docker no Jenkins
                    if (env.BUILD_BACKEND == 'true') {
                        echo '🐳 Building and pushing backend Docker image...'
                        buildAndPushImageWithVersion(
                            '.',  // Build from root (monorepo)
                            env.BACKEND_IMAGE_NAME,
                            'apps/backend/Dockerfile',
                            env.BACKEND_VERSION
                        )
                    } else {
                        echo '⏭️  Skipping backend Docker build (no changes detected)'
                    }

                    echo '☁️  Frontend will be deployed automatically to Cloudflare Pages via Git push'
                }
            }
        }

        stage('Create Git Tags') {
            when {
                allOf {
                    expression { env.DO_SKIP_CI == 'false' }
                    expression { env.SKIP_BUILD != 'true' }
                    expression { isProductionBranch() || isReleaseBranch() }
                }
            }
            steps {
                script {
                    dir(env.TEMP_WORKSPACE) {
                        echo 'Criando tags Git para release...'
                        
                        withCredentials([gitUsernamePassword(credentialsId: env.GIT_CREDENTIALS_ID, gitToolName: 'git')]) {
                            echo 'Configurando Git user para commits e tags...'
                            sh "git config --global user.email '${env.GIT_USER_EMAIL}'"
                            sh "git config --global user.name '${env.GIT_USER_NAME}'"
                            
                            if (env.BUILD_APP_API == 'true') {
                                sh "node scripts/version-manager.js create-tag-safe app-api ${env.APP_API_VERSION}"
                            }
                            
                            if (env.BUILD_GATEWAY_API == 'true') {
                                sh "node scripts/version-manager.js create-tag-safe gateway-api ${env.GATEWAY_API_VERSION}"
                            }
                            
                            if (env.BUILD_AGENTS_ENGINE == 'true') {
                                sh "node scripts/version-manager.js create-tag-safe agents-engine ${env.AGENTS_ENGINE_VERSION}"
                            }
                            
                            if (env.BUILD_MESSAGE_ENGINE == 'true') {
                                sh "node scripts/version-manager.js create-tag-safe message-engine ${env.MESSAGE_ENGINE_VERSION}"
                            }
                            
                            if (env.BUILD_APP_WORKER == 'true') {
                                sh "node scripts/version-manager.js create-tag-safe app-worker ${env.APP_WORKER_VERSION}"
                            }
                            
                            echo 'Fazendo push das tags para o repositório...'
                            if (isProductionBranch()) {
                                sh 'git push --follow-tags origin HEAD:production'
                            } else if (isReleaseBranch()) {
                                sh 'git push --follow-tags origin HEAD:release'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    if (env.BUILD_START_TIME && env.BUILD_START_TIME != 'null') {
                        echo "Calculating duration from start time: ${env.BUILD_START_TIME}"
                        env.BUILD_DURATION = calculateBuildDuration(env.BUILD_START_TIME)
                        echo "Calculated duration: ${env.BUILD_DURATION}"
                    } else {
                        echo "BUILD_START_TIME not available: ${env.BUILD_START_TIME}"
                        env.BUILD_DURATION = "Tempo não disponível"
                    }
                } catch (Exception e) {
                    echo "Error calculating build duration: ${e.getMessage()}"
                    env.BUILD_DURATION = "Erro no cálculo"
                }
            }
            echo 'Pipeline finished.'
            
            script {
                // Limpeza prioritária do workspace efêmero
                if (env.TEMP_WORKSPACE && env.TEMP_WORKSPACE != 'null' && env.TEMP_WORKSPACE.startsWith('/tmp/jenkins-workspace-')) {
                    try {
                        echo "Iniciando limpeza do workspace efêmero: ${env.TEMP_WORKSPACE}"
                        
                        // Verificar se o diretório ainda existe antes de tentar remover
                        def workspaceExists = sh(
                            script: "test -d '${env.TEMP_WORKSPACE}' && echo 'true' || echo 'false'",
                            returnStdout: true
                        ).trim()
                        
                        if (workspaceExists == 'true') {
                            // Forçar remoção de forma mais robusta
                            sh """
                                echo "Removendo conteúdo de: ${env.TEMP_WORKSPACE}"
                                find '${env.TEMP_WORKSPACE}' -type f -delete || true
                                find '${env.TEMP_WORKSPACE}' -depth -type d -delete || true
                                rmdir '${env.TEMP_WORKSPACE}' || rm -rf '${env.TEMP_WORKSPACE}' || true
                            """
                            echo "Workspace efêmero removido com sucesso"
                        } else {
                            echo "Workspace efêmero já foi removido"
                        }
                    } catch (Exception e) {
                        echo "Aviso: Limpeza do workspace efêmero falhou: ${e.getMessage()}"
                        // Tentar limpeza alternativa
                        try {
                            sh "rm -rf '${env.TEMP_WORKSPACE}' 2>/dev/null || true"
                        } catch (Exception e2) {
                            echo "Limpeza alternativa também falhou: ${e2.getMessage()}"
                        }
                    }
                } else {
                    echo "Workspace efêmero não definido ou inválido, pulando limpeza: ${env.TEMP_WORKSPACE}"
                }
                
                // Limpeza do workspace padrão apenas se necessário e seguro
                try {
                    // Só executar cleanWs se não estivermos usando workspace virtual exclusivamente
                    if (env.WORKSPACE && env.WORKSPACE != env.TEMP_WORKSPACE && !env.TEMP_WORKSPACE?.startsWith('/tmp/jenkins-workspace-')) {
                        echo "Executando limpeza padrão do Jenkins: ${env.WORKSPACE}"
                        cleanWs(cleanWhenNotBuilt: false,
                                cleanWhenSuccess: true,
                                cleanWhenAborted: true,
                                cleanWhenFailure: true,
                                cleanWhenUnstable: true,
                                notFailBuild: true,
                                deleteDirs: false,
                                patterns: [[pattern: '.git/**', type: 'EXCLUDE']])
                    } else {
                        echo "Workspace virtual detectado - cleanWs desnecessário"
                    }
                } catch (Exception e) {
                    // Este erro é esperado quando usando workspace virtual
                    echo "CleanWs falhou (esperado para workspace virtual): ${e.getMessage()}"
                }
            }
        }
        success {
            script {
                slackSend(
                    channel: 'ai-pipeline',
                    color: 'good',
                    message: "✅ Build concluído com sucesso: *${env.JOB_NAME}* - #${env.BUILD_NUMBER}\n⏱️ Duração: ${env.BUILD_DURATION}\n🔗 <${env.BUILD_URL}|Detalhes do Build>"
                )
            }
            echo 'Pipeline completed successfully!'
        }
        failure {
            script {
                slackSend(
                    channel: 'ai-pipeline',
                    color: 'danger',
                    message: "❌ Build falhou: *${env.JOB_NAME}* - #${env.BUILD_NUMBER}\n⏱️ Duração: ${env.BUILD_DURATION}\n🔗 <${env.BUILD_URL}|Detalhes do Build>\n📋 <${env.BUILD_URL}console|Ver logs>"
                )
            }
            echo 'Pipeline failed.'
        }
    }
}

// Funções auxiliares para nova estratégia de Production/Release/Main Flow
def isTagBuild() {
    return env.TAG_NAME != null && env.TAG_NAME.matches('(?:.*-)?v\\d+\\.\\d+\\.\\d+$')
}

def isProductionBranch() {
    return env.BRANCH_NAME == 'production'
}

def isReleaseBranch() {
    return env.BRANCH_NAME == 'release'
}

def isMainBranch() {
    return env.BRANCH_NAME == 'main'
}

def isHotfixBranch() {
    return env.BRANCH_NAME != null && env.BRANCH_NAME.startsWith('hotfix/')
}

def hasVersionChanges() {
    try {
        dir(env.TEMP_WORKSPACE) {
            // Verificar se há mudanças nos package.json das aplicações
            def changedFiles = sh(
                script: "git diff --name-only HEAD~1 HEAD",
                returnStdout: true
            ).trim()
            
            def versionChanged = changedFiles.contains('apps/app-api/package.json') ||
                               changedFiles.contains('apps/gateway-api/package.json') ||
                               changedFiles.contains('apps/gateway-worker/package.json')
            
            if (versionChanged) {
                echo "Mudanças detectadas nos package.json - possível release"
                return true
            }
            
            return false
        }
    } catch (Exception e) {
        echo "Erro ao verificar mudanças de versão: ${e.getMessage()}"
        return false
    }
}

def isReleaseCommit() {
    try {
        dir(env.TEMP_WORKSPACE) {
            def commitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim().toLowerCase()
            def isRelease = commitMessage.contains('[release]')
            
            if (isRelease) {
                echo "Commit de release detectado: ${commitMessage}"
            }
            
            return isRelease
        }
    } catch (Exception e) {
        echo "Erro ao verificar commit de release: ${e.getMessage()}"
        return false
    }
}

def shouldBuildImages() {
    // Nova lógica: production e release sempre geram artefatos, main nunca gera
    if (isProductionBranch()) {
        return true  // Sempre gera artefatos finais para produção
    } else if (isReleaseBranch()) {
        return true  // Sempre gera artefatos RC para homologação
    } else if (isMainBranch()) {
        return false  // Main nunca gera artefatos (apenas compila/testa)
    } else if (isHotfixBranch()) {
        return true  // Hotfixes geram artefatos
    } else {
        return env.FORCE_DOCKER_BUILD == 'true'  // Feature branches apenas com força
    }
}

def shouldPushImages() {
    return shouldBuildImages()
}

def getImageTag(appName, version) {
    dir(env.TEMP_WORKSPACE) {
        def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        
        if (isProductionBranch()) {
            return version  // v1.2.3 (versão final para produção)
        } else if (isReleaseBranch()) {
            // Verificar se já é uma versão RC, se não, adicionar RC
            if (version.contains('-rc.')) {
                return version  // v1.2.3-rc.1 (já é RC)
            } else {
                return "${version}-rc.1"  // v1.2.3-rc.1 (adicionar RC)
            }
        } else if (isHotfixBranch()) {
            return "${version}-hotfix.${commitHash}"  // v1.2.4-hotfix.abc123
        } else {
            return "${version}-${commitHash}"  // v1.2.3-abc123 (outras branches)
        }
    }
}

def calculateBuildDuration(startTime) {
    try {
        def endTime = System.currentTimeMillis()
        def startTimeLong = startTime as Long
        def durationMs = endTime - startTimeLong
        def durationSeconds = (durationMs / 1000 + 0.5) as Integer
        
        def hours = (durationSeconds / 3600) as Integer
        def minutes = ((durationSeconds % 3600) / 60) as Integer
        def seconds = (durationSeconds % 60) as Integer
        
        if (hours > 0) {
            return "${hours}h ${minutes}m ${seconds}s"
        } else if (minutes > 0) {
            return "${minutes}m ${seconds}s"
        } else {
            return "${seconds}s"
        }
    } catch (Exception e) {
        return "Erro: ${e.getMessage()}"
    }
}

def buildAndPushImage(String appPath, String imageName, String dockerfilePath) {
    dir(env.TEMP_WORKSPACE) {
        def packageVersion = sh(
            script: "node -e \"console.log(require('./${appPath}/package.json').version)\"",
            returnStdout: true
        ).trim()
        
        def dockerTag = packageVersion
        def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        
        if (env.BRANCH_NAME != 'main') {
            dockerTag = "${packageVersion}-${commitHash}"
        }
        
        echo "Building ${imageName}:${dockerTag}"
        
        withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS_ID, usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
            docker.withRegistry("http://${env.NEXUS_DOCKER_REGISTRY_HOST}:8085", env.NEXUS_CREDENTIALS_ID) {
                def customImage = docker.build(
                    "${imageName}:${dockerTag}",
                    "--build-arg APP_VERSION=${packageVersion} -f ${dockerfilePath} ."
                )
                
                if (env.BRANCH_NAME == 'main') {
                    echo "Pushing ${imageName}:${dockerTag} and latest to registry"
                    customImage.push(dockerTag)
                    customImage.push('latest')
                } else {
                    echo "Branch is ${env.BRANCH_NAME}. Skipping push to registry."
                }
            }
        }
    }
}

def buildAndPushImageWithVersion(String appPath, String imageName, String dockerfilePath, String version) {
    dir(env.TEMP_WORKSPACE) {
        def dockerTag = getImageTag(imageName, version)
        def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        
        echo "Building ${imageName}:${dockerTag} (commit: ${commitHash})"
        echo "Build context: ${isReleaseCommit() && env.BRANCH_NAME == 'main' ? 'RELEASE' : isHotfixBranch() ? 'HOTFIX' : 'OTHER'}"
        
        withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS_ID, usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
            docker.withRegistry("http://${env.NEXUS_DOCKER_REGISTRY_HOST}:8085", env.NEXUS_CREDENTIALS_ID) {
                def customImage = docker.build(
                    "${imageName}:${dockerTag}",
                    "--build-arg APP_VERSION=${version} --build-arg COMMIT_HASH=${commitHash} -f ${dockerfilePath} ."
                )
                
                if (shouldPushImages()) {
                    if (isProductionBranch()) {
                        echo "PRODUCTION BUILD: Pushing ${imageName}:${dockerTag} and latest to registry"
                        customImage.push(dockerTag)
                        customImage.push('latest')
                    } else if (isReleaseBranch()) {
                        echo "RELEASE BUILD: Pushing ${imageName}:${dockerTag} to registry"
                        customImage.push(dockerTag)
                    } else if (isHotfixBranch()) {
                        echo "HOTFIX BUILD: Pushing ${imageName}:${dockerTag} to registry"
                        customImage.push(dockerTag)
                    }
                } else {
                    echo "DEVELOPMENT BUILD: Skipping push to registry (branch: ${env.BRANCH_NAME})"
                }
            }
        }
        
        echo "Successfully built ${imageName}:${dockerTag}"
    }
}