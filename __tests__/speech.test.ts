import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock expo-speech
vi.mock("expo-speech", () => ({
  speak: vi.fn(),
  stop: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn().mockResolvedValue(undefined),
  resume: vi.fn().mockResolvedValue(undefined),
  isSpeakingAsync: vi.fn().mockResolvedValue(false),
  getAvailableVoicesAsync: vi.fn().mockResolvedValue([
    { identifier: "ja-JP-voice1", name: "Japanese Voice 1", language: "ja-JP", quality: "Default" },
    { identifier: "ja-JP-voice2", name: "Japanese Voice 2", language: "ja-JP", quality: "Enhanced" },
    { identifier: "en-US-voice1", name: "English Voice 1", language: "en-US", quality: "Default" },
  ]),
}));

import * as Speech from "expo-speech";

describe("Speech utility functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAvailableVoicesAsync returns voices", async () => {
    const voices = await Speech.getAvailableVoicesAsync();
    expect(voices).toHaveLength(3);
    expect(voices[0].identifier).toBe("ja-JP-voice1");
  });

  it("filters Japanese voices correctly", async () => {
    const voices = await Speech.getAvailableVoicesAsync();
    const jpVoices = voices.filter((v) => v.language.startsWith("ja"));
    expect(jpVoices).toHaveLength(2);
    expect(jpVoices.every((v) => v.language.startsWith("ja"))).toBe(true);
  });

  it("speak is called with correct options", () => {
    const text = "テストテキスト";
    const rate = 1.5;
    const voice = "ja-JP-voice1";
    Speech.speak(text, { rate, voice, language: "ja-JP" });
    expect(Speech.speak).toHaveBeenCalledWith(text, {
      rate,
      voice,
      language: "ja-JP",
    });
  });

  it("stop resolves without error", async () => {
    await expect(Speech.stop()).resolves.toBeUndefined();
  });

  it("rate is clamped between 0.5 and 2.0", () => {
    const clampRate = (r: number) => Math.min(2.0, Math.max(0.5, r));
    expect(clampRate(0.3)).toBe(0.5);
    expect(clampRate(2.5)).toBe(2.0);
    expect(clampRate(1.0)).toBe(1.0);
    expect(clampRate(1.5)).toBe(1.5);
  });

  it("rate label formats correctly", () => {
    const formatRate = (r: number) => r.toFixed(1) + "x";
    expect(formatRate(1.0)).toBe("1.0x");
    expect(formatRate(0.5)).toBe("0.5x");
    expect(formatRate(2.0)).toBe("2.0x");
    expect(formatRate(1.5)).toBe("1.5x");
  });

  it("speech state transitions are valid", () => {
    type SpeechState = "idle" | "playing" | "paused";
    const transitions: Record<SpeechState, SpeechState[]> = {
      idle: ["playing"],
      playing: ["paused", "idle"],
      paused: ["playing", "idle"],
    };
    expect(transitions.idle).toContain("playing");
    expect(transitions.playing).toContain("paused");
    expect(transitions.playing).toContain("idle");
    expect(transitions.paused).toContain("playing");
  });
});
