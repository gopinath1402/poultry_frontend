"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { apiBaseUrl } from "@/services/api-config";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface ProductivityPageProps {
    selectedProject: any;
}

export default function ProductivityPage({ selectedProject }: ProductivityPageProps) {
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [eggCollection, setEggCollection] = useState(0);
    const [hensCount, setHensCount] = useState(0);
    const [error, setError] = useState("");
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dialog open state for each card
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [incomeOpen, setIncomeOpen] = useState(false);
    const [eggOpen, setEggOpen] = useState(false);
    const [hensOpen, setHensOpen] = useState(false);

    // Input values for each dialog
    const [expenseInput, setExpenseInput] = useState("");
    const [incomeInput, setIncomeInput] = useState("");
    const [eggInput, setEggInput] = useState("");
    const [hensInput, setHensInput] = useState("");


    useEffect(() => {
        if (selectedProject) {
            fetchData();
        }
    }, [selectedProject]);

    const fetchData = async () => {
        if (!selectedProject || !selectedProject.id) return;

        try {
            // Fetch total expense
            const expenseResponse = await fetch(`${apiBaseUrl}/api/finance/expense/${selectedProject.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!expenseResponse.ok) {
                throw new Error(`Failed to fetch expense data: ${expenseResponse.status}`);
            }

            const expenseData = await expenseResponse.json();
            const totalExpenseValue = expenseData.reduce((acc: number, expense: any) => acc + expense.amount, 0);
            setTotalExpense(totalExpenseValue);

            // Fetch total income
            const incomeResponse = await fetch(`${apiBaseUrl}/api/finance/income/${selectedProject.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!incomeResponse.ok) {
                throw new Error(`Failed to fetch income data: ${incomeResponse.status}`);
            }

            const incomeData = await incomeResponse.json();
            const totalIncomeValue = incomeData.reduce((acc: number, income: any) => acc + income.amount, 0);
            setTotalIncome(totalIncomeValue);

            // TODO: Implement API endpoints for egg collection and hens count, then fetch the data
            // Example:
            // const eggResponse = await fetch(`${apiBaseUrl}/api/eggcollection/${selectedProject.id}`);
            // const eggData = await eggResponse.json();
            // setEggCollection(eggData.total);

            // const hensResponse = await fetch(`${apiBaseUrl}/api/henscount/${selectedProject.id}`);
            // const hensData = await hensResponse.json();
            // setHensCount(hensData.count);

        } catch (err: any) {
            setError(err.message || "An error occurred while fetching data.");
            console.error(err);
        }
    };

    const handleUpdateValue = async (type: string) => {
        setIsSubmitting(true);
        setError("");

        let value;
        switch (type) {
            case "expense":
                value = parseFloat(expenseInput);
                break;
            case "income":
                value = parseFloat(incomeInput);
                break;
            case "egg":
                value = parseInt(eggInput);
                break;
            case "hens":
                value = parseInt(hensInput);
                break;
            default:
                setError("Invalid type.");
                setIsSubmitting(false);
                return;
        }

        // TODO: Implement API endpoint to update the corresponding value
        // try {
        //     const response = await fetch(`${apiBaseUrl}/api/update/${type}/${selectedProject.id}`, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             "Authorization": `Bearer ${token}`,
        //         },
        //         body: JSON.stringify({ value }),
        //     });

        //     if (!response.ok) {
        //         throw new Error(`Failed to update ${type}: ${response.status}`);
        //     }

        //     const responseData = await response.json();
        //     // Update local state based on responseData
        //     if (type === "expense") setTotalExpense(responseData.totalExpense);
        //     if (type === "income") setTotalIncome(responseData.totalIncome);
        //     if (type === "egg") setEggCollection(responseData.eggCollection);
        //     if (type === "hens") setHensCount(responseData.hensCount);

        //     toast({
        //         title: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`,
        //     });
        // } catch (err: any) {
        //     setError(err.message || `An error occurred while updating ${type}.`);
        //     console.error(err);
        // } finally {
            // Reset input and close dialog
            switch (type) {
                case "expense":
                    setTotalExpense(value);
                    setExpenseOpen(false);
                    setExpenseInput("");
                    break;
                case "income":
                    setTotalIncome(value);
                    setIncomeOpen(false);
                    setIncomeInput("");
                    break;
                case "egg":
                    setEggCollection(value);
                    setEggOpen(false);
                    setEggInput("");
                    break;
                case "hens":
                    setHensCount(value);
                    setHensOpen(false);
                    setHensInput("");
                    break;
            }
            setIsSubmitting(false);
        //}
    };

    return (
        <CardContent className="flex flex-col gap-4">
            {error && <div className="text-red-500">{error}</div>}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Total Expense</CardTitle>
                    <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"
                            className="rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: '#008080', color: 'white' }}
                            >
                                <Plus/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Update Total Expense</DialogTitle>
                                <DialogDescription>
                                    Enter the new total expense value.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="number"
                                    value={expenseInput}
                                    onChange={(e) => setExpenseInput(e.target.value)}
                                />
                            </div>
                            <Button type="submit" onClick={() => handleUpdateValue("expense")} disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update"}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {totalExpense}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Total Income</CardTitle>
                    <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"
                            className="rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: '#008080', color: 'white' }}
                            >
                                <Plus/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Update Total Income</DialogTitle>
                                <DialogDescription>
                                    Enter the new total income value.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="number"
                                    value={incomeInput}
                                    onChange={(e) => setIncomeInput(e.target.value)}
                                />
                            </div>
                            <Button type="submit" onClick={() => handleUpdateValue("income")} disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update"}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {totalIncome}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Egg Collection</CardTitle>
                    <Dialog open={eggOpen} onOpenChange={setEggOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"
                            className="rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: '#008080', color: 'white' }}
                            >
                                <Plus/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Update Egg Collection</DialogTitle>
                                <DialogDescription>
                                    Enter the new egg collection value.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="number"
                                    value={eggInput}
                                    onChange={(e) => setEggInput(e.target.value)}
                                />
                            </div>
                            <Button type="submit" onClick={() => handleUpdateValue("egg")} disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update"}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {eggCollection}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Hens Count</CardTitle>
                    <Dialog open={hensOpen} onOpenChange={setHensOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"
                            className="rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: '#008080', color: 'white' }}
                            >
                                <Plus/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Update Hens Count</DialogTitle>
                                <DialogDescription>
                                    Enter the new hens count value.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="number"
                                    value={hensInput}
                                    onChange={(e) => setHensInput(e.target.value)}
                                />
                            </div>
                            <Button type="submit" onClick={() => handleUpdateValue("hens")} disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update"}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {hensCount}
                </CardContent>
            </Card>
        </CardContent>
    );
}
