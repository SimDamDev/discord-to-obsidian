import { GatewayIntentBits, Partials } from 'discord.js';

export const discordConfig = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
  ],
};

export const discordApiConfig = {
  baseUrl: 'https://discord.com/api/v10',
  endpoints: {
    user: '/users/@me',
    guilds: '/users/@me/guilds',
    channels: (guildId: string) => `/guilds/${guildId}/channels`,
    messages: (channelId: string) => `/channels/${channelId}/messages`,
  },
  rateLimits: {
    global: 50, // 50 requêtes par seconde
    perEndpoint: 5, // 5 requêtes par seconde par endpoint
  },
};

export const botPermissions = [
  'SEND_MESSAGES',
  'READ_MESSAGE_HISTORY',
  'VIEW_CHANNEL',
  'EMBED_LINKS',
  'ATTACH_FILES',
  'USE_EXTERNAL_EMOJIS',
  'ADD_REACTIONS',
];

export const oauth2Scopes = [
  'identify',
  'email',
  'guilds',
  'guilds.members.read',
];


