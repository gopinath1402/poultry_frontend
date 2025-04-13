"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Plus, Settings, LogOut, ListChecks, Users, Newspaper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React from 'react';
import { useAuth } from "@/context/AuthContext";
import {apiBaseUrl} from "@/services/api-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

export default function Projects() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<any[]>([]); // Replace 'any' with your project type
  const [error, setError] = useState("");
  const [open, setOpen] = React.useState(false)
    const router = useRouter();
    const { token, logout } = useAuth();
    const { token: authToken, login, userEmail } = useAuth();
    const [selectedProject, setSelectedProject] = useState<any>(null);


    useEffect(() => {
        if (token) {
            fetchProjects();
        } else {
            router.push('/login'); // Redirect to login if not logged in
        }
    }, [token, router]);

    const fetchProjects = async () => {
        try {
            const userIdResponse = await fetch(`${apiBaseUrl}/api/auth/userid?email=${userEmail}`, {
                method: "GET",
                /*headers: {
                     "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },*/
            });

            if (!userIdResponse.ok) {
               const errorData = await userIdResponse.json();
                const errorMessage = errorData?.message || "Failed to fetch user ID";
                console.error("Failed to fetch user ID:", errorMessage);
                setError(errorMessage);
                return;
            }

            const userIdData = await userIdResponse.json();
            const userId = userIdData.userid;

            const response = await fetch(`${apiBaseUrl}/api/projects?user_id=${userId}`, {
                method: "GET",
                /*headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },*/
            });


            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || "Failed to fetch projects";
                console.error("Failed to fetch projects:", errorMessage);
                return;
            }

            const projectsData = await response.json();
            setProjects(projectsData);
        } catch (err) {
            setError("An error occurred while fetching projects.");
            console.error(err);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!projectName.trim()) {
            setError("Project name cannot be empty");
            return;
        }

        try {
            const userIdResponse = await fetch(`${apiBaseUrl}/api/auth/userid?email=${userEmail}`, {
                method: "GET",
               /* headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },*/
            });

            if (!userIdResponse.ok) {
               const errorData = await userIdResponse.json();
                const errorMessage = errorData?.message || "Failed to fetch user ID";
                console.error("Failed to fetch user ID:", errorMessage);
                setError(errorMessage);
                return;
            }

            const userIdData = await userIdResponse.json();
            const userId = userIdData.userid;
             const startDate = new Date().toISOString().split('T')[0];
            const response = await fetch(`${apiBaseUrl}/api/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                   // "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: projectName,
                    start_date: startDate,
                    end_date:  startDate,
                    user_id: userId,
                }),
            });

            const newProject = await response.json();

            if (response.ok) {
                setProjects([...projects, newProject]);
                setProjectName(""); // Clear input after successful creation
                setOpen(false);
                 toast({
                   title: "Project created successfully!",
                   description: `Project ${projectName} has been created.`,
                 });
                fetchProjects();
            } else {
                setError(newProject.message || "Failed to create project");
            }
        } catch (err) {
            setError("An error occurred while creating the project.");
            console.error(err);
        }
    };

    const handleLogout = () => {
        logout(); // Call the logout function from the auth context
        router.push('/login'); // Redirect to login page
    };

    if (!token) {
        return null; // or a loading indicator
    }

  return (
      <div className="h-screen flex bg-whatsapp-background">
          {/* Sidebar */}
          <aside
              className="w-80 border-r border-whatsapp-border flex flex-col bg-whatsapp-panel"
          >
              {/* Profile and Settings */}
              <div className="p-4 flex items-center justify-between border-b border-whatsapp-border">
                  {/* Avatar and User Info */}
                  <div className="flex items-center space-x-2">
                      <Avatar className="mr-2">
                          <AvatarImage src="https://picsum.photos/50/50" alt={userEmail || "User"}/>
                          <AvatarFallback>{userEmail?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                  </div>

                  <div>
                      <Button variant="ghost" size="icon" onClick={handleLogout}>
                          <LogOut className="h-5 w-5 text-whatsapp-secondary"/>
                      </Button>
                      <Button variant="ghost" size="icon">
                          <Settings className="h-5 w-5 text-whatsapp-secondary"/>
                      </Button>
                  </div>
              </div>

              {/* Sidebar Buttons */}
              <div className="p-2 space-y-2">
                  <Button variant="ghost" className="w-full justify-start rounded-none hover:bg-secondary hover:text-secondary-foreground">
                      <ListChecks className="h-5 w-5 mr-2"/>
                      Project
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-none hover:bg-secondary hover:text-secondary-foreground">
                      <Users className="h-5 w-5 mr-2"/>
                      Project Group
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-none hover:bg-secondary hover:text-secondary-foreground">
                      <Newspaper className="h-5 w-5 mr-2"/>
                      News Feed
                  </Button>
              </div>

              {/* Search Projects */}
              <div className="p-2">
                  <Input type="search" placeholder="Search projects..."
                         className="bg-whatsapp-background text-whatsapp-text"/>
              </div>

              {/* Project List */}
              <ScrollArea className="flex-1">
                  <div className="py-2">
                      {projects.map((project) => (
                          <Button
                              key={project.id}
                              variant="ghost"
                              className="w-full justify-start rounded-none hover:bg-secondary hover:text-secondary-foreground"
                              onClick={() => setSelectedProject(project)}
                              style={{
                                  backgroundColor: selectedProject?.id === project.id ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                  color: '#111b21', // WhatsApp text color
                                  fontWeight: selectedProject?.id === project.id ? '600' : 'normal',
                              }}
                          >
                              {project.name}
                          </Button>
                      ))}
                  </div>
              </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4">
              {selectedProject ? (
                  <Card className="h-full bg-whatsapp-panel">
                      <CardHeader>
                          <h2 className="text-lg font-semibold text-whatsapp-text">{selectedProject.name}</h2>
                      </CardHeader>
                      <CardContent>
                          <Tabs defaultValue="expenses" className="w-full">
                              <TabsList>
                                  <TabsTrigger value="expenses" className="text-whatsapp-secondary">Expenses</TabsTrigger>
                                  <TabsTrigger value="income" className="text-whatsapp-secondary">Income</TabsTrigger>
                                  <TabsTrigger value="productivity" className="text-whatsapp-secondary">Productivity</TabsTrigger>
                                  <TabsTrigger value="report" className="text-whatsapp-secondary">Report</TabsTrigger>
                              </TabsList>
                              <TabsContent value="expenses">
                                  <p className="text-whatsapp-text">Expenses content for project {selectedProject.name}</p>
                              </TabsContent>
                              <TabsContent value="income">
                                  <p className="text-whatsapp-text">Income content for project {selectedProject.name}</p>
                              </TabsContent>
                              <TabsContent value="productivity">
                                  <p className="text-whatsapp-text">Productivity content for project {selectedProject.name}</p>
                              </TabsContent>
                              <TabsContent value="report">
                                  <p className="text-whatsapp-text">Report content for project {selectedProject.name}</p>
                              </TabsContent>
                          </Tabs>
                      </CardContent>
                  </Card>
              ) : (
                  <div className="h-full flex items-center justify-center text-whatsapp-secondary">
                      Select a project to view details.
                  </div>
              )}
          </main>
        {/* Floating Create Project Button */}
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-4 right-4 rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#008080', color: 'white' }}
                >
                    <Plus className="h-8 w-8" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-whatsapp-panel text-whatsapp-text">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Create a new project to manage your expenses, income, and
                        productivity.
                    </DialogDescription>
                </DialogHeader>
                <Card className="w-full md:w-auto bg-whatsapp-panel">
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
  );
}
