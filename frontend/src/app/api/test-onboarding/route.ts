import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test de création d'un utilisateur de test
    const testUser = await prisma.user.upsert({
      where: { discordId: 'test-user-123' },
      update: {},
      create: {
        discordId: 'test-user-123',
        username: 'Utilisateur Test',
        avatarUrl: null
      }
    });

    // Test de création d'une configuration d'onboarding
    const testConfig = await prisma.onboardingConfiguration.upsert({
      where: { userId: testUser.id },
      update: {
        authAndConsent: { user: { discordId: 'test-user-123' }, consent: true },
        selectedVersion: 'simple',
        configuration: { botInfo: { id: 'bot-123' }, selectedServers: [] },
        channelSelection: { selectedChannels: [] },
        obsidianConfig: { vaultPath: '/test/vault', syncSettings: {} },
        isCompleted: true,
        updatedAt: new Date()
      },
      create: {
        userId: testUser.id,
        authAndConsent: { user: { discordId: 'test-user-123' }, consent: true },
        selectedVersion: 'simple',
        configuration: { botInfo: { id: 'bot-123' }, selectedServers: [] },
        channelSelection: { selectedChannels: [] },
        obsidianConfig: { vaultPath: '/test/vault', syncSettings: {} },
        finalConfiguration: { userId: 'test-user-123', isActive: true },
        isCompleted: true
      }
    });

    // Récupérer toutes les configurations pour vérifier
    const allConfigs = await prisma.onboardingConfiguration.findMany({
      include: {
        user: {
          select: {
            discordId: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test de sauvegarde réussi',
      data: {
        testUser,
        testConfig,
        allConfigurations: allConfigs,
        totalConfigurations: allConfigs.length
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du test de sauvegarde',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
