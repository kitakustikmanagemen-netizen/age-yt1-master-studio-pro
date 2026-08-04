import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Monitor, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Youtube, 
  Search, 
  AlertCircle, 
  FileText, 
  RefreshCw,
  Clock,
  Eye,
  BookOpen,
  Flame,
  Globe,
  Plus,
  Volume2,
  Wand2,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Expand,
  Upload,
  Trash2,
  Layers,
  Edit3,
  User,
  Library,
  Compass,
  Wifi,
  Crown,
  Users,
  UserCheck,
  Maximize2,
  Trophy,
  BarChart2,
  Palette,
  Type,
  Sticker,
  Tag,
  Radio,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Image as LucideImage,
  X,
  KeyRound
} from 'lucide-react';

export interface FaceReference {
  id: string;
  dataUrl: string;
  role: 'main' | 'supporting' | 'extra';
  gender: 'male' | 'female';
  label: string;
  slotIndex: number;
}

export interface SlotConfig {
  slotIndex: number;
  role: 'main' | 'supporting' | 'extra';
  label: string;
  badge: string;
  iconName: string;
  colorTheme: string;
}

export interface StylePreset {
  id: 'stickman' | 'cyberpunk' | 'pixar' | 'cinematic' | 'vector';
  label: string;
  icon: string;
  badge: string;
  promptGuide: string;
  negativePrompt: string;
}

export interface ThumbnailVariant {
  id: 'variant-a' | 'variant-b' | 'variant-c';
  title: string;
  conceptType: 'Shock Curiosity' | 'Minimalist Story Arc' | 'High-Stakes Action';
  badge: string;
  prompt: string;
  overlayText: string;
  imageUrl: string;
  isLoading: boolean;
  ctrScore: number;
  estimatedCtrRange: string;
  evalBreakdown: {
    faceProminence: number;
    textReadability: number;
    curiosityGap: number;
    colorPop: number;
  };
  critique: string;
}

export interface ChapterTimecode {
  timecode: string;
  title: string;
}

export interface SeoMetadataState {
  viralTitles: string[];
  selectedTitle: string;
  description: string;
  chapters: ChapterTimecode[];
  multilingualTags: string[];
  primaryKeywords: string[];
  hashtags: string[];
}

export interface NetworkSpeedState {
  downlink: number;
  rtt: number;
  effectiveType: string;
}

export type ApiProvider = 'gemini' | 'openrouter' | 'groq';

export interface StoredApiKey {
  id: string;
  label: string;
  key: string;
  active: boolean;
  provider: ApiProvider;
  model?: string;
}

export const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="%234f46e5" stroke="%23818cf8" stroke-width="3"/><circle cx="50" cy="42" r="13" fill="%23ffffff" stroke="%231f2937" stroke-width="2.5"/><circle cx="46" cy="40" r="2" fill="%231f2937"/><circle cx="54" cy="40" r="2" fill="%231f2937"/><path d="M 46,47 Q 50,51 54,47" stroke="%231f2937" stroke-width="2" fill="none"/><line x1="50" y1="55" x2="50" y2="76" stroke="%23ffffff" stroke-width="3"/><line x1="50" y1="62" x2="34" y2="55" stroke="%23ffffff" stroke-width="2.5"/><line x1="50" y1="62" x2="66" y2="55" stroke="%23ffffff" stroke-width="2.5"/><line x1="50" y1="76" x2="38" y2="90" stroke="%23ffffff" stroke-width="2.5"/><line x1="50" y1="76" x2="62" y2="90" stroke="%23ffffff" stroke-width="2.5"/><polygon points="50,15 44,23 56,23" fill="%23fbbf24" stroke="%231f2937" stroke-width="1.5"/></svg>`;

// === BYOK (Bring Your Own Key) — Manajemen Multi-API-Key Milik Pengguna ===
// Semua key disimpan HANYA di localStorage browser pengguna, tidak pernah dikirim ke server developer.
const API_KEYS_STORAGE_KEY = 'age_yt_user_api_keys';
const KEY_USAGE_STORAGE_KEY = 'age_yt_key_usage_daily';
const ONBOARDING_SEEN_STORAGE_KEY = 'age_yt_onboarding_seen';

interface KeyUsageRecord {
  date: string;
  count: number;
}

const getTodayDateStr = (): string => new Date().toISOString().slice(0, 10);

const getKeyUsageMap = (): Record<string, KeyUsageRecord> => {
  try {
    const raw = localStorage.getItem(KEY_USAGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const recordKeyUsage = (keyId: string): void => {
  try {
    const usage = getKeyUsageMap();
    const today = getTodayDateStr();
    const existing = usage[keyId];
    usage[keyId] = existing && existing.date === today
      ? { date: today, count: existing.count + 1 }
      : { date: today, count: 1 };
    localStorage.setItem(KEY_USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch (e) {
    // Diamkan — pencatatan kuota bersifat pelengkap, tidak boleh mengganggu fitur utama.
  }
};

export const getKeyUsageCount = (keyId: string): number => {
  const usage = getKeyUsageMap();
  const today = getTodayDateStr();
  const rec = usage[keyId];
  return rec && rec.date === today ? rec.count : 0;
};

export const hasSeenOnboarding = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_SEEN_STORAGE_KEY) === '1';
  } catch (e) {
    return true;
  }
};

export const markOnboardingSeen = (): void => {
  try {
    localStorage.setItem(ONBOARDING_SEEN_STORAGE_KEY, '1');
  } catch (e) {
    // no-op
  }
};

export const getStoredApiKeys = (): StoredApiKey[] => {
  try {
    const raw = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Normalisasi key lama (dari Tahap 3) yang belum punya field provider — anggap Gemini.
    return parsed.map((k: any) => ({
      id: k.id,
      label: k.label,
      key: k.key,
      active: !!k.active,
      provider: (k.provider === 'openrouter' || k.provider === 'groq' || k.provider === 'gemini') ? k.provider : 'gemini',
      model: typeof k.model === 'string' ? k.model : undefined
    }));
  } catch (e) {
    return [];
  }
};

export const saveStoredApiKeys = (keys: StoredApiKey[]): void => {
  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch (e) {
    console.error('Gagal menyimpan API key ke localStorage', e);
  }
};

export const addApiKey = (label: string, key: string, provider: ApiProvider = 'gemini', model?: string): StoredApiKey[] => {
  const keys = getStoredApiKeys();
  const trimmedKey = key.trim();
  const newEntry: StoredApiKey = {
    id: `key_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    label: label.trim() || `API Key ${keys.length + 1}`,
    key: trimmedKey,
    active: true,
    provider,
    model: model?.trim() || undefined
  };
  const updated = [...keys, newEntry];
  saveStoredApiKeys(updated);
  return updated;
};

export const removeApiKey = (id: string): StoredApiKey[] => {
  const updated = getStoredApiKeys().filter(k => k.id !== id);
  saveStoredApiKeys(updated);
  return updated;
};

export const toggleApiKeyActive = (id: string): StoredApiKey[] => {
  const updated = getStoredApiKeys().map(k => (k.id === id ? { ...k, active: !k.active } : k));
  saveStoredApiKeys(updated);
  return updated;
};

export const getActiveApiKeys = (): string[] => {
  return getActiveKeysByProvider('gemini').map(k => k.key.trim());
};

export const getActiveKeysByProvider = (provider: ApiProvider): StoredApiKey[] => {
  return getStoredApiKeys().filter(k => k.active && k.provider === provider && k.key && k.key.trim().length > 0);
};

export class NoApiKeyError extends Error {
  constructor() {
    super('Belum ada API Key yang terpasang. Buka menu Pengaturan API Key untuk menambahkan key Anda terlebih dahulu.');
    this.name = 'NoApiKeyError';
  }
}

export class AllApiKeysExhaustedError extends Error {
  constructor(detail?: string) {
    super('Semua API Key yang terpasang sudah mencapai batas kuota atau tidak valid. Tambahkan key baru, aktifkan key lain, atau tunggu beberapa saat lalu coba lagi.' + (detail ? ` (Detail: ${detail})` : ''));
    this.name = 'AllApiKeysExhaustedError';
  }
}

const isQuotaOrKeyError = (error: any): boolean => {
  const msg = (error?.message || '').toString().toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('api key not valid') ||
    msg.includes('permission_denied') ||
    msg.includes('403')
  );
};

// Mencoba tiap API key Gemini aktif milik user secara berurutan (failover) sampai salah satu berhasil.
export const fetchWithKeyFailover = async (buildUrl: (key: string) => string, options: any): Promise<any> => {
  const activeKeys = getActiveKeysByProvider('gemini');
  if (activeKeys.length === 0) {
    throw new NoApiKeyError();
  }

  let lastError: any = null;
  for (const storedKey of activeKeys) {
    try {
      const url = buildUrl(storedKey.key.trim());
      // retries=0: satu key hanya dicoba SEKALI. Kalau gagal karena kuota/rate-limit,
      // langsung pindah ke key berikutnya (failover) alih-alih retry di key yang sama —
      // retry di key yang sama untuk error 429 hanya memboroskan jatah RPM yang sudah ketat.
      const result = await fetchWithRetry(url, options, 0, 800);
      recordKeyUsage(storedKey.id);
      return result;
    } catch (error) {
      recordKeyUsage(storedKey.id);
      lastError = error;
      if (!isQuotaOrKeyError(error)) {
        // Error selain kuota/key (mis. prompt ditolak) — tetap lempar langsung, tidak perlu ganti key.
        throw error;
      }
      continue;
    }
  }
  throw new AllApiKeysExhaustedError(lastError?.message);
};

// === Provider Fallback Gratis (Tahap 4) ===
// OpenRouter & Groq: endpoint OpenAI-compatible, dipakai sebagai fallback TEKS ketika semua key Gemini habis/tidak ada.
const OPENAI_COMPATIBLE_ENDPOINT: Record<'openrouter' | 'groq', string> = {
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions'
};

// Model default yang stabil untuk tiap provider fallback. Pengguna tetap bisa override lewat field "model" opsional.
const DEFAULT_FALLBACK_MODEL: Record<'openrouter' | 'groq', string> = {
  openrouter: 'openrouter/free', // auto-router bawaan OpenRouter, otomatis pilih model gratis yang tersedia hari itu
  groq: 'llama-3.3-70b-versatile'
};

const callOpenAiCompatibleText = async (storedKey: StoredApiKey, promptText: string, isJson: boolean): Promise<string> => {
  const provider = storedKey.provider as 'openrouter' | 'groq';
  const endpoint = OPENAI_COMPATIBLE_ENDPOINT[provider];
  const model = storedKey.model?.trim() || DEFAULT_FALLBACK_MODEL[provider];
  const finalPrompt = isJson
    ? `${promptText}\n\nPENTING: Balas HANYA dengan JSON valid sesuai skema di atas, tanpa penjelasan, tanpa markdown, tanpa teks tambahan apa pun.`
    : promptText;

  const payload = {
    model,
    messages: [{ role: 'user', content: finalPrompt }]
  };

  const data = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storedKey.key.trim()}`
    },
    body: JSON.stringify(payload)
  }, 0, 800);

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Provider fallback (${provider}) tidak mengembalikan konten teks yang valid.`);
  return content;
};

// Pollinations.ai: fallback GRATIS TANPA API KEY untuk generate gambar dari teks saja (tidak mendukung referensi wajah/gambar).
const POLLINATIONS_DIMENSIONS: Record<'16:9' | '9:16', { width: number; height: number }> = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const generateImageViaPollinations = async (promptText: string, aspectRatio: '16:9' | '9:16') => {
  if (!promptText || !promptText.trim()) {
    throw new Error('Prompt teks kosong, tidak bisa memakai fallback Pollinations.ai.');
  }
  const { width, height } = POLLINATIONS_DIMENSIONS[aspectRatio] || POLLINATIONS_DIMENSIONS['16:9'];
  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fallback Pollinations.ai gagal (HTTP ${response.status}).`);
  }
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);

  // Dikembalikan dalam bentuk yang identik dengan respons Gemini, supaya pemanggil tidak perlu diubah.
  return {
    candidates: [{ content: { parts: [{ inlineData: { mimeType: blob.type || 'image/jpeg', data: base64 } }] } }],
    _fallbackProvider: 'pollinations'
  };
};

export const AUTOMATIC_NEGATIVE_PROMPT = "text, watermark, deformed, ugly, bad anatomy, extra limbs, extra fingers, missing fingers, poorly drawn face, mutation, blurred, out of focus, duplicate.";

export const FACE_SLOTS: SlotConfig[] = [
  { slotIndex: 0, role: 'main', label: '👑 Karakter Utama', badge: 'Main Protagonist', iconName: 'Crown', colorTheme: 'amber' },
  { slotIndex: 1, role: 'supporting', label: '🎭 Pendukung 1', badge: 'Secondary Role 1', iconName: 'Users', colorTheme: 'indigo' },
  { slotIndex: 2, role: 'supporting', label: '🎭 Pendukung 2', badge: 'Secondary Role 2', iconName: 'Users', colorTheme: 'indigo' },
  { slotIndex: 3, role: 'extra', label: '👥 Figuran 1', badge: 'Background Extra 1', iconName: 'UserCheck', colorTheme: 'purple' },
  { slotIndex: 4, role: 'extra', label: '👥 Figuran 2', badge: 'Background Extra 2', iconName: 'UserCheck', colorTheme: 'purple' },
  { slotIndex: 5, role: 'extra', label: '👥 Figuran 3', badge: 'Background Extra 3', iconName: 'UserCheck', colorTheme: 'purple' },
];

export const VISUAL_STYLES: StylePreset[] = [
  {
    id: 'stickman',
    label: 'Stickman 2D Doodle',
    icon: '✏️',
    badge: 'Doodle Preserved',
    promptGuide: 'A Main Character featuring a white circular head with thick messy black outlines, tiny circular black eyes, a small simple mouth, and a thin stickman body with simple line arms and legs in cartoon proportions, maintaining a non-realistic hand-drawn doodle style. Minimalist cartoon, simple 2D cartoon, hand drawn doodle, flat colors, bright colorful illustration, clean composition, flat background.',
    negativePrompt: AUTOMATIC_NEGATIVE_PROMPT
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk Neon',
    icon: '🦾',
    badge: 'Futuristic Sci-Fi',
    promptGuide: 'High-tech cyberpunk aesthetic, vibrant neon lighting, dark moody atmosphere, futuristic city elements, reflective rain-slick surfaces, holographic HUD displays, glowing cyan and magenta accents, ultra-detailed sci-fi concept art style.',
    negativePrompt: AUTOMATIC_NEGATIVE_PROMPT
  },
  {
    id: 'pixar',
    label: '3D Pixar Studio',
    icon: '🎨',
    badge: '3D Animation',
    promptGuide: 'Charming 3D animation studio character style, soft volumetric cinematic studio lighting, expressive character features, polished 3D render, subsurface scattering skin tones, vibrant rich color palette, subtle depth of field.',
    negativePrompt: AUTOMATIC_NEGATIVE_PROMPT
  },
  {
    id: 'cinematic',
    label: 'Photorealistic Film',
    icon: '📸',
    badge: 'Hyper Realistic',
    promptGuide: 'Photorealistic cinematic film screenshot, shot on 35mm lens, atmospheric movie lighting, ultra-realistic textures, natural skin details, volumetric fog, high dynamic range, master photography grade color science.',
    negativePrompt: AUTOMATIC_NEGATIVE_PROMPT
  },
  {
    id: 'vector',
    label: 'Flat Vector Art',
    icon: '📐',
    badge: 'Modern Graphic',
    promptGuide: 'Clean modern flat vector illustration, sharp crisp geometric shapes, minimalist graphic background, bold harmonious color palette, commercial design style, clear bold visual focal point.',
    negativePrompt: AUTOMATIC_NEGATIVE_PROMPT
  }
];

export const STEPS_LIST = [
  { step: 1, label: 'Topik & Riset', icon: Flame, desc: 'Find Trending Niche' },
  { step: 2, label: 'Skrip & Karakter', icon: BookOpen, desc: 'Script & 6-Face Slots' },
  { step: 3, label: 'Storyboard Scene', icon: Sparkles, desc: 'AI Scene Prompts & Flow' },
  { step: 4, label: 'Thumbnail Studio', icon: Eye, desc: 'A/B Test & Canvas Editor' },
  { step: 5, label: 'SEO & Meta Tags', icon: Globe, desc: 'Titles, Chapters & Tags' },
  { step: 6, label: 'Ekspor Blueprint', icon: PackageCheck, desc: 'ZIP Asset Package' }
];

export const getUrl = (modelPath: string, key: string) => {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelPath}?key=${key}`;
};

export const extractAndParseJson = (text: string) => {
  if (!text) return null;
  
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Resilient fallback parser
  }

  const sanitizeJsonString = (str: string) => {
    return str
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
        if (match === '\n' || match === '\r' || match === '\t') return match;
        return '';
      });
  };

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  let startIdx = -1;
  let isObject = true;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    isObject = true;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    isObject = false;
  }

  if (startIdx !== -1) {
    const closeChar = isObject ? '}' : ']';
    let lastIdx = cleaned.lastIndexOf(closeChar);

    while (lastIdx > startIdx) {
      const candidate = cleaned.substring(startIdx, lastIdx + 1);
      try {
        return JSON.parse(candidate);
      } catch (e1) {
        try {
          return JSON.parse(sanitizeJsonString(candidate));
        } catch (e2) {
          lastIdx = cleaned.lastIndexOf(closeChar, lastIdx - 1);
        }
      }
    }
  }

  throw new Error("Gagal mengurai format JSON dari AI. Silakan coba kembali.");
};

export const fetchWithRetry = async (url: string, options: any, retries = 5, delay = 1000): Promise<any> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `HTTP Error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const callGemini = async (promptText: string, isJson = false, tools: any[] = []) => {
  const payload: any = {
    contents: [{ parts: [{ text: promptText }] }],
    systemInstruction: {
      parts: [{
        text: "Anda adalah AGE YT#1 Master Core Engine v2.5. Tugas Anda adalah merespons dengan kreativitas super tinggi, menyusun analisis tren YouTube premium, dan mengembalikan data yang terstruktur rapi sesuai parameter."
      }]
    }
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  if (isJson) {
    payload.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };

  return await fetchWithKeyFailover((key) => getUrl('gemini-3.5-flash:generateContent', key), options);
};

// Stage 2 Abstraction Wrappers (diperluas Tahap 4 dengan fallback multi-provider)
export const generateText = async (promptText: string, options?: { isJson?: boolean; tools?: any[] }) => {
  const requiresGoogleSearch = !!(options?.tools && options.tools.length > 0);

  try {
    return await callGemini(promptText, options?.isJson ?? false, options?.tools ?? []);
  } catch (geminiError: any) {
    // Fitur pencarian real-time (Google Search grounding) hanya didukung Gemini — jangan fallback diam-diam ke provider lain untuk kasus ini.
    if (requiresGoogleSearch) {
      throw geminiError;
    }
    if (!(geminiError instanceof NoApiKeyError) && !(geminiError instanceof AllApiKeysExhaustedError)) {
      throw geminiError;
    }

    const fallbackKeys = [...getActiveKeysByProvider('openrouter'), ...getActiveKeysByProvider('groq')];
    if (fallbackKeys.length === 0) {
      throw geminiError;
    }

    let lastFallbackError: any = null;
    for (const storedKey of fallbackKeys) {
      try {
        const content = await callOpenAiCompatibleText(storedKey, promptText, options?.isJson ?? false);
        recordKeyUsage(storedKey.id);
        return { candidates: [{ content: { parts: [{ text: content }] } }], _fallbackProvider: storedKey.provider };
      } catch (fallbackErr) {
        recordKeyUsage(storedKey.id);
        lastFallbackError = fallbackErr;
        continue;
      }
    }
    throw new AllApiKeysExhaustedError(lastFallbackError?.message || geminiError?.message);
  }
};

const hasImageReferenceParts = (parts: any[]): boolean => parts.some((p: any) => p && p.inlineData);

export const generateImage = async (parts: any[], aspectRatio: string = '16:9') => {
  const payload = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio }
    }
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };

  try {
    return await fetchWithKeyFailover((key) => getUrl('gemini-3.1-flash-image:generateContent', key), options);
  } catch (geminiError: any) {
    // Kalau generate ini butuh referensi wajah (image-to-image), Pollinations.ai TIDAK bisa mereproduksi wajah tersebut —
    // jangan fallback diam-diam karena hasilnya akan menyesatkan (wajah karakter hilang). Lempar error asli saja.
    if (hasImageReferenceParts(parts)) {
      throw geminiError;
    }
    if (!(geminiError instanceof NoApiKeyError) && !(geminiError instanceof AllApiKeysExhaustedError)) {
      throw geminiError;
    }

    try {
      const textPart = parts.find((p: any) => p && typeof p.text === 'string');
      const promptText = textPart?.text || '';
      const safeAspect: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
      return await generateImageViaPollinations(promptText, safeAspect);
    } catch (fallbackErr) {
      throw geminiError;
    }
  }
};

export const generateSpeech = async (promptText: string, voiceName: string = 'Kore') => {
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: { 
      responseModalities: ["AUDIO"], 
      speechConfig: { 
        voiceConfig: { 
          prebuiltVoiceConfig: { 
            voiceName 
          } 
        } 
      } 
    },
    model: "gemini-2.5-flash-preview-tts"
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
  return await fetchWithKeyFailover((key) => getUrl('gemini-2.5-flash-preview-tts:generateContent', key), options);
};

export const splitTextIntoTTSChunks = (text: string, maxLen = 400): string[] => {
  const sanitized = text
    .replace(/[\*\_\#\`\~\>]+/g, ' ')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) return [];
  if (sanitized.length <= maxLen) return [sanitized];

  const sentences = sanitized.match(/[^.!?]+[.!?]+|\S+/g) || [sanitized];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if ((currentChunk + ' ' + trimmedSentence).trim().length <= maxLen) {
      currentChunk = (currentChunk + ' ' + trimmedSentence).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (trimmedSentence.length > maxLen) {
        const words = trimmedSentence.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + ' ' + word).trim().length <= maxLen) {
            wordChunk = (wordChunk + ' ' + word).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
        else currentChunk = '';
      } else {
        currentChunk = trimmedSentence;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
};

export const convertPcmBytesToWavBlob = (bytes: Uint8Array, sampleRate = 24000) => {
  const len = bytes.length;
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  const writeString = (v: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, len, true);

  const dest = new Uint8Array(buffer, 44, len);
  dest.set(bytes);

  return new Blob([buffer], { type: 'audio/wav' });
};

export const loadJSZip = () => {
  return new Promise((resolve, reject) => {
    const win = window as any;
    if (win.JSZip) {
      resolve(win.JSZip);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve((window as any).JSZip);
    script.onerror = () => reject(new Error('Gagal memuat pustaka JSZip dari CDN.'));
    document.head.appendChild(script);
  });
};

export function useNetworkSpeed(): NetworkSpeedState {
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeedState>({
    downlink: 10.0,
    rtt: 25,
    effectiveType: '4g'
  });

  useEffect(() => {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      const updateMetrics = () => {
        setNetworkSpeed({
          downlink: typeof connection.downlink === 'number' ? connection.downlink : 10.0,
          rtt: typeof connection.rtt === 'number' ? connection.rtt : 25,
          effectiveType: connection.effectiveType || '4g'
        });
      };

      updateMetrics();
      if (connection.addEventListener) {
        connection.addEventListener('change', updateMetrics);
        return () => connection.removeEventListener('change', updateMetrics);
      }
    }
  }, []);

  return networkSpeed;
}

export const ProcessingOverlay: React.FC<{
  active: boolean;
  title: string;
  message: string;
}> = ({ active, title, message }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="p-8 rounded-3xl max-w-md w-full border text-center shadow-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          <img 
            src={LOGO_SVG} 
            alt="AGE YT#1 Master Process Logo" 
            className="w-20 h-20 rounded-full object-cover shadow-lg border border-indigo-500/20"
          />
        </div>
        <h4 className="text-lg font-extrabold tracking-tight mb-2 text-zinc-100">{title}</h4>
        <p className="text-xs leading-relaxed text-zinc-400">{message}</p>
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-indigo-500 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Memproses dengan AI...</span>
        </div>
      </div>
    </div>
  );
};

export const ResetModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="p-6 rounded-2xl max-w-sm w-full border text-center shadow-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
        <HelpCircle className="h-10 w-10 text-indigo-500 mx-auto mb-3" />
        <h4 className="text-base font-bold">Mulai Proyek Baru?</h4>
        <p className="text-xs text-zinc-400 mt-2">
          Tindakan ini akan menghapus semua kemajuan proyek yang sedang aktif saat ini.
        </p>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
          >
            <span>🔄</span> Ya, Reset
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-lg"
          >
            <span>❌</span> Batal
          </button>
        </div>
      </div>
    </div>
  );
};

const PROVIDER_INFO: Record<ApiProvider, { label: string; badgeClass: string; signupUrl: string; signupLabel: string; note: string }> = {
  gemini: {
    label: 'Gemini',
    badgeClass: 'bg-indigo-500/15 text-indigo-400',
    signupUrl: 'https://aistudio.google.com/apikey',
    signupLabel: 'Dapatkan gratis di Google AI Studio',
    note: 'Mendukung SEMUA fitur (teks, gambar dengan referensi wajah, TTS, riset real-time).'
  },
  openrouter: {
    label: 'OpenRouter',
    badgeClass: 'bg-sky-500/15 text-sky-400',
    signupUrl: 'https://openrouter.ai/keys',
    signupLabel: 'Dapatkan gratis di OpenRouter',
    note: 'Fallback TEKS saja (skrip, SEO, dll) — dipakai kalau semua key Gemini habis kuota.'
  },
  groq: {
    label: 'Groq',
    badgeClass: 'bg-orange-500/15 text-orange-400',
    signupUrl: 'https://console.groq.com/keys',
    signupLabel: 'Dapatkan gratis di Groq Console',
    note: 'Fallback TEKS saja, sangat cepat — dipakai kalau semua key Gemini habis kuota.'
  }
};

export const ApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  apiKeys: StoredApiKey[];
  onAddKey: (label: string, key: string, provider: ApiProvider, model?: string) => void;
  onRemoveKey: (id: string) => void;
  onToggleKey: (id: string) => void;
}> = ({ isOpen, onClose, apiKeys, onAddKey, onRemoveKey, onToggleKey }) => {
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newProvider, setNewProvider] = useState<ApiProvider>('gemini');
  const [newModel, setNewModel] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const maskKey = (key: string) => {
    if (key.length <= 8) return '•'.repeat(key.length);
    return `${key.slice(0, 4)}${'•'.repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`;
  };

  const handleAdd = () => {
    if (!newKey.trim()) return;
    onAddKey(newLabel, newKey.trim(), newProvider, newModel.trim() || undefined);
    setNewLabel('');
    setNewKey('');
    setNewModel('');
  };

  const activeCount = apiKeys.filter(k => k.active).length;
  const activeGeminiCount = apiKeys.filter(k => k.active && k.provider === 'gemini').length;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="p-6 rounded-2xl max-w-lg w-full border shadow-2xl bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-base font-bold flex items-center gap-2">
            <span>🔑</span> Pengaturan API Key
          </h4>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[11px] text-zinc-500 mb-4">
          Masukkan API Key milik Anda sendiri agar semua fitur AI di tool ini tetap berjalan gratis. Key hanya disimpan di <b>penyimpanan lokal browser Anda</b> — tidak pernah dikirim atau tersimpan di server developer manapun. Anda bisa menambahkan lebih dari satu key dari provider berbeda; jika satu key habis kuotanya, sistem otomatis mencoba key berikutnya.
        </p>

        <div className={`p-2 rounded-xl border text-[11px] font-bold mb-4 ${
          activeGeminiCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {activeGeminiCount > 0
            ? `${activeCount} API Key aktif siap digunakan (${activeGeminiCount} di antaranya Gemini).`
            : 'Belum ada API Key Gemini aktif. Tambahkan minimal 1 key Gemini agar fitur generate gambar dengan wajah & TTS berfungsi penuh.'}
        </div>

        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
          {apiKeys.length === 0 && (
            <p className="text-xs text-zinc-500 italic text-center py-4">Belum ada API Key yang ditambahkan.</p>
          )}
          {apiKeys.map((k) => (
            <div key={k.id} className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${PROVIDER_INFO[k.provider].badgeClass}`}>
                    {PROVIDER_INFO[k.provider].label}
                  </span>
                  <p className="text-xs font-bold truncate">{k.label}</p>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono truncate">{maskKey(k.key)}</p>
                <p className="text-[9px] text-zinc-600 mt-0.5">Dipakai {getKeyUsageCount(k.id)}x hari ini</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleKey(k.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    k.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}
                  title={k.active ? 'Nonaktifkan key ini' : 'Aktifkan key ini'}
                >
                  {k.active ? 'Aktif' : 'Nonaktif'}
                </button>
                <button
                  onClick={() => onRemoveKey(k.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                  title="Hapus key ini"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800 pt-4 space-y-2">
          <p className="text-[11px] font-bold text-zinc-400">Tambah API Key Baru</p>

          <div className="flex gap-1.5">
            {(Object.keys(PROVIDER_INFO) as ApiProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => setNewProvider(p)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${
                  newProvider === p
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {PROVIDER_INFO[p].label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500">{PROVIDER_INFO[newProvider].note}</p>

          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (opsional), mis. Key Utama"
            className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder={`Tempel API Key ${PROVIDER_INFO[newProvider].label} Anda di sini`}
            className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
          />

          {newProvider !== 'gemini' && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300"
            >
              {showAdvanced ? '▾ Sembunyikan opsi lanjutan' : '▸ Opsi lanjutan (ganti model)'}
            </button>
          )}
          {newProvider !== 'gemini' && showAdvanced && (
            <input
              type="text"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder={`Model (opsional), default otomatis dipakai jika kosong`}
              className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          )}

          <button
            onClick={handleAdd}
            disabled={!newKey.trim()}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Key
          </button>
          <a
            href={PROVIDER_INFO[newProvider].signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[10px] text-indigo-400 hover:underline"
          >
            Belum punya API Key? {PROVIDER_INFO[newProvider].signupLabel} →
          </a>
          <p className="text-[10px] text-zinc-600 text-center pt-1 border-t border-zinc-800/60">
            💡 Tanpa key sekalipun, generate gambar TANPA referensi wajah tetap bisa jalan lewat fallback gratis Pollinations.ai.
          </p>
        </div>
      </div>
    </div>
  );
};

export const OnboardingModal: React.FC<{
  isOpen: boolean;
  onDismiss: () => void;
  onOpenApiKeySettings: () => void;
}> = ({ isOpen, onDismiss, onOpenApiKeySettings }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="p-6 rounded-2xl max-w-md w-full border shadow-2xl bg-zinc-900 border-zinc-800 text-zinc-100 text-center">
        <img src={LOGO_SVG} alt="AGE YT#1 Logo" className="h-14 w-14 rounded-2xl object-cover shadow-md mx-auto mb-3" />
        <h4 className="text-lg font-black">Selamat Datang di AGE YT#1 Master Studio Pro!</h4>
        <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Tool ini <b>100% gratis</b> untuk siapa saja — Anda cukup memasukkan API Key Google Gemini milik Anda sendiri (juga gratis untuk didapatkan) supaya seluruh fitur AI (skrip, thumbnail, TTS, SEO) bisa berjalan.
        </p>
        <p className="text-[11px] text-zinc-500 mt-2">
          Key Anda hanya tersimpan di browser Anda sendiri, tidak pernah dikirim ke server developer. Anda juga bisa menambahkan lebih dari satu key sekaligus supaya tidak mudah kehabisan kuota.
        </p>
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={() => {
              onDismiss();
              onOpenApiKeySettings();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2"
          >
            <KeyRound className="h-4 w-4" /> Pasang API Key Sekarang
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2 text-zinc-400 hover:text-zinc-200 text-xs font-bold"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};

export const ImagePreviewModal: React.FC<{
  previewData: { url: string; title: string } | null;
  onClose: () => void;
}> = ({ previewData, onClose }) => {
  if (!previewData) return null;
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer"
    >
      <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950" onClick={(e) => e.stopPropagation()}>
        <img src={previewData.url} alt="Zoomed view" className="max-w-full max-h-[75vh] object-contain" />
        <div className="p-4 flex items-center justify-between border-t border-zinc-800">
          <span className="text-xs font-bold text-zinc-300">{previewData.title}</span>
          <a
            href={previewData.url}
            download={`${previewData.title.replace(/\s+/g, '_')}.png`}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <span>📥</span> Unduh Gambar
          </a>
        </div>
      </div>
    </div>
  );
};

export const CanvasEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedThumbnail: ThumbnailVariant | null;
  canvasOverlayText: string;
  setCanvasOverlayText: (text: string) => void;
  canvasFontSize: number;
  setCanvasFontSize: (size: number) => void;
  canvasTextColor: string;
  setCanvasTextColor: (color: string) => void;
  canvasStrokeColor: string;
  setCanvasStrokeColor: (color: string) => void;
  canvasTextPosition: 'top' | 'middle' | 'bottom';
  setCanvasTextPosition: (pos: 'top' | 'middle' | 'bottom') => void;
  canvasFontStyle: 'Impact Heavy' | 'YouTube Bold' | 'Modern Sans';
  setCanvasFontStyle: (style: 'Impact Heavy' | 'YouTube Bold' | 'Modern Sans') => void;
  canvasActiveSticker: string;
  setCanvasActiveSticker: (sticker: any) => void;
  canvasStickerPosition: string;
  setCanvasStickerPosition: (pos: any) => void;
  canvasPreviewUrl: string;
  isRenderingCanvas: boolean;
  globalAspectRatio: '16:9' | '9:16';
  handleSaveCanvasEdits: () => void;
}> = ({
  isOpen,
  onClose,
  selectedThumbnail,
  canvasOverlayText,
  setCanvasOverlayText,
  canvasFontSize,
  setCanvasFontSize,
  canvasTextColor,
  setCanvasTextColor,
  canvasStrokeColor,
  setCanvasStrokeColor,
  canvasTextPosition,
  setCanvasTextPosition,
  canvasFontStyle,
  setCanvasFontStyle,
  canvasActiveSticker,
  setCanvasActiveSticker,
  canvasStickerPosition,
  setCanvasStickerPosition,
  canvasPreviewUrl,
  isRenderingCanvas,
  globalAspectRatio,
  handleSaveCanvasEdits
}) => {
  if (!isOpen || !selectedThumbnail) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-5xl w-full max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-extrabold tracking-tight">Interactive Canvas Studio & Layer Editor</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selectedThumbnail.title}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors text-xs font-bold"
          >
            ✖️ Tutup
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col justify-center items-center space-y-3">
            <div className={`relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center w-full shadow-2xl ${
              globalAspectRatio === '9:16' ? 'aspect-[9/16] max-h-[500px]' : 'aspect-[16/9] w-full'
            }`}>
              {isRenderingCanvas ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs text-zinc-400 font-bold">Compositing Canvas Layers...</span>
                </div>
              ) : canvasPreviewUrl ? (
                <img src={canvasPreviewUrl} alt="Canvas Live Preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-zinc-500">Gagal memuat pratinjau canvas</span>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleSaveCanvasEdits}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>💾</span> Simpan Hasil Edit Canvas
              </button>
              {canvasPreviewUrl && (
                <a
                  href={canvasPreviewUrl}
                  download={`Canvas_Thumbnail_${selectedThumbnail.id}.png`}
                  className="flex-1 py-2.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all"
                >
                  <span>⬇️</span> Download High-Res (.PNG)
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Type className="h-4 w-4" /> 1. Layer Teks Overlay High-CTR
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Teks Overlay</label>
                <input
                  type="text"
                  value={canvasOverlayText}
                  onChange={(e) => setCanvasOverlayText(e.target.value)}
                  className="w-full p-2 text-xs font-extrabold uppercase rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Warna Teks</label>
                  <div className="flex gap-1.5 items-center">
                    {['#FFD700', '#FFFFFF', '#FF3333', '#00FFFF', '#00FF66'].map(hex => (
                      <button
                        key={hex}
                        onClick={() => setCanvasTextColor(hex)}
                        className={`w-6 h-6 rounded-full border-2 ${canvasTextColor === hex ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Outline Stroke</label>
                  <div className="flex gap-1.5 items-center">
                    {['#000000', '#FFFFFF', '#4B0082', '#FF0055'].map(hex => (
                      <button
                        key={hex}
                        onClick={() => setCanvasStrokeColor(hex)}
                        className={`w-6 h-6 rounded-full border-2 ${canvasStrokeColor === hex ? 'border-indigo-400 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  <span>Ukuran Teks ({canvasFontSize}px)</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={95}
                  value={canvasFontSize}
                  onChange={(e) => setCanvasFontSize(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Posisi Teks</label>
                  <div className="flex p-0.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[10px] font-bold">
                    {(['top', 'middle', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setCanvasTextPosition(pos)}
                        className={`flex-1 py-1 capitalize rounded ${canvasTextPosition === pos ? 'bg-indigo-600 text-white' : 'text-zinc-400'}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Gaya Font</label>
                  <select
                    value={canvasFontStyle}
                    onChange={(e) => setCanvasFontStyle(e.target.value as any)}
                    className="w-full p-1.5 text-[11px] font-bold rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-200"
                  >
                    <option value="Impact Heavy">Impact Heavy</option>
                    <option value="YouTube Bold">YouTube Bold</option>
                    <option value="Modern Sans">Modern Sans</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sticker className="h-4 w-4" /> 2. Layer Sticker & Highlight Badge
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None', emoji: '🚫' },
                  { id: 'viral_fire', label: 'Viral', emoji: '🔥' },
                  { id: 'must_watch', label: 'Watch', emoji: '👀' },
                  { id: 'red_arrow', label: 'Urgent', emoji: '🚨' },
                  { id: 'shock_emoji', label: 'Shock', emoji: '😱' },
                  { id: 'glow_circle', label: 'Glow', emoji: '⚡' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setCanvasActiveSticker(st.id as any)}
                    className={`p-2 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                      canvasActiveSticker === st.id 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/30' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{st.emoji}</span> {st.label}
                  </button>
                ))}
              </div>

              {canvasActiveSticker !== 'none' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Posisi Badge</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg border border-zinc-800 bg-zinc-900 text-[10px] font-bold">
                    {[
                      { id: 'top-left', label: 'Top-Left' },
                      { id: 'top-right', label: 'Top-Right' },
                      { id: 'bottom-left', label: 'Bottom-Left' },
                      { id: 'bottom-right', label: 'Bottom-Right' }
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => setCanvasStickerPosition(sp.id as any)}
                        className={`py-1 rounded ${canvasStickerPosition === sp.id ? 'bg-amber-600 text-white' : 'text-zinc-400'}`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeStep: number;
  topicQuery: string;
  darkMode: boolean;
  setShowResetModal: (show: boolean) => void;
}> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeStep,
  topicQuery,
  darkMode,
  setShowResetModal
}) => {
  return (
    <header className={`px-6 py-3.5 border-b flex items-center justify-between backdrop-blur-md z-30 shrink-0 ${
      darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/90 border-slate-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <PanelLeftOpen className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Navigasi</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
            Langkah {activeStep}: {STEPS_LIST[activeStep - 1].label}
          </span>
          <span className="text-xs text-zinc-500 hidden sm:inline">•</span>
          <span className="text-xs font-bold text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
            Niche: "{topicQuery || 'Umum'}"
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowResetModal(true)}
          className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <span>🔄</span> Reset Proyek
        </button>
      </div>
    </header>
  );
};

export const Sidebar: React.FC<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  selectedTopics: any[];
  generatedScript: string;
  networkSpeed: NetworkSpeedState;
  isApiAutoConnected: boolean;
  googleAccount: { email: string; name: string; picture: string } | null;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  viewMode: 'pc' | 'mobile';
  setViewMode: (mode: 'pc' | 'mobile') => void;
  completedProjectsCount: number;
  setErrorMessage: (msg: string) => void;
  activeApiKeysCount: number;
  onOpenApiKeySettings: () => void;
}> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeStep,
  setActiveStep,
  selectedTopics,
  generatedScript,
  networkSpeed,
  isApiAutoConnected,
  googleAccount,
  darkMode,
  setDarkMode,
  viewMode,
  setViewMode,
  completedProjectsCount,
  setErrorMessage,
  activeApiKeysCount,
  onOpenApiKeySettings
}) => {
  return (
    <aside className={`h-full border-r transition-all duration-300 ease-in-out flex flex-col shrink-0 z-40 ${
      darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-md'
    } ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        {isSidebarOpen ? (
          <div className="flex items-center gap-3">
            <img src={LOGO_SVG} alt="AGE YT#1 Logo" className="h-9 w-9 rounded-xl object-cover shadow-md" />
            <div>
              <h1 className="text-sm font-black tracking-tight text-zinc-100">AGE YT#1 Master</h1>
              <p className="text-[10px] text-zinc-400 font-semibold">Studio Pro v2.5</p>
            </div>
          </div>
        ) : (
          <img src={LOGO_SVG} alt="AGE YT#1 Logo" className="h-9 w-9 rounded-xl object-cover shadow-md mx-auto" />
        )}

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      </div>

      <div className="p-3 border-b border-zinc-800/60 space-y-2">
        <div className={`p-2 rounded-xl border text-[10px] font-bold flex items-center justify-between ${
          networkSpeed.downlink >= 5 && networkSpeed.rtt <= 100
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : networkSpeed.downlink < 1 || networkSpeed.rtt > 300
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 animate-pulse" />
            {isSidebarOpen && <span>Signal Speed:</span>}
          </div>
          <span className="font-extrabold">{networkSpeed.downlink.toFixed(1)} Mbps</span>
        </div>

        <div className={`p-2 rounded-xl border text-[10px] font-bold flex items-center justify-between ${
          isApiAutoConnected 
            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
            : 'border-amber-500/20 bg-amber-500/5 text-amber-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isApiAutoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
            {isSidebarOpen && <span>Google API:</span>}
          </div>
          <span className="font-extrabold truncate max-w-[90px]">
            {googleAccount ? googleAccount.name : 'Connected'}
          </span>
        </div>

        <button
          onClick={onOpenApiKeySettings}
          className={`w-full p-2 rounded-xl border text-[10px] font-bold flex items-center justify-between transition-colors ${
            activeApiKeysCount > 0
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
              : 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 animate-pulse'
          }`}
          title="Kelola API Key Gemini Anda"
        >
          <div className="flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5" />
            {isSidebarOpen && <span>API Key:</span>}
          </div>
          <span className="font-extrabold">
            {activeApiKeysCount > 0 ? `${activeApiKeysCount} Aktif` : 'Belum Ada'}
          </span>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {STEPS_LIST.map((stepItem) => {
          const StepIcon = stepItem.icon;
          const isActive = activeStep === stepItem.step;
          const isCompleted = activeStep > stepItem.step;

          return (
            <button
              key={stepItem.step}
              onClick={() => {
                if (stepItem.step > activeStep && selectedTopics.length === 0 && !generatedScript) {
                  setErrorMessage('Silakan tentukan topik atau buat skrip manual di Step 1 terlebih dahulu.');
                  return;
                }
                setActiveStep(stepItem.step);
              }}
              className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3 shrink-0">
                <div className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-white/20 text-white' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <StepIcon className="h-4 w-4" />
                </div>

                {isSidebarOpen && (
                  <div>
                    <span className="block text-xs font-bold leading-none">{stepItem.label}</span>
                    <span className="text-[9px] text-zinc-400 font-normal mt-0.5 block">{stepItem.desc}</span>
                  </div>
                )}
              </div>

              {isSidebarOpen && (
                <div>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse shrink-0" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between gap-1 p-1 rounded-xl border border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex-1 py-1 text-xs font-bold rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center gap-1"
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
          <div className="h-3 w-[1px] bg-zinc-800" />
          <button
            onClick={() => setViewMode(viewMode === 'pc' ? 'mobile' : 'pc')}
            className="flex-1 py-1 text-xs font-bold rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center gap-1"
          >
            {viewMode === 'pc' ? '🖥️ PC' : '📱 Mobile'}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="text-[9px] text-zinc-500 text-center font-bold">
            Selesai Ditangani: {completedProjectsCount} Video
          </div>
        )}
      </div>
    </aside>
  );
};

export function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<'pc' | 'mobile'>('pc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<'stickman' | 'cyberpunk' | 'pixar' | 'cinematic' | 'vector'>('stickman');
  const [failedSceneIndices, setFailedSceneIndices] = useState<number[]>([]);
  const [activePromptTabs, setActivePromptTab] = useState<Record<number, 'visual' | 'video'>>({});

  const [activeStep, setActiveStep] = useState(1);
  const [showResetModal, setShowResetModal] = useState(false);

  // Network & Google Connection States
  const networkSpeed = useNetworkSpeed();
  const [googleAccount, setGoogleAccount] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [isApiAutoConnected, setIsApiAutoConnected] = useState(false);
  const [userApiKeys, setUserApiKeys] = useState<StoredApiKey[]>(() => getStoredApiKeys());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const activeApiKeysCount = userApiKeys.filter(k => k.active).length;

  useEffect(() => {
    if (!hasSeenOnboarding() && getStoredApiKeys().length === 0) {
      setShowOnboarding(true);
    }
  }, []);

  const handleDismissOnboarding = () => {
    markOnboardingSeen();
    setShowOnboarding(false);
  };

  const handleAddApiKey = (label: string, key: string, provider: ApiProvider, model?: string) => {
    setUserApiKeys(addApiKey(label, key, provider, model));
  };

  const handleRemoveApiKey = (id: string) => {
    setUserApiKeys(removeApiKey(id));
  };

  const handleToggleApiKey = (id: string) => {
    setUserApiKeys(toggleApiKeyActive(id));
  };

  const [processingState, setProcessingState] = useState({
    active: false,
    title: '',
    message: ''
  });

  const [videoType, setVideoType] = useState<'long' | 'shorts'>('long'); 
  const [targetAudience, setTargetAudience] = useState<'indonesia' | 'global'>('global'); 
  const [duration, setDuration] = useState('12'); 
  const [topicQuery, setTopicQuery] = useState('');
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]); 
  const [manualScriptInput, setManualScriptInput] = useState('');
  const [scriptSources, setScriptSources] = useState(''); 

  const [language, setLanguage] = useState<'id' | 'en'>('id'); 
  const [narrationStyle, setNarrationStyle] = useState('storytelling'); 
  const [generatedScript, setGeneratedScript] = useState('');
  const [scriptParagraphs, setScriptParagraphs] = useState<string[]>([]);
  const [scriptSourcesUsed, setScriptSourcesUsed] = useState<any[]>([]); 
  
  const [globalAspectRatio, setGlobalAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const [globalFaceRefs, setGlobalFaceRefs] = useState<FaceReference[]>(() => {
    return FACE_SLOTS.map(slot => ({
      id: `slot-${slot.slotIndex}`,
      dataUrl: '',
      role: slot.role,
      gender: 'male',
      label: slot.label,
      slotIndex: slot.slotIndex
    }));
  });

  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [selectedTone, setSelectedTone] = useState('dramatic');
  const [ttsText, setTtsText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);

  const [scenes, setScenes] = useState<any[]>([]); 
  const [expandedParagraphs, setExpandedParagraphs] = useState<Record<number, boolean>>({});
  const [sceneRatios, setSceneRatios] = useState<Record<number, string>>({}); 
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({}); 
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({}); 
  const [activePreviewImage, setActivePreviewImage] = useState<{ url: string; title: string } | null>(null); 

  // STEP 4: THUMBNAIL ENGINE & MANUAL FUSION STATES
  const [thumbnailModeTab, setThumbnailModeTab] = useState<'auto' | 'manual_fusion'>('auto');
  const [editableOverlayText, setEditableOverlayText] = useState('RAHASIA TERBONGKAR!');
  const [uploadedThumbnailImages, setUploadedThumbnailImages] = useState<{ id: string; dataUrl: string; name: string }[]>([]);
  
  const [thumbnailVariants, setThumbnailVariants] = useState<ThumbnailVariant[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<ThumbnailVariant | null>(null);

  // CANVAS EDITOR ENGINE STATES
  const [isCanvasEditorOpen, setIsCanvasEditorOpen] = useState(false);
  const [canvasOverlayText, setCanvasOverlayText] = useState('RAHASIA TERBONGKAR!');
  const [canvasFontSize, setCanvasFontSize] = useState(55);
  const [canvasTextColor, setCanvasTextColor] = useState('#FFD700');
  const [canvasStrokeColor, setCanvasStrokeColor] = useState('#000000');
  const [canvasTextPosition, setCanvasTextPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [canvasFontStyle, setCanvasFontStyle] = useState<'Impact Heavy' | 'YouTube Bold' | 'Modern Sans'>('Impact Heavy');
  const [canvasActiveSticker, setCanvasActiveSticker] = useState<'none' | 'viral_fire' | 'must_watch' | 'red_arrow' | 'shock_emoji' | 'glow_circle'>('none');
  const [canvasStickerPosition, setCanvasStickerPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right');
  const [canvasPreviewUrl, setCanvasPreviewUrl] = useState('');
  const [isRenderingCanvas, setIsRenderingCanvas] = useState(false);

  // STEP 5: SEO METADATA STATE
  const [seoData, setSeoData] = useState<SeoMetadataState>({
    viralTitles: [],
    selectedTitle: '',
    description: '',
    chapters: [],
    multilingualTags: [],
    primaryKeywords: [],
    hashtags: []
  });

  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [improvingIndex, setImprovingIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [completedProjectsCount, setCompletedProjectsCount] = useState(() => {
    return parseInt(localStorage.getItem('andriage_completed_projects') || '0');
  });

  useEffect(() => {
    if (videoType === 'shorts') {
      setGlobalAspectRatio('9:16');
    } else {
      setGlobalAspectRatio('16:9');
    }
  }, [videoType]);

  useEffect(() => {
    const isIframe = window.self !== window.top;
    
    const loadGsiSdk = () => {
      if (document.getElementById('gsi-client-sdk')) {
        initGoogleAuth();
        return;
      }
      const script = document.createElement('script');
      script.id = 'gsi-client-sdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleAuth();
      document.head.appendChild(script);
    };

    const initGoogleAuth = () => {
      const win = window as any;
      if (win.google?.accounts?.id) {
        try {
          win.google.accounts.id.initialize({
            client_id: '921132711002-app.apps.googleusercontent.com',
            use_fedcm_for_prompt: false,
            callback: (response: any) => {
              if (response.credential) {
                try {
                  const base64Url = response.credential.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                  }).join(''));
                  const payload = JSON.parse(jsonPayload);

                  setGoogleAccount({
                    email: payload.email || 'user@google.com',
                    name: payload.name || 'Google Creator',
                    picture: payload.picture || ''
                  });
                  setIsApiAutoConnected(true);
                } catch (e) {
                  setIsApiAutoConnected(true);
                }
              }
            }
          });

          if (!isIframe) {
            try {
              win.google.accounts.id.prompt();
            } catch (pErr) {
              // Bypassed inside iframe context
            }
          }
        } catch (e) {
          console.warn('GSI Initialization bypassed.');
        }
      }
      setIsApiAutoConnected(true);
    };

    loadGsiSdk();
  }, []);

  const handleCopyText = (text: string, id: string) => {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedStates(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [id]: false }));
        }, 2000);
      }).catch(() => {
        fallbackCopyText(text, id);
      });
    } else {
      fallbackCopyText(text, id);
    }
  };

  const fallbackCopyText = (text: string, id: string) => {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      document.execCommand('copy');
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Gagal menyalin teks', err);
    }
    document.body.removeChild(tempTextArea);
  };

  const handleDiscoverTopics = async () => {
    if (!topicQuery.trim()) {
      setErrorMessage('Masukkan tema atau kata kunci riset terlebih dahulu.');
      return;
    }
    setProcessingState({
      active: true,
      title: 'Menganalisis Tren Konten',
      message: `Meriset kata kunci "${topicQuery}" dan merumuskan 10 ide topik YouTube viral dengan nilai CTR tertinggi...`
    });
    setErrorMessage('');
    
    const audienceInstruction = targetAudience === 'indonesia'
      ? 'Target Audiens: Indonesia (Fokus pada tren lokal, budaya, isu hangat, dan gaya penyampaian bahasa Indonesia yang sangat relevan).'
      : 'Target Audiens: Global / Amerika Serikat (US Focus). Wajib menargetkan tren YouTube US, konteks pencarian Amerika Serikat, dan formulasi frasa/judul dalam bahasa Inggris natural (US English).';

    const hookStrategy = videoType === 'shorts'
      ? 'Format: YouTube Shorts (30-60 detik). Wajib merancang ide topik dengan HOOK instan 3 detik pertama yang meledak-ledak (pattern interrupt tajam, curiosity gap langsung, dan pemicu visual secepat kilat).'
      : `Format: YouTube Long Form (Target durasi ${duration} menit). Wajib merancang ide topik dengan struktur retensi jangka panjang, multi-layered curiosity gap, serta alur narasi yang memiliki kedalaman cerita (narrative arc) kuat.`;

    const promptText = `Lakukan riset mendalam menggunakan Google Search dan YouTube mengenai niche kata kunci: "${topicQuery}".
Manfaatkan data pencarian web dan YouTube Search real-time terkini untuk menemukan topik viral terbaru, kata kunci pencarian populer yang sedang naik daun, serta tren minat audiens aktif saat ini yang sangat cocok dengan "${topicQuery}".

Spesifikasi Target & Format:
1. ${audienceInstruction}
2. ${hookStrategy}

Buatlah 10 pilihan ide topik video YouTube viral yang sangat inovatif, segar, dan WAJIB sangat relevan serta berhubungan erat secara langsung dengan kata kunci utama pencarian: "${topicQuery}". Jangan melenceng ke topik yang tidak relevan.

PENTING: Setiap ide topik harus memiliki estimasi nilai CTR (Click-Through Rate) yang sangat tinggi (di atas 8%) beserta analisis kecocokan audiens.

Kembalikan data dalam format JSON yang valid dengan skema berikut:
{
  "topics": [
    {
      "id": 1,
      "title": "Judul Ide Topik Kreatif & Berdaya Klik Tinggi (Wajib mengaitkan langsung secara kuat dengan kata kunci '${topicQuery}')",
      "viralScore": 95, 
      "ctrEstimate": "9.4% - 12.8%",
      "demand": "High / Extreme",
      "uniqueness": "Unik / Mind-Blowing",
      "explanation": "Penjelasan detail mengapa topik ini sangat relevan dengan '${topicQuery}', kelebihan daya saingnya, dan taktik eksekusi narasi."
    }
  ]
}`;

    try {
      const data = await generateText(promptText, { isJson: true, tools: [{ googleSearch: {} }] });
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResponse) {
        const parsed = extractAndParseJson(textResponse);
        if (parsed && parsed.topics && Array.isArray(parsed.topics)) {
          setTopics(parsed.topics);
          setSelectedTopics([]); 
        } else {
          throw new Error("Format respons tidak valid atau tidak memuat array topik.");
        }
      } else {
        throw new Error("Gagal menerima respons dari Gemini API.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat meriset topik.');
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleToggleTopic = (topic: any) => {
    setManualScriptInput(''); 
    const isAlreadySelected = selectedTopics.some(t => t.id === topic.id);
    if (isAlreadySelected) {
      setSelectedTopics(prev => prev.filter(t => t.id !== topic.id));
    } else {
      setSelectedTopics(prev => [...prev, topic]);
    }
  };

  const handleSlotPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultDataUrl = reader.result as string;
      setGlobalFaceRefs(prev => prev.map(item => {
        if (item.slotIndex === slotIndex) {
          return { ...item, dataUrl: resultDataUrl };
        }
        return item;
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSlotGenderToggle = (slotIndex: number, gender: 'male' | 'female') => {
    setGlobalFaceRefs(prev => prev.map(item => {
      if (item.slotIndex === slotIndex) {
        return { ...item, gender: gender };
      }
      return item;
    }));
  };

  const handleRemoveSlotPhoto = (slotIndex: number) => {
    setGlobalFaceRefs(prev => prev.map(item => {
      if (item.slotIndex === slotIndex) {
        return { ...item, dataUrl: '' };
      }
      return item;
    }));
  };

  const getActiveFaceRefs = (): FaceReference[] => {
    return globalFaceRefs.filter(ref => ref && ref.dataUrl && ref.dataUrl.trim().length > 0);
  };

  const handleGenerateScript = async () => {
    if (selectedTopics.length === 0 && !manualScriptInput.trim()) {
      setErrorMessage('Pilih setidaknya satu atau beberapa topik dari Step 1, atau masukkan naskah manual terlebih dahulu.');
      return;
    }
    setProcessingState({
      active: true,
      title: manualScriptInput.trim() ? 'Mengoptimasi Skrip Manual' : 'Menyusun Naskah Narasi Terintegrasi',
      message: manualScriptInput.trim() 
        ? 'Menyelaraskan skrip manual Anda dengan konteks audiens, gaya narasi, dan rujukan data otentik...'
        : 'Mempersiapkan naskah skrip komprehensif yang mengintegrasikan seluruh topik terpilih dengan HOOK retensi tinggi dan rujukan data masif...'
    });
    setErrorMessage('');

    const isGlobal = targetAudience === 'global' || language === 'en';
    const targetLanguageLabel = isGlobal 
      ? 'American English (Fluent US English with natural idioms, clear active phrasing, and engaging rhythm)' 
      : 'Bahasa Indonesia (Sangat natural, komunikatif, mengalir, dan sesuai tata bahasa Indonesia modern)';
    
    const wordCountMin = videoType === 'shorts' 
      ? '130 - 200 words' 
      : `${parseInt(duration) * 140} words (minimal 130-150 words per minute for a ${duration}-minute video)`;
    
    const styleGuides: Record<string, string> = {
      storytelling: "Deep narrative arc, highly immersive storytelling, dramatic transitions, suspenseful build-ups, and an emotional payoff.",
      jokes: "Humor-infused, energetic, witty commentary, lighthearted banter, and entertaining analogies suited for viral YouTube retention.",
      'mind-blowing': "Focus on shocking revelations, conspiracy theories, mind-bending facts, fast curiosity gaps, and intense plot twists.",
      casual: "Warm, conversational, personal, and friendly tone as if talking directly to a close friend in an authentic manner."
    };
    const activeStyleGuide = styleGuides[narrationStyle] || narrationStyle;

    const formatStructure = videoType === 'shorts'
      ? "YouTube Shorts (30-60s): Explosive 3-second instant hook, high-speed pacing, tight narrative structure, and an immediate payoff."
      : `YouTube Long Form (${duration} Minutes): Structured multi-chapter narrative arc with mid-video retention hooks, curiosity gaps, and deep thematic exploration.`;

    const sourceContext = scriptSources.trim()
      ? `\n\nUser-Provided Custom Reference Data:\n"${scriptSources}"\n`
      : '';

    let promptAnchor = '';
    if (manualScriptInput.trim()) {
      promptAnchor = `PRIMARY SOURCE ANCHOR (User Manual Blueprint):
"${manualScriptInput}"
INSTRUCTION: You MUST treat the user's manual draft above as the absolute core foundation. Expand, refine, polish, and adapt it into a world-class YouTube script while preserving its original core message, specific details, and intent.`;
    } else {
      const selectedTopicsSummary = selectedTopics.map(t => `- Title: "${t.title}" | Context: ${t.explanation}`).join('\n');
      promptAnchor = `PRIMARY SOURCE ANCHOR (Selected Topics):
${selectedTopicsSummary}
INSTRUCTION: Deeply synthesize and weave all selected topics above into one seamless, coherent, highly engaging story centered on the primary keyword: "${topicQuery || 'YouTube Video'}". Do NOT write off-topic content.`;
    }

    const promptText = `${promptAnchor}
${sourceContext}

SPECIFICATIONS & CONTEXT BINDING:
- Targeted Keyword/Niche: "${topicQuery || 'General Topic'}"
- Target Audience & Language: ${targetLanguageLabel}
- Format & Duration: ${formatStructure}
- Target Word Count: ${wordCountMin}
- Narration Style & Tone: ${activeStyleGuide}

STRICT WRITING RULES:
1. SCRIPT CONTEXT ALIGNMENT: Every sentence must strictly relate to the targeted keyword "${topicQuery}" and the primary source anchor.
2. AUDIENCE MATCHING: Write strictly in ${targetLanguageLabel}. If language is English, use natural US idioms, active voice, and authentic phrasing.
3. NARRATION STYLE CONSISTENCY: Every paragraph must consistently reflect the "${narrationStyle}" style in tone, pacing, and vocabulary.
4. AUTHENTIC SOURCES: List 8-10 highly authentic, specific, real-world historical, scientific, literary, or archival references validating the script.

Return the response in valid, strict JSON format using the following schema:
{
  "fullScript": "The complete, unbroken, production-ready narrative script text with paragraph breaks.",
  "paragraphs": [
    "Paragraph 1 text with explosive hook...",
    "Paragraph 2 text introducing core context...",
    "Paragraph 3 text expanding details...",
    "Paragraph 4 text with revelation/climax...",
    "Paragraph 5 text with strong closing CTA..."
  ],
  "sourcesUsed": [
    {
      "name": "Specific authentic reference name",
      "type": "Book / Journal / Archive / Manuscript / Scientific Report",
      "relevance": "Concise explanation of how this specific reference validates the facts in the script."
    }
  ]
}`;

    try {
      const data = await generateText(promptText, { isJson: true });
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        const parsed = extractAndParseJson(textResponse);
        if (parsed) {
          const fullScript = parsed.fullScript || parsed.script || '';
          let paragraphs: string[] = [];

          if (Array.isArray(parsed.paragraphs) && parsed.paragraphs.length > 0) {
            paragraphs = parsed.paragraphs.map((p: any) => typeof p === 'string' ? p.trim() : String(p).trim()).filter((p: string) => p.length > 0);
          } else if (fullScript) {
            paragraphs = fullScript.split('\n').filter((p: string) => p.trim().length > 0);
          }

          let sources: any[] = [];
          if (Array.isArray(parsed.sourcesUsed) && parsed.sourcesUsed.length > 0) {
            sources = parsed.sourcesUsed;
          } else if (Array.isArray(parsed.sources) && parsed.sources.length > 0) {
            sources = parsed.sources;
          } else {
            sources = [
              { name: `Google Search & YouTube Trends Database`, type: "Market Analytics", relevance: `Validating keyword accuracy for "${topicQuery || 'Custom Topic'}"` }
            ];
          }

          if (fullScript && paragraphs.length > 0) {
            setGeneratedScript(fullScript);
            setScriptParagraphs(paragraphs);
            setScriptSourcesUsed(sources);

            setScenes([]);
            setSceneImages({});
            setImageLoadingStates({});
          } else {
            throw new Error("Gagal mengekstrak teks skrip dari respons AI.");
          }
        } else {
          throw new Error("Format naskah dari AI tidak valid. Silakan coba kembali.");
        }
      } else {
        throw new Error("Gagal menerima respons dari Gemini API.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat naskah skrip.');
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleImproveParagraph = async (index: number, type: string) => {
    setImprovingIndex(index);
    setProcessingState({
      active: true,
      title: 'Meningkatkan Kualitas Narasi',
      message: `Memformat ulang paragraf ${index + 1} dengan instruksi kustom: "${type}"...`
    });
    setErrorMessage('');
    
    const currentText = scriptParagraphs[index];
    const promptText = `Tulis ulang paragraf naskah berikut dengan instruksi penyesuaian: "${type}".
Paragraf Asli: "${currentText}"

Kembalinya HANYA hasil penulisan ulang paragraf baru tersebut tanpa tambahan intro/outro/tanda kutip tambahan.
Paragraf Baru:`;

    try {
      const data = await generateText(promptText, { isJson: false });
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse && textResponse.trim()) {
        const updatedParagraphs = [...scriptParagraphs];
        updatedParagraphs[index] = textResponse.trim();
        setScriptParagraphs(updatedParagraphs);
        setGeneratedScript(updatedParagraphs.join('\n\n'));
        setScenes([]); 
      } else {
        throw new Error("Gagal menerima respons penulisan ulang.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal melakukan improvisasi paragraf.');
    } finally {
      setImprovingIndex(null);
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleGenerateVoiceOver = async () => {
    if (!ttsText.trim()) {
      setErrorMessage('Pilih atau ketik teks naskah yang ingin disuarakan terlebih dahulu.');
      return;
    }

    setProcessingState({
      active: true,
      title: 'Mensintesis Suara Narator',
      message: 'Memotong naskah ke dalam chunk aman dan merender suara via Gemini 2.5 TTS...'
    });
    setErrorMessage('');
    setAudioUrl('');

    const chunks = splitTextIntoTTSChunks(ttsText, 400);
    if (chunks.length === 0) {
      setErrorMessage('Teks narasi kosong setelah pembersihan formatting.');
      setProcessingState(prev => ({ ...prev, active: false }));
      return;
    }

    const toneInstructions: Record<string, string> = {
      dramatic: "Say in a dramatic, slow, suspenseful, epic storytelling voice: ",
      cheerful: "Say cheerfully, dynamically and energetically: ",
      whisper: "Say in a soft, mysterious whisper: ",
      informative: "Say in a clear, authoritative, highly professional educational voice: "
    };

    const accumulatedPcmBytes: Uint8Array[] = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        setProcessingState(prev => ({
          ...prev,
          message: `Mensintesis Bagian Audio ${i + 1} dari ${chunks.length}...`
        }));

        const promptText = `${toneInstructions[selectedTone] || ""}${chunkText}`;

        let result: any = null;
        let retries = 3;
        while (retries > 0) {
          try {
            result = await generateSpeech(promptText, selectedVoice);
            const audioCandidatePart = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData && p.inlineData.mimeType.startsWith('audio/'));
            if (audioCandidatePart?.inlineData?.data) {
              const binaryString = window.atob(audioCandidatePart.inlineData.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let b = 0; b < binaryString.length; b++) {
                bytes[b] = binaryString.charCodeAt(b);
              }
              accumulatedPcmBytes.push(bytes);
              break;
            } else {
              throw new Error("Response candidate lacks inline audio data.");
            }
          } catch (chunkErr) {
            retries--;
            if (retries === 0) {
              console.warn(`Chunk ${i + 1} failed TTS synthesis after retries. Proceeding with remaining audio.`);
            } else {
              await new Promise(res => setTimeout(res, 1000));
            }
          }
        }

        await new Promise(res => setTimeout(res, 800));
      }

      if (accumulatedPcmBytes.length === 0) {
        throw new Error("Gagal mengekstrak data audio dari respons Gemini TTS. Silakan coba kembali.");
      }

      const totalLen = accumulatedPcmBytes.reduce((sum, b) => sum + b.length, 0);
      const combinedPcm = new Uint8Array(totalLen);
      let offset = 0;
      for (const b of accumulatedPcmBytes) {
        combinedPcm.set(b, offset);
        offset += b.length;
      }

      const wavBlob = convertPcmBytesToWavBlob(combinedPcm, 24000);
      const generatedAudioUrl = URL.createObjectURL(wavBlob);
      setAudioUrl(generatedAudioUrl);

      const audioHelper = new Audio(generatedAudioUrl);
      audioHelper.onloadedmetadata = () => {
        setAudioDuration(audioHelper.duration);
      };

    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghasilkan Pengisi Suara AI.');
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleGenerateVisualScenes = () => {
    if (scriptParagraphs.length === 0) {
      setErrorMessage('Skrip tidak ditemukan. Buat atau input skrip di Step 2 terlebih dahulu.');
      return;
    }
    setProcessingState({
      active: true,
      title: 'Memecah Storyboard Visual',
      message: 'Mengekstrak kalimat, menentukan durasi, dan merancang timeline timecode adegan...'
    });
    setErrorMessage('');

    try {
      const allClauses: any[] = [];
      scriptParagraphs.forEach((para, pIdx) => {
        const numberProtected = para.replace(/(\d+)([.,])(\d+)/g, '$1__NUM_$2__$3');
        const rawClauses = numberProtected.match(/[^,;.!?]+[,;.!?]?/g) || [numberProtected];
        
        const clauses = rawClauses
          .map(c => c.replace(/__NUM_([.,])__/g, '$1').trim())
          .filter(c => c.length > 0);

        clauses.forEach((sentence, sIdx) => {
          const wordCount = sentence.split(/\s+/).filter(w => w).length;
          const baseDuration = Math.max(2, Math.round(wordCount / 2.5));
          allClauses.push({ pIdx, sIdx, sentence, baseDuration });
        });
      });

      let tempScenes: any[] = [];
      let globalSceneCount = 1;
      let runningSeconds = 0;

      allClauses.forEach((item) => {
        const durationVal = item.baseDuration;

        const formatTime = (totalSec: number) => {
          const mins = Math.floor(totalSec / 60);
          const secs = totalSec % 60;
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const startTimeCode = formatTime(runningSeconds);
        runningSeconds += durationVal;
        const endTimeCode = formatTime(runningSeconds);

        const keywordsCleaned = item.sentence
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w: string) => w.length > 3)
          .slice(0, 3)
          .join(' ');

        tempScenes.push({
          globalIndex: globalSceneCount,
          paragraphIndex: item.pIdx + 1,
          sceneIndexInParagraph: item.sIdx + 1,
          sentence: item.sentence,
          startTimeCode: startTimeCode,
          endTimeCode: endTimeCode,
          duration: durationVal,
          visualPrompt: '',
          videoPrompt: '',
          searchKeyword: keywordsCleaned || 'footage',
          isGenerated: false,
          loading: false
        });

        globalSceneCount++;
      });

      setScenes(tempScenes);
      
      const initialExpand: Record<number, boolean> = {};
      scriptParagraphs.forEach((_, idx) => {
        initialExpand[idx + 1] = idx === 0;
      });
      setExpandedParagraphs(initialExpand);

      const newCount = completedProjectsCount + 1;
      setCompletedProjectsCount(newCount);
      localStorage.setItem('andriage_completed_projects', newCount.toString());
    } catch (err: any) {
      setErrorMessage('Kesalahan saat memproses naskah storyboard: ' + err.message);
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleGeneratePromptForScene = async (globalIndex: number) => {
    const sceneToUpdate = scenes.find(s => s.globalIndex === globalIndex);
    if (!sceneToUpdate) return;

    setScenes(prev => prev.map(s => s.globalIndex === globalIndex ? { ...s, loading: true } : s));
    setProcessingState({
      active: true,
      title: `Merancang Visual Contextual & Motion Adegan ${globalIndex}`,
      message: 'Menganalisis kostum, latar, pencahayaan, dan memetakan hierarki karakter...'
    });
    setErrorMessage('');

    const activeStyle = VISUAL_STYLES.find(s => s.id === selectedVisualStyle) || VISUAL_STYLES[0];
    const activeFaces = getActiveFaceRefs();
    const faceRoleSummary = activeFaces.length > 0 
      ? activeFaces.map(ref => `SLOT ${ref.slotIndex + 1} [ROLE: ${ref.role.toUpperCase()}, GENDER: ${ref.gender.toUpperCase()}]: ${ref.label}`).join('\n')
      : 'Tidak ada foto referensi wajah (Gunakan deskripsi generik relevan)';

    const sentenceWords = sceneToUpdate.sentence.trim().split(/\s+/).filter((w: string) => w.length > 0);
    const wordCount = sentenceWords.length;
    const isShortSentence = wordCount >= 1 && wordCount <= 4;
    
    const shortSentenceInstruction = isShortSentence ? 
      `CRITICAL INSTRUCTION: The sentence "${sceneToUpdate.sentence}" contains only ${wordCount} words (extremely short). Strictly extract the core physical concept or literal meaning of these words and make it a central, highly prominent physical element in the visual frame.` : '';

    const selectedTopicsTitles = selectedTopics.map(t => t.title).join(', ');
    const promptText = `Rancanglah sebuah prompt visual (visualPrompt) dan video motion prompt (videoPrompt) detail berbahasa Inggris untuk adegan berikut:

Kalimat Narasi Adegan: "${sceneToUpdate.sentence}"
Topik Utama Video: "${selectedTopicsTitles || 'Video Pembahasan'}"
Niche/Kata Kunci: "${topicQuery || 'YouTube'}"

HIERARKI KARAKTER WAJIB:
${faceRoleSummary}

ATURAN KONTEKS VISUAL UTAMA:
1. EKSTRAKSI KONTEKS:
   - KOSTUM/PAKAIAN: Rancang pakaian subjek agar spesifik dan relevan dengan narasi.
   - LOKASI & LINGKUNGAN: Latar belakang tempat, arsitektur, atmosfer.
   - WAKTU & CUACA: Pencahayaan, waktu, dan efek cuaca.
   - OBJEK UTAMA: Objek spesifik yang dipegang/interaksi karakter.
2. BATASAN RUJUKAN WAJAH:
   - Foto referensi wajah HANYA menentukan struktur wajah, mata, ekspresi, dan rambut.
   - Pakaian, gestur tubuh, posture, dan lingkungan sekitar WAJIB disesuaikan 100% dengan narasi.
3. GAYA VISUAL DITERAPKAN: "${activeStyle.promptGuide}"
4. NEGATIVE PROMPT: "${AUTOMATIC_NEGATIVE_PROMPT}"
${shortSentenceInstruction}

Kembalikan data dalam format JSON yang valid:
{
  "visualPrompt": "Detailed English contextual art prompt incorporating extracted costume, environment, objects, lighting, and specified style guide matching sentence narrative",
  "videoPrompt": "Cinematic English video motion prompt specifying dynamic camera movements, character actions, physics/motion, and pacing",
  "searchKeyword": "short generic clip search keyword in English representing the sentence"
}`;

    try {
      const data = await generateText(promptText, { isJson: true });
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        const parsed = extractAndParseJson(textResponse);
        if (parsed && parsed.visualPrompt) {
          setScenes(prev => prev.map(s => s.globalIndex === globalIndex ? {
            ...s,
            visualPrompt: parsed.visualPrompt,
            videoPrompt: parsed.videoPrompt || '',
            searchKeyword: parsed.searchKeyword || sceneToUpdate.searchKeyword,
            isGenerated: true,
            loading: false
          } : s));
        } else {
          throw new Error("Respons AI tidak memuat format prompt yang valid.");
        }
      }
    } catch (err: any) {
      setErrorMessage(`Gagal memuat prompt adegan ${globalIndex}: ${err.message}`);
      setScenes(prev => prev.map(s => s.globalIndex === globalIndex ? { ...s, loading: false } : s));
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleGenerateImageForScene = async (globalIndex: number) => {
    const scene = scenes.find(s => s.globalIndex === globalIndex);
    if (!scene || !scene.visualPrompt) {
      setErrorMessage('Pastikan Anda sudah meng-generate "Prompt Visual" sebelum membuat gambar.');
      return;
    }

    setImageLoadingStates(prev => ({ ...prev, [globalIndex]: true }));
    setProcessingState({
      active: true,
      title: 'Mengeksekusi Google Flow',
      message: `Merender Gambar Adegan ${globalIndex} menggunakan Google Flow Nano Banana 2...`
    });
    setErrorMessage('');

    const targetRatio = sceneRatios[globalIndex] || globalAspectRatio;
    const promptWithNegative = `${scene.visualPrompt}. Negative prompt: ${AUTOMATIC_NEGATIVE_PROMPT}`;

    let partsArray: any[] = [];
    const activeFaces = getActiveFaceRefs();
    
    if (activeFaces.length > 0) {
      const faceCount = activeFaces.length;
      const roleDetails = activeFaces.map(ref => `${ref.role.toUpperCase()} (${ref.gender}): ${ref.label}`).join(', ');
      
      let faceInstructionText = '';
      if (selectedVisualStyle === 'stickman') {
        faceInstructionText = `Based on the ${faceCount} reference portrait images (${roleDetails}), adapt and simplify the facial features, hairstyles, glasses, head shape, and key expressions from the attached face reference image(s) into a 2D hand-drawn doodle / stickman character face. The character body must remain a clean 2D stickman/doodle style, but the face/head MUST clearly resemble and inherit the recognizable identity and gender characteristics of the provided face reference image. Render this scene: ${promptWithNegative}`;
      } else {
        faceInstructionText = `Based strictly on the physical face features, eyes, expressions, and likenesses provided in the ${faceCount} reference portrait images (${roleDetails}) ONLY for faces, render this scene: ${promptWithNegative}`;
      }

      partsArray.push({ text: faceInstructionText });

      activeFaces.forEach(ref => {
        const strippedBase = ref.dataUrl.split(',')[1];
        const mimeType = ref.dataUrl.split(';')[0].split(':')[1];
        partsArray.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: strippedBase
          }
        });
      });
    } else {
      partsArray.push({ text: promptWithNegative });
    }

    try {
      const response = await generateImage(partsArray, targetRatio);
      const part = response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      
      if (part && part.inlineData && part.inlineData.data) {
        const generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        setSceneImages(prev => ({ ...prev, [globalIndex]: generatedUrl }));
        setFailedSceneIndices(prev => prev.filter(id => id !== globalIndex));
      } else {
        throw new Error("Gagal memperoleh data gambar dari model Google Flow.");
      }
    } catch (err: any) {
      setErrorMessage(`Gagal meng-generate gambar adegan ${globalIndex}: ${err.message}`);
      setFailedSceneIndices(prev => Array.from(new Set([...prev, globalIndex])));
    } finally {
      setImageLoadingStates(prev => ({ ...prev, [globalIndex]: false }));
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleBatchRetryFailedImages = async () => {
    const scenesToRetry = scenes.filter(s => 
      s.visualPrompt && (!sceneImages[s.globalIndex] || failedSceneIndices.includes(s.globalIndex))
    );

    if (scenesToRetry.length === 0) {
      setErrorMessage('Tidak ada gambar yang gagal atau belum di-render untuk diulang.');
      return;
    }

    setProcessingState({
      active: true,
      title: 'Batch Retry Render Gambar Gagal',
      message: `Memulai re-render khusus untuk ${scenesToRetry.length} adegan yang belum berhasil...`
    });
    setErrorMessage('');

    for (let i = 0; i < scenesToRetry.length; i++) {
      const scene = scenesToRetry[i];
      const globalIdx = scene.globalIndex;

      setImageLoadingStates(prev => ({ ...prev, [globalIdx]: true }));
      setProcessingState(prev => ({
        ...prev,
        message: `Re-rendering Gambar Adegan ${globalIdx} (${i + 1} dari ${scenesToRetry.length})...`
      }));

      const targetRatio = sceneRatios[globalIdx] || globalAspectRatio;
      const promptWithNegative = `${scene.visualPrompt}. Negative prompt: ${AUTOMATIC_NEGATIVE_PROMPT}`;

      let partsArray: any[] = [];
      const activeFaces = getActiveFaceRefs();
      if (activeFaces.length > 0) {
        const faceCount = activeFaces.length;
        const roleDetails = activeFaces.map(ref => `${ref.role.toUpperCase()} (${ref.gender}): ${ref.label}`).join(', ');
        
        let faceInstructionText = '';
        if (selectedVisualStyle === 'stickman') {
          faceInstructionText = `Based on reference portraits (${roleDetails}), adapt facial features into 2D doodle stickman face inheriting identity. Render scene: ${promptWithNegative}`;
        } else {
          faceInstructionText = `Based strictly on the physical face features from reference portraits (${roleDetails}), render scene: ${promptWithNegative}`;
        }

        partsArray.push({ text: faceInstructionText });
        activeFaces.forEach(ref => {
          const strippedBase = ref.dataUrl.split(',')[1];
          const mimeType = ref.dataUrl.split(';')[0].split(':')[1];
          partsArray.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: strippedBase
            }
          });
        });
      } else {
        partsArray.push({ text: promptWithNegative });
      }

      try {
        const response = await generateImage(partsArray, targetRatio);
        const part = response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (part && part.inlineData && part.inlineData.data) {
          const generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setSceneImages(prev => ({ ...prev, [globalIdx]: generatedUrl }));
          setFailedSceneIndices(prev => prev.filter(id => id !== globalIdx));
        } else {
          throw new Error("Gagal memperoleh data gambar.");
        }
      } catch (err) {
        console.error(`Retry failed for scene ${globalIdx}:`, err);
        setFailedSceneIndices(prev => Array.from(new Set([...prev, globalIdx])));
      } finally {
        setImageLoadingStates(prev => ({ ...prev, [globalIdx]: false }));
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setProcessingState(prev => ({ ...prev, active: false }));
  };

  const handleGenerateAllPromptsForParagraph = async (paragraphNum: number) => {
    const paraScenes = scenes.filter(s => s.paragraphIndex === paragraphNum);
    if (paraScenes.length === 0) {
      setErrorMessage('Storyboard belum dipecah. Harap ketuk tombol pecah storyboard di atas.');
      return;
    }

    setProcessingState({
      active: true,
      title: `Generasi Semua Prompt Paragraf ${paragraphNum}`,
      message: `Mempersiapkan pembuatan prompt visual & video untuk semua adegan di Paragraf ${paragraphNum} secara berurutan...`
    });
    setErrorMessage('');

    try {
      for (let i = 0; i < paraScenes.length; i++) {
        const scene = paraScenes[i];
        const globalIdx = scene.globalIndex;

        setScenes(prev => prev.map(s => s.globalIndex === globalIdx ? { ...s, loading: true } : s));
        setProcessingState(prev => ({
          ...prev,
          message: `Memproses Adegan ${scene.sceneIndexInParagraph} dari ${paraScenes.length} (Paragraf ${paragraphNum})...`
        }));

        await handleGeneratePromptForScene(globalIdx);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err: any) {
      setErrorMessage(`Gagal meng-generate seluruh prompt untuk paragraf ${paragraphNum}: ${err.message}`);
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleGenerateAllImagesForParagraph = async (paragraphNum: number) => {
    const paraScenes = scenes.filter(s => s.paragraphIndex === paragraphNum);
    if (paraScenes.length === 0) {
      setErrorMessage('Storyboard belum dipecah. Harap ketuk tombol pecah storyboard di atas.');
      return;
    }

    setProcessingState({
      active: true,
      title: `Render Semua Gambar Paragraf ${paragraphNum}`,
      message: `Mempersiapkan render gambar untuk semua adegan di Paragraf ${paragraphNum} secara berurutan...`
    });
    setErrorMessage('');

    try {
      for (let i = 0; i < paraScenes.length; i++) {
        let scene = paraScenes[i];
        const globalIdx = scene.globalIndex;

        if (!scene.visualPrompt) {
          await handleGeneratePromptForScene(globalIdx);
          scene = scenes.find(s => s.globalIndex === globalIdx) || scene;
        }

        if (scene.visualPrompt) {
          await handleGenerateImageForScene(globalIdx);
        }

        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    } catch (err: any) {
      setErrorMessage(`Gagal merender semua gambar untuk paragraf ${paragraphNum}: ${err.message}`);
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleGenerateAllImagesForAllParagraphs = async () => {
    if (scenes.length === 0) {
      setErrorMessage('Storyboard belum dipecah. Harap ketuk tombol pecah storyboard di atas.');
      return;
    }

    setProcessingState({
      active: true,
      title: 'Master Render Semua Gambar',
      message: `Memulai sinkronisasi render visual global untuk total ${scenes.length} adegan di seluruh paragraf...`
    });
    setErrorMessage('');

    try {
      for (let i = 0; i < scenes.length; i++) {
        let scene = scenes[i];
        const globalIdx = scene.globalIndex;

        if (!scene.visualPrompt) {
          await handleGeneratePromptForScene(globalIdx);
          scene = scenes.find(s => s.globalIndex === globalIdx) || scene;
        }

        if (scene.visualPrompt && !sceneImages[globalIdx]) {
          await handleGenerateImageForScene(globalIdx);
        }

        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    } catch (err: any) {
      setErrorMessage(`Master render visual mengalami kendala: ${err.message}`);
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleDownloadAllImagesAsZip = async () => {
    const renderedIndices = Object.keys(sceneImages);
    if (renderedIndices.length === 0) {
      setErrorMessage('Belum ada gambar yang di-render. Silakan render gambar terlebih dahulu.');
      return;
    }

    setProcessingState({
      active: true,
      title: 'Mengompresi Gambar Storyboard',
      message: `Mengompilasi ${renderedIndices.length} berkas gambar hasil AI ke dalam satu folder ZIP terpadu...`
    });

    try {
      const JSZipLib: any = await loadJSZip();
      const zip = new JSZipLib();

      renderedIndices.forEach((gIdx) => {
        const dataUrl = sceneImages[parseInt(gIdx)];
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const ext = mimeType.split('/')[1] || 'png';
          zip.file(`AndriAgeMaster_Adegan_${gIdx}.${ext}`, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `AndriAgeMaster_Storyboard_Semua_Adegan.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setErrorMessage('Gagal membuat arsip ZIP. Mengalihkan ke unduhan individual...');
      renderedIndices.forEach((gIdx, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = sceneImages[parseInt(gIdx)];
          link.download = `AndriAgeMaster_Adegan_${gIdx}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 400);
      });
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleGenerateThumbnailVariants = async () => {
    if (selectedTopics.length === 0 && !generatedScript) {
      setErrorMessage('Harap pastikan Anda telah memilih topik atau memasukkan skrip terlebih dahulu.');
      return;
    }

    setProcessingState({
      active: true,
      title: 'Merancang 3 Varian Thumbnail A/B Test',
      message: 'Menganalisis skrip, merumuskan 3 konsep visual unik, dan menghitung estimasi CTR AI...'
    });
    setErrorMessage('');

    const activeStyle = VISUAL_STYLES.find(s => s.id === selectedVisualStyle) || VISUAL_STYLES[0];
    const selectedTopicsTitles = selectedTopics.map(t => t.title).join(', ');
    const mainFaceRef = globalFaceRefs[0]?.dataUrl ? "Karakter Utama (Slot 0) dilampirkan sebagai rujukan wajah." : "Menggunakan deskripsi wajah generik.";

    const promptText = `Berdasarkan topik: "${selectedTopicsTitles || 'Skrip Kustom'}", kata kunci: "${topicQuery || 'YouTube'}", dan narasi skrip:
"${generatedScript.slice(0, 1000)}..."

Rancanglah 3 KONSEP VARIAN THUMBNAIL YOUTUBE A/B TEST BERBEDA (A, B, dan C) beserta EVALUASI PREDIKSI CTR VISUAL AI:

GAYA VISUAL WAJIB DITERAPKAN: "${activeStyle.promptGuide}"

Spesifikasi 3 Konsep:
1. VARIANT A (Shock Curiosity): Warna kontras tinggi, ekspresi wajah shock/panik/kaget dramatis, pemicu pola interrupt tajam, dengan overlay teks 2-3 kata ("${editableOverlayText}").
2. VARIANT B (Minimalist Story Arc): Estetika bersih/sinematik, pencahayaan dramatis, gaya cerita mendalam, fokus emosi personal dengan overlay teks bercerita singkat.
3. VARIANT C (High-Stakes / Action): Komposisi dinamis berenergi tinggi, elemen aksi/transformasi meledak-ledak, visual taruhan tinggi, overlay teks deklarasi tajam.

INFORMASI RUJUKAN WAJAH: ${mainFaceRef}

Berikan evaluasi realistis nilai CTR (0-100) dan rincian skor visual (1-10) untuk setiap varian:
- faceProminence (Kejelasan & ekspresi wajah)
- textReadability (Kontras & daya pikat teks)
- curiosityGap (Daya dorong klik penonton)
- colorPop (Dominasi warna & keterlihatan feed)

Kembalikan data dalam format JSON yang valid:
{
  "variants": [
    {
      "id": "variant-a",
      "title": "Varian A: Shock Curiosity",
      "conceptType": "Shock Curiosity",
      "badge": "⚡ High Pattern Interrupt",
      "prompt": "Detailed English art prompt for Variant A specifying shocking face expression, contrasting vibrant background, emotional intensity, and subject composition matching active visual style guide.",
      "overlayText": "${editableOverlayText}",
      "ctrScore": 94,
      "estimatedCtrRange": "12.8% - 15.5%",
      "evalBreakdown": {
        "faceProminence": 9,
        "textReadability": 9,
        "curiosityGap": 10,
        "colorPop": 9
      },
      "critique": "Ekspresi shock ekstrem dipadukan warna kontras tinggi terbukti menghasilkan angka klik teratas di YouTube feed."
    },
    {
      "id": "variant-b",
      "title": "Varian B: Minimalist Story Arc",
      "conceptType": "Minimalist Story Arc",
      "badge": "📖 Deep Emotional Mystery",
      "prompt": "Detailed English art prompt for Variant B specifying cinematic studio lighting, minimalist composition, deep narrative curiosity matching active visual style guide.",
      "overlayText": "${editableOverlayText}",
      "ctrScore": 86,
      "estimatedCtrRange": "10.2% - 12.4%",
      "evalBreakdown": {
        "faceProminence": 8,
        "textReadability": 8,
        "curiosityGap": 9,
        "colorPop": 8
      },
      "critique": "Pencahayaan sinematik dan komposisi bersih menarik kelompok penonton yang menyukai dokumenter/penceritaan emosional."
    },
    {
      "id": "variant-c",
      "title": "Varian C: High-Stakes Action",
      "conceptType": "High-Stakes Action",
      "badge": "🔥 High Energy & Stakes",
      "prompt": "Detailed English art prompt for Variant C specifying explosive energy, dynamic motion blur, high stakes environment matching active visual style guide.",
      "overlayText": "${editableOverlayText}",
      "ctrScore": 90,
      "estimatedCtrRange": "11.5% - 13.9%",
      "evalBreakdown": {
        "faceProminence": 8,
        "textReadability": 9,
        "curiosityGap": 9,
        "colorPop": 10
      },
      "critique": "Elemen dinamis berenergi tinggi sangat cocok untuk menghentikan scroll penonton saat menjelajah YouTube."
    }
  ]
}`;

    try {
      const data = await generateText(promptText, { isJson: true });
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResponse) {
        const parsed = extractAndParseJson(textResponse);
        if (parsed && Array.isArray(parsed.variants) && parsed.variants.length === 3) {
          const initialVariants: ThumbnailVariant[] = parsed.variants.map((v: any) => ({
            ...v,
            imageUrl: '',
            isLoading: true
          }));

          setThumbnailVariants(initialVariants);
          setProcessingState(prev => ({
            ...prev,
            message: 'Merender 3 gambar varian thumbnail secara langsung dengan Google Flow Nano Banana 2...'
          }));

          const mainFace = globalFaceRefs[0];
          const hasMainFace = mainFace && mainFace.dataUrl && mainFace.dataUrl.trim().length > 0;

          for (let i = 0; i < initialVariants.length; i++) {
            const v = initialVariants[i];
            const promptWithNegative = `${v.prompt}. CRITICAL REQUIREMENT: Overlay text "${v.overlayText}" prominently in bold high contrast typography. Negative prompt: ${AUTOMATIC_NEGATIVE_PROMPT}`;

            let partsArray: any[] = [];
            if (hasMainFace) {
              partsArray.push({
                text: `Using the attached main character portrait reference (ROLE: MAIN PROTAGONIST), adapt the facial features into this high-CTR YouTube thumbnail variant art: ${promptWithNegative}`
              });
              partsArray.push({
                inlineData: {
                  mimeType: mainFace.dataUrl.split(';')[0].split(':')[1] || 'image/jpeg',
                  data: mainFace.dataUrl.split(',')[1]
                }
              });
            } else {
              partsArray.push({ text: promptWithNegative });
            }

            try {
              const imgResponse = await generateImage(partsArray, globalAspectRatio);
              const part = imgResponse?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
              if (part && part.inlineData && part.inlineData.data) {
                const generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setThumbnailVariants(prev => prev.map(variant => 
                  variant.id === v.id ? { ...variant, imageUrl: generatedUrl, isLoading: false } : variant
                ));
              }
            } catch (vErr) {
              console.error(`Failed to render variant ${v.id}:`, vErr);
              setThumbnailVariants(prev => prev.map(variant => 
                variant.id === v.id ? { ...variant, isLoading: false } : variant
              ));
            }
          }
          // Automatically pick the highest scoring variant as default selected
          const topScoring = [...initialVariants].sort((a, b) => b.ctrScore - a.ctrScore)[0];
          if (topScoring) {
            setSelectedThumbnail(topScoring);
          }

        } else {
          throw new Error("Gagal menyusun 3 varian thumbnail.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghasilkan varian thumbnail.');
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleManualFusionThumbnail = async () => {
    if (uploadedThumbnailImages.length === 0) {
      setErrorMessage('Unggah setidaknya 1-4 foto kustom terlebih dahulu untuk melakukan AI Fusion.');
      return;
    }

    setProcessingState({
      active: true,
      title: 'Melakukan AI Multi-Image Fusion',
      message: `Menggabungkan ${uploadedThumbnailImages.length} foto kustom dengan gaya visual aktif & overlay teks "${editableOverlayText}"...`
    });
    setErrorMessage('');

    const activeStyle = VISUAL_STYLES.find(s => s.id === selectedVisualStyle) || VISUAL_STYLES[0];

    const fusionTextPrompt = `Act as an elite YouTube graphic designer. Merge and blend the provided ${uploadedThumbnailImages.length} custom source image(s) seamlessly into a high-CTR YouTube thumbnail collage matching this style: "${activeStyle.promptGuide}".
CRITICAL REQUIREMENT: You MUST overlay the following text in massive, bold, high-contrast typography directly onto the merged thumbnail image: "${editableOverlayText}". Negative prompt: ${AUTOMATIC_NEGATIVE_PROMPT}`;

    const imageParts = uploadedThumbnailImages.map(img => {
      const base64Data = img.dataUrl.split(',')[1];
      const mimeType = img.dataUrl.split(';')[0].split(':')[1];
      return {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: base64Data
        }
      };
    });

    try {
      const response = await generateImage([{ text: fusionTextPrompt }, ...imageParts], globalAspectRatio);

      const part = response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (part && part.inlineData && part.inlineData.data) {
        const generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        
        const fusionVariant: ThumbnailVariant = {
          id: 'variant-a',
          title: 'Varian Fusion Manual AI',
          conceptType: 'Shock Curiosity',
          badge: '🎨 Multi-Image Fusion',
          prompt: fusionTextPrompt,
          overlayText: editableOverlayText,
          imageUrl: generatedUrl,
          isLoading: false,
          ctrScore: 92,
          estimatedCtrRange: "12.0% - 14.8%",
          evalBreakdown: { faceProminence: 9, textReadability: 9, curiosityGap: 9, colorPop: 9 },
          critique: "Penggabungan elemen foto kustom dengan AI berhasil menciptakan komposisi unik ber-CTR tinggi."
        };

        setThumbnailVariants([fusionVariant]);
        setSelectedThumbnail(fusionVariant);
      } else {
        throw new Error("Model AI gagal merender penggabungan gambar.");
      }
    } catch (err: any) {
      setErrorMessage(`Gagal merender AI Fusion: ${err.message}`);
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const handleSingleVariantRender = async (variantId: 'variant-a' | 'variant-b' | 'variant-c') => {
    const variant = thumbnailVariants.find(v => v.id === variantId);
    if (!variant) return;

    setThumbnailVariants(prev => prev.map(v => v.id === variantId ? { ...v, isLoading: true } : v));
    setProcessingState({
      active: true,
      title: `Re-rendering ${variant.title}`,
      message: 'Merender ulang gambar thumbnail dengan Google Flow...'
    });

    const promptWithNegative = `${variant.prompt}. CRITICAL REQUIREMENT: Overlay text "${editableOverlayText}" prominently in bold high contrast typography. Negative prompt: ${AUTOMATIC_NEGATIVE_PROMPT}`;

    let partsArray: any[] = [];
    const mainFace = globalFaceRefs[0];
    if (mainFace && mainFace.dataUrl && mainFace.dataUrl.trim().length > 0) {
      partsArray.push({
        text: `Using the attached main character portrait reference (ROLE: MAIN PROTAGONIST), adapt facial features into this high-CTR thumbnail art: ${promptWithNegative}`
      });
      partsArray.push({
        inlineData: {
          mimeType: mainFace.dataUrl.split(';')[0].split(':')[1] || 'image/jpeg',
          data: mainFace.dataUrl.split(',')[1]
        }
      });
    } else {
      partsArray.push({ text: promptWithNegative });
    }

    try {
      const imgResponse = await generateImage(partsArray, globalAspectRatio);
      const part = imgResponse?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (part && part.inlineData && part.inlineData.data) {
        const generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        setThumbnailVariants(prev => prev.map(v => 
          v.id === variantId ? { ...variant, imageUrl: generatedUrl, overlayText: editableOverlayText, isLoading: false } : v
        ));
      }
    } catch (err: any) {
      setErrorMessage(`Gagal re-render ${variant.title}: ${err.message}`);
    } finally {
      setThumbnailVariants(prev => prev.map(v => v.id === variantId ? { ...v, isLoading: false } : v));
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const renderCanvasComposition = async (
    bgImageUrl: string,
    text: string,
    fontSize: number,
    textColor: string,
    strokeColor: string,
    position: 'top' | 'middle' | 'bottom',
    fontStyle: string,
    sticker: string,
    stickerPos: string,
    aspectRatio: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      if (!bgImageUrl) return resolve('');

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = aspectRatio === '9:16' ? 1080 : 1920;
        const height = aspectRatio === '9:16' ? 1920 : 1080;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(bgImageUrl);

        ctx.drawImage(img, 0, 0, width, height);

        if (sticker && sticker !== 'none') {
          ctx.save();
          let stickerX = width - 280;
          let stickerY = 40;
          if (stickerPos === 'top-left') { stickerX = 40; stickerY = 40; }
          else if (stickerPos === 'bottom-left') { stickerX = 40; stickerY = height - 280; }
          else if (stickerPos === 'bottom-right') { stickerX = width - 280; stickerY = height - 280; }

          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.strokeStyle = textColor || '#FFD700';
          ctx.lineWidth = 6;
          
          if (typeof (ctx as any).roundRect === 'function') {
            ctx.beginPath();
            (ctx as any).roundRect(stickerX, stickerY, 240, 240, 32);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(stickerX, stickerY, 240, 240);
            ctx.strokeRect(stickerX, stickerY, 240, 240);
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let badgeIcon = '🔥';
          let badgeLabel = 'VIRAL';
          if (sticker === 'viral_fire') { badgeIcon = '🔥'; badgeLabel = 'VIRAL'; }
          else if (sticker === 'must_watch') { badgeIcon = '👀'; badgeLabel = 'MUST WATCH'; }
          else if (sticker === 'red_arrow') { badgeIcon = '🚨'; badgeLabel = 'URGENT'; }
          else if (sticker === 'shock_emoji') { badgeIcon = '😱'; badgeLabel = 'SHOCKING'; }
          else if (sticker === 'glow_circle') { badgeIcon = '⚡'; badgeLabel = 'EXCLUSIVE'; }

          ctx.font = '110px sans-serif';
          ctx.fillText(badgeIcon, stickerX + 120, stickerY + 95);

          ctx.font = '900 24px Arial, sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(badgeLabel, stickerX + 120, stickerY + 185);
          ctx.restore();
        }

        if (text && text.trim().length > 0) {
          ctx.save();
          let fontFamily = 'Impact, Arial Black, sans-serif';
          if (fontStyle === 'YouTube Bold') fontFamily = 'Arial Black, Gadget, sans-serif';
          else if (fontStyle === 'Modern Sans') fontFamily = 'Inter, system-ui, sans-serif';

          const scaledFontSize = Math.round(fontSize * (width / 950));
          ctx.font = `900 ${scaledFontSize}px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textX = width / 2;
          let textY = height - (scaledFontSize * 1.6);
          if (position === 'top') { textY = scaledFontSize * 1.6; }
          else if (position === 'middle') { textY = height / 2; }

          ctx.fillStyle = textColor;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = Math.max(8, Math.round(scaledFontSize / 7));
          ctx.lineJoin = 'round';

          ctx.strokeText(text.toUpperCase(), textX, textY);
          ctx.fillText(text.toUpperCase(), textX, textY);
          ctx.restore();
        }

        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.onerror = () => resolve(bgImageUrl);
      img.src = bgImageUrl;
    });
  };

  const handleOpenCanvasEditor = (variant: ThumbnailVariant) => {
    setSelectedThumbnail(variant);
    setCanvasOverlayText(variant.overlayText || editableOverlayText || 'RAHASIA TERBONGKAR!');
    setIsCanvasEditorOpen(true);
  };

  useEffect(() => {
    if (isCanvasEditorOpen && selectedThumbnail?.imageUrl) {
      setIsRenderingCanvas(true);
      renderCanvasComposition(
        selectedThumbnail.imageUrl,
        canvasOverlayText,
        canvasFontSize,
        canvasTextColor,
        canvasStrokeColor,
        canvasTextPosition,
        canvasFontStyle,
        canvasActiveSticker,
        canvasStickerPosition,
        globalAspectRatio
      ).then((resUrl) => {
        setCanvasPreviewUrl(resUrl);
        setIsRenderingCanvas(false);
      });
    }
  }, [
    isCanvasEditorOpen,
    selectedThumbnail,
    canvasOverlayText,
    canvasFontSize,
    canvasTextColor,
    canvasStrokeColor,
    canvasTextPosition,
    canvasFontStyle,
    canvasActiveSticker,
    canvasStickerPosition,
    globalAspectRatio
  ]);

  const handleSaveCanvasEdits = () => {
    if (!selectedThumbnail || !canvasPreviewUrl) return;

    const updatedVariant: ThumbnailVariant = {
      ...selectedThumbnail,
      imageUrl: canvasPreviewUrl,
      overlayText: canvasOverlayText
    };

    setSelectedThumbnail(updatedVariant);
    setThumbnailVariants(prev => prev.map(v => v.id === updatedVariant.id ? updatedVariant : v));
    setIsCanvasEditorOpen(false);
  };

  const calculateChapterTimecodes = (paragraphs: string[], audioSecs: number): ChapterTimecode[] => {
    let runningSeconds = 0;
    const totalWords = paragraphs.join(' ').split(/\s+/).filter(w => w.length > 0).length || 1;
    const secsPerWord = audioSecs > 0 ? (audioSecs / totalWords) : (60 / 130);

    return paragraphs.map((para, idx) => {
      const mins = Math.floor(runningSeconds / 60);
      const secs = Math.floor(runningSeconds % 60);
      const timecode = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      const words = para.split(/\s+/).filter(w => w.length > 0);
      runningSeconds += words.length * secsPerWord;

      const snippet = para.slice(0, 35).replace(/[^\w\s]/gi, '').trim();
      const defaultTitle = idx === 0 ? "Intro & Hook Utama" : `${snippet}...`;

      return { timecode, title: defaultTitle };
    });
  };

  const handleGenerateSEO = async () => {
    if (!generatedScript) {
      setErrorMessage('Pastikan naskah skrip sudah tersedia sebelum membuat SEO.');
      return;
    }
    setProcessingState({
      active: true,
      title: 'Mengoptimasi Algoritma SEO & Timecode Bab',
      message: 'Menyusun 5 Judul Viral, Deskripsi SEO lengkap, Timecode Bab, dan Tags Bilingual (ID + EN)...'
    });
    setErrorMessage('');

    const calculatedChapters = calculateChapterTimecodes(scriptParagraphs, audioDuration);
    const chapterStringText = calculatedChapters.map(c => `${c.timecode} ${c.title}`).join('\n');

    const selectedTopicsTitles = selectedTopics.map(t => t.title).join(', ');
    const promptText = `Berdasarkan topik: "${selectedTopicsTitles || 'Skrip Kustom'}", kata kunci: "${topicQuery || 'YouTube'}", dan skrip:
"${generatedScript.slice(0, 1800)}"

Rancanglah Paket Metadata SEO YouTube Tingkat Lanjut (High Algorithm Performance):

1. VIRAL TITLES (viralTitles): 5 alternatif judul YouTube ber-CTR tinggi (maksimal 65 karakter per judul) yang mengandung kata kunci utama.
2. TIMECODE CHAPTERS (chapters): Gunakan atau perbaiki judul bab berikut sesuai waktu timecode-nya:
${chapterStringText}
3. DESKRIPSI UTUH (description): Deskripsi YouTube 3 paragraf lengkap memikat penonton di 2 kalimat pertama, mencantumkan Ringkasan Cerita, Poin Kunci, Bagian Timestamps/Chapters berikut:\n${chapterStringText}\n\nDisclaimer Hak Cipta, dan 5 Hashtags Utama.
4. MULTILINGUAL TAGS (multilingualTags): 15-20 kata kunci tag pencarian YouTube paling populer dalam Bahasa Indonesia DAN Bahasa Inggris (Total gabungan karakter WAJIB di bawah 480 karakter agar tidak melebihi batas 500 YouTube).
5. PRIMARY KEYWORDS (primaryKeywords): 6-8 kata kunci utama teratas.

Kembalikan dalam format JSON yang valid:
{
  "viralTitles": [
    "Judul Viral 1 (CTR Teratas)",
    "Judul Viral 2",
    "Judul Viral 3",
    "Judul Viral 4",
    "Judul Viral 5"
  ],
  "description": "Teks Deskripsi Lengkap YouTube dengan Timestamps dan Hashtags...",
  "chapters": [
    { "timecode": "00:00", "title": "Intro & Hook Utama" },
    { "timecode": "01:15", "title": "Pembahasan..." }
  ],
  "multilingualTags": ["tag1", "tag2", "tag3", "tag indonesia", "english tag"],
  "primaryKeywords": ["keyword1", "keyword2", "keyword3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

    try {
      const data = await generateText(promptText, { isJson: true });
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        const parsed = extractAndParseJson(textResponse);
        if (parsed) {
          const titles = Array.isArray(parsed.viralTitles) ? parsed.viralTitles : (parsed.mainTitle ? [parsed.mainTitle, ...(parsed.altTitles || [])] : []);
          const chosenTitle = titles[0] || 'Judul Video YouTube High CTR';

          setSeoData({
            viralTitles: titles,
            selectedTitle: chosenTitle,
            description: parsed.description || '',
            chapters: Array.isArray(parsed.chapters) && parsed.chapters.length > 0 ? parsed.chapters : calculatedChapters,
            multilingualTags: Array.isArray(parsed.multilingualTags) ? parsed.multilingualTags : (parsed.keywords || []),
            primaryKeywords: Array.isArray(parsed.primaryKeywords) ? parsed.primaryKeywords : [],
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : []
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses data SEO.');
    } finally {
      setProcessingState(prev => ({ ...prev, active: false }));
    }
  };

  const generateMasterBlueprintText = (): string => {
    let content = `==================================================\n`;
    content += `          AGE YT#1 MASTER PRO BLUEPRINT           \n`;
    content += `==================================================\n\n`;
    
    content += `[SECTION 1: CONFIGURATION & NICHE]\n`;
    content += `- Niche Keyword   : ${topicQuery || 'General Topic'}\n`;
    content += `- Format Video    : YouTube ${videoType.toUpperCase()}\n`;
    content += `- Durasi Target   : ${duration} ${videoType === 'long' ? 'Menit' : 'Detik'}\n`;
    content += `- Bahasa          : ${language === 'id' ? 'Indonesia' : 'Inggris'}\n`;
    content += `- Target Audiens  : ${targetAudience.toUpperCase()}\n`;
    content += `- Gaya Narasi     : ${narrationStyle.toUpperCase()}\n`;
    content += `- Visual Style    : ${selectedVisualStyle.toUpperCase()}\n\n`;

    if (seoData.selectedTitle || seoData.viralTitles.length > 0) {
      content += `[SECTION 2: SEO METADATA & CHAPTERS]\n`;
      content += `Judul Terpilih    : ${seoData.selectedTitle || seoData.viralTitles[0]}\n\n`;
      content += `Alternatif Judul  :\n${seoData.viralTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n`;
      content += `Deskripsi Video   :\n${seoData.description}\n\n`;
      content += `Multilingual Tags : ${seoData.multilingualTags.join(', ')}\n`;
      content += `Core Keywords     : ${seoData.primaryKeywords.join(', ')}\n`;
      content += `Hashtags          : ${seoData.hashtags.join(' ')}\n\n`;
    }

    if (generatedScript) {
      content += `[SECTION 3: FULL SCRIPT & SOURCES]\n${generatedScript}\n\n`;
      if (scriptSourcesUsed.length > 0) {
        content += `Rujukan & Basis Data:\n`;
        scriptSourcesUsed.forEach((s, i) => {
          content += `${i + 1}. [${s.type}] ${s.name} - ${s.relevance}\n`;
        });
        content += `\n`;
      }
    }

    if (scenes.length > 0) {
      content += `[SECTION 4: STORYBOARD & SCENE PROMPTS]\n`;
      scenes.forEach(scene => {
        content += `Adegan ${scene.globalIndex} (Paragraf ${scene.paragraphIndex} - ${scene.startTimeCode} s/d ${scene.endTimeCode}):\n`;
        content += `- Kalimat         : "${scene.sentence}"\n`;
        content += `- Visual Prompt   : ${scene.visualPrompt || '(Belum dibuat)'}\n`;
        content += `- Motion Prompt   : ${scene.videoPrompt || '(Belum dibuat)'}\n`;
        content += `- Aspect Ratio    : ${sceneRatios[scene.globalIndex] || globalAspectRatio}\n\n`;
      });
    }

    if (selectedThumbnail) {
      content += `[SECTION 5: THUMBNAIL & CTR ANALYTICS]\n`;
      content += `- Judul Varian    : ${selectedThumbnail.title}\n`;
      content += `- Concept Type    : ${selectedThumbnail.conceptType}\n`;
      content += `- Teks Overlay    : "${selectedThumbnail.overlayText}"\n`;
      content += `- AI CTR Score    : ${selectedThumbnail.ctrScore}/100 (Est. ${selectedThumbnail.estimatedCtrRange})\n`;
      content += `- Visual Prompt   : ${selectedThumbnail.prompt}\n`;
      content += `- Evaluasi Critique: ${selectedThumbnail.critique}\n\n`;
    }

    content += `==================================================\n`;
    content += `   AGE YT#1 Master • Studio Pro v2.5 Blueprint    \n`;
    content += `==================================================\n`;

    return content;
  };

  const [isZippingAssetPackage, setIsZippingAssetPackage] = useState(false);
  const [zipProgressPercent, setZipProgressPercent] = useState(0);

  const handleDownloadAssetZip = async () => {
    setIsZippingAssetPackage(true);
    setZipProgressPercent(10);
    setErrorMessage('');

    try {
      const JSZipLib: any = await loadJSZip();
      const zip = new JSZipLib();

      setZipProgressPercent(25);
      const blueprintText = generateMasterBlueprintText();
      zip.file('blueprint.txt', blueprintText);

      if (audioUrl) {
        setZipProgressPercent(40);
        try {
          const audioResponse = await fetch(audioUrl);
          const audioBlob = await audioResponse.blob();
          zip.file('audio_voiceover.wav', audioBlob);
        } catch (aErr) {
          console.warn("Failed to attach audio blob to zip:", aErr);
        }
      }

      if (selectedThumbnail?.imageUrl) {
        setZipProgressPercent(55);
        const match = selectedThumbnail.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          zip.file('thumbnail_main.png', match[2], { base64: true });
        }
      }

      const scenesFolder = zip.folder('scenes');
      const renderedSceneIndices = Object.keys(sceneImages);
      setZipProgressPercent(70);

      renderedSceneIndices.forEach((gIdx, idx) => {
        const dataUrl = sceneImages[parseInt(gIdx)];
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match && scenesFolder) {
          const paddedNum = (idx + 1).toString().padStart(3, '0');
          scenesFolder.file(`scene_${paddedNum}.png`, match[2], { base64: true });
        }
      });

      const facesFolder = zip.folder('face_references');
      const activeFaces = getActiveFaceRefs();
      setZipProgressPercent(85);

      activeFaces.forEach((f) => {
        const match = f.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match && facesFolder) {
          facesFolder.file(`slot_${f.slotIndex + 1}_${f.role}_${f.gender}.png`, match[2], { base64: true });
        }
      });

      setZipProgressPercent(95);
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);

      const link = document.createElement('a');
      link.href = downloadUrl;
      const safeTitle = (seoData.selectedTitle || topicQuery || 'Project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `Master_Asset_Package_${safeTitle}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setZipProgressPercent(100);
    } catch (err: any) {
      setErrorMessage(`Gagal membuat paket ZIP: ${err.message}. Silakan unduh laporan .TXT secara terpisah.`);
    } finally {
      setTimeout(() => {
        setIsZippingAssetPackage(false);
        setZipProgressPercent(0);
      }, 800);
    }
  };

  const handleConfirmResetProject = () => {
    setTopicQuery('');
    setTopics([]);
    setSelectedTopics([]); 
    setManualScriptInput('');
    setScriptSources(''); 
    setGeneratedScript('');
    setScriptParagraphs([]);
    setScriptSourcesUsed([]);
    setGlobalFaceRefs(FACE_SLOTS.map(slot => ({
      id: `slot-${slot.slotIndex}`,
      dataUrl: '',
      role: slot.role,
      gender: 'male',
      label: slot.label,
      slotIndex: slot.slotIndex
    })));
    setScenes([]);
    setThumbnailVariants([]);
    setSelectedThumbnail(null);
    setAudioDuration(0);
    setSeoData({
      viralTitles: [],
      selectedTitle: '',
      description: '',
      chapters: [],
      multilingualTags: [],
      primaryKeywords: [],
      hashtags: []
    });
    setActiveStep(1);
    setShowResetModal(false);
  };

  const handleExportProject = () => {
    const blueprintText = generateMasterBlueprintText();
    const blob = new Blob([blueprintText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (seoData.selectedTitle || topicQuery || 'Project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `AGE_YT1_Master_Blueprint_${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleParagraphDropdown = (pIdx: number) => {
    setExpandedParagraphs(prev => ({
      ...prev,
      [pIdx]: !prev[pIdx]
    }));
  };

  useEffect(() => {
    if (activeStep === 4 && thumbnailVariants.length === 0 && (selectedTopics.length > 0 || generatedScript)) {
      handleGenerateThumbnailVariants();
    }
    if (activeStep === 5 && seoData.viralTitles.length === 0 && (selectedTopics.length > 0 || generatedScript)) {
      handleGenerateSEO();
    }
  }, [activeStep]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans antialiased transition-colors duration-300 ${
      darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* COLLAPSIBLE LEFT SIDEBAR */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        selectedTopics={selectedTopics}
        generatedScript={generatedScript}
        networkSpeed={networkSpeed}
        isApiAutoConnected={isApiAutoConnected}
        googleAccount={googleAccount}
        activeApiKeysCount={activeApiKeysCount}
        onOpenApiKeySettings={() => setShowApiKeyModal(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        completedProjectsCount={completedProjectsCount}
        setErrorMessage={setErrorMessage}
      />

      {/* MAIN WORKSPACE CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Top Header Workspace Status Bar */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeStep={activeStep}
          topicQuery={topicQuery}
          darkMode={darkMode}
          setShowResetModal={setShowResetModal}
        />

        {/* Scrollable Main Steps Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className={`transition-all duration-300 w-full ${
            viewMode === 'mobile' ? 'max-w-[420px] border shadow-2xl rounded-3xl p-4 bg-zinc-950 border-zinc-800' : 'max-w-7xl'
          }`}>

            {/* Toast Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-bold text-xs">Error Terjadi</h5>
                  <p className="text-[11px] leading-relaxed mt-0.5">{errorMessage}</p>
                </div>
                <button 
                  onClick={() => setErrorMessage('')} 
                  className="text-[10px] hover:underline uppercase tracking-wider font-bold"
                >
                  ✖️ Tutup
                </button>
              </div>
            )}

            {/* STEP 1: TOPIC DISCOVERY & MANUAL ENTRY */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300 shadow-md'
                }`}>
                  <h3 className="text-base font-bold flex items-center gap-2 text-indigo-500">
                    <Flame className="h-4 w-4 text-orange-500 animate-pulse" /> 
                    Step 1: Topic Discovery & Search Grounding
                  </h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-400' : 'text-slate-800 font-semibold'}`}>
                    Mencari beberapa ide topik viral berskala tinggi sekaligus menggunakan data Google Search & YouTube real-time.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                        Format Video
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { setVideoType('long'); setDuration('12'); }}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                            videoType === 'long' 
                              ? 'bg-indigo-600 text-white border-transparent shadow' 
                              : (darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-300 text-slate-900')
                          }`}
                        >
                          📹 Long Form
                        </button>
                        <button 
                          onClick={() => { setVideoType('shorts'); setDuration('60'); }}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                            videoType === 'shorts' 
                              ? 'bg-indigo-600 text-white border-transparent shadow' 
                              : (darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-300 text-slate-900')
                          }`}
                        >
                          ⚡ Shorts
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                        Target Audiens
                      </label>
                      <select 
                        value={targetAudience} 
                        onChange={(e) => setTargetAudience(e.target.value as any)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg border outline-none ${
                          darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="indonesia">🇮🇩 Indonesia (Konten & Tren Lokal)</option>
                        <option value="global">🇺🇸 Global (Amerika / US Focus - English)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                        Durasi Video
                      </label>
                      {videoType === 'long' ? (
                        <select 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)}
                          className={`w-full py-2 px-3 text-xs font-bold rounded-lg border outline-none ${
                            darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="8">8 Menit</option>
                          <option value="12">12 Menit</option>
                          <option value="15">15 Menit</option>
                          <option value="20">20 Menit</option>
                        </select>
                      ) : (
                        <select 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)}
                          className={`w-full py-2 px-3 text-xs font-bold rounded-lg border outline-none ${
                            darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="30">30 Detik</option>
                          <option value="45">45 Detik</option>
                          <option value="60">60 Detik</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                        Kata Kunci Utama (Keyword)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Contoh: Atlantis, Moon Conspiracy" 
                          value={topicQuery}
                          onChange={(e) => setTopicQuery(e.target.value)}
                          className={`flex-1 py-2 px-3 text-xs rounded-lg border outline-none ${
                            darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                        <button 
                          onClick={handleDiscoverTopics}
                          className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                            darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-slate-955 text-white'
                          }`}
                        >
                          <span>🔍</span>
                          Riset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MANUAL SCRIPT INPUT BOX */}
                <div className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300 shadow-md'
                }`}>
                  <h4 className={`text-sm font-bold flex items-center gap-2 mb-2 ${darkMode ? 'text-zinc-200' : 'text-slate-900'}`}>
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Atau Masukkan Skrip Secara Manual (Lewati Riset Topik)
                  </h4>
                  <p className={`text-xs mb-3 ${darkMode ? 'text-zinc-400' : 'text-slate-800 font-medium'}`}>
                    Jika Anda sudah memiliki naskah sendiri, tempelkan di bawah ini untuk diproses langsung.
                  </p>
                  <textarea
                    value={manualScriptInput}
                    onChange={(e) => setManualScriptInput(e.target.value)}
                    placeholder="Tempel atau ketik draf skrip Anda di sini..."
                    rows={4}
                    className={`w-full p-3 text-xs rounded-lg border outline-none resize-none ${
                      darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => {
                        if (!manualScriptInput.trim()) {
                          setErrorMessage('Masukkan naskah/skrip manual terlebih dahulu.');
                          return;
                        }
                        setGeneratedScript(manualScriptInput);
                        const paragraphs = manualScriptInput.split('\n').filter(p => p.trim().length > 0);
                        setScriptParagraphs(paragraphs);
                        setSelectedTopics([{
                          id: 'manual',
                          title: 'Skrip Kustom Pengguna',
                          explanation: 'Naskah yang diinputkan secara manual oleh pengguna.'
                        }]);
                        setActiveStep(2);
                      }}
                      className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        darkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                      }`}
                    >
                      <span>✍️</span>
                      Gunakan Skrip Manual & Lanjut ke Step 2
                    </button>
                  </div>
                </div>

                {/* TOPICS DISPLAY GRID */}
                {topics.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                        10 Ide Topik Sangat Relevan:
                      </h4>
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-md font-semibold">
                        {selectedTopics.length} Topik Terpilih
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topics.map((t) => {
                        const isAlreadySelected = selectedTopics.some(topic => topic.id === t.id);
                        return (
                          <div 
                            key={t.id} 
                            onClick={() => handleToggleTopic(t)}
                            className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isAlreadySelected 
                                ? 'bg-indigo-500/5 border-indigo-500 shadow-md ring-2 ring-indigo-500/50' 
                                : (darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300')
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  Topik {t.id}
                                </span>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">CTR: {t.ctrEstimate || "9.4%"}</span>
                              </div>

                              <h4 className={`font-bold text-sm ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                                {t.title}
                              </h4>
                              <p className={`text-xs mt-2 leading-relaxed line-clamp-3 ${darkMode ? 'text-zinc-400' : 'text-slate-800'}`}>
                                {t.explanation}
                              </p>
                            </div>

                            <div className={`flex justify-between items-center mt-4 pt-3 border-t ${darkMode ? 'border-zinc-800/40' : 'border-slate-200'}`}>
                              <span className="text-xs font-bold text-indigo-400">Viral Score: {t.viralScore}%</span>
                              <span className="text-xs font-bold text-indigo-500">
                                {isAlreadySelected ? '✓ Terpilih' : 'Pilih Ide Ini'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={`flex justify-end pt-6 border-t ${darkMode ? 'border-zinc-800/40' : 'border-slate-300'}`}>
                  <button
                    onClick={() => {
                      if (selectedTopics.length === 0 && !generatedScript) {
                        setErrorMessage('Silakan pilih minimal satu topik atau masukkan skrip manual di Step 1 terlebih dahulu.');
                        return;
                      }
                      setActiveStep(2);
                    }}
                    className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    Lanjut ke Edit Skrip & Narasi
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SCRIPT SYNTHESIS & 6-TIER FACE SLOTS */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300 shadow-md'
                }`}>
                  <h3 className="text-base font-bold flex items-center gap-2 text-indigo-500">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    Step 2: Script Synthesis & 6-Tier Character Reference System
                  </h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-400' : 'text-slate-800 font-semibold'}`}>
                    Membangun naskah skrip narasi YouTube dengan integrasi 6-tier slot referensi wajah karakter.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 p-4 rounded-xl border bg-zinc-950/40 border-zinc-800/80">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                        🌐 Bahasa Skrip Narasi
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          onClick={() => setLanguage('id')}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                            language === 'id' 
                              ? 'bg-indigo-600 text-white border-transparent shadow' 
                              : (darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-300 text-slate-900')
                          }`}
                        >
                          🇮🇩 Indonesia
                        </button>
                        <button 
                          type="button"
                          onClick={() => setLanguage('en')}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                            language === 'en' 
                              ? 'bg-indigo-600 text-white border-transparent shadow' 
                              : (darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-300 text-slate-900')
                          }`}
                        >
                          🇺🇸 English
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-1 lg:col-span-2">
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                        🎭 Gaya Narasi / Pembawaan Skrip
                      </label>
                      <select 
                        value={narrationStyle} 
                        onChange={(e) => setNarrationStyle(e.target.value)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg border outline-none ${
                          darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="storytelling">📖 Storytelling (Alur Narasi Mengalir, Epik & Mendalam)</option>
                        <option value="jokes">😄 Jokes & Humoris (Santai, Lucu & Penuh Candaan Segar)</option>
                        <option value="mind-blowing">🤯 Mind-Blowing (Teori Konspirasi & Fakta Mengejutkan)</option>
                        <option value="casual">💬 Santai (Seperti Mengobrol Akrab dengan Teman Dekat)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                      <span>🖼️</span> Hierarki 6 Slot Referensi Wajah Karakter
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {FACE_SLOTS.map((slot) => {
                        const faceRef = globalFaceRefs.find(f => f.slotIndex === slot.slotIndex);
                        const dataUrl = faceRef?.dataUrl || '';
                        const currentGender = faceRef?.gender || 'male';

                        return (
                          <div 
                            key={slot.slotIndex} 
                            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                              slot.role === 'main'
                                ? 'bg-amber-500/5 border-amber-500/30'
                                : slot.role === 'supporting'
                                  ? 'bg-indigo-500/5 border-indigo-500/30'
                                  : 'bg-purple-500/5 border-purple-500/30'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                  slot.role === 'main'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : slot.role === 'supporting'
                                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                }`}>
                                  {slot.label}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-400">Slot #{slot.slotIndex + 1}</span>
                              </div>

                              {dataUrl ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-700 group my-2">
                                  <img src={dataUrl} alt={slot.label} className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => handleRemoveSlotPhoto(slot.slotIndex)}
                                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-80 hover:opacity-100 transition-opacity"
                                    title="Hapus Foto"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className={`relative border-2 border-dashed rounded-lg p-3 text-center my-2 cursor-pointer transition-colors ${
                                  darkMode ? 'bg-zinc-950/40 border-zinc-800 hover:border-indigo-500' : 'bg-slate-50 border-slate-300 hover:border-indigo-600'
                                }`}>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleSlotPhotoUpload(e, slot.slotIndex)} 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                  <Upload className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
                                  <span className="text-[10px] font-bold text-zinc-400 block">
                                    Unggah Foto Wajah
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
                              <span className="text-[9px] font-bold uppercase text-zinc-400">Gender:</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSlotGenderToggle(slot.slotIndex, 'male')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    currentGender === 'male'
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  👨 Pria
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSlotGenderToggle(slot.slotIndex, 'female')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    currentGender === 'female'
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  👩 Wanita
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleGenerateScript}
                      className={`py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                        darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 text-white'
                      }`}
                    >
                      <span>📜</span>
                      {manualScriptInput.trim() ? 'Sintesis & Optimalkan Skrip' : 'Tulis Skrip Lengkap AI'}
                    </button>
                  </div>
                </div>

                {/* SCRIPT EDITOR & TTS VOICE OVER STUDIO */}
                {generatedScript && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className={`xl:col-span-2 p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300'}`}>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-800/40">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <FileText className="h-4 w-4" /> Naskah Skrip Narasi Final
                        </h4>
                        <button
                          onClick={() => handleCopyText(generatedScript, 'script')}
                          className="text-xs text-indigo-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <span>📋</span> {copiedStates['script'] ? 'Disalin!' : 'Salin Skrip'}
                        </button>
                      </div>

                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                        {scriptParagraphs.map((para, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border space-y-3 ${
                            darkMode ? 'bg-zinc-950/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <strong className="text-[10px] text-indigo-400 uppercase tracking-widest">
                                PARAGRAF {idx + 1}
                              </strong>
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => handleImproveParagraph(idx, "Make it sound much more dramatic")}
                                  className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold"
                                >
                                  🎭 Dramatis
                                </button>
                                <button 
                                  onClick={() => { setTtsText(para); }}
                                  className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold"
                                >
                                  🎙️ Suarakan
                                </button>
                              </div>
                            </div>
                            
                            <textarea
                              value={para}
                              onChange={(e) => {
                                const updatedParagraphs = [...scriptParagraphs];
                                updatedParagraphs[idx] = e.target.value;
                                setScriptParagraphs(updatedParagraphs);
                                setGeneratedScript(updatedParagraphs.join('\n\n'));
                              }}
                              rows={3}
                              className={`w-full p-2.5 text-xs rounded-lg border outline-none font-sans leading-relaxed ${
                                darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300'}`}>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-4 pb-2 border-b border-zinc-800/40">
                        <Volume2 className="h-4 w-4" /> Studio Pengisi Suara AI (Gemini TTS)
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-zinc-400">
                            Model Karakter Suara
                          </label>
                          <select 
                            value={selectedVoice} 
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className={`w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg border outline-none ${
                              darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Kore">Kore (Male, Bold)</option>
                            <option value="Zephyr">Zephyr (Male, Soft)</option>
                            <option value="Puck">Puck (Female, Lively)</option>
                            <option value="Leda">Leda (Female, Deep)</option>
                            <option value="Fenrir">Fenrir (Male, Intense)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-zinc-400">
                            Emosi / Pembawaan TTS
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'dramatic', label: '🎭 Dramatis' },
                              { id: 'cheerful', label: '⚡ Berenergi' },
                              { id: 'whisper', label: '🕵️ Misterius' },
                              { id: 'informative', label: '📚 Informatif' }
                            ].map((tone) => (
                              <button
                                key={tone.id}
                                type="button"
                                onClick={() => setSelectedTone(tone.id)}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                                  selectedTone === tone.id 
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                                    : (darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-slate-300 text-slate-900')
                                }`}
                              >
                                {tone.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-zinc-400">
                            Teks Untuk Disuarakan
                          </label>
                          <textarea
                            value={ttsText}
                            onChange={(e) => setTtsText(e.target.value)}
                            placeholder="Pilih 'Suarakan' pada paragraf di samping..."
                            rows={4}
                            maxLength={5000}
                            className={`w-full p-2 text-xs rounded-lg border outline-none ${
                              darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleGenerateVoiceOver}
                          disabled={!ttsText.trim()}
                          className="w-full py-2 disabled:opacity-40 text-white text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          <span>🎙️</span>
                          Sintesis Audio Narator
                        </button>

                        {audioUrl && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 mt-4">
                            <span className="block text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Audio Ready ({Math.round(audioDuration)}s)
                            </span>
                            <audio controls src={audioUrl} className="w-full h-8" />
                            <a
                              href={audioUrl}
                              download="Andriage_Audio.wav"
                              className="w-full py-1 border text-[10px] font-bold rounded flex items-center justify-center gap-1 bg-zinc-950 border-zinc-800 text-zinc-300"
                            >
                              <Download className="h-3 w-3" /> Unduh Audio (.WAV)
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className={`flex justify-between pt-6 border-t ${darkMode ? 'border-zinc-800/40' : 'border-slate-300'}`}>
                  <button
                    onClick={() => setActiveStep(1)}
                    className={`px-4 py-2 border rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-slate-300 text-slate-900'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Riset
                  </button>
                  <button
                    onClick={() => {
                      if (scriptParagraphs.length === 0) {
                        setErrorMessage('Harap buat skrip terlebih dahulu.');
                        return;
                      }
                      setActiveStep(3);
                      if (scenes.length === 0) {
                        handleGenerateVisualScenes();
                      }
                    }}
                    className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    Lanjut ke Storyboard Visual
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: STORYBOARD VISUAL & STYLE SWITCHER */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className={`p-5 rounded-2xl border ${
                  darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-300 shadow-md'
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span>🎨</span> Visual Style Switcher & Aspect Ratio
                      </h4>
                      <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-slate-600 font-medium'}`}>
                        Pilih gaya estetika visual dan rasio aspek default untuk seluruh adegan storyboard.
                      </p>
                    </div>

                    <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                      darkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-100 border-slate-300'
                    }`}>
                      <span className="text-[10px] font-bold uppercase text-zinc-400 px-2">Global Ratio:</span>
                      <button
                        onClick={() => setGlobalAspectRatio('16:9')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          globalAspectRatio === '16:9'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>🖥️</span> 16:9 (Long Form)
                      </button>
                      <button
                        onClick={() => setGlobalAspectRatio('9:16')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          globalAspectRatio === '9:16'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>📱</span> 9:16 (Shorts)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {VISUAL_STYLES.map((preset) => {
                      const isSelected = selectedVisualStyle === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setSelectedVisualStyle(preset.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/40 shadow-md'
                              : (darkMode ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-base">{preset.icon}</span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {preset.badge}
                              </span>
                            </div>
                            <h5 className={`text-xs font-bold leading-snug ${
                              isSelected ? 'text-indigo-400 font-black' : (darkMode ? 'text-zinc-200' : 'text-slate-900')
                            }`}>
                              {preset.label}
                            </h5>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 text-indigo-500">
                        <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                        Step 3: Visual Scene & Storyboard Creation
                      </h3>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-400' : 'text-slate-800 font-semibold'}`}>
                        Setiap adegan dipecah berdasarkan tanda baca klausa kalimat untuk memastikan sinkronisasi 100% dengan narasi.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleGenerateVisualScenes}
                      disabled={scriptParagraphs.length === 0}
                      className={`py-2 px-3 border text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                        darkMode ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300' : 'border-slate-300 text-slate-900'
                      }`}
                    >
                      <span>🔄</span>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset & Pecah Ulang Naskah
                    </button>
                  </div>

                  {scenes.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {/* GLOBAL STATS PARAMETERS DASHBOARD */}
                      {(() => {
                        const totalGlobalScenes = scenes.length;
                        const totalGlobalPrompts = scenes.filter(s => s.visualPrompt && s.visualPrompt.trim().length > 0).length;
                        const totalGlobalPromptsPending = totalGlobalScenes - totalGlobalPrompts;
                        const totalGlobalImagesRendered = Object.keys(sceneImages).length;
                        const totalGlobalImagesPending = totalGlobalScenes - totalGlobalImagesRendered;
                        const totalGlobalFailed = failedSceneIndices.length;

                        return (
                          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border ${
                            darkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-100 border-slate-300 shadow-inner'
                          }`}>
                            <div className="p-3 rounded-lg border bg-zinc-900/40 border-zinc-800/80">
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-extrabold mb-1">
                                🎬 Total Scene Global
                              </span>
                              <strong className="text-sm font-black text-indigo-400">
                                {totalGlobalScenes} Scene
                              </strong>
                            </div>

                            <div className="p-3 rounded-lg border bg-zinc-900/40 border-zinc-800/80">
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-extrabold mb-1">
                                📝 Prompt Gambar & Video
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <strong className="text-sm font-black text-emerald-400">
                                  {totalGlobalPrompts} Ready
                                </strong>
                                <span className="text-[10px] text-amber-400 font-bold">
                                  ({totalGlobalPromptsPending} Belum)
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg border bg-zinc-900/40 border-zinc-800/80">
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-extrabold mb-1">
                                🎨 Gambar Di-Render
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <strong className="text-sm font-black text-emerald-400">
                                  {totalGlobalImagesRendered} Ready
                                </strong>
                                <span className="text-[10px] text-amber-400 font-bold">
                                  ({totalGlobalImagesPending} Belum)
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg border bg-zinc-900/40 border-zinc-800/80">
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-extrabold mb-1">
                                ⚠️ Status Error / Gagal
                              </span>
                              <strong className={`text-sm font-black ${totalGlobalFailed > 0 ? 'text-rose-400 animate-pulse' : 'text-zinc-400'}`}>
                                {totalGlobalFailed} Scene Gagal
                              </strong>
                            </div>
                          </div>
                        );
                      })()}

                      {/* MASTER BATCH CONTROLLER WITH BATCH RETRY */}
                      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                        darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-300 shadow-sm'
                      }`}>
                        <div className="space-y-1">
                          <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                            Master Batch Controller
                          </h4>
                          <p className={`text-[10px] ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Generate semua gambar visual adegan sekaligus, atau lakukan batch retry khusus pada gambar yang gagal/belum di-render.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0">
                          <button
                            onClick={handleGenerateAllImagesForAllParagraphs}
                            className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow"
                          >
                            <span>🎨</span>
                            <Sparkles className="h-4 w-4" />
                            ⚡ Render Semua Gambar
                          </button>

                          <button
                            onClick={handleBatchRetryFailedImages}
                            className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center justify-center gap-2 shadow"
                            title="Ulangi render hanya untuk adegan yang gagal/belum ada gambar"
                          >
                            <span>🔄</span>
                            <RefreshCw className="h-4 w-4 text-amber-400" />
                            Batch Retry Gambar Gagal ({failedSceneIndices.length})
                          </button>

                          <button
                            onClick={handleDownloadAllImagesAsZip}
                            disabled={Object.keys(sceneImages).length === 0}
                            className={`flex-1 md:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow ${
                              Object.keys(sceneImages).length > 0
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                            }`}
                          >
                            <span>📦</span>
                            <Download className="h-4 w-4" />
                            📁 Unduh semua (.ZIP)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SCENES LIST WITH STREAMLINED PROMPT BOX UI */}
                {scenes.length > 0 && (
                  <div className="space-y-4">
                    {scriptParagraphs.map((para, pIdx) => {
                      const paragraphNum = pIdx + 1;
                      const paragraphScenes = scenes.filter(s => s.paragraphIndex === paragraphNum);
                      const isExpanded = expandedParagraphs[paragraphNum];

                      const totalParaScenes = paragraphScenes.length;
                      const paraPromptsDone = paragraphScenes.filter(s => s.visualPrompt && s.visualPrompt.trim().length > 0).length;
                      const paraPromptsPending = totalParaScenes - paraPromptsDone;
                      const paraImagesDone = paragraphScenes.filter(s => sceneImages[s.globalIndex]).length;
                      const paraImagesPending = totalParaScenes - paraImagesDone;
                      const paraFailedCount = paragraphScenes.filter(s => failedSceneIndices.includes(s.globalIndex)).length;

                      return (
                        <div 
                          key={pIdx} 
                          className={`rounded-xl border transition-all overflow-hidden ${
                            darkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-slate-300'
                          }`}
                        >
                          <div 
                            onClick={() => toggleParagraphDropdown(paragraphNum)}
                            className={`p-4 flex items-center justify-between cursor-pointer select-none ${
                              darkMode ? 'bg-zinc-900/20 hover:bg-zinc-900/40' : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-[10px] font-black border border-indigo-500/20">
                                {paragraphNum}
                              </span>
                              <div>
                                <h4 className={`font-bold text-xs ${darkMode ? 'text-zinc-200' : 'text-slate-900'}`}>Paragraf {paragraphNum}</h4>
                                <p className={`text-[10px] line-clamp-1 max-w-md ${darkMode ? 'text-zinc-400' : 'text-slate-800 font-semibold'}`}>{para}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                🎬 {totalParaScenes} Scene
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                paraPromptsDone === totalParaScenes
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                📝 Prompt: {paraPromptsDone}/{totalParaScenes} ({paraPromptsPending} Belum)
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                paraImagesDone === totalParaScenes
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                🎨 Gambar: {paraImagesDone}/{totalParaScenes} ({paraImagesPending} Belum)
                              </span>
                              {paraFailedCount > 0 && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  ⚠️ {paraFailedCount} Gagal
                                </span>
                              )}
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500 ml-1" /> : <ChevronDown className="h-4 w-4 text-zinc-500 ml-1" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 border-t space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/40">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-300 flex-wrap">
                                  <span className="text-indigo-400 uppercase tracking-wider text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    Rincian Paragraf {paragraphNum}
                                  </span>
                                  <span className="text-zinc-400">• Total: <strong className="text-indigo-400">{totalParaScenes} Scene</strong></span>
                                  <span className="text-zinc-400">• Prompt: <strong className="text-emerald-400">{paraPromptsDone} Dibuat</strong> / <strong className="text-amber-400">{paraPromptsPending} Belum</strong></span>
                                  <span className="text-zinc-400">• Render: <strong className="text-emerald-400">{paraImagesDone} Selesai</strong> / <strong className="text-amber-400">{paraImagesPending} Belum</strong></span>
                                  {paraFailedCount > 0 && <span className="text-rose-400 font-extrabold">• ({paraFailedCount} Gagal)</span>}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleGenerateAllPromptsForParagraph(paragraphNum)}
                                    className="py-1 px-2.5 rounded bg-indigo-600/90 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors"
                                  >
                                    <span>🎞️</span> Generate Prompts Paragraf {paragraphNum}
                                  </button>
                                  <button
                                    onClick={() => handleGenerateAllImagesForParagraph(paragraphNum)}
                                    className="py-1 px-2.5 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-700 transition-colors"
                                  >
                                    <span>🎨</span> Render Gambar Paragraf {paragraphNum}
                                  </button>
                                </div>
                              </div>

                              {paragraphScenes.map((scene) => {
                                const globalIdx = scene.globalIndex;
                                const ratio = sceneRatios[globalIdx] || globalAspectRatio;
                                const imgUrl = sceneImages[globalIdx];
                                const isImgLoading = imageLoadingStates[globalIdx];
                                const hasFailed = failedSceneIndices.includes(globalIdx);
                                const activeTab = activePromptTabs[globalIdx] || 'visual';

                                return (
                                  <div 
                                    key={scene.globalIndex}
                                    className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row gap-5 ${
                                      hasFailed
                                        ? 'bg-rose-500/5 border-rose-500/40 ring-1 ring-rose-500/20'
                                        : darkMode ? 'bg-zinc-950/85 border-zinc-800' : 'bg-white border-slate-300 shadow-sm'
                                    }`}
                                  >
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded">
                                            Adegan {scene.sceneIndexInParagraph}
                                          </span>
                                          <span className={`text-[10px] flex items-center gap-1 font-semibold ${darkMode ? 'text-zinc-400' : 'text-slate-900'}`}>
                                            <Clock className="h-3 w-3 text-indigo-500 animate-pulse" />
                                            {scene.startTimeCode} - {scene.endTimeCode} ({scene.duration}s)
                                          </span>
                                          {hasFailed && (
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                              ⚠️ Render Gagal - Perlu Retry
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <blockquote className={`text-xs italic pl-3 border-l-2 border-indigo-500 leading-relaxed ${darkMode ? 'text-zinc-300' : 'text-slate-900 font-bold'}`}>
                                        "{scene.sentence}"
                                      </blockquote>

                                      <div className="p-3 rounded-xl border bg-zinc-950/50 border-zinc-800/80 space-y-2">
                                        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                                          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                                            <button
                                              onClick={() => setActivePromptTab(prev => ({ ...prev, [globalIdx]: 'visual' }))}
                                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                                activeTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                                              }`}
                                            >
                                              🖼️ Prompt Visual (Gambar)
                                            </button>
                                            <button
                                              onClick={() => setActivePromptTab(prev => ({ ...prev, [globalIdx]: 'video' }))}
                                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                                activeTab === 'video' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                                              }`}
                                            >
                                              🎞️ Prompt Gerakan (Video)
                                            </button>
                                          </div>

                                          {activeTab === 'visual' && scene.visualPrompt && (
                                            <button 
                                              onClick={() => handleCopyText(scene.visualPrompt, `copy-scene-${globalIdx}`)}
                                              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                                            >
                                              <span>📋</span> {copiedStates[`copy-scene-${globalIdx}`] ? 'Disalin!' : 'Salin Prompt'}
                                            </button>
                                          )}

                                          {activeTab === 'video' && scene.videoPrompt && (
                                            <button 
                                              onClick={() => handleCopyText(scene.videoPrompt, `copy-video-${globalIdx}`)}
                                              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                                            >
                                              <span>📋</span> {copiedStates[`copy-video-${globalIdx}`] ? 'Disalin!' : 'Salin Video Prompt'}
                                            </button>
                                          )}
                                        </div>

                                        {activeTab === 'visual' ? (
                                          scene.visualPrompt ? (
                                            <p className="text-[11px] font-mono leading-relaxed text-indigo-300">
                                              {scene.visualPrompt}
                                            </p>
                                          ) : (
                                            <p className="text-xs italic text-zinc-500">
                                              Prompt visual belum dibuat. Klik 'Generate Prompt' atau jalankan Master Controls.
                                            </p>
                                          )
                                        ) : (
                                          scene.videoPrompt ? (
                                            <p className="text-[11px] font-mono leading-relaxed text-emerald-300">
                                              {scene.videoPrompt}
                                            </p>
                                          ) : (
                                            <p className="text-xs italic text-zinc-500">
                                              Prompt gerakan video belum dibuat. Klik 'Generate Prompt' atau jalankan Master Controls.
                                            </p>
                                          )
                                        )}
                                      </div>
                                    </div>

                                    <div className={`w-full lg:w-72 shrink-0 flex flex-col justify-between p-3 rounded-xl border text-xs gap-3 ${
                                      darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-100 border-slate-200'
                                    }`}>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b border-zinc-800/40">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Aksi Adegan {scene.sceneIndexInParagraph}
                                          </span>
                                          <div className="flex items-center gap-1 p-0.5 rounded border border-zinc-800 bg-zinc-950">
                                            {['16:9', '9:16'].map((r) => (
                                              <button
                                                key={r}
                                                onClick={() => setSceneRatios(prev => ({ ...prev, [globalIdx]: r }))}
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                  ratio === r ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                                                }`}
                                              >
                                                {r}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => handleGeneratePromptForScene(globalIdx)}
                                          disabled={scene.loading}
                                          className="w-full py-1.5 border font-bold rounded flex items-center justify-center gap-1.5 transition-all text-[11px] bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900"
                                        >
                                          <span>🎞️</span>
                                          {scene.loading ? <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" /> : <Wand2 className="h-3 w-3 text-indigo-500" />}
                                          {scene.visualPrompt ? 'Perbarui Prompt' : 'Generate Prompt'}
                                        </button>

                                        {scene.visualPrompt && (
                                          <div className="space-y-2">
                                            <button
                                              onClick={() => handleGenerateImageForScene(globalIdx)}
                                              disabled={isImgLoading}
                                              className={`w-full py-1.5 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                                                hasFailed ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                              }`}
                                            >
                                              <span>{hasFailed ? '🔄' : '🎨'}</span>
                                              {isImgLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3 text-white" />}
                                              {hasFailed ? 'Retry Render Gambar' : 'Render Gambar AI (Flow)'}
                                            </button>

                                            <div className={`relative border rounded-lg overflow-hidden flex items-center justify-center transition-all ${
                                              ratio === '9:16' ? 'aspect-[9/16] h-48 mx-auto' : 'aspect-[16/9] w-full'
                                            } bg-zinc-950 border-zinc-800`}>
                                              {isImgLoading ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950">
                                                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                                                  <span className="text-[10px] text-zinc-500 font-medium">Nano Banana 2 Rendering...</span>
                                                </div>
                                              ) : imgUrl ? (
                                                <>
                                                  <img src={imgUrl} alt={`Scene ${globalIdx}`} className="w-full h-full object-cover" />
                                                  <div className="absolute bottom-1 right-1 flex items-center gap-1">
                                                    <button
                                                      onClick={() => setActivePreviewImage({ url: imgUrl, title: `Scene ${globalIdx}` })}
                                                      className="p-1.5 rounded hover:text-white border bg-zinc-900/90 text-zinc-300 border-zinc-800"
                                                      title="Perbesar"
                                                    >
                                                      <Expand className="h-3.5 w-3.5" />
                                                    </button>
                                                    <a
                                                      href={imgUrl}
                                                      download={`Andriage_Scene_${globalIdx}.png`}
                                                      className="p-1.5 rounded hover:text-white border bg-zinc-900/90 text-zinc-300 border-zinc-800"
                                                      title="Unduh Gambar"
                                                    >
                                                      <Download className="h-3.5 w-3.5" />
                                                    </a>
                                                  </div>
                                                </>
                                              ) : (
                                                <div className="text-center p-4">
                                                  <ImageIcon className="h-5 w-5 text-zinc-400 mx-auto mb-1.5" />
                                                  <span className="text-[10px] text-zinc-500 italic">
                                                    {hasFailed ? 'Render Gagal - Perlu Retry' : 'No image generated'}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={`flex justify-between pt-6 border-t ${darkMode ? 'border-zinc-800/40' : 'border-slate-300'}`}>
                  <button
                    onClick={() => setActiveStep(2)}
                    className={`px-4 py-2 border rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-slate-300 text-slate-900'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Skrip
                  </button>
                  <button
                    onClick={() => {
                      if (scenes.length === 0) {
                        setErrorMessage('Harap generate storyboard terlebih dahulu.');
                        return;
                      }
                      setActiveStep(4);
                    }}
                    className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    Lanjut ke Desain Thumbnail
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: THUMBNAIL STUDIO & A/B VARIANTS */}
            {activeStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300 shadow-md'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 text-indigo-500">
                        <Eye className="h-4 w-4 text-indigo-500 animate-pulse" />
                        Step 4: High CTR Thumbnail Blueprint & AI Fusion Studio
                      </h3>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-400' : 'text-slate-800 font-semibold'}`}>
                        Pilih mode konseptual A/B Test otomatis AI atau lakukan AI Fusion dari 1-4 foto kustom manual.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-zinc-800 bg-zinc-950 shrink-0">
                      <button
                        onClick={() => setThumbnailModeTab('auto')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          thumbnailModeTab === 'auto' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        🤖 3 Konsep Otomatis AI
                      </button>
                      <button
                        onClick={() => setThumbnailModeTab('manual_fusion')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          thumbnailModeTab === 'manual_fusion' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        📤 AI Fusion (1-4 Foto)
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 p-4 rounded-xl border bg-zinc-950/40 border-zinc-800/80">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Teks Overlay Thumbnail (Dapat Di-Edit)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editableOverlayText}
                        onChange={(e) => setEditableOverlayText(e.target.value)}
                        placeholder="Ketik Teks Overlay (misal: RAHASIA TERBONGKAR!)"
                        className="flex-1 p-2 text-xs font-extrabold uppercase rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-100"
                      />
                      <button
                        onClick={() => {
                          if (thumbnailModeTab === 'auto') handleGenerateThumbnailVariants();
                          else handleManualFusionThumbnail();
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow"
                      >
                        <span>🔄</span> Render Ulang Thumbnail Dengan Teks Baru
                      </button>
                    </div>
                  </div>
                </div>

                {/* MANUAL FUSION DROPZONE (IF MANUAL MODE) */}
                {thumbnailModeTab === 'manual_fusion' && (
                  <div className={`p-6 rounded-2xl border space-y-4 ${
                    darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300'
                  }`}>
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <span>📤</span> Unggah 1-4 Foto Kustom Untuk AI Fusion
                    </h4>

                    <div className="border-2 border-dashed border-zinc-800 rounded-xl p-5 text-center relative cursor-pointer hover:border-indigo-500 transition-colors">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (uploadedThumbnailImages.length + files.length > 4) {
                            setErrorMessage('Maksimal 4 foto kustom.');
                            return;
                          }
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setUploadedThumbnailImages(prev => [
                                ...prev,
                                { id: 'm-' + Date.now() + Math.random(), dataUrl: reader.result as string, name: file.name }
                              ]);
                            };
                            reader.readAsDataURL(file);
                          });
                        }} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <Upload className="h-6 w-6 text-indigo-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-zinc-300 block">Pilih 1 - 4 Foto Kustom</span>
                    </div>

                    {uploadedThumbnailImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {uploadedThumbnailImages.map((img) => (
                          <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950">
                            <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                            <button
                              onClick={() => setUploadedThumbnailImages(prev => prev.filter(i => i.id !== img.id))}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleManualFusionThumbnail}
                      disabled={uploadedThumbnailImages.length === 0}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl disabled:opacity-40 shadow flex items-center justify-center gap-2"
                    >
                      <span>🎨</span> Fusion & Render 3 Konsep Gambar Manual
                    </button>
                  </div>
                )}

                {/* 3-COLUMN THUMBNAIL VARIANT CARDS GRID */}
                {thumbnailVariants.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-400" /> Hasil Evaluasi Varian Thumbnail (A/B/C Test Concepts)
                      </h4>
                      {selectedThumbnail && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          📌 Terpilih: {selectedThumbnail.title}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {thumbnailVariants.map((v) => {
                        const isSelected = selectedThumbnail?.id === v.id;
                        const scoreColor = v.ctrScore >= 85 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                          : v.ctrScore >= 70 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
                            : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';

                        return (
                          <div 
                            key={v.id}
                            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl' 
                                : (darkMode ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-300 shadow-md')
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {v.badge}
                                </span>
                                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${scoreColor}`}>
                                  CTR: {v.estimatedCtrRange}
                                </span>
                              </div>

                              <h4 className={`text-sm font-black ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                                {v.title}
                              </h4>

                              <div className={`relative rounded-xl overflow-hidden border flex items-center justify-center bg-zinc-950 border-zinc-800 ${
                                globalAspectRatio === '9:16' ? 'aspect-[9/16] h-72 mx-auto' : 'aspect-[16/9] w-full'
                              }`}>
                                {v.isLoading ? (
                                  <div className="flex flex-col items-center justify-center p-4">
                                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-[10px] text-zinc-400 font-bold animate-pulse">Rendering Google Flow...</span>
                                  </div>
                                ) : v.imageUrl ? (
                                  <>
                                    <img src={v.imageUrl} alt={v.title} className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => setActivePreviewImage({ url: v.imageUrl, title: v.title })}
                                      className="absolute bottom-2 right-2 p-1.5 rounded bg-zinc-900/90 text-zinc-200 hover:text-white border border-zinc-700"
                                      title="Perbesar"
                                    >
                                      <Expand className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <div className="text-center p-4 text-zinc-500">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                    <span className="text-[10px] italic">Gagal merender gambar</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-2.5 rounded-xl border bg-zinc-950/60 border-zinc-800 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-zinc-400 uppercase">Overlay Text:</span>
                                <strong className="text-xs font-black text-amber-300 uppercase tracking-tight">
                                  "{v.overlayText || editableOverlayText}"
                                </strong>
                              </div>

                              <div className="space-y-2 p-3 rounded-xl border bg-zinc-950/40 border-zinc-800/80">
                                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-zinc-300 mb-1">
                                  <span className="flex items-center gap-1"><BarChart2 className="h-3 w-3 text-indigo-400" /> Score Metrik Visual AI</span>
                                  <span className="text-indigo-400 font-black">{v.ctrScore}/100</span>
                                </div>

                                {[
                                  { label: 'Kejelasan Wajah', val: v.evalBreakdown?.faceProminence || 8, color: 'bg-amber-400' },
                                  { label: 'Keterbacaan Teks', val: v.evalBreakdown?.textReadability || 9, color: 'bg-emerald-400' },
                                  { label: 'Pemicu Penasaran', val: v.evalBreakdown?.curiosityGap || 9, color: 'bg-indigo-400' },
                                  { label: 'Kontras Warna', val: v.evalBreakdown?.colorPop || 8, color: 'bg-purple-400' }
                                ].map((m, mIdx) => (
                                  <div key={mIdx} className="space-y-0.5">
                                    <div className="flex justify-between text-[9px] text-zinc-400 font-semibold">
                                      <span>{m.label}</span>
                                      <span>{m.val}/10</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${m.color}`} style={{ width: `${m.val * 10}%` }}></div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <p className={`text-[10px] italic leading-relaxed p-3 rounded-xl border ${
                                darkMode ? 'bg-zinc-950/30 border-zinc-800/60 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}>
                                "{v.critique}"
                              </p>
                            </div>

                            <div className="space-y-2 mt-4 pt-3 border-t border-zinc-800/60">
                              <button
                                onClick={() => setSelectedThumbnail(v)}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                                  isSelected 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                <span>📌</span>
                                {isSelected ? 'Terpilih Sebagai Cover Utama' : 'Pilih Sebagai Thumbnail Utama'}
                              </button>

                              <button
                                onClick={() => handleOpenCanvasEditor(v)}
                                disabled={!v.imageUrl}
                                className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1.5"
                              >
                                <span>🎨</span>
                                Buka Interactive Canvas Studio
                              </button>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSingleVariantRender(v.id)}
                                  disabled={v.isLoading}
                                  className="flex-1 py-1.5 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-[10px] font-bold text-zinc-300 flex items-center justify-center gap-1"
                                >
                                  <span>🔄</span> Re-render
                                </button>
                                {v.imageUrl && (
                                  <a
                                    href={v.imageUrl}
                                    download={`Thumbnail_${v.id}.png`}
                                    className="flex-1 py-1.5 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-[10px] font-bold text-zinc-300 flex items-center justify-center gap-1"
                                  >
                                    <span>📥</span> Unduh
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={`flex justify-between pt-6 border-t ${darkMode ? 'border-zinc-800/40' : 'border-slate-300'}`}>
                  <button
                    onClick={() => setActiveStep(3)}
                    className={`px-4 py-2 border rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-slate-300 text-slate-900'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Storyboard
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    Lanjut ke Pengaturan SEO
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SEO METADATA & CHAPTER TIMECODES */}
            {activeStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-300 shadow-md'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black flex items-center gap-2 text-indigo-500">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        Step 5: SEO Metadata & Algorithmic Growth Engine
                      </h3>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-400' : 'text-slate-700 font-medium'}`}>
                        Sistem optimasi metadata otomatis untuk mendongkrak peringkat rekomendasi YouTube Search & Feed Algorithm.
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateSEO}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 shrink-0"
                    >
                      <span>🏷️</span>
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerasi Paket SEO
                    </button>
                  </div>
                </div>

                {seoData.viralTitles.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-6">
                      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-300 shadow-md'}`}>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-400" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                              1. Judul Video Viral (Pilih 1 Judul Utama)
                            </h4>
                          </div>
                          <button 
                            onClick={() => handleCopyText(seoData.selectedTitle || seoData.viralTitles[0], 'seo-selected-title')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black border border-indigo-500/30 transition-all flex items-center gap-1"
                          >
                            <span>📋</span> {copiedStates['seo-selected-title'] ? '✅ Disalin!' : 'Salin Judul Terpilih'}
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {seoData.viralTitles.map((title, idx) => {
                            const isSelected = (seoData.selectedTitle || seoData.viralTitles[0]) === title;
                            return (
                              <div 
                                key={idx}
                                onClick={() => setSeoData(prev => ({ ...prev, selectedTitle: title }))}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                  isSelected 
                                    ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50' 
                                    : (darkMode ? 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isSelected ? (
                                    <span className="h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                                  ) : (
                                    <span className="h-4 w-4 rounded-full border border-zinc-600 block"></span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-0.5">
                                    Opsi #{idx + 1} {idx === 0 && '⚡ (High CTR)'}
                                  </span>
                                  <h5 className={`text-xs font-bold leading-relaxed ${isSelected ? 'text-indigo-400 font-black' : (darkMode ? 'text-zinc-200' : 'text-slate-900')}`}>
                                    {title}
                                  </h5>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-300 shadow-md'}`}>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-400" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                              2. Deskripsi SEO YouTube & Timecode Bab
                            </h4>
                          </div>
                          <button 
                            onClick={() => handleCopyText(seoData.description, 'seo-description')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black border border-indigo-500/30 transition-all flex items-center gap-1"
                          >
                            <span>📋</span> {copiedStates['seo-description'] ? '✅ Disalin!' : 'Salin Deskripsi Lengkap'}
                          </button>
                        </div>

                        <textarea
                          value={seoData.description}
                          onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
                          rows={12}
                          className={`w-full p-3.5 text-xs font-mono rounded-xl border outline-none leading-relaxed resize-none ${
                            darkMode ? 'bg-zinc-950/60 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-300 shadow-md'}`}>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-emerald-400" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                              3. Tags Bilingual (ID + EN)
                            </h4>
                          </div>
                          <button 
                            onClick={() => handleCopyText(seoData.multilingualTags.join(', '), 'seo-tags')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 transition-all flex items-center gap-1"
                          >
                            <span>📋</span> {copiedStates['seo-tags'] ? '✅ Disalin!' : 'Salin Semua Tags'}
                          </button>
                        </div>

                        {(() => {
                          const totalChars = seoData.multilingualTags.join(', ').length;
                          const isOver = totalChars > 500;
                          return (
                            <div className="flex items-center justify-between text-[10px] font-bold mb-3 px-1">
                              <span className="text-zinc-400 uppercase tracking-wider">Karakter YouTube Limit:</span>
                              <span className={`px-2 py-0.5 rounded font-black ${isOver ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {totalChars} / 500 Karakter
                              </span>
                            </div>
                          );
                        })()}

                        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border bg-zinc-950/40 border-zinc-800/80 max-h-56 overflow-y-auto">
                          {seoData.multilingualTags.map((tag, i) => (
                            <span key={i} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                              <span>🏷️</span> {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-300 shadow-md'}`}>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 mb-3 pb-2 border-b border-zinc-800/60 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-purple-400" /> Kata Kunci Utama & Hashtags
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1.5">Core Keywords:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {seoData.primaryKeywords.map((kw, idx) => (
                                <span key={idx} className="text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1.5">Hashtags Popular:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {seoData.hashtags.map((hash, idx) => (
                                <span key={idx} className="text-[11px] font-extrabold text-indigo-400">
                                  {hash}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`flex justify-between pt-6 border-t ${darkMode ? 'border-zinc-800/40' : 'border-slate-300'}`}>
                  <button
                    onClick={() => setActiveStep(4)}
                    className={`px-4 py-2 border rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-slate-300 text-slate-900'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Thumbnail
                  </button>
                  <button
                    onClick={() => setActiveStep(6)}
                    className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    Selesai & Simpan Proyek
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: FINAL COMPLETION DASHBOARD & EXPORT BUNDLER */}
            {activeStep === 6 && (
              <div className="space-y-6 animate-fade-in py-4">
                <div className={`p-8 rounded-3xl border text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden ${
                  darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-300'
                }`}>
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 p-4 rounded-full inline-block mb-4 animate-bounce">
                    <CheckCircle className="h-10 w-10 text-emerald-400" />
                  </div>

                  <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                    Proyek Pra-Produksi Selesai 100%!
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                    Seluruh naskah, rujukan basis data, audio narator, storyboard scene, cover thumbnail A/B test, dan metadata SEO telah siap dipaketkan.
                  </p>

                  {/* ASSET INVENTORY METRICS SUMMARY */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 rounded-2xl border bg-zinc-950/60 border-zinc-800 text-left">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">Total Kata Skrip</span>
                      <strong className="text-xs font-black text-indigo-400">
                        {generatedScript.split(/\s+/).filter(w => w).length} Kata
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">Adegan Storyboard</span>
                      <strong className="text-xs font-black text-emerald-400">
                        {scenes.length} Scenes ({Object.keys(sceneImages).length} Rendered)
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">Audio TTS Narator</span>
                      <strong className="text-xs font-black text-amber-400">
                        {audioDuration > 0 ? `${Math.round(audioDuration)}s WAV` : 'Teks Siap TTS'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">Predicted CTR</span>
                      <strong className="text-xs font-black text-purple-400">
                        {selectedThumbnail ? `${selectedThumbnail.ctrScore}/100 Score` : 'High CTR'}
                      </strong>
                    </div>
                  </div>

                  {/* ZIPPING PROGRESS BAR */}
                  {isZippingAssetPackage && (
                    <div className="mb-6 p-4 rounded-xl border bg-indigo-500/10 border-indigo-500/30 text-indigo-300 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Mengompresi & Memaketkan Aset ke .ZIP...</span>
                        <span>{zipProgressPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${zipProgressPercent}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* EXPORT ACTION BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleExportProject}
                      className="p-5 rounded-2xl font-extrabold bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-200 text-xs transition-all flex flex-col items-center justify-center gap-1.5 shadow"
                    >
                      <span className="text-base">📄</span>
                      <span>Unduh Ringkasan Master (.TXT)</span>
                      <span className="text-[9px] font-normal text-zinc-400">Satu file laporan teks utuh</span>
                    </button>

                    <button
                      onClick={handleDownloadAssetZip}
                      disabled={isZippingAssetPackage}
                      className="p-5 rounded-2xl font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white text-xs transition-all flex flex-col items-center justify-center gap-1.5 shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                    >
                      <span className="text-base">📦</span>
                      <span>Unduh Paket Aset Lengkap (.ZIP)</span>
                      <span className="text-[9px] font-normal text-indigo-100">Termasuk /blueprint.txt, /audio, /thumbnail, /scenes</span>
                    </button>
                  </div>

                  <div className="pt-6 border-t border-zinc-800/60 mt-6 flex justify-center">
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="px-5 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <span>🔄</span> Buat Proyek Video Baru
                    </button>
                  </div>
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={() => setActiveStep(5)}
                    className={`px-4 py-2 border rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                      darkMode ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-slate-300 text-slate-900'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Pengaturan SEO
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className={`py-4 px-6 text-center text-[10px] border-t shrink-0 transition-colors ${
          darkMode ? 'bg-zinc-900/30 border-zinc-900 text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <p className="max-w-xl mx-auto leading-relaxed font-bold">
            <strong>AGE YT#1 Master</strong> • Studio Pro v2.5 • Dirancang khusus untuk memotong waktu pra-produksi konten video YouTube dari 8 jam menjadi hanya 3 menit.
          </p>
        </footer>

      </div>

      {/* Global Modals & Overlays */}
      <ProcessingOverlay active={processingState.active} title={processingState.title} message={processingState.message} />
      <ResetModal isOpen={showResetModal} onConfirm={handleConfirmResetProject} onCancel={() => setShowResetModal(false)} />
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        apiKeys={userApiKeys}
        onAddKey={handleAddApiKey}
        onRemoveKey={handleRemoveApiKey}
        onToggleKey={handleToggleApiKey}
      />
      <OnboardingModal
        isOpen={showOnboarding}
        onDismiss={handleDismissOnboarding}
        onOpenApiKeySettings={() => setShowApiKeyModal(true)}
      />
      <ImagePreviewModal previewData={activePreviewImage} onClose={() => setActivePreviewImage(null)} />
      <CanvasEditorModal
        isOpen={isCanvasEditorOpen}
        onClose={() => setIsCanvasEditorOpen(false)}
        selectedThumbnail={selectedThumbnail}
        canvasOverlayText={canvasOverlayText}
        setCanvasOverlayText={setCanvasOverlayText}
        canvasFontSize={canvasFontSize}
        setCanvasFontSize={setCanvasFontSize}
        canvasTextColor={canvasTextColor}
        setCanvasTextColor={setCanvasTextColor}
        canvasStrokeColor={canvasStrokeColor}
        setCanvasStrokeColor={setCanvasStrokeColor}
        canvasTextPosition={canvasTextPosition}
        setCanvasTextPosition={setCanvasTextPosition}
        canvasFontStyle={canvasFontStyle}
        setCanvasFontStyle={setCanvasFontStyle}
        canvasActiveSticker={canvasActiveSticker}
        setCanvasActiveSticker={setCanvasActiveSticker}
        canvasStickerPosition={canvasStickerPosition}
        setCanvasStickerPosition={setCanvasStickerPosition}
        canvasPreviewUrl={canvasPreviewUrl}
        isRenderingCanvas={isRenderingCanvas}
        globalAspectRatio={globalAspectRatio}
        handleSaveCanvasEdits={handleSaveCanvasEdits}
      />

    </div>
  );
}

export default App;