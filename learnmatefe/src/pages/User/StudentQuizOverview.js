import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Badge as Status } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";
import { Card } from "../../components/ui/Card";
import { Clock, FileText, Info, Trophy } from "lucide-react";
import { Separator } from "../../components/ui/Separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/AlertDialog";

const statusFor = (now, start, end) => {
  if (now < start) return "Upcoming";
  if (now > end) return "Completed";
  return "Active";
};

const StudentQuizOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const schedule = useMemo(
    () => ({
      "vocab-basics": {
        startAt: new Date(currentYear, 9, 15, 0, 0),
        endAt: new Date(currentYear, 9, 15, 23, 59),
      },
      "grammar-test-1": {
        startAt: new Date(currentYear, 9, 18, 0, 0),
        endAt: new Date(currentYear, 9, 18, 23, 59),
      },
      "reading-comp": {
        startAt: new Date(currentYear, 9, 25, 0, 0),
        endAt: new Date(currentYear, 9, 25, 23, 59),
      },
    }),
    [currentYear]
  );

  const dates = schedule[id] || schedule["reading-comp"];
  const now = new Date();
  const state = statusFor(now, dates.startAt, dates.endAt);

  useEffect(() => {
    let mounted = true;
    const bases = ["/api", "./netlify/functions/api"];

    const getJson = async (paths) => {
      for (const p of paths) {
        try {
          const r = await fetch(p);
          if (r.ok) return await r.json();
        } catch (e) {
          // ignore
        }
      }
      throw new Error("network error");
    };

    (async () => {
      try {
        const data = await getJson(bases.map((b) => `${b}/quiz/${id}`));
        if (mounted) setQuiz(data);
      } catch {
        if (mounted)
          setQuiz({
            id: id || "quiz",
            title: id?.includes("grammar") ? "Grammar Test 1" : "Quiz",
            duration: 1800,
            questions: Array.from({ length: 10 }).map((_, i) => ({
              id: `q${i + 1}`,
              text: `Q${i + 1}`,
              options: ["A", "B", "C", "D"],
            })),
          });
      }

      try {
        const result = await getJson(
          bases.map((b) => `${b}/quiz/${id}/result`)
        );
        if (mounted) setSubmitted(!!result.submitted);
      } catch {
        if (mounted) setSubmitted(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const durationMin = quiz ? Math.round(quiz.duration / 60) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {quiz?.title || "Quiz Details"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview for quiz: {id}
            </p>
            {!quiz && (
              <div className="mt-2 text-xs">
                <Status variant="secondary">Loading...</Status>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {state === "Active" && (
              <Button onClick={() => setConfirmOpen(true)}>Start Quiz</Button>
            )}
            {state === "Upcoming" && (
              <Button variant="outline" disabled>
                Starts {format(dates.startAt, "MM d")}
              </Button>
            )}
            {state === "Completed" &&
              (submitted ? (
                <Button asChild variant="secondary">
                  <Link to={`/student/quiz/${id}/result`}>View Result</Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Closed
                </Button>
              ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Instructions</h2>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  You will have {durationMin} minutes to complete the quiz.
                </li>
                <li>Each question has one correct answer. Choose A–D.</li>
                <li>Your answers are auto-saved after each selection.</li>
                <li>Once you submit, you cannot change your answers.</li>
              </ul>
              <Separator className="my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">
                    Availability
                  </div>
                  <div className="mt-1 font-medium">
                    {format(dates.startAt, "MMM d, HH:mm")} -{" "}
                    {format(dates.endAt, "MMM d, HH:mm")}
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="mt-1 font-medium">{durationMin} minutes</div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-1 font-medium flex items-center gap-2">
                    {state === "Upcoming" && (
                      <Badge variant="secondary">Upcoming</Badge>
                    )}
                    {state === "Active" && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                        Active
                      </Badge>
                    )}
                    {state === "Completed" && (
                      <Badge className="bg-slate-800 hover:bg-slate-800 text-white">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="text-sm text-muted-foreground">Questions</div>
                  <div className="mt-1 font-medium">
                    {quiz?.questions.length ?? 0}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Overview</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                This quiz covers essential grammar topics including verb tenses,
                subject-verb agreement, and sentence structure.
              </p>
            </Card>
          </div>
          <aside className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Quick Info</h3>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Opens</dt>
                  <dd className="font-medium">
                    {format(dates.startAt, "MMM d")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Closes</dt>
                  <dd className="font-medium">
                    {format(dates.endAt, "MMM d")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Attempts</dt>
                  <dd className="font-medium">
                    {submitted ? "1 / 1" : "0 / 1"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Score</dt>
                  <dd className="font-medium">{submitted ? "Pending" : "—"}</dd>
                </div>
              </dl>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">What to aim for</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Aim for 80% or higher. You can review explanations after
                submission.
              </p>
            </Card>
          </aside>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start quiz now?</AlertDialogTitle>
              <AlertDialogDescription>
                The timer will start immediately. You will have {durationMin}{" "}
                minutes to complete the quiz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => navigate(`/student/quiz/${id}/take`)}
              >
                Start Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StudentQuizOverview;
