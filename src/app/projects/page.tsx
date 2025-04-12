"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";
import Link from "next/link";

export default function Projects() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<any[]>([]); // Replace 'any' with your project type
  const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            router.push('/'); // Redirect to login if not logged in
        }
    }, [router]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Replace with your actual create project API endpoint
      const response = await fetch(`${BACKEND_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: projectName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create project");
        return;
      }

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setProjectName(""); // Clear input after successful creation
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred");
    }
  };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        router.push('/'); // Redirect to login page
    };

  return (
    <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Projects</h1>
            <Button onClick={handleLogout}>Logout</Button>
        </div>
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Create New Project</h2>
        </CardHeader>
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
    </div>
  );
}
