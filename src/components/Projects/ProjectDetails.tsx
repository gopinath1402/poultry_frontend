"use client";

import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExpensesPage from "@/components/Expenses/ExpensesPage";
import IncomePage from "@/app/projects/income/page";

interface ProjectDetailsProps {
    selectedProject: any;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ selectedProject }) => {
    return (
        <CardContent>
            <Tabs defaultValue="expenses" className="w-full">
                <TabsList>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="productivity">Productivity</TabsTrigger>
                    <TabsTrigger value="report">Report</TabsTrigger>
                </TabsList>
                <TabsContent value="expenses">
                    <ExpensesPage selectedProject={selectedProject} />
                </TabsContent>
                <TabsContent value="income">
                    <IncomePage selectedProject={selectedProject} />
                </TabsContent>
                <TabsContent value="productivity">
                    <p>Productivity content for project {selectedProject.name}</p>
                </TabsContent>
                <TabsContent value="report">
                    <p>Report content for project {selectedProject.name}</p>
                </TabsContent>
            </Tabs>
        </CardContent>
    );
};

export default ProjectDetails;
