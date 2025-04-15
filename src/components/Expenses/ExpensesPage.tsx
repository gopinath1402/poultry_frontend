"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {apiBaseUrl} from "@/services/api-config";
import { Check, ChevronsUpDown } from "lucide-react";

interface ExpensesPageProps {
    selectedProject: any;
}

const expenseCategories = ['egg', 'feed', 'medicine', 'electricity', 'labor', 'other', 'equipment', 'chicks', 'insurance', 'transport'];

const ExpensesPage: React.FC<ExpensesPageProps> = ({ selectedProject }) => {
    const [expenseOpen, setExpenseOpen] = React.useState(false);
    const [error, setError] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("");
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [expenseData, setExpenseData] = useState<any[]>([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [sortingDirection, setSortingDirection] = useState<'asc' | 'desc' | null>(null);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);


    useEffect(() => {
        if (selectedProject) {
            fetchExpenseData();
        }
    }, [selectedProject]);

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

    const filteredExpenseData = useMemo(() => {
        let filteredData = expenseData;

        if (filterCategory && filterCategory !== "all") {
            filteredData = filteredData.filter(expense => expense.category === filterCategory);
        }

        return filteredData;
    }, [expenseData, filterCategory]);

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

    return (
        <>
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
                                    <Label htmlFor="category">Expense Category</Label>
                                    <Select onValueChange={setExpenseCategory} defaultValue={expenseCategory}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <ScrollArea className="h-[200px] w-[200px] rounded-md border">
                                            {expenseCategories.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                        <Label>Expense Date</Label>
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
              <Select onValueChange={setFilterCategory} defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                      <ScrollArea className="h-[200px] w-[200px] rounded-md border">
                      <SelectItem value="all">All Categories</SelectItem>
                      {expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                      </ScrollArea>
                  </SelectContent>
              </Select>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                           <TableHead>
                               <Button variant="ghost" size="sm" onClick={sortExpensesByAmount}>
                                   Amount
                                   {sortingDirection && (
                                       sortingDirection === 'asc' ? <ChevronsUpDown  className="w-4 h-4 ml-2"/> :
                                           <ChevronsUpDown className="w-4 h-4 ml-2"/>
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
        </>
    );
};

export default ExpensesPage;

