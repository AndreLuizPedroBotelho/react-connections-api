import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Curiosity } from "@/lib/types";
import { curiositiesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { CommentSection } from "./CommentSection";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  hard: "bg-destructive/10 text-destructive border-destructive/20",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

interface Props {
  curiosity: Curiosity;
  likedBy?: string;
  onUpdate?: () => void;
}

export function CuriosityCard({ curiosity, likedBy, onUpdate }: Props) {
  const [liked, setLiked] = useState(curiosity.is_liked);
  const [likesCount, setLikesCount] = useState(curiosity.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = async () => {
    try {
      if (liked) {
        await curiositiesAPI.unlike(curiosity.id);
        setLikesCount((c) => c - 1);
      } else {
        await curiositiesAPI.like(curiosity.id);
        setLikesCount((c) => c + 1);
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 600);
      }
      setLiked(!liked);
      onUpdate?.();
    } catch {
      toast({ title: "Erro", description: "Não foi possível curtir", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl">
        <CardContent className="p-5">
          {likedBy && (
            <p className="mb-3 text-xs text-muted-foreground">
              ❤️ Curtido por <span className="font-semibold text-primary">@{likedBy}</span>
            </p>
          )}

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{curiosity.emoji}</span>
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">{curiosity.title}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{curiosity.category}</Badge>
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", DIFFICULTY_COLORS[curiosity.difficulty])}>
                    {DIFFICULTY_LABELS[curiosity.difficulty]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{curiosity.content}</p>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 transition-colors", liked && "text-accent")}
              onClick={handleLike}
            >
              <motion.div animate={likeAnimating ? { scale: [1, 1.4, 1] } : {}}>
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              </motion.div>
              {likesCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              {curiosity.comments_count}
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t pt-4">
                  <CommentSection curiosityId={curiosity.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
