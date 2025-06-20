import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Header from "./Header";

export default function Login() {
    const [membername, setMembername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ membername, password }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.message || "Login failed");
            } else {
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-grow md:grid md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-3">
                <div className="flex items-center justify-center p-6 py-12 sm:p-12 md:col-span-1 lg:col-span-2 xl:col-span-1">
                    <Card className="mx-auto w-full max-w-sm border-0 shadow-none sm:border sm:shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl">Login</CardTitle>
                            <CardDescription>
                                Enter your membername below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="membername">Membername</Label>
                                    <Input
                                        id="membername"
                                        type="text"
                                        placeholder="your-username"
                                        value={membername}
                                        onChange={(e) => setMembername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                            <Separator className="my-6" />
                            <Button variant="outline" className="w-full" asChild>
                                <a href={`${API_URL}/auth/google`}>Login with Google</a>
                            </Button>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link to="/register" className="underline">
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div
                    className="hidden bg-cover bg-center md:block lg:col-span-3 xl:col-span-2"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop')",
                    }}
                />
            </main>
        </div>
    );
}
