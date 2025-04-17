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

const expenseCategories = ['egg', 'feed', 'medicine', 'electricity', 'labor', 'other', 'equipment', 'chicks', 'insurance', 'transport'];

interface ExpensePageProps {
    selectedProject: any;
}

export default function ExpensePage({ selectedProject }: ExpensePageProps) {
    const [projectName, setProjectName] = useState("");
    const [projects, setProjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = React.useState(false);
    const [expenseOpen, setExpenseOpen] = React.useState(false);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("");
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [expenseData, setExpenseData] = useState<any[]>([]);
    const [sortingDirection, setSortingDirection] = useState<'asc' | 'desc' | null>('desc');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (selectedProject) {
            fetchExpenseData();
        }
    }, [selectedProject]);

    const fetchExpenseData = async () => {
        if (selectedProject && selectedProject.id) {
            try {
                const expenseResponse = await fetch(`${apiBaseUrl}/api/finance/expense/${selectedProject.id}`, {
                    method: "GET",
                });

                if (expenseResponse.ok) {
                    const expenseData = await expenseResponse.json();

                    // Sort expense by date in descending order by default
                    const sortedData = [...expenseData].sort((a, b) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    });
                    setExpenseData(sortedData);
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
        if (isSubmitting) return; // prevent double submits
        setError("");
        if (!expenseAmount || !expenseDescription || !expenseCategory || !date) {
            setError("Please fill in all expense fields.");
            return;
        }
        if (!selectedProject) {
            setError("Please select a project to add the expense to.");
            return;
        }
        setIsSubmitting(true); // disable the button
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
                fetchExpenseData();
            } else {
            const newExpense = await response.json();
                setError(newExpense.message || "Failed to create expense");
            }
        } catch (err) {
            setError("An error occurred while creating the expense.");
            console.error(err);
        }finally {
            setIsSubmitting(false); // allow future submits
        }
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

    const sortExpenseByAmount = () => {
        const newDirection = sortingDirection === 'asc' ? 'desc' : 'asc';
        setSortingDirection(newDirection);

        const sortedData = [...expenseData].sort((a, b) => {
            const amountA = a.amount;
            const amountB = b.amount;

            if (newDirection === 'asc') {
                return amountA - amountB;
            } else {
                return amountB - amountA;
            }
        });
        setExpenseData(sortedData);
    };


    return (
        <CardContent>
            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                <DialogTrigger asChild>
                    <Button>Add Expense</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] text-whatsapp-text">
                    <DialogHeader>
                        <DialogTitle>
                            <span style={{ color: '#008080' }}>Add a new expense to this project.</span>
                        </DialogTitle>
                    </DialogHeader>
                    <Card className="w-full md:w-auto bg-whatsapp-panel border-none">
                        <CardContent>
                            {error && <div className="text-red-500">{error}</div>}
                            <form onSubmit={handleCreateExpense} className="space-y-2">
                                <div className="w-[200px]">
                                    <Input
                                        type="number"
                                        placeholder="Expense Amount"
                                        value={expenseAmount.toString()}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                    />
                                </div>
                                <div className="w-[200px]">
                                    <Input
                                        type="text"
                                        placeholder="Expense Description"
                                        value={expenseDescription}
                                        onChange={(e) => setExpenseDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Select onValueChange={setExpenseCategory}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent className="w-[200px]">
                                            <ScrollArea className="h-[200px] w-[200px] rounded-md border">
                                                {expenseCategories.map((category) => (
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
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 rounded text-white ${
                                        isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080] hover:bg-[#006666]"
                                    }`}
                                >
                                    {isSubmitting ? "Processing..." : "Create Expense"}
                                </Button>
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
                                    <SelectTrigger className="w-[100px] border-none">
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
                            <TableHead className="w-[60px]">
                                <Button variant="ghost" size="sm" onClick={sortExpenseByAmount}>
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
                                <TableCell className="w-[120px]">{expense.date}</TableCell>
                                <TableCell className="w-[60px]">{expense.category}</TableCell>
                                <TableCell className="w-[60px]">{expense.amount}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
    );
}