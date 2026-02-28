# テキスト読み上げ君

テキストを入力して音声で読み上げるモバイルアプリです。Expo / React Native で構築されており、iOS・Android・ブラウザで動作します。

## 機能

- テキスト入力エリア（複数行）
- 再生速度スライダー（0.5x〜2.0x）
- 音声種類の選択（デバイスで利用可能な音声一覧）
- 再生 / 一時停止 / リセットボタン
- 読み上げ中ステータス表示
- iOS・Android・Web（ブラウザ）対応

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Expo SDK 54 / React Native 0.81 |
| 言語 | TypeScript |
| スタイリング | NativeWind v4 (Tailwind CSS) |
| ルーティング | Expo Router v6 |
| TTS | expo-speech |
| スライダー | @react-native-community/slider（ネイティブ）/ HTML input[range]（Web） |
| ピッカー | @react-native-picker/picker（ネイティブ）/ HTML select（Web） |

## セットアップ

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

## ライセンス

MIT
