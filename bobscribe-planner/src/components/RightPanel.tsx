import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { SystemBlueprint } from './SystemBlueprint';
import { GithubIssuesView } from './GithubIssuesView';
import { BobConsole } from './BobConsole';
import { ChatTab } from './ChatTab';

export const RightPanel: React.FC = () => {
  return (
    <div className="flex flex-col w-full">
      <Tabs defaultValue="blueprint" className="flex flex-col w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="blueprint">System Blueprint</TabsTrigger>
          <TabsTrigger value="issues">GitHub Issues</TabsTrigger>
          <TabsTrigger value="bob">Bob Console</TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4 w-full">
          <TabsContent value="blueprint" className="w-full">
            <SystemBlueprint />
          </TabsContent>
          
          <TabsContent value="issues" className="w-full">
            <GithubIssuesView />
          </TabsContent>
          
          <TabsContent value="bob" className="w-full">
            <BobConsole />
          </TabsContent>

          <TabsContent value="chat" className="w-full h-[600px]">
            <ChatTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Made with Bob
