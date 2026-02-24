import { useState, useEffect } from "react";
import { curiositiesAPI } from "@/lib/api";
import { Curiosity } from "@/lib/types";
import { CuriosityCard } from "@/components/CuriosityCard";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, History } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  "Todas", "Ciência", "História", "Tecnologia", "Geografia",
  "Arte", "Psicologia", "Espaço", "Biologia", "Física",
];

export default function FeedPage() {
  const [curiosities, setCuriosities] = useState<Curiosity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await curiositiesAPI.getDaily();
      setCuriosities(res.data);
    } catch {
      setCuriosities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await curiositiesAPI.getHistory();
      setCuriosities(res.data);
    } catch {
      setCuriosities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      showHistory ? fetchHistory() : fetchDaily();
      return;
    }
    setLoading(true);
    try {
      const res = await curiositiesAPI.search(searchQuery);
      setCuriosities(res.data);
    } catch {
      setCuriosities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, []);

  const filtered = activeCategory === "Todas"
    ? curiosities
    : curiosities.filter((c) => c.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display text-2xl font-bold">
              {showHistory ? "📚 Histórico" : "✨ Curiosidades do Dia"}
            </h1>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) fetchHistory();
                else fetchDaily();
              }}
            >
              {showHistory ? <Sparkles className="h-4 w-4" /> : <History className="h-4 w-4" />}
              {showHistory ? "Hoje" : "Histórico"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-4xl mb-2">🔍</p>
            <p>Nenhuma curiosidade encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((curiosity) => (
              <CuriosityCard key={curiosity.id} curiosity={curiosity} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
