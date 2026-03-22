# Medical Slide Design Guidelines

国際学会（AHA/ASCO/ASH）のスピーカーガイドラインに基づく医学スライドのデザインルール。

## カラーパレット

| Name | Hex | Usage |
|------|-----|-------|
| Ivory Light | `#faf9f5` | メイン背景 |
| Slate Medium | `#3d3d3a` | テキスト（黒 `#141413` は使わない） |
| Cloud Dark | `#87867f` | 控えめテキスト・ラベル |
| Clay | `#d97757` | プライマリアクセント |
| Kraft | `#d4a27f` | ウォームタン |
| Oat | `#e3dacc` | テーブルヘッダー背景・ウォームベージュ |

### 医学特有の色

| Name | Hex | Usage |
|------|-----|-------|
| Red | `#dc2626` | 異常高値・否定所見・High risk |
| Blue | `#2563eb` | 異常低値 |
| Green | `#059669` | 正常・改善・支持所見・Low risk |
| Amber | `#f59e0b` | 注意・Some concerns |
| Purple | `#7c3aed` | Very Low（GRADE） |

### 禁止ルール

- 赤-緑の組み合わせは禁止（色覚多様性配慮）
- 黒 `#141413` の塗りつぶし背景は使わない
- ネオンカラーは使わない
- 放射線画像は黒背景で表示

## タイポグラフィ

| 要素 | フォント | サイズ |
|------|---------|--------|
| h1（タイトル） | Noto Serif JP (900) | 36-42px |
| h2（見出し） | Poppins + Noto Sans JP | 28-32px |
| 本文 | Poppins + Noto Sans JP | 16-22px |
| テーブルセル | Inter + Noto Sans JP | 14-16px |
| テーブルヘッダー | Inter + Noto Sans JP (700) | 14px |
| ラベル・キャプション | Inter | 13-14px |
| 出典・注釈 | Inter | 13px |

## テーブルデザイン

- ヘッダー背景: `#e3dacc`（Oat）+ テキスト `#3d3d3a`
- 縦罫線は使わない（横罫線のみ）
- 有意差ありのp値は Clay `#d97757` + 太字
- 異常値は赤（高値）/ 青（低値）でハイライト
- 基準範囲は灰色小文字で併記
- Table 1はスクリーンショット貼り付け禁止（重要3-5項目を再タイプ）

## 図表ルール

- 3Dグラフは使用禁止
- グリッドラインは薄く控えめに
- 凡例はグラフ内に直接配置
- KM曲線にはNumber at Risk表を必ず付ける
- Forest PlotにはHR=1.0線 + Favors Treatment/Control ラベル

## 余白の原則

- スライドのpadding: 上下左右64px（固定、上書きしない）
- コンテンツとフッターの間: 80px以上
- 要素間: gap 16-24px
- カード内: padding 16-24px
- 1スライドの40-60%がコンテンツ、残りが余白

## 情報密度

- 1スライド = 1メッセージ（One Slide, One Idea）
- 1枚/分を目安にスライド枚数を設計
- テキスト要素は6個以下（Rule of Six）
- コンテンツが多すぎる場合はスライドを分割する

## 参考文献

- Naegle KM. Ten Simple Rules for Effective Presentation Slides. PLoS Comput Biol. 2021;17(12):e1009554.
- AHA Scientific Sessions — Presenter Guidelines
- ASCO Annual Meeting — Oral Presenter Guidelines
- ASH Annual Meeting — Presenter Resources
