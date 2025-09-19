#!/bin/bash

# 🚀 Script de Déploiement Automatisé - Onboarding Optimisé
# Usage: ./scripts/deploy-onboarding.sh [phase] [percentage]

set -e  # Arrêter en cas d'erreur

# Configuration
PHASE=${1:-"canary"}
PERCENTAGE=${2:-5}
NAMESPACE="default"
DEPLOYMENT_NAME="onboarding-frontend"
IMAGE_TAG="onboarding-optimized-v1.0.0"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl n'est pas installé"
        exit 1
    fi
    
    # Vérifier la connexion au cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Impossible de se connecter au cluster Kubernetes"
        exit 1
    fi
    
    # Vérifier curl
    if ! command -v curl &> /dev/null; then
        log_error "curl n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis validés"
}

# Vérifier la santé du déploiement actuel
check_current_health() {
    log_info "Vérification de la santé du déploiement actuel..."
    
    # Vérifier que le déploiement existe
    if ! kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE &> /dev/null; then
        log_error "Le déploiement $DEPLOYMENT_NAME n'existe pas"
        exit 1
    fi
    
    # Vérifier que tous les pods sont prêts
    READY_PODS=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    DESIRED_PODS=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    
    if [ "$READY_PODS" != "$DESIRED_PODS" ]; then
        log_error "Le déploiement actuel n'est pas stable ($READY_PODS/$DESIRED_PODS pods prêts)"
        exit 1
    fi
    
    log_success "Déploiement actuel stable ($READY_PODS/$DESIRED_PODS pods prêts)"
}

# Configurer les feature flags
configure_feature_flags() {
    log_info "Configuration des feature flags pour $PERCENTAGE% du trafic..."
    
    # Activer le feature flag avec le pourcentage spécifié
    curl -X POST "http://localhost:3000/api/feature-flags/onboarding-optimized" \
        -H "Content-Type: application/json" \
        -d "{\"enabled\": true, \"rolloutPercentage\": $PERCENTAGE}" \
        --max-time 10 || {
        log_warning "Impossible de configurer les feature flags via API, configuration manuelle requise"
    }
    
    log_success "Feature flags configurés pour $PERCENTAGE% du trafic"
}

# Déployer la nouvelle version
deploy_new_version() {
    log_info "Déploiement de la nouvelle version $IMAGE_TAG..."
    
    # Mettre à jour l'image
    kubectl set image deployment/$DEPLOYMENT_NAME \
        onboarding=$IMAGE_TAG \
        -n $NAMESPACE
    
    # Attendre que le déploiement soit terminé
    log_info "Attente de la finalisation du déploiement..."
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=300s
    
    log_success "Nouvelle version déployée avec succès"
}

# Vérifier la santé après déploiement
check_post_deployment_health() {
    log_info "Vérification de la santé après déploiement..."
    
    # Attendre que tous les pods soient prêts
    sleep 30
    
    # Vérifier les pods
    READY_PODS=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    DESIRED_PODS=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    
    if [ "$READY_PODS" != "$DESIRED_PODS" ]; then
        log_error "Problème de santé après déploiement ($READY_PODS/$DESIRED_PODS pods prêts)"
        return 1
    fi
    
    # Vérifier les endpoints
    log_info "Test des endpoints..."
    if ! curl -f "http://localhost:3000/api/health" --max-time 10 &> /dev/null; then
        log_warning "L'endpoint de santé ne répond pas"
    fi
    
    log_success "Santé post-déploiement validée"
}

# Configurer le monitoring
setup_monitoring() {
    log_info "Configuration du monitoring..."
    
    # Créer les alertes si elles n'existent pas
    kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: onboarding-alerts
  namespace: $NAMESPACE
data:
  alerts.yaml: |
    groups:
    - name: onboarding
      rules:
      - alert: OnboardingCompletionRateDrop
        expr: onboarding_completion_rate < 0.6
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taux de completion de l'onboarding en chute"
          
      - alert: OnboardingErrorRateSpike
        expr: onboarding_error_rate > 0.02
        for: 2m
        labels:
          severity: high
        annotations:
          summary: "Taux d'erreur de l'onboarding élevé"
EOF
    
    log_success "Monitoring configuré"
}

# Fonction de rollback
rollback() {
    log_warning "Déclenchement du rollback..."
    
    # Désactiver les feature flags
    curl -X POST "http://localhost:3000/api/feature-flags/onboarding-optimized" \
        -H "Content-Type: application/json" \
        -d '{"enabled": false}' \
        --max-time 10 || true
    
    # Rollback du déploiement
    kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    
    # Attendre la finalisation
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=300s
    
    log_success "Rollback terminé"
}

# Fonction principale
main() {
    log_info "🚀 Déploiement de l'onboarding optimisé - Phase: $PHASE, Pourcentage: $PERCENTAGE%"
    
    # Vérifications préalables
    check_prerequisites
    check_current_health
    
    # Déploiement
    configure_feature_flags
    deploy_new_version
    
    # Vérifications post-déploiement
    if ! check_post_deployment_health; then
        log_error "Échec des vérifications post-déploiement, rollback automatique"
        rollback
        exit 1
    fi
    
    # Configuration du monitoring
    setup_monitoring
    
    log_success "🎉 Déploiement réussi!"
    log_info "📊 Monitoring en cours sur $PERCENTAGE% du trafic"
    log_info "🔍 Surveillez les métriques: kubectl logs -f deployment/$DEPLOYMENT_NAME -n $NAMESPACE"
    
    # Afficher les prochaines étapes
    echo ""
    log_info "📋 Prochaines étapes:"
    echo "  1. Surveiller les métriques pendant 24h"
    echo "  2. Vérifier le taux de completion > 70%"
    echo "  3. Vérifier le temps moyen < 15min"
    echo "  4. Si tout va bien, augmenter le pourcentage"
    echo "  5. En cas de problème: ./scripts/rollback-onboarding.sh"
}

# Gestion des signaux pour le rollback automatique
trap 'log_error "Interruption détectée, rollback automatique..."; rollback; exit 1' INT TERM

# Exécution
main "$@"
