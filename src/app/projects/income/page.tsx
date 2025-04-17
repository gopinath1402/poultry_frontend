"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import React from 'react';
import { useAuth } from "@/context/AuthContext";
import { apiBaseUrl } from "@/services/api-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ChevronsUpDown } from "lucide-react";

const incomeCategories = ['egg', 'feed', 'medicine', 'electricity', 'labor', 'other', 'equipment', 'chicks', 'insurance', 'transport'];

interface IncomesPageProps {
    selectedProject: any;
}

export default function IncomePage({ selectedProject }: IncomesPageProps) {
    const [projectName, setProjectName] = useState("");
    const [projects, setProjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = React.useState(false);
    const [incomeOpen, setIncomeOpen] = React.useState(false);
    const [incomeAmount, setIncomeAmount] = useState("");
    const [incomeDescription, setIncomeDescription] = useState("");
    const [incomeCategory, setIncomeCategory] = useState("");
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [incomeData, setIncomeData] = useState<any[]>([]);
    const [sortingDirection, setSortingDirection] = useState<'asc' | 'desc' | null>('desc');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    useEffect(() => {
        if (selectedProject) {
            fetchIncomeData();
        }
    }, [selectedProject]);

    const fetchIncomeData = async () => {
        if (selectedProject && selectedProject.id) {
            try {
                const incomeResponse = await fetch(`${apiBaseUrl}/api/finance/income/${selectedProject.id}`, {
                    method: "GET",
                });

                if (incomeResponse.ok) {
                    const incomeData = await incomeResponse.json();

                    // Sort incomes by date in descending order by default
                    const sortedData = [...incomeData].sort((a, b) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    });
                    setIncomeData(sortedData);
                } else {
                    console.error("Failed to fetch income data");
                    setIncomeData([]);
                }
            } catch (err) {
                console.error("An error occurred while fetching income data:", err);
                setIncomeData([]);
            }
        } else {
            setIncomeData([]);
        }
    };

    const handleCreateIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!incomeAmount || !incomeDescription || !incomeCategory || !date) {
            setError("Please fill in all income fields.");
            return;
        }

        if (!selectedProject) {
            setError("Please select a project to add the income to.");
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
                    type: "income",
                    amount: parseFloat(incomeAmount.toString()),
                    description: incomeDescription,
                    category: incomeCategory,
                    date: date ? format(date, 'yyyy-MM-dd') : null,
                }),
            });

            const newIncome = await response.json();

            if (response.ok) {
                setIncomeAmount("");
                setIncomeDescription("");
                setIncomeCategory("");
                setDate(new Date());
                setIncomeOpen(false);
                toast({
                    title: "Income created successfully!",
                    description: `Income ${incomeDescription} has been created.`,
                });
                fetchIncomeData();
            } else {
                setError(newIncome.message || "Failed to create income");
            }
        } catch (err) {
            setError("An error occurred while creating the income.");
            console.error(err);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        setDate(date);
        setIsCalendarOpen(false);
    };

    const filteredIncomeData = useMemo(() => {
        if (filterCategory === null || filterCategory === 'all') {
            return incomeData;
        }

        return incomeData.filter(income => income.category === filterCategory);
    }, [incomeData, filterCategory]);

    const sortIncomesByAmount = () => {
        const newDirection = sortingDirection === 'asc' ? 'desc' : 'asc';
        setSortingDirection(newDirection);

        const sortedData = [...incomeData].sort((a, b) => {
            const amountA = a.amount;
            const amountB = b.amount;

            if (newDirection === 'asc') {
                return amountA - amountB;
            } else {
                return amountB - amountA;
            }
        });
        setIncomeData(sortedData);
    };


    return (
        <CardContent>
            <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
                <DialogTrigger asChild>
                    <Button>Add Income</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-whatsapp-panel text-whatsapp-text">
                    <DialogHeader>
                        <DialogTitle>Add a new income to this project.</DialogTitle>
                        <DialogDescription>
                            <span style={{ color: '#008080' }}>Add a new income to this project.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <Card className="w-full md:w-auto bg-whatsapp-panel">
                        <CardContent>
                            {error && <div className="text-red-500">{error}</div>}
                            <form onSubmit={handleCreateIncome} className="space-y-2">
                                <div>
                                    <Input
                                        type="number"
                                        placeholder="Income Amount"
                                        value={incomeAmount.toString()}
                                        onChange={(e) => setIncomeAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Income Description"
                                        value={incomeDescription}
                                        onChange={(e) => setIncomeDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Select onValueChange={setIncomeCategory}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <ScrollArea className="h-[200px] w-[200px] rounded-md border">
                                                {incomeCategories.map((category) => (
                                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                                ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
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
                                <Button type="submit">Create Income</Button>
                            </form>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
            <ScrollArea>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead>
                                <Select onValueChange={setFilterCategory} defaultValue="all">
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Filter by Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <ScrollArea className="h-[200px] w-[200px] rounded-md border">
                                            <SelectItem value="all">Category</SelectItem>
                                            {incomeCategories.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                            </TableHead>
                            <TableHead className="w-[60px]">
                                <Button variant="ghost" size="sm" onClick={sortIncomesByAmount}>
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
                        {filteredIncomeData.map((income) => (
                            <TableRow key={income.id}>
                                <TableCell className="w-[120px]">{income.date}</TableCell>
                                <TableCell className="w-[60px]">{income.category}</TableCell>
                                <TableCell className="w-[60px]">{income.amount}</TableCell>
                                <TableCell>{income.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
    );
}
