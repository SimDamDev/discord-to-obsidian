'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChannelList } from '@/components/dashboard/ChannelList';
import { DiscordGuild } from '@/types/auth';

// Données de test
const mockServer: DiscordGuild = {
  id: 'test-server-1',
  name: 'Serveur de Test',
  icon: undefined,
  owner: true,
  permissions: '8',
  features: ['COMMUNITY', 'NEWS'],
};

export default function TestChannelsPage() {
  const [showChannels, setShowChannels] = useState(false);

  const handleToggleChannels = () => {
    setShowChannels(!showChannels);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test - Affichage des Canaux par Serveur</CardTitle>
            <CardDescription>
              Page de test pour vérifier le fonctionnement de l'affichage des canaux Discord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {mockServer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{mockServer.name}</h3>
                      <div className="flex space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Propriétaire
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {mockServer.features.length} fonctionnalités
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ChannelList
                  serverId={mockServer.id}
                  serverName={mockServer.name}
                  isExpanded={showChannels}
                  onToggle={handleToggleChannels}
                />
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Instructions de test :</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cliquez sur "Voir les canaux" pour charger les canaux du serveur</li>
                  <li>• Vérifiez que les canaux s'affichent correctement</li>
                  <li>• Testez les boutons de surveillance des canaux</li>
                  <li>• Vérifiez les indicateurs visuels d'état</li>
                  <li>• Testez le bouton d'actualisation</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Fonctionnalités implémentées :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Affichage des canaux par serveur</li>
                  <li>✅ Gestion du cache avec TTL</li>
                  <li>✅ Gestion des erreurs avec retry automatique</li>
                  <li>✅ Indicateurs visuels d'état de surveillance</li>
                  <li>✅ Statistiques de surveillance en temps réel</li>
                  <li>✅ Interface responsive et moderne</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
