/**
 * CustomPicker - Platform-agnostic picker that works on iOS, Android, and Web.
 * Uses @react-native-picker/picker on native, and a styled HTML select on web.
 */
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  style?: object;
}

export function CustomPicker({
  selectedValue,
  onValueChange,
  items,
  style,
}: CustomPickerProps) {
  const colors = useColors();

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webWrapper, { borderColor: colors.border, backgroundColor: colors.background }, style]}>
        {/* @ts-ignore */}
        <select
          value={selectedValue}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onValueChange(e.target.value)
          }
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: 13,
            color: colors.foreground,
            backgroundColor: colors.background,
            border: "none",
            outline: "none",
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  // Native: use @react-native-picker/picker
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Picker } = require("@react-native-picker/picker");
  return (
    <View style={[styles.nativeWrapper, { borderColor: colors.border, backgroundColor: colors.background }, style]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.nativePicker, { color: colors.foreground }]}
        dropdownIconColor={colors.muted}
      >
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  nativeWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  nativePicker: {
    height: 44,
    fontSize: 13,
  },
});
