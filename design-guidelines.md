# Medical Slide Design Guidelines

国際学会（AHA/ASCO/ASH）のスピーカーガイドラインに基づく医学スライドのデザインルール。

## カラーパレット

白背景・無彩色を地に、**アクセントはクリニカルブルー1色**。論文図版（NEJM / Lancet / JAMA）の水準に揃える。

| Name | Hex | Usage |
|------|-----|-------|
| White | `#ffffff` | メイン背景 |
| Ink | `#16191f` | テキスト（ほぼ黒） |
| Secondary Ink | `#2c333d` | やや弱いテキスト |
| Muted | `#5c6470` | 控えめテキスト・ラベル |
| Clinical Blue | `#1a5fb4` | 唯一の差し色（見出し罫・データ点・p値強調） |
| Border | `#dde3ea` | ヘアライン罫・テーブル横罫 |
| Card BG | `#f4f6f9` | カード・淡い面 |
| Neutral Gray | `#6b7280` | データ第2系列（KM対照群・薬剤バー等） |

### 医学特有の色（臨床慣習色・例外的に保持）

Traffic light や検査値の高低は、Cochrane RoB 2 等の確立した慣習色のため据え置く。

| Name | Hex | Usage |
|------|-----|-------|
| Red | `#dc2626` | 異常高値・否定所見・High risk |
| Blue | `#2563eb` | 異常低値 |
| Green | `#059669` | 正常・改善・支持所見・Low risk |
| Amber | `#f59e0b` | 注意・Some concerns |
| Purple | `#7c3aed` | Very Low（GRADE） |

### 禁止ルール

- 背景は白を既定とする（クリーム・グラデーション・ノイズ等の装飾背景は使わない）
- アクセントは1色（クリニカルブルー）に絞る。装飾的な多色使いをしない
- フローの矢印はテキスト記号（→ ↓）ではなく描画した罫線コネクタを使う
- 赤-緑を「対比の意味」で隣接させない（色覚多様性配慮。RoB等の慣習表示は形・記号で冗長化）
- ネオンカラーは使わない
- 放射線画像は黒背景で表示

## タイポグラフィ

中立グロテスク（Inter + Noto Sans JP）に統一。明朝の重い見出しや幾何学フレンドリー書体（Poppins）は使わない。数値は等幅桁（tabular-nums）で揃える。

| 要素 | フォント | サイズ |
|------|---------|--------|
| h1（タイトル） | Inter + Noto Sans JP (700) | 36-42px |
| h2（見出し） | Inter + Noto Sans JP (700) | 28-32px |
| 本文 | Inter + Noto Sans JP | 16-22px |
| テーブルセル | Inter + Noto Sans JP | 14-16px |
| テーブルヘッダー | Inter + Noto Sans JP (700) | 14px |
| ラベル・キャプション | Inter / SF Mono（英字ラベル） | 13-14px |
| 出典・注釈 | Inter | 13px |

## テーブルデザイン

- booktabs方式: 上罫（2px ink）+ 横罫（1px ヘアライン）のみ。**縦罫線は使わない**
- ヘッダー背景は薄いブルーグレー `#dde3ea` + テキスト `#16191f`（黒塗りつぶし禁止）
- 有意差ありのp値は Clinical Blue `#1a5fb4` + 太字
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
