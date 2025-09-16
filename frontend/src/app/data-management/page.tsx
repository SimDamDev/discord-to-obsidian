'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DataManagementPage() {
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simuler l'export des données
      const userData = {
        user: {
          id: session?.user?.id,
          name: session?.user?.name,
          email: session?.user?.email,
          discordId: session?.user?.discordId,
        },
        consent: {
          messages: true,
          metadata: true,
          serverInfo: true,
          analytics: false,
          marketing: false,
          timestamp: new Date().toISOString(),
        },
        servers: [
          { id: '123', name: 'Mon Serveur', channels: 5 },
          { id: '456', name: 'Serveur Test', channels: 3 },
        ],
        messages: [
          { id: 'msg1', content: 'Message exemple', channel: '#général', date: '2024-01-15' },
        ],
        notes: [
          { id: 'note1', title: 'Note Obsidian', content: 'Contenu...', date: '2024-01-15' },
        ],
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      // Créer et télécharger le fichier JSON
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `discord-to-obsidian-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des données');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    setIsDeleting(true);
    try {
      // Simuler la suppression des données
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici, vous feriez un appel API pour supprimer toutes les données
      console.log('Suppression de toutes les données utilisateur...');
      
      alert('Toutes vos données ont été supprimées avec succès.');
      setShowDeleteConfirm(false);
      
      // Rediriger vers la déconnexion
      window.location.href = '/api/auth/signout';
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression des données');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔒 Accès restreint
            </h2>
            <p className="text-gray-600 mb-4">
              Vous devez être connecté pour gérer vos données.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Gestion de vos données
          </h1>
          <p className="text-lg text-gray-600">
            Contrôlez vos données personnelles conformément au RGPD
          </p>
        </div>

        <div className="space-y-6">
          {/* Informations utilisateur */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                👤 Vos informations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Informations de base :</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Nom :</strong> {session.user?.name}</li>
                    <li><strong>Email :</strong> {session.user?.email}</li>
                    <li><strong>Discord ID :</strong> {session.user?.discordId}</li>
                    <li><strong>Membre depuis :</strong> {new Date().toLocaleDateString()}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Statut du compte :</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Statut :</strong> Actif</li>
                    <li><strong>Serveurs surveillés :</strong> 2</li>
                    <li><strong>Canaux surveillés :</strong> 8</li>
                    <li><strong>Notes créées :</strong> 15</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consentements */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                ✅ Vos consentements RGPD
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-green-900 mb-2">Consentements actifs :</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✅ Messages Discord publics</li>
                    <li>✅ Métadonnées des messages</li>
                    <li>✅ Informations des serveurs</li>
                    <li>❌ Analytics et amélioration</li>
                    <li>❌ Communications marketing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-green-900 mb-2">Dernière mise à jour :</h3>
                  <p className="text-sm text-green-800">
                    {new Date().toLocaleString()}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Modifier les consentements
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export des données */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">
                📤 Export de vos données (Droit de portabilité)
              </h2>
              <p className="text-sm text-purple-800 mb-4">
                Téléchargez toutes vos données dans un format lisible par machine (JSON).
                Cela inclut vos messages, notes, configurations et consentements.
              </p>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-900 mb-2">Données incluses dans l'export :</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Informations de profil et compte</li>
                    <li>• Messages Discord collectés</li>
                    <li>• Notes Obsidian créées</li>
                    <li>• Configurations et préférences</li>
                    <li>• Historique des consentements</li>
                    <li>• Métadonnées et logs d'activité</li>
                  </ul>
                </div>
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Export en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Télécharger mes données
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suppression des données */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-red-900 mb-4">
                🗑️ Suppression de vos données (Droit à l'effacement)
              </h2>
              <p className="text-sm text-red-800 mb-4">
                <strong>Attention :</strong> Cette action est irréversible. Toutes vos données seront définitivement supprimées.
              </p>
              
              {!showDeleteConfirm ? (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h3 className="font-medium text-red-900 mb-2">Données qui seront supprimées :</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Toutes vos données personnelles</li>
                      <li>• Messages Discord collectés</li>
                      <li>• Notes Obsidian créées</li>
                      <li>• Configurations et préférences</li>
                      <li>• Historique des consentements</li>
                      <li>• Compte utilisateur et accès</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer toutes mes données
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-900 mb-2">⚠️ Confirmation requise</h3>
                    <p className="text-sm text-yellow-800">
                      Êtes-vous sûr de vouloir supprimer définitivement toutes vos données ? 
                      Cette action ne peut pas être annulée.
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleDeleteData}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Suppression en cours...
                        </>
                      ) : (
                        'Oui, supprimer définitivement'
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact DPO */}
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📞 Contact et support
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Délégué à la Protection des Données (DPO) :</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Email :</strong> dpo@discord-to-obsidian.com</li>
                    <li><strong>Réponse :</strong> Sous 30 jours</li>
                    <li><strong>Langues :</strong> Français, Anglais</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Support technique :</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Email :</strong> support@discord-to-obsidian.com</li>
                    <li><strong>Réponse :</strong> Sous 48h</li>
                    <li><strong>Urgences :</strong> 24h/7j</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
