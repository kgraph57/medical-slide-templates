# 場面別スライド構成パターン

## A: 学会口演（RCT、7-10分、18枚）

```
01: slide-title          — 演題名・著者・所属
02: coi-disclosure       — COI開示
03: ethics-approval      — 倫理審査情報
04: slide-content        — 背景
05: slide-landing        — 目的（1文）
06: study-design         — 研究デザイン概要
07: inclusion-exclusion  — 選択基準・除外基準
08: consort-flow         — CONSORT図
09: statistical-methods  — 統計手法
10: table-1              — 患者背景
11: stat                 — 主要結果の数値
12: Chart.js (bar/line)  — 主要アウトカムのグラフ
13: outcome-summary      — アウトカム一覧
14: forest-plot          — サブグループ解析
15: slide-content        — 考察
16: bullets-horizontal   — Limitations
17: take-home-message    — 結語
18: acknowledgments      — 謝辞
```

## B: 学会口演（SR/メタアナリシス、7-10分、16枚）

```
01: slide-title          — 演題名
02: coi-disclosure       — COI開示
03: slide-content        — 背景
04: slide-landing        — 目的
05: slide-content        — 検索戦略
06: prisma-flow          — PRISMA図
07: evidence-summary     — 採用論文の特徴
08: forest-plot          — Forest Plot（主要アウトカム）
09: subgroup-table       — サブグループ解析
10: funnel-plot          — Funnel Plot
11: grade-assessment     — GRADE
12: slide-content        — 考察
13: strengths-limitations — 強みと限界
14: take-home-message    — 結語
15: references           — 参考文献
16: slide-end            — 締め
```

## C: 学会口演（診断精度研究、7-10分、14枚）

```
01: slide-title          — 演題名
02: coi-disclosure       — COI開示
03: ethics-approval      — 倫理審査
04: slide-content        — 背景
05: slide-landing        — 目的
06: study-design         — 研究デザイン
07: table-1              — 患者背景
08: confusion-matrix     — 2x2表 + 診断指標
09: roc-curve            — ROC曲線
10: slide-content        — 考察
11: strengths-limitations — 限界
12: take-home-message    — 結語
13: references           — 参考文献
14: slide-end            — 締め
```

## D: 抄読会（Journal Club、20-30分、14枚）

```
01: slide-title          — 抄読会タイトル
02: bibliography-card    — 論文書誌情報
03: slide-content        — 臨床的背景
04: pico-table           — PICO
05: structured-abstract  — 構造化抄録
06: consort-flow         — CONSORT図（or prisma-flow）
07: table-1              — 患者背景
08: slide-content        — 主要結果
09: risk-of-bias         — RoB 2
10: grade-assessment     — GRADE
11: casp-checklist       — CASP
12: strengths-limitations — 強みと限界
13: clinical-bottom-line — Clinical Bottom Line
14: discussion-points    — ディスカッション
```

## E: 症例報告（Case Report、10-15分、16枚）

```
01: slide-title          — 演題名
02: coi-disclosure       — COI開示
03: patient-info         — 症例提示
04: present-illness      — 現病歴
05: past-history         — 既往歴・家族歴・内服
06: vital-signs          — バイタルサイン
07: physical-exam        — 身体所見
08: lab-results          — 検査値
09: image-annotation     — 画像所見
10: differential-diagnosis — 鑑別診断
11: slide-content        — 確定診断・治療方針
12: clinical-course      — 臨床経過図
13: slide-content        — 転帰・文献的考察
14: take-home-message    — Clinical Pearl
15: references           — 参考文献
16: slide-end            — 締め
```

## F: 教育講演（レクチャー、30-60分）

```
01: slide-title          — タイトル
02: learning-objectives  — 学習目標
03: slide-content        — 導入・背景
04: key-definitions      — 重要用語
05-10: slide-content     — 本編（複数枚）
11: quiz                 — クイズ
12: slide-content        — 解説
13: diagnostic-algorithm — 診断アルゴリズム
14: treatment-algorithm  — 治療アルゴリズム
15: guideline-comparison — ガイドライン比較
16: before-after         — 導入効果
17: stat                 — データ
18: take-home-message    — まとめ
19: references           — 参考文献
20: slide-end            — 締め
```

## G: ICU症例報告（拡張版）

E（症例報告）に以下を追加:
- `problem-list` — Active Problems / Inactive Problems
- `medication-timeline` — 薬剤投与タイムライン
- `ventilator-settings` — 人工呼吸器設定の経時変化

## H: 臨床試験プロット（腫瘍学）

A（学会口演）の結果セクションに以下を追加:
- `waterfall-plot` — 各患者の腫瘍縮小率
- `swimmer-plot` — 患者別の治療期間と奏効
