"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {apiBaseUrl} from "@/services/api-config";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !name || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, name, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to login page after successful registration
                router.push('/login');
            } else {
                setError(data.message || "Registration failed.");
            }
        } catch (err: any) {
            setError("An error occurred during registration.");
            console.error(err);
        }
    };

    return (
        <div className="grid h-screen place-items-center">
            <Card className="w-96">
                <CardHeader>
                    <h1 className="text-2xl font-semibold">Sign Up</h1>
                </CardHeader>
                <CardContent>
                    {error && <div className="text-red-500">{error}</div>}
                    <form onSubmit={handleSignup} className="space-y-4">
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
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                        <div>
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Sign Up
                        </Button>
                    </form>
                    <div className="mt-4 text-sm">
                        Already have an account? <a href="/login" className="text-primary">Log In</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

