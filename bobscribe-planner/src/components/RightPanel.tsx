import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { SystemBlueprint } from './SystemBlueprint';
import { GithubIssuesView } from './GithubIssuesView';
import { BobConsole } from './BobConsole';

export const RightPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="blueprint" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="blueprint">System Blueprint</TabsTrigger>
          <TabsTrigger value="issues">GitHub Issues</TabsTrigger>
          <TabsTrigger value="bob">Bob Console</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-auto scrollbar-thin mt-4">
          <TabsContent value="blueprint">
            <SystemBlueprint />
          </TabsContent>
          
          <TabsContent value="issues">
            <GithubIssuesView />
          </TabsContent>
          
          <TabsContent value="bob">
            <BobConsole />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Made with Bob
