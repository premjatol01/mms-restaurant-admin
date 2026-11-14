import React, { useState } from "react";
import {
  Gamepad2,
  Trophy,
  Flame,
  Dices,
  Plus,
  Trash2,
  Clock,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Users,
  Bot,
  CheckCircle2,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { usePortalHandlerStore } from "../../../store/portalHandlerStore";
import Button from "../../../components/ui/Button";

const STATUS_OPTIONS = ["Active", "In Development", "Coming Soon"];
const COLOR_PRESETS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
  "#8B5CF6", "#EC4899", "#F97316", "#14B8A6",
];

export default function TableGamesTab() {
  const {
    portalData,
    toggleTableGamesMaster,
    toggleGameEnabled,
    updateGameField,
    addTriviaQuestion,
    deleteTriviaQuestion,
    addDare,
    deleteDare,
    resetDefaultGames,
  } = usePortalHandlerStore();

  const games = portalData?.tableGames || {
    enabled: true,
    trivia: { enabled: true, title: "Foodie Trivia Showdown", status: "Active", timerSeconds: 15, questions: [] },
    dareSpin: { enabled: true, title: "Table Dare & Spin", status: "Active", dares: [] },
    ticTacToe: { enabled: true, title: "Table Tic-Tac-Toe", status: "Active", mode: "pvp" },
  };

  const [activeGameSubtab, setActiveGameSubtab] = useState("trivia");

  // New Question form state
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");

  // New Dare form state
  const [newDareText, setNewDareText] = useState("");
  const [newDareColor, setNewDareColor] = useState(COLOR_PRESETS[0]);

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      toast.error("Please enter a question");
      return;
    }
    const cleanOptions = newOptions.map((o) => o.trim());
    if (cleanOptions.some((o) => !o)) {
      toast.error("Please fill in all 4 answer options");
      return;
    }

    addTriviaQuestion({
      question: newQuestionText.trim(),
      options: cleanOptions,
      correctIndex: Number(newCorrectIndex),
      explanation: newExplanation.trim() || "Great knowledge!",
    });

    setNewQuestionText("");
    setNewOptions(["", "", "", ""]);
    setNewCorrectIndex(0);
    setNewExplanation("");
  };

  const handleCreateDare = (e) => {
    e.preventDefault();
    if (!newDareText.trim()) {
      toast.error("Please enter a dare challenge");
      return;
    }
    addDare(newDareText.trim(), newDareColor);
    setNewDareText("");
  };

  return (
    <div className="bg-surface rounded-xl border border-theme p-5 space-y-6">
      {/* Header & Master Feature Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <Gamepad2 size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme">
              Table Games & Entertainment Handler
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Manage interactive multiplayer games shown to dining customers while food is prepared.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetDefaultGames}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-secondary hover:text-theme bg-surface-soft border border-theme flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to default questions & dares"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => toggleTableGamesMaster()}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
              games.enabled
                ? "bg-green-600 border-green-700 text-white hover:bg-green-700"
                : "bg-surface-soft border-theme text-secondary hover:bg-gray-200"
            }`}
          >
            {games.enabled ? "Games Hub Active" : "Games Hub Paused"}
          </button>
        </div>
      </div>

      {/* Subtab Switcher for 3 Games */}
      <div className="flex items-center gap-2 border-b border-theme pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveGameSubtab("trivia")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeGameSubtab === "trivia"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              : "text-secondary hover:text-theme hover:bg-surface-soft"
          }`}
        >
          <Trophy size={15} />
          <span>Foodie Trivia</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 font-bold">
            {(games.trivia?.questions || []).length} Qs
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGameSubtab("dareSpin")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeGameSubtab === "dareSpin"
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
              : "text-secondary hover:text-theme hover:bg-surface-soft"
          }`}
        >
          <Flame size={15} />
          <span>Dare & Spin Wheel</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 font-bold">
            {(games.dareSpin?.dares || []).length} Dares
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGameSubtab("ticTacToe")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeGameSubtab === "ticTacToe"
              ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
              : "text-secondary hover:text-theme hover:bg-surface-soft"
          }`}
        >
          <Dices size={15} />
          <span>Table Tic-Tac-Toe</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 font-bold">
            {games.ticTacToe?.mode === "bot" ? "vs Bot" : "Pass & Play"}
          </span>
        </button>
      </div>

      {/* ─── TAB 1: FOODIE TRIVIA SHOWDOWN ────────────────────────────────────────── */}
      {activeGameSubtab === "trivia" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl border border-theme bg-surface-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-theme">
                  Foodie Trivia Showdown
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {games.trivia?.status || "Active"}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Multiplayer quiz battle covering world cuisines, ingredients, and fun culinary facts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Select */}
              <select
                value={games.trivia?.status || "Active"}
                onChange={(e) => updateGameField("trivia", "status", e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-theme bg-surface text-theme font-medium focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {/* Timer selector */}
              <div className="flex items-center gap-1.5 bg-surface border border-theme px-2.5 py-1.5 rounded-lg text-xs text-theme">
                <Clock size={13} className="text-secondary" />
                <select
                  value={games.trivia?.timerSeconds || 15}
                  onChange={(e) => updateGameField("trivia", "timerSeconds", Number(e.target.value))}
                  className="bg-transparent text-xs text-theme font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={10}>10s / Question</option>
                  <option value={15}>15s / Question</option>
                  <option value={20}>20s / Question</option>
                  <option value={30}>30s / Question</option>
                </select>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => toggleGameEnabled("trivia")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  games.trivia?.enabled
                    ? "bg-green-600 border-green-700 text-white"
                    : "bg-surface border-theme text-secondary"
                }`}
              >
                {games.trivia?.enabled ? "Game Enabled" : "Game Disabled"}
              </button>
            </div>
          </div>

          {/* Add Question Form */}
          <div className="p-4 rounded-xl border border-theme bg-surface space-y-3">
            <h5 className="text-xs font-bold text-theme uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              Add Custom Trivia Question
            </h5>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Question (e.g. Which country is the birthplace of Croissants?)..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface-soft text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={newCorrectIndex === idx}
                      onChange={() => setNewCorrectIndex(idx)}
                      className="cursor-pointer"
                      title="Select as correct answer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newOptions];
                        copy[idx] = e.target.value;
                        setNewOptions(copy);
                      }}
                      placeholder={`Option ${idx + 1}${newCorrectIndex === idx ? " (Correct Answer)" : ""}`}
                      className={`flex-1 px-3 py-1.5 text-xs rounded-lg border text-theme focus:outline-none ${
                        newCorrectIndex === idx
                          ? "border-green-500 bg-green-50/30 dark:bg-green-950/20"
                          : "border-theme bg-surface-soft"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Fun Fact / Explanation revealed after answering..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-theme bg-surface-soft text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
                />
                <Button variant="primary" size="sm" icon={Plus} type="submit">
                  Save Question
                </Button>
              </div>
            </form>
          </div>

          {/* Questions List */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-secondary uppercase tracking-wider">
              Configured Trivia Questions ({(games.trivia?.questions || []).length})
            </h5>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {(games.trivia?.questions || []).map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-xl border border-theme bg-surface-soft flex items-start justify-between gap-3 hover:border-theme-hover transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-primary shrink-0">
                        Q{idx + 1}.
                      </span>
                      <p className="text-xs font-bold text-theme leading-snug">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pl-5">
                      {(q.options || []).map((opt, oIdx) => (
                        <span
                          key={oIdx}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                            oIdx === q.correctIndex
                              ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border-green-300"
                              : "bg-surface border-theme text-secondary"
                          }`}
                        >
                          {opt} {oIdx === q.correctIndex && "✓"}
                        </span>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-secondary pl-5 italic">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTriviaQuestion(q.id)}
                    className="p-1.5 text-secondary hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0 cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TABLE DARE & SPIN ────────────────────────────────────────────── */}
      {activeGameSubtab === "dareSpin" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl border border-theme bg-surface-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-theme">
                  Table Dare & Spin Wheel
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                  {games.dareSpin?.status || "Active"}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Interactive spinning wheel for lighthearted table dares, food critic challenges, and photo prompts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Select */}
              <select
                value={games.dareSpin?.status || "Active"}
                onChange={(e) => updateGameField("dareSpin", "status", e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-theme bg-surface text-theme font-medium focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => toggleGameEnabled("dareSpin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  games.dareSpin?.enabled
                    ? "bg-green-600 border-green-700 text-white"
                    : "bg-surface border-theme text-secondary"
                }`}
              >
                {games.dareSpin?.enabled ? "Game Enabled" : "Game Disabled"}
              </button>
            </div>
          </div>

          {/* Add Dare Form */}
          <div className="p-4 rounded-xl border border-theme bg-surface space-y-3">
            <h5 className="text-xs font-bold text-theme uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              Add Custom Dinner Dare
            </h5>

            <form onSubmit={handleCreateDare} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newDareText}
                onChange={(e) => setNewDareText(e.target.value)}
                placeholder="Type challenge (e.g. Compliment the chef, tell your favorite food memory)..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-theme bg-surface-soft text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
              />

              {/* Color Presets */}
              <div className="flex items-center gap-1.5 px-2 bg-surface-soft rounded-lg border border-theme">
                <Palette size={14} className="text-secondary" />
                {COLOR_PRESETS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewDareColor(col)}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                      newDareColor === col ? "scale-125 ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>

              <Button variant="primary" size="sm" icon={Plus} type="submit">
                Add to Wheel
              </Button>
            </form>
          </div>

          {/* Dares List */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-secondary uppercase tracking-wider">
              Wheel Challenge Segments ({(games.dareSpin?.dares || []).length})
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(games.dareSpin?.dares || []).map((dare, idx) => (
                <div
                  key={dare.id || idx}
                  className="p-3 rounded-xl border border-theme bg-surface-soft flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: dare.color || "#EF4444" }}
                    />
                    <p className="text-xs font-medium text-theme line-clamp-2">
                      {dare.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDare(dare.id)}
                    className="p-1.5 text-secondary hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0 cursor-pointer"
                    title="Delete dare"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: TABLE TIC-TAC-TOE ────────────────────────────────────────────── */}
      {activeGameSubtab === "ticTacToe" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl border border-theme bg-surface-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-theme">
                  Table Tic-Tac-Toe
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  {games.ticTacToe?.status || "Active"}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Food-themed 3x3 showdown (Pizza 🍕 vs Burger 🍔) for quick rounds between courses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Select */}
              <select
                value={games.ticTacToe?.status || "Active"}
                onChange={(e) => updateGameField("ticTacToe", "status", e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-theme bg-surface text-theme font-medium focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => toggleGameEnabled("ticTacToe")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  games.ticTacToe?.enabled
                    ? "bg-green-600 border-green-700 text-white"
                    : "bg-surface border-theme text-secondary"
                }`}
              >
                {games.ticTacToe?.enabled ? "Game Enabled" : "Game Disabled"}
              </button>
            </div>
          </div>

          {/* Gameplay Mode Selection */}
          <div className="p-4 rounded-xl border border-theme bg-surface space-y-3">
            <h5 className="text-xs font-bold text-theme uppercase tracking-wider">
              Default Table Match Mode
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => updateGameField("ticTacToe", "mode", "pvp")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  games.ticTacToe?.mode === "pvp"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-theme bg-surface-soft hover:border-theme-hover"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-theme">
                      Pass &amp; Play (2 Table Mates)
                    </h6>
                    <p className="text-[11px] text-secondary">
                      Players pass the phone back and forth on their table.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => updateGameField("ticTacToe", "mode", "bot")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  games.ticTacToe?.mode === "bot"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-theme bg-surface-soft hover:border-theme-hover"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-theme">
                      Play vs Chef Bot (AI)
                    </h6>
                    <p className="text-[11px] text-secondary">
                      Solo diner can play against our automated restaurant Chef Bot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-xl border border-dashed border-theme bg-surface-soft text-center space-y-2">
            <span className="text-2xl">🍕 vs 🍔</span>
            <p className="text-xs font-bold text-theme">
              Full interactive Tic-Tac-Toe engine is ready in the customer portal!
            </p>
            <p className="text-[11px] text-secondary max-w-md mx-auto">
              Customers can instantly switch between 2-player Pass &amp; Play and Chef Bot directly during their game.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
