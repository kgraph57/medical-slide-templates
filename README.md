# Medical Slide Templates

学会発表・抄読会・症例報告・教育講演のための医学スライドテンプレート集。
国際学会（AHA/ASCO/ASH）のガイドラインに準拠したデザイン。

## テンプレート一覧（63枚）

| カテゴリ | 枚数 | テンプレート |
|---------|------|------------|
| 共通 | 4 | タイトル, COI開示(なし/あり), 倫理審査 |
| 学会口演 | 13 | Table 1, CONSORT, PRISMA, Forest Plot, KM曲線, ROC, 選択/除外基準, Study Design, 統計手法, サブグループ, Outcome Summary, 謝辞, ピラミッド |
| 抄読会 | 10 | 書誌カード, PICO, RoB2, GRADE, S&L, Discussion, 構造化抄録, Clinical Bottom Line, CASP, エビデンスサマリー |
| 症例報告 | 15 | 患者情報, 現病歴, 既往歴/家族歴, 身体所見, バイタル, 検査値, 画像, 鑑別診断, 臨床経過図, Problem List, 薬剤タイムライン, 混同行列, 人工呼吸器設定 |
| 教育講演 | 7 | Learning Objectives, Key Definitions, クイズ, 診断アルゴリズム, 治療アルゴリズム, ガイドライン比較 |
| 臨床試験 | 3 | Waterfall Plot, Swimmer Plot, Funnel Plot |
| 汎用 | 8 | Take Home, Flow, Timeline, Gantt, Before/After, Stat, 参考文献, 締め |

## 対応する発表パターン

| パターン | 網羅率 |
|---------|--------|
| 学会口演（RCT） | 100% |
| 学会口演（SR/メタアナリシス） | 100% |
| 学会口演（診断精度研究） | 100% |
| 学会口演（観察研究） | 100% |
| 抄読会（RCT / SR） | 100% |
| 症例報告（典型 / ICU重症） | 100% |
| 教育講演 | 100% |

## プレビュー

ブラウザで開いて矢印キーで全テンプレートを確認できます:

```
decks/medical-template-catalog/index.html
```

## ファイル構成

```
medical-slide-templates/
  SKILL.md                              # スキル定義（ワークフロー+ワイヤーフレーム+ルール）
  engine/
    slide.css                           # コアエンジン（16:9ロック, ナビUI）
    slide.js                            # ナビゲーション, キーボード操作
  theme/
    anthropic.css                       # Anthropicテーマ（カラー, タイポグラフィ）
  decks/
    medical-template-catalog/
      index.html                        # テンプレートカタログ（63枚）
```

## デザイン原則

- 1スライド = 1メッセージ（1枚/分が目安）
- テーブルヘッダーは `#e3dacc`（ウォームベージュ）、黒塗りつぶしは使わない
- 赤-緑の色の組み合わせは禁止（色覚多様性配慮）
- 3Dグラフは使用禁止
- Table 1は論文PDFのスクショ貼り付け禁止（再タイプする）
- Kaplan-Meier曲線にはNumber at Risk表を必ず付ける

## Claude Code スキルとして使う

`~/.claude/skills/medical-slide/` にSKILL.mdを配置すると、Claude Codeから `/medical-slide` で呼び出せます。

## ライセンス

MIT
