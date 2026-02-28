import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type Voice = {
  identifier: string;
  name: string;
  language: string;
};

type SpeechState = "idle" | "playing" | "paused";

const DEFAULT_TEXT =
  "こんにちは！これはテキスト読み上げアプリです。スライダーを動かすことで再生速度を自由に変えることができます。ぜひ試してみてください。";

export default function HomeScreen() {
  const colors = useColors();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const [loadingVoices, setLoadingVoices] = useState(true);

  useEffect(() => {
    loadVoices();
    return () => {
      Speech.stop();
    };
  }, []);

  const loadVoices = async () => {
    try {
      const available = await Speech.getAvailableVoicesAsync();
      // Prefer Japanese voices, then all voices
      const jpVoices = available.filter((v) =>
        v.language.startsWith("ja")
      );
      const allVoices = jpVoices.length > 0 ? jpVoices : available;
      setVoices(allVoices);
      if (allVoices.length > 0) {
        setSelectedVoice(allVoices[0].identifier);
      }
    } catch {
      // Web may not support getAvailableVoicesAsync
      setVoices([]);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handlePlay = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!text.trim()) return;

    if (speechState === "paused") {
      // Resume (iOS only; on Android/web we restart)
      if (Platform.OS === "ios") {
        await Speech.resume();
        setSpeechState("playing");
        return;
      }
    }

    // Stop any ongoing speech first
    await Speech.stop();

    setSpeechState("playing");
    Speech.speak(text, {
      rate,
      voice: selectedVoice || undefined,
      language: "ja-JP",
      onDone: () => setSpeechState("idle"),
      onStopped: () => setSpeechState("idle"),
      onError: () => setSpeechState("idle"),
    });
  }, [text, rate, selectedVoice, speechState]);

  const handlePause = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (Platform.OS === "ios") {
      await Speech.pause();
      setSpeechState("paused");
    } else {
      // Android/web: stop instead of pause
      await Speech.stop();
      setSpeechState("idle");
    }
  }, []);

  const handleReset = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    await Speech.stop();
    setSpeechState("idle");
  }, []);

  const rateLabel = rate.toFixed(1) + "x";

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: "#EFF6FF" }]}>
            <Text style={styles.headerIconText}>📄</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            テキスト読み上げ君
          </Text>
        </View>

        {/* Text Input Area */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.muted }]}>
            読み上げるテキストを入力または貼り付け
          </Text>
          <View
            style={[
              styles.textInputContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.foreground }]}
              multiline
              value={text}
              onChangeText={setText}
              placeholder="ここにテキストを入力してください..."
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
              returnKeyType="default"
            />
          </View>
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Speed Slider Card */}
          <View
            style={[
              styles.sliderCard,
              { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
            ]}
          >
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: "#1D4ED8" }]}>
                再生速度
              </Text>
              <Text style={[styles.sliderValue, { color: "#2563EB" }]}>
                {rateLabel}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              value={rate}
              onValueChange={setRate}
              minimumTrackTintColor="#3B82F6"
              maximumTrackTintColor="#BFDBFE"
              thumbTintColor="#2563EB"
            />
            <View style={styles.sliderFooter}>
              <Text style={[styles.sliderFooterText, { color: "#60A5FA" }]}>
                0.5x（ゆっくり）
              </Text>
              <Text style={[styles.sliderFooterText, { color: "#60A5FA" }]}>
                2.0x（高速）
              </Text>
            </View>
          </View>

          {/* Voice Picker Card */}
          <View
            style={[
              styles.voiceCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sliderLabel, { color: colors.foreground }]}>
              声の種類
            </Text>
            {loadingVoices ? (
              <ActivityIndicator
                color={colors.primary}
                style={styles.voiceLoading}
              />
            ) : voices.length > 0 ? (
              <View
                style={[
                  styles.pickerWrapper,
                  { borderColor: colors.border, backgroundColor: colors.background },
                ]}
              >
                <Picker
                  selectedValue={selectedVoice}
                  onValueChange={(val) => setSelectedVoice(val)}
                  style={[styles.picker, { color: colors.foreground }]}
                  dropdownIconColor={colors.muted}
                >
                  {voices.map((v) => (
                    <Picker.Item
                      key={v.identifier}
                      label={v.name}
                      value={v.identifier}
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <Text style={[styles.noVoiceText, { color: colors.muted }]}>
                デフォルト音声
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsRow}>
          {/* Play Button */}
          <Pressable
            onPress={handlePlay}
            disabled={speechState === "playing"}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: "#2563EB" },
              pressed && styles.btnPressed,
              speechState === "playing" && styles.btnDisabled,
            ]}
          >
            <Text style={styles.btnIcon}>▶</Text>
            <Text style={styles.btnText}>再生</Text>
          </Pressable>

          {/* Pause Button */}
          <Pressable
            onPress={handlePause}
            disabled={speechState !== "playing"}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: "#F59E0B" },
              pressed && styles.btnPressed,
              speechState !== "playing" && styles.btnDisabled,
            ]}
          >
            <Text style={styles.btnIcon}>⏸</Text>
            <Text style={styles.btnText}>一時停止</Text>
          </Pressable>

          {/* Reset Button */}
          <Pressable
            onPress={handleReset}
            disabled={speechState === "idle"}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: "#EF4444" },
              pressed && styles.btnPressed,
              speechState === "idle" && styles.btnDisabled,
            ]}
          >
            <Text style={styles.btnIcon}>↺</Text>
            <Text style={styles.btnText}>リセット</Text>
          </Pressable>
        </View>

        {/* Status indicator */}
        {speechState !== "idle" && (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    speechState === "playing" ? "#22C55E" : "#F59E0B",
                },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.muted }]}>
              {speechState === "playing" ? "読み上げ中..." : "一時停止中"}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: {
    fontSize: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  textInputContainer: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    minHeight: 160,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 24,
    minHeight: 130,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 12,
  },
  sliderCard: {
    flex: 1.2,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: 32,
    marginVertical: 2,
  },
  sliderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderFooterText: {
    fontSize: 10,
    fontWeight: "500",
  },
  voiceCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    justifyContent: "flex-start",
  },
  voiceLoading: {
    marginTop: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 44,
    fontSize: 13,
  },
  noVoiceText: {
    fontSize: 13,
    marginTop: 8,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 6,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
