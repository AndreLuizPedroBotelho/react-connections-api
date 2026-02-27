import { useState, useEffect } from "react";
import { curiositiesAPI } from "@/lib/api";
import { Curiosity } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, CheckCircle, XCircle, ArrowRight, RotateCcw, Brain, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  curiosity: Curiosity;
  question: string;
  options: string[];
  correctIndex: number;
}

function generateQuizFromCuriosities(curiosities: Curiosity[]): QuizQuestion[] {
  if (curiosities.length < 2) return [];

  return curiosities.slice(0, 10).map((c, idx) => {
    const others = curiosities.filter((_, i) => i !== idx);
    const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);

    const questionTypes = [
      {
        question: `Qual é a categoria da curiosidade "${c.title}"?`,
        correct: c.category,
        wrongs: shuffledOthers.map((o) => o.category).filter((cat) => cat !== c.category),
      },
      {
        question: `Sobre o que fala a curiosidade com o emoji ${c.emoji}?`,
        correct: c.title,
        wrongs: shuffledOthers.map((o) => o.title),
      },
      {
        question: `Qual o nível de dificuldade da curiosidade "${c.title}"?`,
        correct: c.difficulty === "easy" ? "Fácil" : c.difficulty === "medium" ? "Médio" : "Difícil",
        wrongs: ["Fácil", "Médio", "Difícil"].filter(
          (d) => d !== (c.difficulty === "easy" ? "Fácil" : c.difficulty === "medium" ? "Médio" : "Difícil")
        ),
      },
    ];

    const type = questionTypes[idx % questionTypes.length];
    const uniqueWrongs = [...new Set(type.wrongs)].slice(0, 3);

    while (uniqueWrongs.length < 3) {
      uniqueWrongs.push(`Opção ${uniqueWrongs.length + 2}`);
    }

    const options = [type.correct, ...uniqueWrongs.slice(0, 3)];
    const shuffled = options.sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(type.correct);

    return {
      curiosity: c,
      question: type.question,
      options: shuffled,
      correctIndex,
    };
  });
}

export default function QuizPage() {
  const [curiosities, setCuriosities] = useState<Curiosity[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await curiositiesAPI.getHistory(0, 30);
        setCuriosities(res.data);
      } catch {
        setCuriosities([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (curiosities.length >= 2) {
      setQuestions(generateQuizFromCuriosities(curiosities));
    }
  }, [curiosities]);

  const current = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100 : 0;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === current.correctIndex) {
      const pts = streak >= 3 ? 15 : 10;
      setScore((s) => s + pts);
      setStreak((s) => {
        const next = s + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setQuestions(generateQuizFromCuriosities(curiosities));
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setStreak(0);
    setFinished(false);
  };

  const getScoreEmoji = () => {
    const pct = (score / (questions.length * 10)) * 100;
    if (pct >= 90) return "🏆";
    if (pct >= 70) return "🌟";
    if (pct >= 50) return "👍";
    return "💪";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl font-bold">Quiz de Curiosidades</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Teste seus conhecimentos sobre as curiosidades que você já leu!
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-4xl mb-3">📚</p>
              <p className="text-muted-foreground">
                Leia pelo menos 2 curiosidades no Feed para desbloquear o quiz!
              </p>
              <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/")}>
                Ir para o Feed
              </Button>
            </CardContent>
          </Card>
        ) : finished ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8 text-center">
                <p className="text-6xl mb-4">{getScoreEmoji()}</p>
                <h2 className="font-display text-3xl font-bold mb-2">Quiz Finalizado!</h2>
                <p className="text-muted-foreground">Veja como você se saiu</p>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <Trophy className="h-6 w-6 mx-auto mb-1 text-warning" />
                    <p className="font-display text-2xl font-bold">{score}</p>
                    <p className="text-xs text-muted-foreground">Pontos</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <CheckCircle className="h-6 w-6 mx-auto mb-1 text-success" />
                    <p className="font-display text-2xl font-bold">
                      {Math.round((score / (questions.length * 10)) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Acertos</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <Zap className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-display text-2xl font-bold">{bestStreak}</p>
                    <p className="text-xs text-muted-foreground">Melhor Sequência</p>
                  </div>
                </div>
                <Button onClick={handleRestart} className="w-full gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Jogar Novamente
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Score bar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-warning" />
                <span className="font-display font-bold text-sm">{score} pts</span>
              </div>
              {streak >= 2 && (
                <Badge variant="secondary" className="gap-1 animate-pulse">
                  <Zap className="h-3 w-3" />
                  {streak}x streak!
                </Badge>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="mb-6 h-2" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{current.curiosity.emoji}</span>
                      <Badge variant="outline">{current.curiosity.category}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-snug">{current.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {current.options.map((opt, idx) => {
                      const isCorrect = idx === current.correctIndex;
                      const isSelected = idx === selected;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          disabled={answered}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium",
                            !answered && "hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
                            !answered && "border-border bg-card",
                            answered && isCorrect && "border-success bg-success/10 text-success",
                            answered && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                            answered && !isSelected && !isCorrect && "border-border opacity-50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {answered && isCorrect && <CheckCircle className="h-5 w-5 text-success" />}
                            {answered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                          </div>
                        </button>
                      );
                    })}

                    {answered && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Button onClick={handleNext} className="w-full mt-2 gap-2">
                          {currentIndex + 1 >= questions.length ? "Ver Resultado" : "Próxima"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
