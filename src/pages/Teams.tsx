import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import Header from "./Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Frown, PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Team {
  _id: string;
  teamName: string;
}

interface User {
  _id: string;
  isAdmin: boolean;
}

interface Player {
  _id: string;
  playerName: string;
  team: Team;
}

function CreateTeamDialog({ onTeamCreated, teams }: { onTeamCreated: () => void; teams: Team[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) {
      setError("Team name is required.");
      return;
    }
    if (teams.some(t => t.teamName.trim().toLowerCase() === teamName.trim().toLowerCase())) {
      toast.error("Tên team đã tồn tại.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Tạo team thành công!");
        onTeamCreated();
        setIsOpen(false);
        setTeamName("");
      } else {
        if (data.message?.toLowerCase().includes("exists")) {
          toast.error("Tên team đã tồn tại.");
        } else {
          toast.error(data.message || "Tạo team thất bại.");
        }
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>Enter the name for the new team. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teamName" className="text-right">
                Name
              </Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="col-span-3"
              />
            </div>
             {error && <p className="col-span-4 text-sm text-destructive text-right">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTeamDialog({ team, onTeamUpdated, teams }: { team: Team | null; onTeamUpdated: () => void; teams: Team[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team) {
      setTeamName(team.teamName);
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !teamName) {
      setError("Team name is required.");
      return;
    }
    if (teams.some(t => t.teamName.trim().toLowerCase() === teamName.trim().toLowerCase() && t._id !== team._id)) {
      toast.error("Tên team đã tồn tại.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/teams/${team._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật team thành công!");
        onTeamUpdated();
        setIsOpen(false);
      } else {
        if (data.message?.toLowerCase().includes("exists")) {
          toast.error("Tên team đã tồn tại.");
        } else {
          toast.error(data.message || "Cập nhật team thất bại.");
        }
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>Update the team name. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTeamName" className="text-right">
                Name
              </Label>
              <Input
                id="editTeamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="col-span-3"
              />
            </div>
             {error && <p className="col-span-4 text-sm text-destructive text-right">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTeamDialog({ team, onTeamDeleted, playerCount }: { team: Team | null; onTeamDeleted: () => void; playerCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!team) return;
    if (playerCount > 0) {
      toast.error("Không thể xóa team có thành viên!");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/teams/${team._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa team thành công!");
        onTeamDeleted();
        setIsOpen(false);
      } else {
        toast.error(data.message || "Xóa team thất bại.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{team?.teamName}</strong>? This action cannot be undone. <strong>You can not delete a team that has players.</strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading || playerCount > 0}>
            {loading ? "Deleting..." : "Delete Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/teams`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setTeams(data.data || []);
      } else {
        setTeams([]);
      }
    } catch (error) {
       console.error("Failed to fetch teams", error);
       setTeams([]);
    }
    setLoading(false);
  }, []);
  
  const fetchPlayers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/players`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setPlayers(data.data.players || []);
      } else {
        setPlayers([]);
      }
    } catch {
      setPlayers([]);
    }
  }, []);
  
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    fetchTeams();
    fetchPlayers();
  }, [fetchTeams, fetchPlayers]);

  const teamPlayerCount = React.useMemo(() => {
    const map: Record<string, number> = {};
    players.forEach(p => {
      if (p.team && p.team._id) {
        map[p.team._id] = (map[p.team._id] || 0) + 1;
      }
    });
    return map;
  }, [players]);

  const renderSkeletons = () => (
    Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className="items-center text-center">
          <Skeleton className="w-16 h-16 rounded-full" />
        </CardHeader>
        <CardContent className="text-center">
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-12">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Our Teams</h1>
            <p className="mt-4 text-lg text-muted-foreground">Discover the titans of the league.</p>
          </div>
           {user?.isAdmin && <CreateTeamDialog onTeamCreated={fetchTeams} teams={teams} />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? renderSkeletons() : teams.length > 0 ? (
            teams.map(team => (
              <Card key={team._id} className="text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="items-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2">
                    <Users className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <CardTitle>{team.teamName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full mb-2">
                    <Link to={`/teams/${team._id}`}>View Roster</Link>
                  </Button>
                  {user?.isAdmin && (
                    <div className="flex justify-center gap-1">
                      <EditTeamDialog team={team} onTeamUpdated={fetchTeams} teams={teams} />
                      <DeleteTeamDialog team={team} onTeamDeleted={fetchTeams} playerCount={teamPlayerCount[team._id] || 0} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 bg-card border rounded-lg">
              <Frown className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold">No Teams Found</h2>
              <p className="text-muted-foreground">Check back later for updates.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}