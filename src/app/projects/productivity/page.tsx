"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { apiBaseUrl } from "@/services/api-config";
import { useAuth } from "@/context/AuthContext";

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

    return (
        <CardContent className="flex flex-col gap-4">
            {error && <div className="text-red-500">{error}</div>}

            <Card>
                <CardHeader>
                    <CardTitle>Total Expense</CardTitle>
                </CardHeader>
                <CardContent>
                    {totalExpense}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                    {totalIncome}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Egg Collection</CardTitle>
                </CardHeader>
                <CardContent>
                    {eggCollection}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Hens Count</CardTitle>
                </CardHeader>
                <CardContent>
                    {hensCount}
                </CardContent>
            </Card>
        </CardContent>
    );
}
