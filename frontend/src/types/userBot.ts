export interface UserBot {
  id: string;
  userId: string;
  clientId: string;
  token: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AuthorizedServer {
  id: string;
  userId: string;
  serverId: string;
  serverName: string;
  botId: string;
  authorizedAt: Date;
  permissions: string[];
  isActive: boolean;
}

export interface BotInviteLink {
  url: string;
  expiresAt: Date;
  permissions: number;
}

export interface CreateUserBotRequest {
  userId: string;
  botName: string;
  permissions?: string[];
}

export interface BotCreationResult {
  bot: UserBot;
  inviteLink: BotInviteLink;
}
