export type Profession = "Student" | "Job/Employee" | "Business" | "Other";

export type UserDetails = {
  name: string;
  age: string;
  profession: Profession;
  qualification: string;
};

export type SoundKey = "chime" | "alarm" | "beep" | "ding";

export type Task = {
  id: string;
  name: string;
  time: string; // HH:MM
  sound: SoundKey;
  done: boolean;
  notifiedOn?: string; // YYYY-MM-DD HH:MM already fired
};

export const SOUNDS: { key: SoundKey; label: string }[] = [
  { key: "chime", label: "Chime" },
  { key: "alarm", label: "Alarm" },
  { key: "beep", label: "Beep" },
  { key: "ding", label: "Ding" },
];

export const STORAGE = {
  user: "dat.user",
  tasks: "dat.tasks",
  theme: "dat.theme",
};

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

const RECIPES: Record<SoundKey, { freq: number; type: OscillatorType; beats: number; gap: number; dur: number }> = {
  chime: { freq: 880, type: "sine", beats: 3, gap: 0.25, dur: 0.35 },
  alarm: { freq: 620, type: "square", beats: 6, gap: 0.18, dur: 0.14 },
  beep: { freq: 1040, type: "triangle", beats: 2, gap: 0.2, dur: 0.12 },
  ding: { freq: 1320, type: "sine", beats: 1, gap: 0, dur: 0.9 },
};

export function playSound(key: SoundKey) {
  const ac = ctx();
  if (!ac) return;
  const r = RECIPES[key] ?? RECIPES.chime;
  for (let i = 0; i < r.beats; i++) {
    const start = ac.currentTime + i * (r.dur + r.gap);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = r.type;
    osc.frequency.setValueAtTime(r.freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + r.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + r.dur + 0.02);
  }
}

export function notify(title: string, body: string) {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
      return;
    } catch {
      /* fall through */
    }
  }
  window.alert(`${title}\n${body}`);
}

export function formatTime(hhmm: string) {
  const parts = hhmm.split(":").map(Number);
  const h = parts[0] ?? NaN;
  const m = parts[1] ?? NaN;
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function nowKey() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    day: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    hhmm: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}
