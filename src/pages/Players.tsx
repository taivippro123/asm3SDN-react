import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import Header from "./Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Frown, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Team {
  _id: string;
  teamName: string;
}
interface Player {
  _id: string;
  playerName: string;
  image: string;
  cost: number;
  information: string;
  isCaptain: boolean;
  team: Team;
}
interface User {
  _id: string;
  isAdmin: boolean;
}

function CreatePlayerDialog({ teams, onPlayerCreated }: { teams: Team[], onPlayerCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    playerName: '',
    image: '',
    cost: 0,
    isCaptain: false,
    information: '',
    team: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'cost' ? parseInt(value) || 0 : value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, team: value}));
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
     if (typeof checked === 'boolean') {
        setFormData(prev => ({ ...prev, isCaptain: checked }));
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.playerName || !formData.team || !formData.image || !formData.information) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onPlayerCreated();
        setIsOpen(false);
        // Reset form
        setFormData({
            playerName: '', image: '', cost: 0, isCaptain: false, information: '', team: ''
        });
      } else {
        setError(data.message || 'Failed to create player');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Player</DialogTitle>
          <DialogDescription>Fill in the details for the new player.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="playerName">Name</Label>
            <Input id="playerName" name="playerName" value={formData.playerName} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" name="image" value={formData.image} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cost">Cost</Label>
            <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="team">Team</Label>
            <Select onValueChange={handleSelectChange} value={formData.team}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team._id} value={team._id}>{team.teamName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="information">Information</Label>
            <Textarea id="information" name="information" value={formData.information} onChange={handleChange} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="isCaptain" checked={formData.isCaptain} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="isCaptain">Captain</Label>
          </div>
          {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Player'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    const url = new URL(`${API_URL}/players`);
    if (search) url.searchParams.append("search", search);
    if (selectedTeam) url.searchParams.append("team", selectedTeam);
    const res = await fetch(url.toString(), { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setPlayers(data.data.players || []);
    } else {
      setPlayers([]);
    }
    setLoading(false);
  }, [search, selectedTeam]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }

    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_URL}/teams`, { credentials: "include" });
        const data = await res.json();
        if (data.success) setTeams(data.data || []);
      } catch (error) {
        console.error("Failed to fetch teams", error);
      }
    };
    fetchTeams();
    fetchPlayers();
  }, [fetchPlayers]);

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value === "all" ? "" : value);
  };

  const handleSearchClick = () => {
    fetchPlayers();
  };

  const renderSkeletons = () => (
    Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
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
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div className="flex-1 min-w-[300px]">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Explore the Players</h1>
            <p className="mt-4 text-lg text-muted-foreground">Find your favorite players from all the teams.</p>
          </div>
          {user?.isAdmin && <CreatePlayerDialog teams={teams} onPlayerCreated={fetchPlayers} />}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-card border rounded-lg">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by player name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick() }}
              className="pl-10"
            />
          </div>
          <Select value={selectedTeam || "all"} onValueChange={handleTeamChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(team => (
                <SelectItem key={team._id} value={team._id}>{team.teamName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearchClick} className="w-full sm:w-auto">Search</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? renderSkeletons() : players.length > 0 ? (
            players.map(player => (
              <Card key={player._id} className="overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative h-48">
                    {player.isCaptain && (
                      <Badge className="absolute top-2 right-2 z-10" variant="destructive">Captain</Badge>
                    )}
                    <img
                      src={player.image}
                      alt={player.playerName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </CardContent>
                <CardHeader>
                  <CardTitle className="truncate">{player.playerName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{player.team.teamName}</p>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                   <p className="text-lg font-semibold">${player.cost.toLocaleString()}</p>
                   <Button asChild>
                     <Link to={`/players/${player._id}`}>View Details</Link>
                   </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
             <div className="col-span-full flex flex-col items-center justify-center h-64 bg-card border rounded-lg">
              <Frown className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold">No Players Found</h2>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}