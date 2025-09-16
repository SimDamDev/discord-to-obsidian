'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/dashboard/Navigation';
import { ServerList } from '@/components/dashboard/ServerList';
import { ChannelMonitor } from '@/components/dashboard/ChannelMonitor';
import { ConnectionStats } from '@/components/dashboard/ConnectionStats';
import { ServiceHealth } from '@/components/dashboard/ServiceHealth';
import DiscordStatus from '@/components/dashboard/DiscordStatus';
import DiscordPermissions from '@/components/dashboard/DiscordPermissions';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {session.user?.name} ! Gérez vos serveurs Discord et surveillez vos canaux.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ServerList />
            <ChannelMonitor />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <DiscordPermissions />
            <DiscordStatus />
            <ConnectionStats />
            <ServiceHealth />
          </div>
        </div>
      </div>
    </div>
  );
}

