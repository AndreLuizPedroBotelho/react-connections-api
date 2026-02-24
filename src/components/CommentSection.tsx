import { useState, useEffect } from "react";
import { curiositiesAPI } from "@/lib/api";
import { Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  curiosityId: number;
}

export function CommentSection({ curiosityId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await curiositiesAPI.getComments(curiosityId);
      setComments(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [curiosityId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await curiositiesAPI.addComment(curiosityId, newComment.trim());
      setNewComment("");
      fetchComments();
      toast({ title: "Comentário adicionado! 💬" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível comentar", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando comentários...</p>;
  }

  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">@{comment.username}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <p className="mt-1 text-sm">{comment.text}</p>
        </div>
      ))}

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="min-h-[60px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button size="icon" onClick={handleSubmit} disabled={submitting || !newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
