import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";

interface User { _id: string; name: string; YOB: number; membername: string; isAdmin: boolean; googleId?: string; }

interface CommentData {
  playerId: string;
  playerName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Profile Update State
  const [name, setName] = useState("");
  const [YOB, setYOB] = useState("");
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Comments State
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setCommentsLoading(true);
      setCommentsError("");
      try {
        const res = await fetch(`${API_URL}/auth/profile`, { credentials: "include" });
        if (!res.ok) throw new Error("Not logged in");
        const data = await res.json();
        if (data.success) {
          setUser(data.data.user);
          setName(data.data.user.name);
          setYOB(data.data.user.YOB.toString());
          setComments(data.data.comments || []);
        } else {
          navigate("/login");
        }
      } catch (error) {
        setCommentsError("Failed to load comments");
        navigate("/login");
      }
      setCommentsLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, YOB }),
      });
      const data = await res.json();
      setProfileMessage({ type: data.success ? "success" : "error", text: data.message });
      if (data.success) {
        // Optimistically update local state or re-fetch
        setUser(prev => prev ? { ...prev, name, YOB: parseInt(YOB) } : null);
        // Also update localStorage if you are persisting the whole user object
        const localUser = localStorage.getItem('user');
        if (localUser) {
          const parsedUser = JSON.parse(localUser);
          parsedUser.name = name;
          parsedUser.YOB = parseInt(YOB);
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
      }
    } catch (err) {
      setProfileMessage({ type: "error", text: "An error occurred." });
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPasswordMessage({ type: "", text: "" });
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
      });
      const data = await res.json();
      setPasswordMessage({ type: data.success ? "success" : "error", text: data.message });
       if (data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordMessage({ type: "error", text: "An error occurred." });
    }
    setPasswordLoading(false);
  };

  if (!user) return <div className="min-h-screen bg-background"><Header /><p className="text-center mt-10">Loading profile...</p></div>;

  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <Tabs defaultValue="account" className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 h-auto rounded-lg">
            <TabsTrigger value="account" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-slate-50 data-[state=active]:shadow-sm rounded-md">Account</TabsTrigger>
            <TabsTrigger value="password" disabled={!!user.googleId} className="data-[state=active]:bg-neutral-700 data-[state=active]:text-slate-50 data-[state=active]:shadow-sm rounded-md">Change Password</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="membername">Membername</Label>
                    <Input id="membername" value={user.membername} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="YOB">Year of Birth</Label>
                    <Input id="YOB" type="number" value={YOB} onChange={(e) => setYOB(e.target.value)} />
                  </div>
                  {profileMessage.text && (
                    <p className={`text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {profileMessage.text}
                    </p>
                  )}
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
                {/* Comments Section */}
                {user && !user.isAdmin && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-2">Your Comments for Players</h4>
                    {commentsLoading ? (
                      <p>Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p className="text-gray-500">You have not commented on any players yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-3 py-2 border">Player Name</th>
                              <th className="px-3 py-2 border">Rating</th>
                              <th className="px-3 py-2 border">Content</th>
                              <th className="px-3 py-2 border">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comments.map((comment, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 border">
                                  <a href={`/players/${comment.playerId}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                    {comment.playerName}
                                  </a>
                                </td>
                                <td className="px-3 py-2 border">{comment.rating}</td>
                                <td className="px-3 py-2 border">{comment.content}</td>
                                <td className="px-3 py-2 border">{new Date(comment.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  {user.googleId 
                    ? "You are logged in with Google and cannot change your password here."
                    : "Enter your old and new password to update."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Old Password</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowOldPassword((v) => !v)}
                        aria-label={showOldPassword ? "Hide password" : "Show password"}
                      >
                        {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {passwordMessage.text && (
                    <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordMessage.text}
                    </p>
                  )}
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
