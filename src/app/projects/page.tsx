"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import React from 'react';

// Function to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function Projects() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<any[]>([]); // Replace 'any' with your project type
  const [error, setError] = useState("");
  const [open, setOpen] = React.useState(false)
    const router = useRouter();

    useEffect(() => {
        const isLoggedIn = true;
        if (!isLoggedIn) {
            router.push('/'); // Redirect to login if not logged in
        }
    }, [router]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectName.trim()) {
      setError("Project name cannot be empty");
      return;
    }

    const newProject = {
      id: generateId(), // Generate a unique ID
      name: projectName,
    };

    setProjects([...projects, newProject]);
    setProjectName(""); // Clear input after successful creation
        setOpen(false);
  };

    const handleLogout = () => {
        router.push('/'); // Redirect to login page
    };

  return (
    <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Projects</h1>
            <Button onClick={handleLogout}>Logout</Button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <h3 className="text-lg font-semibold">{project.name}</h3>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="expenses" className="w-full">
                <TabsList>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="productivity">Productivity</TabsTrigger>
                  <TabsTrigger value="report">Report</TabsTrigger>
                </TabsList>
                <TabsContent value="expenses">
                  <p>Expenses content for project {project.name}</p>
                </TabsContent>
                <TabsContent value="income">
                  <p>Income content for project {project.name}</p>
                </TabsContent>
                <TabsContent value="productivity">
                  <p>Productivity content for project {project.name}</p>
                </TabsContent>
                <TabsContent value="report">
                  <p>Report content for project {project.name}</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

        <div className="fixed bottom-4 right-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-6 w-6"/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project to manage your expenses, income, and
                  productivity.
                </DialogDescription>
              </DialogHeader>
              <Card className="w-full md:w-auto">
                <CardContent>
                  {error && <div className="text-red-500">{error}</div>}
                  <form onSubmit={handleCreateProject} className="space-y-2">
                    <div>
                      <Input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>
                    <Button type="submit">Create Project</Button>
                  </form>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        </div>
    </div>
  );
}
