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
import { useAuth } from "@/context/AuthContext";
import {apiBaseUrl} from "@/services/api-config";

export default function Projects() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<any[]>([]); // Replace 'any' with your project type
  const [error, setError] = useState("");
  const [open, setOpen] = React.useState(false)
    const router = useRouter();
    const { token, logout } = useAuth();
      const { token: authToken, login, userEmail } = useAuth();


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
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!userIdResponse.ok) {
                const errorData = await userIdResponse.json();
                const errorMessage = errorData?.message || "Failed to fetch user ID";
                console.error("Failed to fetch user ID:", errorMessage);
                setError(errorMessage);
                return;
            }

            const userIdData = await userIdResponse.json();
            const userId = userIdData.userId; // Adjust if the response structure is different
            const response = await fetch(`${apiBaseUrl}/api/projects?user_id=${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message || "Failed to fetch projects";
                console.error("Failed to fetch projects:", errorMessage);
                setError(errorMessage);
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
            // Fetch user ID from backend using email as a query parameter
            const userIdResponse = await fetch(`${apiBaseUrl}/api/auth/userid?email=${userEmail}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!userIdResponse.ok) {
               const errorData = await userIdResponse.json();
                const errorMessage = errorData?.message || "Failed to fetch user ID";
                console.error("Failed to fetch user ID:", errorMessage);
                setError(errorMessage);
                return;
            }

            const userIdData = await userIdResponse.json();
            const userId = userIdData.userId; // Adjust if the response structure is different
             const startDate = new Date().toISOString().split('T')[0];
            const response = await fetch(`${apiBaseUrl}/api/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: projectName,
                    start_date: startDate, // Today's date in YYYY-MM-DD format
                    end_date:  startDate,
                    user_id: userId,
                }),
            });

            const newProject = await response.json();

            if (response.ok) {
                setProjects([...projects, newProject]);
                setProjectName(""); // Clear input after successful creation
                setOpen(false);
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

