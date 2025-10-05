'use client';

import { PrismaClient } from '@prisma/client';

// Interface pour la configuration d'onboarding
export interface OnboardingConfigData {
  authAndConsent?: any;
  versionChoice?: any;
  configuration?: any;
  channelSelection?: any;
  obsidianConfig?: any;
  finalConfiguration?: any;
}

// Interface pour les données d'étape
export interface OnboardingStepData {
  [key: string]: any;
}

class OnboardingDatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Sauvegarder ou mettre à jour la configuration d'onboarding
  async saveOnboardingConfiguration(
    userId: string,
    stepName: string,
    stepData: OnboardingStepData
  ): Promise<void> {
    try {
      console.log(`💾 Sauvegarde étape ${stepName} pour l'utilisateur ${userId}:`, stepData);

      // Vérifier si une configuration existe déjà
      const existingConfig = await this.prisma.onboardingConfiguration.findUnique({
        where: { userId }
      });

      if (existingConfig) {
        // Mettre à jour la configuration existante
        const updateData: any = {};
        updateData[stepName] = stepData;
        updateData.updatedAt = new Date();

        // Si c'est l'étape finale, marquer comme complétée
        if (stepName === 'finalConfiguration') {
          updateData.isCompleted = true;
        }

        await this.prisma.onboardingConfiguration.update({
          where: { userId },
          data: updateData
        });

        console.log(`✅ Configuration mise à jour pour l'utilisateur ${userId}`);
      } else {
        // Créer une nouvelle configuration
        const createData: any = {
          userId,
          [stepName]: stepData,
          isCompleted: stepName === 'finalConfiguration'
        };

        await this.prisma.onboardingConfiguration.create({
          data: createData
        });

        console.log(`✅ Nouvelle configuration créée pour l'utilisateur ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de l'étape ${stepName}:`, error);
      throw error;
    }
  }

  // Récupérer la configuration d'onboarding complète
  async getOnboardingConfiguration(userId: string): Promise<any | null> {
    try {
      const config = await this.prisma.onboardingConfiguration.findUnique({
        where: { userId }
      });

      if (config) {
        console.log(`📖 Configuration récupérée pour l'utilisateur ${userId}`);
        return config;
      }

      console.log(`⚠️ Aucune configuration trouvée pour l'utilisateur ${userId}`);
      return null;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de la configuration:`, error);
      throw error;
    }
  }

  // Vérifier si l'onboarding est complété
  async isOnboardingCompleted(userId: string): Promise<boolean> {
    try {
      const config = await this.prisma.onboardingConfiguration.findUnique({
        where: { userId },
        select: { isCompleted: true }
      });

      return config?.isCompleted || false;
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du statut d'onboarding:`, error);
      return false;
    }
  }

  // Supprimer la configuration d'onboarding
  async deleteOnboardingConfiguration(userId: string): Promise<void> {
    try {
      await this.prisma.onboardingConfiguration.delete({
        where: { userId }
      });

      console.log(`🗑️ Configuration supprimée pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de la configuration:`, error);
      throw error;
    }
  }

  // Récupérer les statistiques d'onboarding
  async getOnboardingStats(): Promise<{
    totalUsers: number;
    completedOnboarding: number;
    pendingOnboarding: number;
  }> {
    try {
      const totalUsers = await this.prisma.user.count();
      const completedOnboarding = await this.prisma.onboardingConfiguration.count({
        where: { isCompleted: true }
      });
      const pendingOnboarding = await this.prisma.onboardingConfiguration.count({
        where: { isCompleted: false }
      });

      return {
        totalUsers,
        completedOnboarding,
        pendingOnboarding
      };
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des statistiques:`, error);
      throw error;
    }
  }
}

// Instance singleton
export const onboardingDatabaseService = new OnboardingDatabaseService();
