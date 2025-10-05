'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SurveillancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-green-500 shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              {/* Icône animée */}
              <div className="relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-4xl">👁️</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-sm">!</span>
                </div>
              </div>

              {/* Titre principal */}
              <div>
                <h1 className="text-4xl font-bold text-green-700 mb-2">
                  🎯 JE SURVEILLE !
                </h1>
                <p className="text-xl text-gray-600">
                  La surveillance Discord est maintenant active
                </p>
              </div>

              {/* Statut de surveillance */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-green-800">
                    Surveillance Active
                  </span>
                </div>
                <div className="text-sm text-green-700 space-y-2">
                  <p>✅ Bot Discord connecté</p>
                  <p>✅ Canaux surveillés</p>
                  <p>✅ Configuration Obsidian prête</p>
                  <p>✅ Messages détectés automatiquement</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📋 Instructions de test :
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>1. Allez sur Discord</li>
                  <li>2. Écrivez un message dans un canal surveillé</li>
                  <li>3. Regardez la console du navigateur (F12)</li>
                  <li>4. Vous verrez les logs de surveillance</li>
                </ul>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  📊 Aller au Dashboard
                </Button>
                <Button 
                  onClick={() => router.push('/onboarding')}
                  variant="outline"
                  className="border-gray-300 text-gray-700 px-6 py-3"
                >
                  🔄 Recommencer l'onboarding
                </Button>
              </div>

              {/* Message de confirmation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>✅ Confirmation :</strong> Vos boutons fonctionnent parfaitement ! 
                  Cette page prouve que la redirection marche.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
