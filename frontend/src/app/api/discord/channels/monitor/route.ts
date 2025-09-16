import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Récupérer la session NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json(
        { error: 'ID du canal requis' },
        { status: 400 }
      );
    }

    // TODO: Implémenter l'ajout du canal à la surveillance
    // Pour l'instant, on simule l'ajout
    console.log(`Ajout du canal ${channelId} à la surveillance pour l'utilisateur ${session.user.discordId}`);

    return NextResponse.json({ 
      message: 'Canal ajouté à la surveillance',
      channelId,
      userId: session.user.discordId,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du canal:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du canal' },
      { status: 500 }
    );
  }
}

