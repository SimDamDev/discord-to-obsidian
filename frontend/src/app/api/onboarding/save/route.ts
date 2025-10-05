import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { stepName, stepData } = body;

    if (!stepName || !stepData) {
      return NextResponse.json(
        { error: 'stepName et stepData sont requis' },
        { status: 400 }
      );
    }

    console.log(`💾 API - Sauvegarde étape ${stepName} pour l'utilisateur ${session.user.discordId}`);

    // Trouver ou créer l'utilisateur par discordId
    let user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId }
    });

    if (!user) {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          discordId: session.user.discordId,
          username: session.user.name || 'Utilisateur Discord',
          avatarUrl: session.user.image || null
        }
      });
    }

    // Vérifier si une configuration existe déjà
    const existingConfig = await prisma.onboardingConfiguration.findUnique({
      where: { userId: user.id }
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

      await prisma.onboardingConfiguration.update({
        where: { userId: user.id },
        data: updateData
      });

      console.log(`✅ API - Configuration mise à jour pour l'utilisateur ${user.discordId}`);
    } else {
      // Créer une nouvelle configuration
      const createData: any = {
        userId: user.id,
        [stepName]: stepData,
        isCompleted: stepName === 'finalConfiguration'
      };

      await prisma.onboardingConfiguration.create({
        data: createData
      });

      console.log(`✅ API - Nouvelle configuration créée pour l'utilisateur ${user.discordId}`);
    }

    return NextResponse.json({
      success: true,
      message: `Configuration ${stepName} sauvegardée avec succès`
    });

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Trouver l'utilisateur par discordId
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer la configuration d'onboarding
    const config = await prisma.onboardingConfiguration.findUnique({
      where: { userId: user.id }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration d\'onboarding non trouvée' },
        { status: 404 }
      );
    }

    console.log(`📖 API - Configuration récupérée pour l'utilisateur ${user.discordId}`);

    return NextResponse.json({
      success: true,
      configuration: config
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
