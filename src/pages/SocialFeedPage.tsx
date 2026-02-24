import { useState, useEffect } from "react";
import { socialAPI } from "@/lib/api";
import { SocialFeedItem } from "@/lib/types";
import { CuriosityCard } from "@/components/CuriosityCard";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

export default function SocialFeedPage() {
  const [items, setItems] = useState<SocialFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await socialAPI.getFeed();
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-2xl font-bold mb-6">👥 Feed Social</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-4xl mb-2">👀</p>
            <p>Nada aqui ainda. Siga outros usuários para ver suas curtidas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => (
              <CuriosityCard
                key={`${item.id}-${i}`}
                curiosityId={item.id}
                likedBy={item.actor_username}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
