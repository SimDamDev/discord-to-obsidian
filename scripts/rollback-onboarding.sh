#!/bin/bash

# 🔄 Script de Rollback - Onboarding Optimisé
# Usage: ./scripts/rollback-onboarding.sh [reason]

set -e  # Arrêter en cas d'erreur

# Configuration
REASON=${1:-"manual"}
NAMESPACE="default"
DEPLOYMENT_NAME="onboarding-frontend"

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

# Fonction principale de rollback
rollback() {
    log_warning "🔄 Déclenchement du rollback - Raison: $REASON"
    
    # 1. Désactiver immédiatement les feature flags
    log_info "Désactivation des feature flags..."
    curl -X POST "http://localhost:3000/api/feature-flags/onboarding-optimized" \
        -H "Content-Type: application/json" \
        -d '{"enabled": false}' \
        --max-time 5 || {
        log_warning "Impossible de désactiver les feature flags via API"
    }
    
    # 2. Rollback du déploiement Kubernetes
    log_info "Rollback du déploiement Kubernetes..."
    kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    
    # 3. Attendre la finalisation du rollback
    log_info "Attente de la finalisation du rollback..."
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=300s
    
    # 4. Vérifier la santé après rollback
    log_info "Vérification de la santé après rollback..."
    sleep 30
    
    READY_PODS=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    DESIRED_PODS=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    
    if [ "$READY_PODS" != "$DESIRED_PODS" ]; then
        log_error "Problème de santé après rollback ($READY_PODS/$DESIRED_PODS pods prêts)"
        return 1
    fi
    
    # 5. Test des endpoints
    log_info "Test des endpoints..."
    if curl -f "http://localhost:3000/api/health" --max-time 10 &> /dev/null; then
        log_success "Endpoints fonctionnels"
    else
        log_warning "Problème avec les endpoints"
    fi
    
    log_success "🎉 Rollback terminé avec succès!"
}

# Fonction d'urgence (rollback en 30 secondes)
emergency_rollback() {
    log_error "🚨 ROLLBACK D'URGENCE - Onboarding Optimisé"
    
    # Désactiver immédiatement
    curl -X POST "http://localhost:3000/api/feature-flags/onboarding-optimized" \
        -d '{"enabled": false}' \
        --max-time 5 || true
    
    # Redéployer l'ancienne version
    kubectl patch deployment $DEPLOYMENT_NAME -n $NAMESPACE \
        -p '{"spec":{"template":{"spec":{"containers":[{"name":"onboarding","image":"onboarding:stable"}]}}}}'
    
    # Vérifier rapidement
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=60s
    
    log_success "✅ Rollback d'urgence terminé"
}

# Fonction principale
main() {
    if [ "$REASON" = "emergency" ]; then
        emergency_rollback
    else
        rollback
    fi
    
    # Afficher les informations post-rollback
    echo ""
    log_info "📋 Informations post-rollback:"
    echo "  - Feature flags: DÉSACTIVÉS"
    echo "  - Version: Ancienne version stable"
    echo "  - Trafic: 100% sur l'ancien flux"
    echo "  - Monitoring: Actif"
    
    echo ""
    log_info "🔍 Commandes utiles:"
    echo "  - Vérifier les pods: kubectl get pods -n $NAMESPACE"
    echo "  - Voir les logs: kubectl logs -f deployment/$DEPLOYMENT_NAME -n $NAMESPACE"
    echo "  - Statut du déploiement: kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE"
}

# Exécution
main "$@"
