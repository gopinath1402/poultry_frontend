"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Plus, Settings, LogOut } from "lucide-react";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

const expenseCategories = ['egg', 'feed', 'medicine', 'electricity', 'labor', 'other', 'equipment', 'chicks', 'insurance', 'transport'];

export default function Projects() {
    const [projectName, setProjectName] = useState("");
    const [projects, setProjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = React.useState(false);
    const [expenseOpen, setExpenseOpen] = React.useState(false);
    const router = useRouter();
    const { token, logout, userEmail } = useAuth();
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("");
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [expenseData, setExpenseData] = useState<any[]>([]);
    const [sortingDirection, setSortingDirection] = useState<'asc' | 'desc' | null>(null);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    useEffect(() => {
        if (token && userEmail) {
            fetchProjects();
        } else {
            router.push('/login');
        }
    }, [token, router, userEmail]);

    const fetchProjects = async () => {
        try {
            const userIdResponse = await fetch(`${apiBaseUrl}/api/auth/userid?email=${userEmail}`, {
                method: "GET",
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
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || "Failed to fetch projects";
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

    useEffect(() => {
        if (selectedProject) {
            fetchExpenseData();
        }
    }, [selectedProject]);

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
                },
                body: JSON.stringify({
                    name: projectName,
                    start_date: startDate,
                    end_date: startDate,
                    user_id: userId,
                }),
            });

            const newProject = await response.json();

            if (response.ok) {
                setProjects([...projects, newProject]);
                setProjectName("");
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
        logout();
        router.push('/login');
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    const fetchExpenseData = async () => {
        if (selectedProject && selectedProject.id) {
            try {
                const expenseResponse = await fetch(`${apiBaseUrl}/api/finance/expense/${selectedProject.id}`, {
                    method: "GET",
                });

                if (expenseResponse.ok) {
                    const expenseData = await expenseResponse.json();
                    setExpenseData(expenseData);
                } else {
                    console.error("Failed to fetch expense data");
                    setExpenseData([]);
                }
            } catch (err) {
                console.error("An error occurred while fetching expense data:", err);
                setExpenseData([]);
            }
        } else {
            setExpenseData([]);
        }
    };

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!expenseAmount || !expenseDescription || !expenseCategory || !date) {
            setError("Please fill in all expense fields.");
            return;
        }

        if (!selectedProject) {
            setError("Please select a project to add the expense to.");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/finance`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    project_id: selectedProject.id,
                    type: "expense",
                    amount: parseFloat(expenseAmount.toString()),
                    description: expenseDescription,
                    category: expenseCategory,
                    date: date ? format(date, 'yyyy-MM-dd') : null,
                }),
            });

            const newExpense = await response.json();

            if (response.ok) {
                setExpenseAmount("");
                setExpenseDescription("");
                setExpenseCategory("");
                setDate(new Date());
                setExpenseOpen(false);
                toast({
                    title: "Expense created successfully!",
                    description: `Expense ${expenseDescription} has been created.`,
                });
                const expenseResponse = await fetch(`${apiBaseUrl}/api/finance/expense/${selectedProject.id}`, {
                    method: "GET",
                });
                if (expenseResponse.ok) {
                    const expenseData = await expenseResponse.json();
                    setExpenseData(expenseData);
                } else {
                    console.error("Failed to fetch expense data");
                    setExpenseData([]);
                }
            } else {
                setError(newExpense.message || "Failed to create expense");
            }
        } catch (err) {
            setError("An error occurred while creating the expense.");
            console.error(err);
        }
    };

    const sortExpensesByAmount = () => {
        if (!expenseData || expenseData.length === 0) {
            return;
        }

        const newDirection = sortingDirection === 'asc' ? 'desc' : 'asc';
        setSortingDirection(newDirection);

        const sortedData = [...expenseData].sort((a, b) => {
            const amountA = parseFloat(a.amount);
            const amountB = parseFloat(b.amount);

            if (newDirection === 'asc') {
                return amountA - amountB;
            } else {
                return amountB - amountA;
            }
        });

        setExpenseData(sortedData);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setDate(date);
        setIsCalendarOpen(false);
    };


    const filteredExpenseData = useMemo(() => {
        if (filterCategory === null || filterCategory === 'all') {
            return expenseData;
        }

        return expenseData.filter(expense => expense.category === filterCategory);
    }, [expenseData, filterCategory]);


    return (
        <div className="h-screen flex bg-whatsapp-background">
            {/* Sidebar */}
            <aside
                className="w-80 border-r border-whatsapp-border flex flex-col bg-whatsapp-panel"
            >
                {/* Profile and Settings */}
                <div className="p-4 flex items-center justify-between border-b border-whatsapp-border">
                    {/* Avatar and User Info */}
                    <Avatar className="mr-2">
                        <AvatarImage src="https://picsum.photos/50/50" alt={userEmail || "User"} />
                        <AvatarFallback>{userEmail?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>

                    {/* Settings and Logout Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5 text-whatsapp-secondary" />
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-5 w-5 text-whatsapp-secondary" />
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
                </div>

                {/* Search Bar */}
                <div className="p-2">
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        className="bg-whatsapp-background text-whatsapp-text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Project List */}
                <ScrollArea className="flex-1">
                    <div className="py-2">
                        {filteredProjects.map((project) => (
                            <Button
                                key={project.id}
                                variant="ghost"
                                className="w-full justify-start rounded-none hover:bg-secondary hover:text-secondary-foreground"
                                onClick={() => setSelectedProject(project)}
                                style={{
                                    backgroundColor: selectedProject?.id === project.id ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                    color: '#111b21',
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
                                      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                                        <DialogTrigger asChild>
                                            <Button>Add Expense</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] bg-whatsapp-panel text-whatsapp-text">
                                            <DialogHeader>
                                                <DialogTitle>Add a new expense to this project.</DialogTitle>
                                                <DialogDescription>
                                                    <span style={{ color: '#008080' }}>Add a new expense to this project.</span>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Card className="w-full md:w-auto bg-whatsapp-panel">
                                                <CardContent>
                                                    {error && <div className="text-red-500">{error}</div>}
                                                    <form onSubmit={handleCreateExpense} className="space-y-2">
                                                        <div>
                                                            <Input
                                                                type="number"
                                                                placeholder="Expense Amount"
                                                                value={expenseAmount.toString()}
                                                                onChange={(e) => setExpenseAmount(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Input
                                                                type="text"
                                                                placeholder="Expense Description"
                                                                value={expenseDescription}
                                                                onChange={(e) => setExpenseDescription(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Input
                                                                type="text"
                                                                placeholder="Category"
                                                                value={expenseDescription}
                                                                onChange={(e) => setExpenseDescription(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>            
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-[240px] justify-start text-left font-normal",
                                                                            !date && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={date}
                                                                        onSelect={handleDateSelect}
                                                                        className={cn("rounded-md border")}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                        <Button type="submit">Create Expense</Button>
                                                    </form>
                                                </CardContent>
                                            </Card>
                                        </DialogContent>
                                    </Dialog>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>
                                                    <Select onValueChange={setFilterCategory} defaultValue="all">
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Filter by Category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <ScrollArea className="h-[200px] w-[200px] rounded-md border">
                                                                <SelectItem value="all">Category</SelectItem>
                                                                {expenseCategories.map((category) => (
                                                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                                                ))}
                                                            </ScrollArea>
                                                        </SelectContent>
                                                    </Select>
                                                </TableHead>
                                                <TableHead>
                                                    <Button variant="ghost" size="sm" onClick={sortExpensesByAmount}>
                                                        Amount
                                                        {sortingDirection && (
                                                            sortingDirection === 'asc' ? <ChevronsUpDown className="w-4 h-4 ml-2" /> :
                                                                <ChevronsUpDown className="w-4 h-4 ml-2" />
                                                        )}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredExpenseData.map((expense) => (
                                                <TableRow key={expense.id}>
                                                    <TableCell>{expense.date}</TableCell>
                                                    <TableCell>{expense.category}</TableCell>
                                                    <TableCell>{expense.amount}</TableCell>
                                                    <TableCell>{expense.description}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
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
