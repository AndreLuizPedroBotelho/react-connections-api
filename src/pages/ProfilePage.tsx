import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI, socialAPI } from "@/lib/api";
import { UserProfile } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { UserPlus, UserMinus, Users } from "lucide-react";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<{ id: number; username: string }[]>([]);
  const [following, setFollowing] = useState<{ id: number; username: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const isOwnProfile = !userId || Number(userId) === currentUser?.id;
  const targetId = userId ? Number(userId) : currentUser?.id;

  const fetchProfile = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await usersAPI.getProfile(targetId);
      setProfile(res.data);
      const [fRes, gRes] = await Promise.all([
        socialAPI.getFollowers(targetId),
        socialAPI.getFollowing(targetId),
      ]);
      setFollowers(fRes.data);
      setFollowing(gRes.data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.is_following) {
        await socialAPI.unfollow(profile.id);
        toast({ title: `Você deixou de seguir @${profile.username}` });
      } else {
        await socialAPI.follow(profile.id);
        toast({ title: `Você agora segue @${profile.username}! 🎉` });
      }
      fetchProfile();
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-12 text-center text-muted-foreground">Usuário não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
            <CardContent className="relative pt-0 px-6 pb-6">
              <div className="flex items-end justify-between -mt-8 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-3xl shadow-lg border-4 border-card">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                {!isOwnProfile && (
                  <Button
                    variant={profile.is_following ? "outline" : "default"}
                    size="sm"
                    className="gap-1.5"
                    onClick={handleFollow}
                  >
                    {profile.is_following ? (
                      <><UserMinus className="h-4 w-4" /> Desseguir</>
                    ) : (
                      <><UserPlus className="h-4 w-4" /> Seguir</>
                    )}
                  </Button>
                )}
              </div>

              <h2 className="font-display text-xl font-bold">@{profile.username}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>

              <div className="mt-4 flex gap-4">
                <button
                  className="text-center hover:text-primary transition-colors"
                  onClick={() => { setShowFollowers(!showFollowers); setShowFollowing(false); }}
                >
                  <p className="font-display text-lg font-bold">{profile.followers_count}</p>
                  <p className="text-xs text-muted-foreground">Seguidores</p>
                </button>
                <button
                  className="text-center hover:text-primary transition-colors"
                  onClick={() => { setShowFollowing(!showFollowing); setShowFollowers(false); }}
                >
                  <p className="font-display text-lg font-bold">{profile.following_count}</p>
                  <p className="text-xs text-muted-foreground">Seguindo</p>
                </button>
              </div>

              {profile.interests?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Interesses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(showFollowers || showFollowing) && (
            <Card className="mt-4 border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {showFollowers ? "Seguidores" : "Seguindo"}
                </h3>
                {(showFollowers ? followers : following).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum usuário</p>
                ) : (
                  <div className="space-y-2">
                    {(showFollowers ? followers : following).map((u) => (
                      <Link
                        key={u.id}
                        to={`/profile/${u.id}`}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">@{u.username}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
