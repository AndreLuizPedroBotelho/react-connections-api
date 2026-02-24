import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Sparkles, UserPlus } from "lucide-react";

const INTEREST_OPTIONS = [
  "🔬 Ciência", "📜 História", "💻 Tecnologia", "🌍 Geografia",
  "🎨 Arte", "🧠 Psicologia", "🚀 Espaço", "🦕 Paleontologia",
  "🧬 Biologia", "⚡ Física", "🏛️ Filosofia", "🎵 Música",
  "🍳 Culinária", "⚽ Esportes", "🌿 Natureza", "📐 Matemática",
];

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      toast({ title: "Selecione interesses", description: "Escolha pelo menos 1 interesse", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register({ username, email, password, interests });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Erro no registro",
        description: err.response?.data?.detail || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold tracking-tight">CuriosityNet</h1>
          <p className="mt-2 text-muted-foreground">Crie sua conta e comece a explorar</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-display">Criar Conta</CardTitle>
            <CardDescription>Preencha seus dados e escolha seus interesses</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seu_usuario" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div className="space-y-2">
                <Label>Interesses</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <motion.div key={interest} whileTap={{ scale: 0.95 }}>
                      <Badge
                        variant={interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer select-none px-3 py-1.5 text-sm transition-all hover:scale-105"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{interests.length} selecionado(s)</p>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <UserPlus className="h-4 w-4" />
                {loading ? "Criando..." : "Criar Conta"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
