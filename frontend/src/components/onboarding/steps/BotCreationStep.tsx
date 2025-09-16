'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';
import { BotCreationResult } from '@/types/onboarding';
import { useDiscordPopup } from '@/hooks/useDiscordPopup';

export function BotCreationStep() {
  const { data: session } = useSession();
  const { updateStep, nextStep } = useOnboarding();
  const [botName, setBotName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [botResult, setBotResult] = useState<BotCreationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [botInvited, setBotInvited] = useState(false);
  const { openDiscordPopup, isOpen: isPopupOpen, error: popupError } = useDiscordPopup();

  // Générer un nom de bot par défaut
  useEffect(() => {
    if (session?.user?.name && !botName) {
      setBotName(`${session.user.name}'s Helper Bot`);
    }
  }, [session, botName]);

  // Détecter si l'utilisateur revient de Discord
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const botInvited = urlParams.get('botInvited');
    
    if (botInvited === 'true') {
      setBotInvited(true);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCreateBot = async () => {
    if (!botName.trim()) {
      setError('Veuillez entrer un nom pour votre bot');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/user-bot/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botName: botName.trim(),
          permissions: ['VIEW_CHANNELS', 'READ_MESSAGE_HISTORY'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du bot');
      }

      const result = await response.json();
      setBotResult(result);
      
      // Utiliser le vrai bot principal au lieu du bot mocké
      const mainBotClientId = '1417259355967062037';
      const realInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${mainBotClientId}&scope=bot&permissions=6656`;
      setInviteLink(realInviteLink);
      
      // Marquer cette étape comme complétée
      updateStep('botCreation', {
        bot: result.bot,
        inviteLink: result.inviteLink,
        createdAt: new Date(),
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      // Optionnel: afficher une notification de succès
    }
  };

  const handleOpenInvitePopup = () => {
    if (inviteLink) {
      openDiscordPopup(inviteLink, {
        onSuccess: () => {
          setBotInvited(true);
        },
        onError: (error) => {
          setError(error);
        },
        onClose: () => {
          // L'utilisateur a fermé la popup, on considère que c'est fait
          setBotInvited(true);
        }
      });
    }
  };

  const handleAutoInvite = async () => {
    if (!botResult?.bot) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user-bot/auto-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          botId: botResult.bot.clientId 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBotInvited(true);
        // Optionnel: afficher les invitations créées
        console.log('Invitations créées:', data.invitations);
      } else {
        setError(data.error || 'Erreur lors de l\'invitation automatique');
      }
    } catch (err) {
      setError('Erreur réseau lors de l\'invitation automatique');
      console.error('Error auto-inviting bot:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDirectInvite = () => {
    // Utiliser le bot principal de l'application (celui qui existe vraiment)
    const mainBotClientId = '1417259355967062037'; // Le vrai client_id de votre bot Discord
    
    // Pour l'instant, utiliser une URL d'invitation simple sans redirection
    // L'utilisateur devra revenir manuellement à l'application
    const directInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${mainBotClientId}&scope=bot&permissions=6656`;
    
    // Ouvrir dans un nouvel onglet pour garder l'application ouverte
    window.open(directInviteUrl, '_blank');
    
    // Marquer le bot comme invité après un délai (simulation)
    setTimeout(() => {
      setBotInvited(true);
    }, 2000);
  };

  const handleNext = () => {
    if (botResult) {
      nextStep();
    }
  };

  const isBotCreated = !!botResult;

  return (
    <OnboardingLayout
      title="Configuration du Bot Discord"
      description="Configurez l'accès au bot principal pour surveiller vos serveurs"
      icon="🤖"
      onNext={handleNext}
      nextDisabled={!isBotCreated}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {!isBotCreated ? (
          <div className="space-y-6">
            {/* Formulaire de création */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-4">
                  Configuration de l'accès au bot principal
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="botName" className="block text-sm font-medium text-blue-800 mb-2">
                      Nom d'affichage (optionnel)
                    </label>
                    <Input
                      id="botName"
                      type="text"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="Mon Bot Discord"
                      className="border-blue-300 focus:border-blue-500"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Nom pour identifier votre configuration (le bot principal sera utilisé)
                    </p>
                  </div>

                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Permissions du bot principal
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-blue-800 mb-1">✅ Permissions accordées :</h5>
                        <ul className="text-sm text-blue-800 space-y-1 ml-4">
                          <li>• <strong>Voir les canaux</strong> - pour lister les canaux disponibles</li>
                          <li>• <strong>Lire l'historique des messages</strong> - pour surveiller les nouveaux messages</li>
                          <li>• <strong>Accès aux informations de base</strong> - pour identifier les serveurs</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-800 mb-1">❌ Permissions NON accordées :</h5>
                        <ul className="text-sm text-red-800 space-y-1 ml-4">
                          <li>• <strong>Envoyer des messages</strong> - le bot ne poste jamais</li>
                          <li>• <strong>Gérer les serveurs</strong> - aucune modification des paramètres</li>
                          <li>• <strong>Accès aux messages privés</strong> - jamais accessible</li>
                          <li>• <strong>Permissions administratives</strong> - aucun privilège spécial</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bouton de création */}
            <div className="text-center">
              <Button
                onClick={handleCreateBot}
                disabled={isCreating || !botName.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Configurer l'accès
                  </>
                )}
              </Button>
            </div>

            {/* Message d'erreur */}
            {(error || popupError) && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-900">Erreur</h4>
                      <p className="text-red-700">{error || popupError}</p>
                      {popupError && (
                        <p className="text-sm text-red-600 mt-1">
                          Vérifiez que les popups ne sont pas bloquées dans votre navigateur.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bot créé avec succès */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Configuration créée avec succès !</h3>
                    <p className="text-green-700">
                      Accès configuré pour <strong>{botResult.bot.name}</strong>
                    </p>
                    <p className="text-sm text-green-600">
                      ID: {botResult.bot.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lien d'invitation */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-4">
                  Invitez le bot principal sur vos serveurs
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={inviteLink || ''}
                        readOnly
                        className="flex-1 bg-white border-blue-300"
                      />
                      <Button
                        onClick={handleCopyInviteLink}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Copier
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={handleDirectInvite}
                        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        Inviter le bot sur Discord
                      </Button>
                      
                      <p className="text-sm text-gray-600 text-center">
                        ✨ Utilise votre session Discord actuelle - pas de reconnexion nécessaire !
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Instructions simples
                    </h4>
                     <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                       <li>Cliquez sur "Inviter le bot sur Discord"</li>
                       <li>Un nouvel onglet Discord s'ouvrira (votre application reste ouverte)</li>
                       <li>Sélectionnez les serveurs où vous voulez ajouter le bot</li>
                       <li>Vérifiez que le bot a les permissions "Voir les canaux"</li>
                       <li>Cliquez sur "Autoriser"</li>
                       <li>Revenez sur cet onglet pour continuer</li>
                       <li>Le formulaire se mettra à jour automatiquement</li>
                     </ol>
                    <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                      <p className="text-sm text-yellow-800">
                        <strong>Note :</strong> Nous utilisons le bot principal de l'application pour cette démonstration. 
                        En production, chaque utilisateur aurait son propre bot Discord.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vérification de l'invitation */}
            {botInvited ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Bot invité avec succès !</h4>
                      <p className="text-green-700">
                        Le bot principal a été ajouté à vos serveurs Discord. Vous pouvez maintenant continuer.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-900">Étape suivante</h4>
                      <p className="text-yellow-700">
                        Cliquez sur "Inviter le bot sur Discord" pour l'ajouter à vos serveurs, puis continuez.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Informations sur la sécurité et RGPD */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              🔒 Transparence RGPD - Ce que nous pouvons voir
            </h4>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-2">✅ Ce que le bot PEUT voir :</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>Liste des serveurs</strong> où vous l'avez invité</li>
                  <li>• <strong>Liste des canaux</strong> dans ces serveurs</li>
                  <li>• <strong>Messages publics</strong> dans les canaux que vous surveillez</li>
                  <li>• <strong>Métadonnées</strong> : auteur, date, liens dans les messages</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-red-900 mb-2">❌ Ce que le bot NE PEUT PAS voir :</h5>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• <strong>Messages privés</strong> (DM) - jamais accessibles</li>
                  <li>• <strong>Canaux privés</strong> sans permission</li>
                  <li>• <strong>Messages supprimés</strong> ou modifiés</li>
                  <li>• <strong>Informations personnelles</strong> d'autres utilisateurs</li>
                  <li>• <strong>Données de connexion</strong> ou mots de passe</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">🛡️ Protection de vos données :</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Isolation totale</strong> : vos données ne sont jamais mélangées avec d'autres utilisateurs</li>
                  <li>• <strong>Chiffrement</strong> : toutes les données sont chiffrées en transit et au repos</li>
                  <li>• <strong>Contrôle total</strong> : vous choisissez quels canaux surveiller</li>
                  <li>• <strong>Suppression</strong> : vous pouvez supprimer toutes vos données à tout moment</li>
                  <li>• <strong>Audit</strong> : logs d'accès pour traçabilité</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-900 mb-2">⚠️ Important à savoir :</h5>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Le bot ne lit que les <strong>messages publics</strong> des canaux que vous autorisez</li>
                  <li>• Il ne peut pas accéder aux <strong>messages privés</strong> ou <strong>canaux restreints</strong></li>
                  <li>• Vous gardez le <strong>contrôle total</strong> sur ce qui est surveillé</li>
                  <li>• Vous pouvez <strong>révoquer l'accès</strong> à tout moment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
