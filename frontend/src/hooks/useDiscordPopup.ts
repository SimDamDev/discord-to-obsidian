import { useState, useCallback } from 'react';

interface DiscordPopupOptions {
  width?: number;
  height?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export function useDiscordPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDiscordPopup = useCallback((url: string, options: DiscordPopupOptions = {}) => {
    const {
      width = 500,
      height = 700,
      onSuccess,
      onError,
      onClose
    } = options;

    setError(null);
    setIsOpen(true);

    // Calculer la position centrée
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      url,
      'discord-popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no`
    );

    if (!popup) {
      const errorMsg = 'Impossible d\'ouvrir la popup. Vérifiez que les popups ne sont pas bloquées.';
      setError(errorMsg);
      onError?.(errorMsg);
      setIsOpen(false);
      return null;
    }

    popup.focus();

    // Vérifier si la popup est fermée
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setIsOpen(false);
        onClose?.();
      }
    }, 1000);

    // Vérifier si la popup a changé d'URL (succès)
    const checkSuccess = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkSuccess);
          return;
        }

        // Vérifier si l'URL contient des indicateurs de succès
        const currentUrl = popup.location.href;
        if (currentUrl.includes('success') || currentUrl.includes('authorized') || currentUrl.includes('callback')) {
          clearInterval(checkSuccess);
          clearInterval(checkClosed);
          popup.close();
          setIsOpen(false);
          onSuccess?.();
        }
      } catch (e) {
        // Ignorer les erreurs CORS
      }
    }, 1000);

    // Nettoyer les intervalles après 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      clearInterval(checkSuccess);
      if (!popup.closed) {
        popup.close();
      }
      setIsOpen(false);
    }, 5 * 60 * 1000);

    return popup;
  }, []);

  // Nouvelle fonction pour vérifier automatiquement si le bot est invité
  const checkBotInvitation = useCallback(async (botId: string) => {
    try {
      const response = await fetch('/api/user-bot/check-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ botId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.isInvited;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'invitation:', error);
      return false;
    }
  }, []);

  const closePopup = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  return {
    isOpen,
    error,
    openDiscordPopup,
    checkBotInvitation,
    closePopup
  };
}
