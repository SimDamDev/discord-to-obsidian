import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Récupérer les statistiques d'onboarding
    const totalUsers = await prisma.user.count();
    const completedOnboarding = await prisma.onboardingConfiguration.count({
      where: { isCompleted: true }
    });
    const pendingOnboarding = await prisma.onboardingConfiguration.count({
      where: { isCompleted: false }
    });

    // Récupérer les configurations par version
    const simpleVersion = await prisma.onboardingConfiguration.count({
      where: {
        selectedVersion: 'simple'
      }
    });

    const secureVersion = await prisma.onboardingConfiguration.count({
      where: {
        selectedVersion: 'secure'
      }
    });

    // Récupérer les configurations récentes
    const recentConfigurations = await prisma.onboardingConfiguration.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            discordId: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    const stats = {
      totalUsers,
      completedOnboarding,
      pendingOnboarding,
      completionRate: totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0,
      versionDistribution: {
        simple: simpleVersion,
        secure: secureVersion
      },
      recentConfigurations: recentConfigurations.map(config => ({
        id: config.id,
        userId: config.userId,
        user: config.user,
        selectedVersion: config.selectedVersion,
        isCompleted: config.isCompleted,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      }))
    };

    console.log('📊 Statistiques d\'onboarding récupérées:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
