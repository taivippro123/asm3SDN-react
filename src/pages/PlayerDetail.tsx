import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// @ts-ignore
import API_URL from "@/config/api";
import Header from "./Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageCircle, Edit, Trash2, ArrowLeft } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Interfaces
interface Author { _id: string; name: string; membername: string; }
interface Comment { _id: string; rating: number; content: string; author: Author; createdAt: string; }
interface Team { _id: string; teamName: string; }
interface Player { _id: string; playerName: string; image: string; cost: number; information: string; isCaptain: boolean; team: Team | null; comments: Comment[]; }
interface User { _id: string; name: string; membername: string; isAdmin: boolean; }

// Main Component
export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);

  const fetchPlayer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/players/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setPlayer(data.data.player);
      } else {
        setError("Player not found.");
      }
    } catch (err) {
      setError("Failed to fetch player data.");
    } finally {
    setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    fetchPlayer();
  }, [id, fetchPlayer]);
  
  const handleDelete = async () => {
    if (!id || !user?.isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/players/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        navigate('/players');
      } else {
        toast.error(data.message || 'Failed to delete player.');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the player.');
    }
  };

  // Edit comment handler
  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  };
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent("");
    setEditRating(0);
  };
  const handleEditSubmit = async (e: React.FormEvent, comment: Comment) => {
    e.preventDefault();
    if (!editContent || editRating === 0) return;
    try {
      const res = await fetch(`${API_URL}/players/${player?._id}/comments/${comment._id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editContent, rating: editRating })
      });
      const data = await res.json();
      if (data.success) {
        setEditingCommentId(null);
        setEditContent("");
        setEditRating(0);
        fetchPlayer();
        toast.success('Comment updated!');
      } else {
        toast.error(data.message || 'Failed to edit comment.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };
  // Delete comment handler
  const handleDeleteComment = async (comment: Comment) => {
    try {
      const res = await fetch(`${API_URL}/players/${player?._id}/comments/${comment._id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        fetchPlayer();
        toast.success('Comment deleted!');
      } else {
        toast.error(data.message || 'Failed to delete comment.');
      }
    } catch (err) {
      console.log(err);
      toast.error('An error occurred.');
    }
  };

  if (loading) return <PlayerDetailSkeleton />;
  if (error || !player) return (
    <div className="min-h-screen bg-background">
      <Header />
      <p className="text-center text-red-500 mt-10">{error || "Player not found."}</p>
    </div>
  );

  // Check if user already commented
  const userComment = user && player?.comments.find(c => c.author._id === user._id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl py-8 px-4">
        <div className="mb-6">
          <Link to="/players" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Players</span>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Left Column: Player Info */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  {/* Intentionally left empty to push buttons to the right */}
                </div>
                {user?.isAdmin && (
                  <div className="flex gap-2">
                    <EditPlayerDialog player={player} onUpdate={fetchPlayer} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the player
                            and remove their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 text-center -mt-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img src={player.image} alt={player.playerName} className="w-full h-full object-contain rounded-lg shadow-md bg-gray-100" />
                  {player.isCaptain && <Badge variant="destructive" className="absolute -top-2 -right-2">C</Badge>}
                </div>
                <h1 className="text-2xl font-bold">{player.playerName}</h1>
                <p className="text-muted-foreground">{player.team?.teamName || 'No Team'}</p>
              </CardContent>
              <Separator />
              <CardContent className="p-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Cost:</span>
                  <span className="font-mono">${(player.cost || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 text-left">
                  <span className="font-semibold text-muted-foreground">Information:</span>
                  <p className="text-sm text-foreground/80 mt-1">{player.information}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Comments */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Comments & Ratings
                </CardTitle>
                <CardDescription>See what others think about this player.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Only show comment form if user is member, not admin, and chưa comment */}
                {user && !user.isAdmin && !userComment && <CommentForm playerId={player._id} onCommentAdded={fetchPlayer} />}
                <Separator className="my-6" />
                <div className="space-y-6">
                  {(player.comments || []).length > 0 ? (
                    (player.comments || []).slice().reverse().map(comment => (
                      <div key={comment._id} className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${comment.author.membername}`} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">{comment.author.name}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {[1, 2, 3].map(val => (
                                <Star key={val} className={`w-4 h-4 ${comment.rating >= val ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                          {/* Nếu đang edit comment này */}
                          {editingCommentId === comment._id ? (
                            <form onSubmit={e => handleEditSubmit(e, comment)} className="mt-2 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                {[1, 2, 3].map(val => (
                                  <button type="button" key={val} onClick={() => setEditRating(val)} className="focus:outline-none">
                                    <Star className={`w-5 h-5 ${editRating >= val ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300'}`} />
                                  </button>
                                ))}
                              </div>
                              <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={2} />
                              <div className="flex gap-2">
                                <Button type="submit" size="sm">Save</Button>
                                <Button type="button" size="sm" variant="secondary" onClick={handleEditCancel}>Cancel</Button>
                              </div>
                            </form>
                          ) : (
                            <p className="mt-2 text-sm text-foreground/90">{comment.content}</p>
                          )}
                          {/* Nếu là member và là tác giả comment thì hiện nút Edit/Delete */}
                          {user && !user.isAdmin && comment.author._id === user._id && editingCommentId !== comment._id && (
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditClick(comment)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this comment?
                                      <br />
                                      <span className="italic text-muted-foreground">"{comment.content.length > 100 ? comment.content.substring(0, 100) + '...' : comment.content}"</span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteComment(comment)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to share your thoughts.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Skeleton component for loading state
const PlayerDetailSkeleton = () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 text-center">
                <Skeleton className="w-32 h-32 rounded-lg mx-auto mb-4" />
                <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-5 w-1/2 mx-auto" />
              </CardContent>
              <Separator />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-8">
                  <Skeleton className="h-20 w-full" />
                  <Separator />
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );

// Comment Form Component
function CommentForm({ playerId, onCommentAdded }: { playerId: string, onCommentAdded: () => void }) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || rating === 0) {
      setError("Please provide a rating and a comment.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/players/${playerId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, rating })
      });
      const data = await res.json();
      if (data.success) {
        setContent("");
        setRating(0);
        onCommentAdded();
      } else {
        setError(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Your Rating</Label>
        <div className="flex items-center gap-2 mt-1">
          {[1, 2, 3].map(val => (
            <button type="button" key={val} onClick={() => setRating(val)} className="focus:outline-none">
              <Star className={`w-6 h-6 transition-colors ${rating >= val ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300'}`} />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        placeholder="Share your thoughts on this player..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Comment'}</Button>
    </form>
  )
}

// Edit Player Dialog Component
function EditPlayerDialog({ player, onUpdate }: { player: Player, onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    playerName: player.playerName,
    image: player.image,
    cost: player.cost,
    isCaptain: player.isCaptain,
    information: player.information,
    team: player.team?._id || 'none',
  });

  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch(`${API_URL}/teams`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setTeams(data.data || []);
    };
    if (isOpen) fetchTeams();
  }, [isOpen]);

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
    try {
      const payload = {
        ...formData,
        team: formData.team === 'none' ? null : formData.team,
      };

      const res = await fetch(`${API_URL}/players/${player._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onUpdate();
        setIsOpen(false);
      } else {
        toast.error(data.message || 'Failed to update player');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>Make changes to the player's profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playerName" className="text-right">Name</Label>
            <Input id="playerName" name="playerName" value={formData.playerName} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Image URL</Label>
            <Input id="image" name="image" value={formData.image} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">Cost</Label>
            <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">Team</Label>
            <Select onValueChange={handleSelectChange} defaultValue={formData.team}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">No Team</SelectItem>
                    {teams.map(team => (
                        <SelectItem key={team._id} value={team._id}>{team.teamName}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="information" className="text-right">Information</Label>
            <Textarea id="information" name="information" value={formData.information} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isCaptain" className="text-right">Captain</Label>
            <Checkbox id="isCaptain" checked={formData.isCaptain} onCheckedChange={handleCheckboxChange} />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
