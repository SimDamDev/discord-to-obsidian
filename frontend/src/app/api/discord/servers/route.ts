import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';
import DiscordCacheService from '@/services/DiscordCacheService';
import DiscordRateLimitService from '@/services/DiscordRateLimitService';
import PrismaDatabaseService from '@/services/PrismaDatabaseService';
import { UserBotManager } from '@/services/UserBotManager';

export async function GET(request: NextRequest) {
  try {
    // Vérifier si c'est un refresh forcé
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Récupérer la session NextAuth
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Debug session dans servers:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      discordId: session?.user?.discordId,
      sessionKeys: session ? Object.keys(session) : []
    });
    
    if (!session) {
      console.log('❌ Aucune session trouvée');
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (!session.accessToken) {
      console.log('❌ Pas de token Discord dans la session');
      return NextResponse.json(
        { error: 'Token Discord manquant' },
        { status: 401 }
      );
    }

    const userId = session.user.discordId;
    const cacheService = DiscordCacheService.getInstance();
    const rateLimitService = DiscordRateLimitService.getInstance();
    const dbService = PrismaDatabaseService.getInstance();
    
    // Vérifier la base de données d'abord (sauf si refresh forcé)
    const isDbDataRecent = !forceRefresh && await dbService.isDataRecent(userId, 'servers');
    
    if (isDbDataRecent) {
      try {
        const dbServers = await dbService.getServers(userId);
        console.log(`📦 DB hit: ${dbServers.length} serveurs récupérés depuis la base de données PostgreSQL`);
        return NextResponse.json({ 
          guilds: dbServers,
          cached: true,
          source: 'database',
          cacheStatus: cacheService.getStatus()
        });
      } catch (dbError) {
        console.error('Erreur lors de la récupération depuis la DB:', dbError);
        // Continue avec l'API Discord si la DB échoue
      }
    }
    
    // Vérifier le cache mémoire en fallback (sauf si refresh forcé)
    const cacheKey = DiscordCacheService.getServersKey(userId);
    const cachedServers = !forceRefresh ? cacheService.get(cacheKey) : null;
    
    if (cachedServers) {
      console.log(`📦 Memory cache hit: ${cachedServers.length} serveurs récupérés depuis le cache mémoire`);
      return NextResponse.json({ 
        guilds: cachedServers,
        cached: true,
        source: 'memory',
        cacheStatus: cacheService.getStatus()
      });
    }

    console.log('🔄 Cache miss: Récupération des serveurs depuis l\'API Discord...');
    
    // Vérifier le rate limit
    const endpoint = 'guilds';
    if (!rateLimitService.canMakeRequest(endpoint)) {
      const waitTime = rateLimitService.getWaitTime(endpoint);
      console.log(`⏳ Rate limit atteint, attente de ${waitTime}ms`);
      
      return NextResponse.json({
        error: 'Rate limit atteint',
        retryAfter: waitTime,
        queueStatus: rateLimitService.getQueueStatus()
      }, { status: 429 });
    }

    try {
      const response = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        timeout: 10000,
      });

      // Mettre à jour le rate limit
      if (response.headers) {
        rateLimitService.updateRateLimit(endpoint, response.headers);
      }

      const allServers = response.data;
      console.log(`✅ ${allServers.length} serveurs récupérés depuis Discord`);

      // Filtrer les serveurs où le bot est présent et où l'utilisateur a des permissions
      const userBotManager = UserBotManager.getInstance();
      const userBot = await userBotManager.getUserBot(userId);
      
      if (!userBot) {
        console.log('❌ Aucun bot configuré pour l\'utilisateur');
        return NextResponse.json({
          guilds: [],
          cached: false,
          source: 'api',
          message: 'Aucun bot configuré. Veuillez d\'abord créer un bot.'
        });
      }

      // Filtrer les serveurs où le bot est présent
      const filteredServers = [];
      for (const server of allServers) {
        try {
          // Vérifier si le bot est présent sur ce serveur
          const botResponse = await axios.get(`https://discord.com/api/guilds/${server.id}`, {
            headers: {
              'Authorization': `Bot ${userBot.token}`,
            },
            timeout: 5000,
          });
          
          // Si le bot a accès au serveur, l'ajouter à la liste
          filteredServers.push(server);
          console.log(`✅ Bot présent sur le serveur: ${server.name}`);
        } catch (error) {
          // Le bot n'est pas présent sur ce serveur ou n'a pas accès
          console.log(`❌ Bot non présent sur le serveur: ${server.name}`);
        }
      }

      console.log(`🔍 ${filteredServers.length} serveurs filtrés (bot présent) sur ${allServers.length} serveurs total`);

      // Stocker en base de données
      try {
        await dbService.storeServers(userId, filteredServers);
        console.log(`💾 Serveurs filtrés stockés en base de données`);
      } catch (dbError) {
        console.error('Erreur lors du stockage en DB:', dbError);
      }

      // Mettre en cache mémoire (15 minutes)
      cacheService.set(cacheKey, filteredServers, 15 * 60 * 1000);

      return NextResponse.json({ 
        guilds: filteredServers,
        cached: false,
        source: 'api',
        rateLimitStatus: rateLimitService.getQueueStatus(),
        cacheStatus: cacheService.getStatus()
      });

    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Discord:', error);
      
      // Mettre à jour le rate limit même en cas d'erreur
      if (axios.isAxiosError(error) && error.response?.headers) {
        rateLimitService.updateRateLimit(endpoint, error.response.headers);
      }
      
      // Si le token est expiré ou invalide
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Token Discord expiré ou invalide' },
          { status: 401 }
        );
      }

      // Si rate limit (429)
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        return NextResponse.json(
          { 
            error: 'Limite de taux Discord atteinte',
            retryAfter: parseInt(retryAfter) * 1000,
            queueStatus: rateLimitService.getQueueStatus()
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la récupération des serveurs Discord' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs Discord:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}