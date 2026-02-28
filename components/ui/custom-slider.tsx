/**
 * CustomSlider - Platform-agnostic slider that works on iOS, Android, and Web.
 * Uses @react-native-community/slider on native, and a custom HTML range input on web.
 */
import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";

interface CustomSliderProps {
  minimumValue: number;
  maximumValue: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: object;
}

export function CustomSlider({
  minimumValue,
  maximumValue,
  step,
  value,
  onValueChange,
  minimumTrackTintColor = "#3B82F6",
  maximumTrackTintColor = "#BFDBFE",
  thumbTintColor = "#2563EB",
  style,
}: CustomSliderProps) {
  if (Platform.OS === "web") {
    // Percentage fill for the track
    const pct =
      ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

    return (
      <View style={[styles.webContainer, style]}>
        {/* @ts-ignore - web-only input element */}
        <input
          type="range"
          min={minimumValue}
          max={maximumValue}
          step={step}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onValueChange(parseFloat(e.target.value))
          }
          style={{
            width: "100%",
            height: 32,
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, ${minimumTrackTintColor} 0%, ${minimumTrackTintColor} ${pct}%, ${maximumTrackTintColor} ${pct}%, ${maximumTrackTintColor} 100%)`,
            borderRadius: 4,
            outline: "none",
            cursor: "pointer",
          }}
        />
        <style>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${thumbTintColor};
            cursor: pointer;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          }
          input[type='range']::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${thumbTintColor};
            cursor: pointer;
            border: none;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </View>
    );
  }

  // Native: use @react-native-community/slider
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SliderNative = require("@react-native-community/slider").default;
  return (
    <SliderNative
      style={[styles.nativeSlider, style]}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      value={value}
      onValueChange={onValueChange}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
    />
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: "100%",
    justifyContent: "center",
  },
  nativeSlider: {
    width: "100%",
    height: 32,
  },
});
