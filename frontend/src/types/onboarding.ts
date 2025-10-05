export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  data?: any;
}

export interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;
  steps: {
    authAndConsent: OnboardingStep;
    versionChoice: OnboardingStep;
    configuration: OnboardingStep;
    channelSelection: OnboardingStep;
    obsidianConfig: OnboardingStep;
    finalization: OnboardingStep;
  };
}

export interface UserConfiguration {
  userId: string;
  discordBot: {
    id: string;
    token: string;
    clientId: string;
    name: string;
  };
  selectedServers: string[];
  selectedChannels: string[];
  obsidianConfig: {
    vaultPath: string;
    syncSettings: {
      autoSync: boolean;
      syncInterval: number;
      includeAttachments: boolean;
    };
  };
  isActive: boolean;
}

export interface DiscordServer {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
  features: string[];
  botInvited: boolean;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  position: number;
  parent_id?: string;
  topic?: string;
  nsfw?: boolean;
  guild_id?: string;
  accessible: boolean;
}

export interface BotCreationResult {
  bot: {
    id: string;
    userId: string;
    clientId: string;
    token: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  inviteLink: {
    url: string;
    permissions: number;
    expiresAt: Date;
  };
  success: boolean;
  message: string;
}

export interface OnboardingContextType {
  state: OnboardingState;
  configuration: UserConfiguration | null;
  dispatch: (action: any) => void;
  updateStep: (stepId: string, data: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  completeOnboarding: (config: UserConfiguration) => void;
  resetOnboarding: () => void;
  isLoading: boolean;
  error: string | null;
}
