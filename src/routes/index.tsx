import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle2,
  Clock,
  Moon,
  Pencil,
  Plus,
  Search,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import {
  SOUNDS,
  STORAGE,
  formatTime,
  loadJSON,
  notify,
  nowKey,
  playSound,
  saveJSON,
  type Profession,
  type SoundKey,
  type Task,
  type UserDetails,
} from "@/lib/tracker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Activity Tracker — Plan, Remind, Complete" },
      {
        name: "description",
        content:
          "Track your daily activities with timed reminders, sound alerts, notifications, filters and light or dark themes.",
      },
      { property: "og:title", content: "Daily Activity Tracker" },
      {
        property: "og:description",
        content: "Plan your day, get sound and push reminders, and track completion in one clean app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Filter = "all" | "completed" | "pending";

function Index() {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [sound, setSound] = useState<SoundKey>("chime");
  const [editingId, setEditingId] = useState<string | null>(null);
  const tasksRef = useRef<Task[]>([]);

  useEffect(() => {
    setUser(loadJSON<UserDetails | null>(STORAGE.user, null));
    setTasks(loadJSON<Task[]>(STORAGE.tasks, []));
    setDark(loadJSON<boolean>(STORAGE.theme, false));
    setReady(true);
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveJSON(STORAGE.tasks, tasks);
    tasksRef.current = tasks;
  }, [tasks, ready]);

  useEffect(() => {
    if (!ready) return;
    saveJSON(STORAGE.theme, dark);
    document.documentElement.classList.toggle("dark", dark);
  }, [dark, ready]);

  useEffect(() => {
    const tick = () => {
      const { day, hhmm } = nowKey();
      const stamp = `${day} ${hhmm}`;
      const due = tasksRef.current.filter((t) => !t.done && t.time === hhmm && t.notifiedOn !== stamp);
      if (due.length === 0) return;
      due.forEach((t) => {
        playSound(t.sound);
        notify("⏰ Task due now", `${t.name} · ${formatTime(t.time)}`);
      });
      setTasks((prev) =>
        prev.map((t) => (due.some((d) => d.id === t.id) ? { ...t, notifiedOn: stamp } : t)),
      );
    };
    const id = window.setInterval(tick, 10000);
    return () => window.clearInterval(id);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (filter === "completed") return t.done;
      if (filter === "pending") return !t.done;
      return true;
    });
  }, [tasks, query, filter]);

  const completed = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !time) return;
    if (editingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, name: trimmed, time, sound, notifiedOn: undefined } : t)),
      );
      setEditingId(null);
    } else {
      setTasks((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: trimmed, time, sound, done: false },
      ]);
    }
    setName("");
    setTime("");
  };

  const startEdit = (t: Task) => {
    setEditingId(t.id);
    setName(t.name);
    setTime(t.time);
    setSound(t.sound);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-surface pb-16">
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 sm:pt-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              {user?.name ? `Welcome, ${user.name}! 👋 ` : ""}Daily Activity Tracker
            </h1>
            {user && (
              <p className="mt-1 text-sm text-muted-foreground">
                {user.profession} · {user.qualification} · {user.age} yrs
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="btn-slate inline-flex items-center gap-2"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {dark ? "Light" : "Dark"}
          </button>
        </header>

        <section className="card mt-6 p-4 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="field pl-9"
              aria-label="Search tasks"
            />
          </div>

          <form onSubmit={submitTask} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Task name"
              className="field"
              aria-label="Task name"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="field sm:w-32"
              aria-label="Due time"
            />
            <select
              value={sound}
              onChange={(e) => setSound(e.target.value as SoundKey)}
              className="field sm:w-32"
              aria-label="Reminder sound"
            >
              {SOUNDS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-success inline-flex items-center justify-center gap-2">
              {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {editingId ? "Save" : "Add"}
            </button>
          </form>
          {editingId && (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEditingId(null);
                setName("");
                setTime("");
              }}
            >
              <X className="size-3" /> Cancel edit
            </button>
          )}
        </section>

        <section className="card mt-4 p-4 sm:p-5">
          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              Completed: {completed} / {tasks.length}
            </span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["all", "completed", "pending"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={filter === f ? "btn-info" : "btn-info-outline"}
              >
                {f[0]!.toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span className="grow" />
            <button
              type="button"
              className="btn-neutral"
              onClick={() => setTasks((prev) => prev.filter((t) => !t.done))}
            >
              Clear Completed
            </button>
            <button
              type="button"
              className="btn-purple"
              onClick={() =>
                setTasks((prev) => prev.map((t) => ({ ...t, done: false, notifiedOn: undefined })))
              }
            >
              Reset for Today
            </button>
          </div>
        </section>

        <ul className="mt-4 space-y-2">
          {visible.map((t) => (
            <li key={t.id} className="card flex flex-wrap items-center gap-3 p-3 sm:p-4">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() =>
                  setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
                }
                className="size-5 shrink-0 accent-[var(--success)]"
                aria-label={`Mark ${t.name} complete`}
              />
              <span
                className={`min-w-0 grow truncate text-sm font-medium ${
                  t.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {t.name}
              </span>
              <span className="badge-time inline-flex items-center gap-1">
                <Clock className="size-3" />
                {formatTime(t.time)}
              </span>
              <button type="button" className="btn-warning" onClick={() => startEdit(t)}>
                <Pencil className="size-3.5" />
                <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => setTasks((prev) => prev.filter((x) => x.id !== t.id))}
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="card p-10 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-3 size-6 opacity-50" />
              No tasks here yet. Add your first activity above.
            </li>
          )}
        </ul>
      </div>

      {ready && !user && <Onboarding onSave={(u) => { setUser(u); saveJSON(STORAGE.user, u); }} />}
    </main>
  );
}

function Onboarding({ onSave }: { onSave: (u: UserDetails) => void }) {
  const [form, setForm] = useState<UserDetails>({
    name: "",
    age: "",
    profession: "Student",
    qualification: "",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          onSave({ ...form, name: form.name.trim() });
        }}
        className="card w-full max-w-md p-6"
      >
        <h2 className="text-lg font-bold text-foreground">Let&apos;s set you up</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A few details so your tracker feels like yours.
        </p>
        <div className="mt-5 space-y-3">
          <input
            className="field"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-label="Name"
            required
          />
          <input
            className="field"
            type="number"
            min={1}
            max={120}
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            aria-label="Age"
          />
          <select
            className="field"
            value={form.profession}
            onChange={(e) => setForm({ ...form, profession: e.target.value as Profession })}
            aria-label="Profession or role"
          >
            {["Student", "Job/Employee", "Business", "Other"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            className="field"
            placeholder="Qualification"
            value={form.qualification}
            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            aria-label="Qualification"
          />
        </div>
        <button type="submit" className="btn-success mt-5 w-full">
          Start tracking
        </button>
      </form>
    </div>
  );
}
