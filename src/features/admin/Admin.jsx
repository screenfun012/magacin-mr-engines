import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamManagement } from './TeamManagement';
import { LogsViewer } from './LogsViewer';
import { Statistics } from './Statistics';
import { AppSettings } from './AppSettings';

export function Admin() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">Upravljanje sistemom i podesavanja</p>
      </div>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="stats">Statistika</TabsTrigger>
          <TabsTrigger value="team">Radnici & Odeljenja</TabsTrigger>
          <TabsTrigger value="logs">Logovi</TabsTrigger>
          <TabsTrigger value="settings">Podesavanja</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <Statistics />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <LogsViewer />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AppSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

