'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OnboardingMetrics {
  completionRate: number;
  averageTime: number;
  errorRate: number;
  abandonmentRate: number;
  totalUsers: number;
  activeUsers: number;
}

interface ABTestMetrics {
  control: {
    users: number;
    completionRate: number;
    averageTime: number;
  };
  treatment: {
    users: number;
    completionRate: number;
    averageTime: number;
  };
  statisticalSignificance: number;
}

export function OnboardingDashboard() {
  const [metrics, setMetrics] = useState<OnboardingMetrics>({
    completionRate: 0,
    averageTime: 0,
    errorRate: 0,
    abandonmentRate: 0,
    totalUsers: 0,
    activeUsers: 0,
  });

  const [abTestMetrics, setAbTestMetrics] = useState<ABTestMetrics>({
    control: { users: 0, completionRate: 0, averageTime: 0 },
    treatment: { users: 0, completionRate: 0, averageTime: 0 },
    statisticalSignificance: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des métriques
    const loadMetrics = async () => {
      try {
        // En production, récupérer depuis votre API
        const response = await fetch('/api/analytics/onboarding-metrics');
        const data = await response.json();
        
        setMetrics(data.metrics);
        setAbTestMetrics(data.abTest);
      } catch (error) {
        console.error('Erreur lors du chargement des métriques:', error);
        
        // Données de démonstration
        setMetrics({
          completionRate: 78.5,
          averageTime: 9.2,
          errorRate: 0.8,
          abandonmentRate: 12.3,
          totalUsers: 1247,
          activeUsers: 89,
        });
        
        setAbTestMetrics({
          control: { users: 623, completionRate: 65.2, averageTime: 18.5 },
          treatment: { users: 624, completionRate: 78.5, averageTime: 9.2 },
          statisticalSignificance: 0.03,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeColor = (time: number) => {
    if (time <= 10) return 'text-green-600';
    if (time <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorRateColor = (rate: number) => {
    if (rate <= 1) return 'text-green-600';
    if (rate <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          📊 Dashboard Onboarding
        </h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taux de Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCompletionRateColor(metrics.completionRate)}`}>
              {metrics.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Objectif: 80%+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Temps Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTimeColor(metrics.averageTime)}`}>
              {metrics.averageTime.toFixed(1)} min
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Objectif: &lt;10 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taux d'Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getErrorRateColor(metrics.errorRate)}`}>
              {metrics.errorRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seuil: &lt;1%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Utilisateurs Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.activeUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total: {metrics.totalUsers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* A/B Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Résultats A/B Test
            <span className={`text-sm px-2 py-1 rounded ${
              abTestMetrics.statisticalSignificance < 0.05 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {abTestMetrics.statisticalSignificance < 0.05 ? 'Significatif' : 'Non significatif'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control (Ancien flux) */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Ancien Flux (8 étapes)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Utilisateurs:</span>
                  <span className="font-medium">{abTestMetrics.control.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion:</span>
                  <span className={`font-medium ${getCompletionRateColor(abTestMetrics.control.completionRate)}`}>
                    {abTestMetrics.control.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps moyen:</span>
                  <span className={`font-medium ${getTimeColor(abTestMetrics.control.averageTime)}`}>
                    {abTestMetrics.control.averageTime.toFixed(1)} min
                  </span>
                </div>
              </div>
            </div>

            {/* Treatment (Nouveau flux) */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Nouveau Flux (5 étapes)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Utilisateurs:</span>
                  <span className="font-medium">{abTestMetrics.treatment.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion:</span>
                  <span className={`font-medium ${getCompletionRateColor(abTestMetrics.treatment.completionRate)}`}>
                    {abTestMetrics.treatment.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps moyen:</span>
                  <span className={`font-medium ${getTimeColor(abTestMetrics.treatment.averageTime)}`}>
                    {abTestMetrics.treatment.averageTime.toFixed(1)} min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Amélioration */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">📈 Amélioration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Completion: </span>
                <span className="font-semibold text-green-800">
                  +{((abTestMetrics.treatment.completionRate - abTestMetrics.control.completionRate) / abTestMetrics.control.completionRate * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-green-700">Temps: </span>
                <span className="font-semibold text-green-800">
                  -{((abTestMetrics.control.averageTime - abTestMetrics.treatment.averageTime) / abTestMetrics.control.averageTime * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Augmenter le trafic à 25%
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Déployer à 100%
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Rollback d'urgence
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Exporter les données
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
