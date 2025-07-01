import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import Header from "./Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Member {
  _id: string;
  name: string;
  YOB: number;
  membername: string;
  isAdmin: boolean;
  googleId?: string;
}

export default function Accounts() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API_URL}/accounts`, { credentials: "include" });
        if (res.status === 401 || res.status === 403) {
          navigate("/login");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setMembers(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>Manage all member accounts in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Membername</TableHead>
                  <TableHead className="hidden md:table-cell">Y.O.B</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Provider</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  members.filter(member => !member.isAdmin).map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.membername}</TableCell>
                      <TableCell className="hidden md:table-cell">{member.YOB}</TableCell>
                      <TableCell>
                        <Badge variant={!member.isAdmin ? "default" : "destructive"}>
                          {!member.isAdmin ? "Member" : "Admin"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">
                          {member.googleId ? "Google" : "Email"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}