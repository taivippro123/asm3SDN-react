import React, { useState } from "react";
import { Link } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "./Header";

export default function Register() {
  const [membername, setMembername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [YOB, setYOB] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membername, password, name, YOB }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Register failed");
      } else {
        setSuccess("Register successful! You can now login.");
        setMembername("");
        setPassword("");
        setName("");
        setYOB("");
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
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="membername">Membername</Label>
                  <Input
                    id="membername"
                    placeholder="your-username"
                    value={membername}
                    onChange={(e) => setMembername(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="YOB">Year of Birth</Label>
                  <Input
                    id="YOB"
                    type="number"
                    placeholder="2000"
                    value={YOB}
                    onChange={(e) => setYOB(e.target.value)}
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
                {success && (
                  <p className="text-sm text-green-500">{success}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create an account"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <div
          className="hidden bg-cover bg-center md:block lg:col-span-3 xl:col-span-2"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1546608235-3310a2494cdf?q=80&w=1876&auto=format&fit=crop')",
          }}
        />
      </main>
    </div>
  );
}