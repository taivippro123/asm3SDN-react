import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import Header from "./Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Frown } from "lucide-react";

// Interfaces
interface Team { _id: string; teamName: string; }
interface Player { _id: string; playerName: string; image: string; cost: number; isCaptain: boolean; }

// Main Component
export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTeamData = async () => {
      setLoading(true);
      try {
        const [teamRes, playersRes] = await Promise.all([
          fetch(`${API_URL}/teams/${id}`, { credentials: "include" }),
          fetch(`${API_URL}/players?team=${id}`, { credentials: "include" })
        ]);

        const teamData = await teamRes.json();
        const playersData = await playersRes.json();

        if (teamData.success) setTeam(teamData.data);
        if (playersData.success) setPlayers(playersData.data.players);

      } catch (error) {
        console.error("Failed to fetch team details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, [id]);

  if (loading) return <TeamDetailSkeleton />;
  if (!team) return <div className="min-h-screen bg-background"><Header /><p className="text-center text-red-500 mt-10">Team not found.</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{team.teamName}</h1>
            <p className="mt-2 text-lg text-muted-foreground">Roster of Players</p>
          </div>
        </div>

        {players.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {players.map(player => (
              <Link to={`/players/${player._id}`} key={player._id}>
                <Card className="overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                  <CardContent className="p-0">
                    <div className="relative h-48">
                      {player.isCaptain && <Badge className="absolute top-2 right-2 z-10" variant="destructive">Captain</Badge>}
                      <img src={player.image} alt={player.playerName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  </CardContent>
                  <CardHeader>
                    <CardTitle className="truncate text-base">{player.playerName}</CardTitle>
                    <CardDescription>${player.cost.toLocaleString()}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-card border rounded-lg">
            <Frown className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Players in Roster</h2>
            <p className="text-muted-foreground">This team currently has no players assigned.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Skeleton loader
const TeamDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-6 mb-12">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-0"><Skeleton className="h-48 w-full" /></CardContent><CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></CardHeader></Card>
        ))}
      </div>
    </main>
  </div>
);
