"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {apiBaseUrl} from "@/services/api-config";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Assuming the backend returns a token upon successful login
                login(data.token);
                router.push('/projects'); // Redirect to the projects page
            } else {
                setError(data.message || "Invalid credentials.");
            }
        } catch (err) {
            setError("An error occurred while logging in.");
            console.error(err);
        }
    };

    return (
        <div className="grid h-screen place-items-center">
            <Card className="w-96">
                <CardHeader>
                    <h1 className="text-2xl font-semibold">Login</h1>
                </CardHeader>
                <CardContent>
                    {error && <div className="text-red-500">{error}</div>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Log In
                        </Button>
                    </form>
                    <div className="mt-4 text-sm">
                        Don't have an account? <a href="/signup" className="text-primary">Sign up</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
