import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Bot, MessageCircle } from "lucide-react";
import api from "@/lib/api";

interface AISidebarProps {
  projectId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  projectId,
  open,
  setOpen,
}) => {
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"summarize" | "ask">("summarize");

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/ai/${projectId}/summarize`);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error getting summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/ai/${projectId}/ask`, {
        question: question.trim(),
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="h-full w-full">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <SheetHeader>
          <SheetTitle>AI Assistant</SheetTitle>
          <SheetDescription>
            Get an AI-powered summary of all tasks in this project
          </SheetDescription>
        </SheetHeader>
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <Button
              variant={activeTab === "ask" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("ask")}
              className="flex-1"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Ask
            </Button>
          </div>
        </div>

        <div className="h-full space-y-4 overflow-y-auto p-4">
          {activeTab === "summarize" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Project Summary</CardTitle>
                  <CardDescription>
                    Get an AI-powered summary of all tasks in this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Generating..." : "Generate Summary"}
                  </Button>
                </CardContent>
              </Card>

              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-wrap text-gray-700">
                      {summary}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "ask" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ask a Question</CardTitle>
                  <CardDescription>
                    Ask the AI about your project, tasks, or get insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAskQuestion} className="space-y-3">
                    <div>
                      <Label htmlFor="question">Your Question</Label>
                      <Textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., What tasks are taking the longest? What should I prioritize?"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !question.trim()}
                      className="w-full"
                    >
                      {loading ? "Thinking..." : "Ask AI"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {answer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-wrap text-gray-700">
                      {answer}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
