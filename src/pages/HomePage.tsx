import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// @ts-ignore
import API_URL from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center p-6 bg-transparent border-0 md:border md:bg-card">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </Card>
);

interface Team { _id: string; teamName: string; }
interface Player { _id: string; playerName: string; image: string; team: Team | null; }

export default function HomePage() {
    const [featuredPlayers, setFeaturedPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedPlayers = async () => {
            try {
                const res = await fetch(`${API_URL}/players`, { credentials: "include" });
                const data = await res.json();
                if (data.success && data.data.players) {
                    setFeaturedPlayers(data.data.players.slice(0, 4));
                }
            } catch (error) {
                console.error("Failed to fetch featured players", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedPlayers();
    }, []);


    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-20 md:py-32"
            >
                <div className="container mx-auto">
                    <Badge variant="outline" className="mb-4">The Ultimate Football Database</Badge>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                        Discover Your Favorite Players & Teams
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                        The most comprehensive and up-to-date platform for football enthusiasts. Explore detailed stats, player info, and team compositions.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg">
                            <Link to="/players">Explore Players</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link to="/teams">Browse Teams</Link>
                        </Button>
                    </div>
                </div>
            </motion.section>

            {/* Features Section */}
            <section className="py-20 bg-muted/40">
                <div className="container mx-auto">
                    <div className="max-w-2xl mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Why Choose Us?</h2>
                        <p className="text-muted-foreground mt-2">Everything you need in one place.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<ShieldCheck className="w-12 h-12 text-primary" />}
                            title="Verified Information"
                            description="All data is verified and regularly updated to ensure accuracy."
                        />
                        <FeatureCard
                            icon={<Users className="w-12 h-12 text-primary" />}
                            title="Community Driven"
                            description="Comment and rate players to share your opinion with the community."
                        />
                        <FeatureCard
                            icon={<Trophy className="w-12 h-12 text-primary" />}
                            title="Track Champions"
                            description="Follow teams and players on their journey to become champions."
                        />
                    </div>
                </div>
            </section>

            {/* Featured Players Section */}
            <section className="py-20">
                <div className="container mx-auto">
                    <div className="max-w-2xl mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Featured Players</h2>
                        <p className="text-muted-foreground mt-2">Meet some of the top talents in the league.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <Skeleton className="h-56 w-full" />
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardFooter>
                                        <Skeleton className="h-10 w-full" />
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            featuredPlayers.map(player => (
                                <Card key={player._id} className="overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1">
                                    <CardContent className="p-0">
                                        <div className="relative h-56">
                                            <img src={player.image} alt={player.playerName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>
                                    </CardContent>
                                    <CardHeader className="text-center">
                                        <CardTitle className="truncate">{player.playerName}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{player.team?.teamName || 'No Team'}</p>
                                    </CardHeader>
                                    <CardFooter>
                                        <Button asChild className="w-full">
                                            <Link to={`/players/${player._id}`}>View Details</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                    <div className="text-center mt-12">
                        <Button asChild size="lg" variant="outline">
                            <Link to="/players">View All Players</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="py-8 bg-muted">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Football App. All Rights Reserved.</p>
                    <p className="mt-1">Built with React & Node.js</p>
                </div>
            </footer>
        </div>
    );
}