import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ClipboardList,
  FlaskConical,
  Loader2,
  Map,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  X,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const NAV_ITEMS = [
  { id: 'settings', label: '設定', icon: Settings },
  { id: 'survey', label: 'ユーザー調査', icon: ClipboardList },
  { id: 'persona', label: 'ペルソナ', icon: Users },
  { id: 'journey', label: 'ジャーニーマップ', icon: Map },
  { id: 'mentalModel', label: 'メンタル・モデル', icon: Brain },
  { id: 'storyboard', label: 'ストーリーボード', icon: Clapperboard },
  { id: 'usability', label: 'ユーザビリティテスト', icon: FlaskConical }
];

const PERSONA_SEEDS = [
  {
    id: 'miyuki',
    name: '美雪',
    age: 28,
    occupation: '経理',
    country: '日本',
    gender: '女性',
    itLiteracy: '中',
    personality: ['慎重', '時短志向', '実用重視'],
    value: '業務の手戻りを減らし、短時間で成果を出せることを重視。',
    interest: '最初は最小入力で開始し、必要に応じて設定を深めたい。',
    painPoint: '初期設定が複雑だと利用開始前に離脱しやすい。',
    mockReplies: [
      '最初にどんな記事が作られるかサンプルで見せてもらえると、安心して設定を進められます。',
      '承認作業が5分以内に収まるなら、仕事の合間に続けられそうです。',
      '一度設定すれば自動で回るなら、週1回確認するだけでも運用できます。'
    ]
  },
  {
    id: 'takuya',
    name: '拓也',
    age: 33,
    occupation: 'バックエンドエンジニア',
    country: '日本',
    gender: '男性',
    itLiteracy: '高',
    personality: ['合理的', '検証重視', '再現性重視'],
    value: '権限や挙動が透明で、失敗時にも復旧しやすい設計を好む。',
    interest: '設定差分と実行ログを明確に確認したい。',
    painPoint: 'ブラックボックスな推論結果だと信頼して運用できない。',
    mockReplies: [
      '記事生成のロジックとSEO設定の詳細を確認できないと、品質の見極めができません。',
      '自動投稿が失敗した場合のリカバリー設計が先に見えると安心して導入できます。',
      'APIで既存の分析ツールと連携できるかどうかが、導入判断の分かれ目になります。'
    ]
  },
  {
    id: 'rin',
    name: '凛',
    age: 22,
    occupation: '大学生',
    country: '日本',
    gender: '女性',
    itLiteracy: '中',
    personality: ['探究心', '直感重視', '学習中'],
    value: '難解な専門用語なしで試せることを重視。',
    interest: 'チュートリアルとサンプルを見ながら触りたい。',
    painPoint: '空画面で次の行動が分からないと挫折しやすい。',
    mockReplies: [
      '最初にサンプル記事を見せてもらえると、どんなものが作れるか掴めます。',
      'セグメント設定の手順をステップごとに案内してくれると迷わずできそうです。',
      'AIが勝手に投稿しないよう、承認ステップがあると安心して使えます。'
    ]
  },
  {
    id: 'yoko',
    name: '陽子',
    age: 52,
    occupation: '看護師',
    country: '日本',
    gender: '女性',
    itLiteracy: '低',
    personality: ['堅実', '安全志向', '現場優先'],
    value: '短時間で迷わず操作できる安定性を重視。',
    interest: '毎回同じ場所に同じ操作があること。',
    painPoint: '確認が不足している操作は不安で使えない。',
    mockReplies: [
      '副業で使いたいけど、設定が難しいと最初の一歩が踏み出せません。',
      '毎日確認しなくても自動で動いてくれるなら、仕事との両立ができそうです。',
      '何かあった時にすぐ投稿を止められるボタンがあると、安心して任せられます。'
    ]
  },
  {
    id: 'sora',
    name: '蒼',
    age: 27,
    occupation: 'SaaS営業',
    country: '日本',
    gender: '男性',
    itLiteracy: '中',
    personality: ['成果志向', '説明力重視', 'スピード重視'],
    value: '導入メリットが早く可視化されることを重視。',
    interest: '社内説明に使えるレポートが欲しい。',
    painPoint: '価値が見えるまでが遅いと提案機会を逃す。',
    mockReplies: [
      '導入後どれくらいで集客効果が出るか、見通しが欲しいです。',
      '顧客へのアプローチ数増加につながるSEO効果の数値が見えると提案しやすいです。',
      '上司への説明に使えるレポート出力機能があると、社内導入がスムーズになります。'
    ]
  },
  {
    id: 'noa',
    name: 'ノア',
    age: 19,
    occupation: '専門学校生',
    country: '日本',
    gender: 'ノンバイナリー',
    itLiteracy: '中',
    personality: ['挑戦的', '自己表現', 'テンポ重視'],
    value: '試行錯誤を邪魔しない、軽快な操作体験を重視。',
    interest: '失敗してもすぐ戻せる安心感が欲しい。',
    painPoint: 'エラーメッセージが硬いと学習意欲が下がる。',
    mockReplies: [
      '思いついたテーマですぐ記事を作れる「オリジナル素材」機能が楽しそうです。',
      '承認した記事が実際にどこに投稿されるか、リアルタイムで見てみたいです。',
      'うまくいかなくても設定を変えてまたトライできると、試行錯誤が楽しめます。'
    ]
  },
  {
    id: 'james',
    name: 'James',
    age: 35,
    occupation: 'Product Manager',
    country: 'アメリカ',
    gender: '男性',
    itLiteracy: '高',
    personality: ['分析志向', '合意形成', '優先順位重視'],
    value: '意思決定の根拠とトレードオフを明確にしたい。',
    interest: 'ペルソナ差分を比較して議論材料にしたい。',
    painPoint: '推奨理由が曖昧だとチーム合意を得づらい。',
    mockReplies: [
      'どのセグメントへの記事が最もコンバージョンに寄与するか、比較データが欲しいです。',
      'AI生成記事のブランドトーン一貫性を確認できる仕組みがないと、運用に不安が残ります。',
      '複数プラットフォームへの投稿スケジュールを一元管理できる画面が必要です。'
    ]
  },
  {
    id: 'linh',
    name: 'Linh',
    age: 30,
    occupation: 'カスタマーサポート',
    country: '東南アジア',
    gender: '女性',
    itLiteracy: '中',
    personality: ['共感力', '運用重視', '現実的'],
    value: '問い合わせ対応が減る、分かりやすい導線を重視。',
    interest: '自己解決しやすいヘルプ導線を最初から設計したい。',
    painPoint: 'FAQにたどり着けないとサポート負荷が急増する。',
    mockReplies: [
      '「広める対象」の入力欄に何を書けばいいか分からないというお問い合わせが多そうです。',
      'AIが生成した記事の品質に問題があった時の報告・修正フローが見えないと不安です。',
      'オンボーディング完了後に「次に何をすれば良いか」が示されないと離脱が増えそうです。'
    ]
  },
  {
    id: 'emma',
    name: 'Emma',
    age: 41,
    occupation: 'HR Manager',
    country: 'ヨーロッパ',
    gender: '女性',
    itLiteracy: '中',
    personality: ['運用管理', 'リスク回避', '標準化'],
    value: '監査対応に耐える履歴と権限管理を重視。',
    interest: '誰が何を変更したかを追跡したい。',
    painPoint: '共有運用時に責任境界が曖昧だと導入できない。',
    mockReplies: [
      'どのメンバーがどの記事を承認したか、変更履歴が追えないと社内管理ができません。',
      'チームメンバーごとに承認・編集・閲覧の権限を分けられると運用しやすくなります。',
      '記事の承認フローをカスタマイズできる仕組みがないと、複数人での運用が難しいです。'
    ]
  },
  {
    id: 'hans',
    name: 'Hans',
    age: 48,
    occupation: '製造ライン管理者',
    country: 'ヨーロッパ',
    gender: '男性',
    itLiteracy: '低',
    personality: ['慎重', '現場適応', '再現重視'],
    value: '現場で止まらないこと、引き継ぎやすいことを重視。',
    interest: '通信不安定でも最低限の操作は継続したい。',
    painPoint: '途中入力が消えると現場での信用を失う。',
    mockReplies: [
      '記事の自動投稿がいつ・どこに行われたか、後から確認できないと管理が困難です。',
      '途中まで作った記事の下書きが消えてしまうと、作業のやり直しが発生して困ります。',
      '担当者が変わっても引き継げるよう、設定内容と運用履歴が一目で分かると助かります。'
    ]
  }
];

const SEGMENT_PROFILE_BY_SEED = {
  miyuki: {
    education: '大学卒',
    hobby: '旅行',
    family: '夫婦のみ',
    environment: '都市部',
    commute: '公共交通機関',
    driving: 'ほとんど運転しない'
  },
  takuya: {
    education: '大学院卒',
    hobby: 'ゲーム',
    family: '単身',
    environment: '都市部',
    commute: 'リモート中心',
    driving: '運転しない'
  },
  rin: {
    education: '在学中',
    hobby: '音楽',
    family: '親と同居',
    environment: '都市部',
    commute: '公共交通機関',
    driving: '運転しない'
  },
  yoko: {
    education: '専門学校卒',
    hobby: '料理',
    family: '子どもあり',
    environment: '郊外',
    commute: '自動車',
    driving: '毎日運転する'
  },
  sora: {
    education: '大学卒',
    hobby: '運動',
    family: '単身',
    environment: '都市部',
    commute: '公共交通機関',
    driving: '週に数回運転する'
  },
  noa: {
    education: '在学中',
    hobby: 'ゲーム',
    family: '親と同居',
    environment: '郊外',
    commute: '自転車',
    driving: '運転しない'
  },
  james: {
    education: '大学院卒',
    hobby: '運動',
    family: '子どもあり',
    environment: '郊外',
    commute: '自動車',
    driving: '週に数回運転する'
  },
  linh: {
    education: '大学卒',
    hobby: '料理',
    family: '子どもあり',
    environment: '都市部',
    commute: '公共交通機関',
    driving: 'ほとんど運転しない'
  },
  emma: {
    education: '大学院卒',
    hobby: '読書',
    family: '夫婦のみ',
    environment: '郊外',
    commute: '自動車',
    driving: '週に数回運転する'
  },
  hans: {
    education: '高校卒',
    hobby: '運動',
    family: '子どもあり',
    environment: '地方',
    commute: '自動車',
    driving: '毎日運転する'
  }
};

const TOTAL_PERSONA_COUNT = 10000;
const PERSONAS_PER_PAGE = 24;
const PAGE_WINDOW_SIZE = 7;

const QUESTION_TYPES = [
  { value: 'single', label: '単一選択' },
  { value: 'multi', label: '複数選択' },
  { value: 'rating', label: '評価スケール (1–5)' },
  { value: 'text', label: '自由記述' }
];

const SURVEY_CHART_COLORS = ['#047857', '#3b82f6', '#f59e0b', '#e05252', '#8b5cf6', '#10b981'];

const TEXT_THEME_PRESETS = [
  ['操作の簡略化', 'ヘルプ・ガイドの充実', '処理速度の改善', 'UIの視認性向上', 'モバイル対応', 'その他'],
  ['コスト削減', '機能の充実', 'サポート改善', 'セキュリティ強化', 'パフォーマンス向上', 'その他'],
  ['使いやすさ向上', 'デザイン改善', '通知設定の改善', 'データ管理', '外部連携機能', 'その他']
];

function buildMockSurveyResults(questions, totalRespondents) {
  return questions.map((q, qIdx) => {
    const shift = qIdx * 0.15;
    if (q.type === 'single') {
      const opts = q.options.filter((o) => o.trim());
      if (!opts.length) return { ...q, chartData: [] };
      const weights = opts.map((_, i) => Math.max(5, 50 - i * (11 + shift * 3)));
      const sum = weights.reduce((a, b) => a + b, 0);
      return {
        ...q,
        chartData: opts.map((name, i) => ({
          name,
          count: Math.round((weights[i] / sum) * totalRespondents),
          pct: Math.round((weights[i] / sum) * 100)
        }))
      };
    }
    if (q.type === 'multi') {
      const opts = q.options.filter((o) => o.trim());
      if (!opts.length) return { ...q, chartData: [] };
      return {
        ...q,
        chartData: opts.map((name, i) => {
          const pct = Math.max(10, Math.round(72 - i * (11 + shift * 5)));
          return { name, count: Math.round((totalRespondents * pct) / 100), pct };
        })
      };
    }
    if (q.type === 'rating') {
      const base = [0.04, 0.09, 0.17, 0.38, 0.32];
      const chartData = [1, 2, 3, 4, 5].map((n, i) => ({
        name: `${n}点`,
        count: Math.round(totalRespondents * Math.max(0.02, base[i] + (shift - 0.075) * (i - 2) * 0.04))
      }));
      const totalCount = chartData.reduce((s, d) => s + d.count, 0);
      const avg = chartData.reduce((s, d) => s + Number(d.name[0]) * d.count, 0) / totalCount;
      return { ...q, chartData, avg: avg.toFixed(1) };
    }
    if (q.type === 'text') {
      const themes = TEXT_THEME_PRESETS[qIdx % TEXT_THEME_PRESETS.length];
      const weights = [0.32, 0.23, 0.17, 0.13, 0.09, 0.06];
      return {
        ...q,
        chartData: themes.map((name, i) => ({
          name,
          count: Math.round(totalRespondents * (weights[i] ?? 0.05))
        }))
      };
    }
    return { ...q, chartData: [] };
  });
}

function buildRespondentAnswers(result, samplePersonas) {
  return samplePersonas.map((persona) => {
    const seed = persona.serial ?? 1;
    let answer = '';
    if (result.type === 'single') {
      const d = result.chartData;
      if (d.length === 0) { answer = '-'; }
      else { answer = d[seed % d.length]?.name ?? '-'; }
    } else if (result.type === 'multi') {
      const d = result.chartData;
      const picks = d.filter((_, i) => (seed + i) % 3 !== 0).slice(0, 3);
      answer = picks.length > 0 ? picks.map((p) => p.name).join('、') : '-';
    } else if (result.type === 'rating') {
      const base = persona.itLiteracy === '高' ? 4 : persona.itLiteracy === '低' ? 2 : 3;
      const rating = Math.min(5, Math.max(1, base + ((seed % 3) - 1)));
      answer = `${rating} 点`;
    } else if (result.type === 'text') {
      const d = result.chartData;
      const theme = d.length > 0 ? (d[seed % d.length]?.name ?? 'その他') : 'その他';
      const hint = persona.painPoint ? persona.painPoint.slice(0, 20) : '';
      answer = `${theme}が課題です。${hint ? hint + '…' : ''}`;
    }
    return { persona, answer };
  });
}

const PROJECT_CONTEXT_SOURCES = {
  readme: 'README: Medialは広めたい対象を入力するだけでメディアを自動生成・運用・改善するSaaSツール。',
  codebase: 'Service: 記事自動生成・複数プラットフォーム自動投稿・AI編集部・分析改善の機能を持つ。'
};

const COUNTRY_OPTIONS = ['指定なし', '日本', 'アメリカ', '東南アジア', 'ヨーロッパ'];
const AGE_OPTIONS = ['指定なし', '18-24', '25-34', '35-44', '45+'];
const GENDER_OPTIONS = ['指定なし', '女性', '男性', 'ノンバイナリー'];
const IT_OPTIONS = ['指定なし', '低', '中', '高'];
const OCCUPATION_OPTIONS = ['指定なし', ...Array.from(new Set(PERSONA_SEEDS.map((seed) => seed.occupation)))];
const EDUCATION_OPTIONS = [
  '指定なし',
  ...Array.from(new Set(Object.values(SEGMENT_PROFILE_BY_SEED).map((profile) => profile.education)))
];
const HOBBY_OPTIONS = ['指定なし', ...Array.from(new Set(Object.values(SEGMENT_PROFILE_BY_SEED).map((profile) => profile.hobby)))];
const FAMILY_OPTIONS = ['指定なし', ...Array.from(new Set(Object.values(SEGMENT_PROFILE_BY_SEED).map((profile) => profile.family)))];
const ENVIRONMENT_OPTIONS = [
  '指定なし',
  ...Array.from(new Set(Object.values(SEGMENT_PROFILE_BY_SEED).map((profile) => profile.environment)))
];
const COMMUTE_OPTIONS = ['指定なし', ...Array.from(new Set(Object.values(SEGMENT_PROFILE_BY_SEED).map((profile) => profile.commute)))];
const DRIVING_OPTIONS = ['指定なし', ...Array.from(new Set(Object.values(SEGMENT_PROFILE_BY_SEED).map((profile) => profile.driving)))];
const ADVANCED_PERSONA_SECTIONS = [
  {
    title: '1. 心理・行動特性',
    fields: [
      { key: 'mentalModel', label: 'メンタルモデル' },
      { key: 'decisionLogic', label: '意思決定ロジック' },
      { key: 'cognitiveLoadTolerance', label: '認知的負荷への耐性' },
      { key: 'behaviorTrigger', label: '行動のトリガー' }
    ]
  },
  {
    title: '2. 文脈と環境',
    fields: [
      { key: 'usageEnvironment', label: '物理的・デジタル環境' },
      { key: 'deviceEcosystem', label: 'マルチデバイス連携' },
      { key: 'timeConstraint', label: '時間の制約' },
      { key: 'stakeholders', label: '周囲のステークホルダー' }
    ]
  },
  {
    title: '3. リテラシーと技術スタック',
    fields: [
      { key: 'aiLiteracy', label: 'AIリテラシー' },
      { key: 'privacyPolicy', label: 'プライバシー・ポリシー' },
      { key: 'informationChannel', label: '情報の収集経路' }
    ]
  },
  {
    title: '4. 価値観とインクルーシブ要素',
    fields: [
      { key: 'ethicsValue', label: '倫理性・社会的価値観' },
      { key: 'accessibilityNeed', label: 'アクセシビリティ配慮' },
      { key: 'wellbeing', label: 'ウェルビーイングの定義' }
    ]
  },
  {
    title: '5. Jobs to be Done',
    fields: [
      { key: 'expectedOutcome', label: '期待するアウトカム' },
      { key: 'alternativeSolution', label: '現状の代替手段' }
    ]
  }
];

const TOOLTIP_STYLE = {
  backgroundColor: '#252526',
  border: '1px solid #333333',
  borderRadius: '8px',
  color: '#cccccc',
  fontSize: '12px'
};

const JOURNEY_PHASES = ['認知・検討', 'オンボーディング', '初回記事承認', '日次運用', '分析・拡大'];
const JOURNEY_ROW_HEADER_WIDTH = 180;
const JOURNEY_PHASE_COLUMN_MIN_WIDTH = 160;
const JOURNEY_MIN_WIDTH = JOURNEY_ROW_HEADER_WIDTH + JOURNEY_PHASE_COLUMN_MIN_WIDTH * JOURNEY_PHASES.length;
const ADVANCED_PROFILE_LOADING_DELAY = 1200;

function inAgeRange(age, bucket) {
  if (bucket === '指定なし') return true;
  if (bucket === '18-24') return age >= 18 && age <= 24;
  if (bucket === '25-34') return age >= 25 && age <= 34;
  if (bucket === '35-44') return age >= 35 && age <= 44;
  if (bucket === '45+') return age >= 45;
  return true;
}

function buildAdvancedPersonaProfile(persona, projectRequirement) {
  const lowIt = persona.itLiteracy === '低';
  const highIt = persona.itLiteracy === '高';
  const traits = persona.personality || [];
  const hasTrait = (keyword) => traits.some((trait) => trait.includes(keyword));
  const requirementText = (projectRequirement || '').trim() || '要件は未入力';
  const requirementFocus = requirementText.length > 32
    ? `${requirementText.slice(0, 32)}...`
    : requirementText;
  const requirementHints = {
    speed: /(離脱|短縮|時短|初回|迅速|スピード)/.test(requirementText),
    reliability: /(安全|監査|権限|再現|信頼|運用)/.test(requirementText),
    collaboration: /(共有|チーム|合意|説明|社内)/.test(requirementText),
    onboarding: /(オンボーディング|ガイド|チュートリアル|学習|導入)/.test(requirementText)
  };

  return {
    mentalModel: requirementHints.speed
      ? `「${requirementFocus}」に直結する最短手順なら採用しやすい`
      : requirementHints.reliability
        ? `「${requirementFocus}」を満たしつつ、根拠が見える提案なら採用しやすい`
        : highIt
          ? 'AIは提案の根拠を示し、人が検証して採用するもの'
          : lowIt
            ? 'AIは安全な範囲で補助し、人が確認して進めるもの'
            : 'AIは提案し、人が最終判断するもの',
    decisionLogic: requirementHints.collaboration || hasTrait('合意') || hasTrait('説明')
      ? '個人評価だけでなく、チームで説明可能かを重視して決める'
      : hasTrait('合理') || hasTrait('分析') || hasTrait('検証')
        ? 'データ・比較表で合理的に決める'
        : hasTrait('共感')
          ? '周囲の反応と利用者の感情を重視して決める'
          : '手間と成果のバランスを見て決める',
    cognitiveLoadTolerance: lowIt
      ? '3ステップ以内なら安心して試せる'
      : highIt
        ? '複雑でも構造が明確なら扱える'
        : requirementHints.onboarding
          ? '段階的なガイドがあれば複雑な設定にも対応できる'
          : '必要性が分かれば段階的に学習できる',
    behaviorTrigger: persona.painPoint || '困りごとが発生した瞬間',
    usageEnvironment: highIt
      ? 'オフィスのPC中心（必要時にスマホ）'
      : '現場・移動中のスマホ利用を含む',
    deviceEcosystem: requirementHints.speed
      ? 'スマホとPCを切り替えても入力状態を維持したい'
      : lowIt
        ? '操作導線が一定なら端末差を気にせず使える'
        : highIt
          ? 'スマホとPCをシームレス連携したい'
          : 'スマホ中心で、必要時にPCで深掘りしたい',
    timeConstraint: requirementHints.speed || hasTrait('時短') || hasTrait('スピード') || hasTrait('テンポ')
      ? '5分以内で主要タスクを完了したい'
      : '30分以内で比較検討まで終えたい',
    stakeholders: requirementHints.collaboration || hasTrait('合意') || hasTrait('説明')
      ? '同僚・上司の承認が必要'
      : hasTrait('共感')
        ? '家族やチームメンバーの反応が影響する'
        : '基本は本人判断だが運用者の意見も影響する',
    aiLiteracy: highIt
      ? 'AIを業務フローに積極統合し、結果を検証する'
      : lowIt
        ? 'AI利用は限定的で、誤作動リスクに敏感'
        : 'AI提案を確認してから使う',
    privacyPolicy: highIt || requirementHints.reliability
      ? '監査・説明可能性が担保されるならデータ提供可'
      : '利便性が高く、目的が明確なら匿名データ提供可',
    informationChannel: requirementHints.onboarding
      ? 'チュートリアル・動画・ヘルプ記事を優先して確認'
      : highIt
      ? '検索と技術コミュニティで情報収集'
      : hasTrait('探究') || hasTrait('自己表現')
        ? 'SNS・動画・コミュニティで情報収集'
        : '検索と周囲の口コミを併用',
    ethicsValue: requirementHints.reliability || hasTrait('安全') || hasTrait('堅実') || hasTrait('リスク')
      ? '安全性・社会的リスクの低さを重視'
      : '利便性と社会的影響のバランスを重視',
    accessibilityNeed: lowIt
      ? '視認性・誤操作防止・一貫したUIを重視'
      : requirementHints.speed
        ? '片手操作・短時間操作・明確なフィードバックを重視'
        : '文脈に応じた入力方法の切り替えを重視',
    wellbeing: requirementHints.speed || hasTrait('成果')
      ? '短時間で成果を実感できることが幸福'
      : hasTrait('共感')
        ? '周囲と摩擦なく進められることが幸福'
        : '不安なく継続利用できることが幸福',
    expectedOutcome: persona.interest || '迷わず意思決定できる状態になりたい',
    alternativeSolution: requirementHints.collaboration
      ? 'スプレッドシート・会議メモ・チャット相談を組み合わせて対応'
      : 'スプレッドシート・メモ・同僚相談を組み合わせて対応'
  };
}

function buildPersonaPool(seeds, totalCount) {
  return Array.from({ length: totalCount }, (_, index) => {
    const seed = seeds[index % seeds.length];
    const segmentProfile = SEGMENT_PROFILE_BY_SEED[seed.id] || {};
    const batch = Math.floor(index / seeds.length);
    const ageOffset = ((batch + index) % 7) - 3;
    const age = Math.max(18, Math.min(65, seed.age + ageOffset));
    return {
      ...seed,
      ...segmentProfile,
      id: `${seed.id}-${index + 1}`,
      name: batch === 0 ? seed.name : `${seed.name} ${batch + 1}`,
      age,
      serial: index + 1
    };
  });
}

function buildProjectContextSummary(chatMessages) {
  const recentUserMessages = chatMessages
    .filter((message) => message.senderType === 'user')
    .slice(-2)
    .map((message) => message.text.trim())
    .filter(Boolean);

  const chatContext = recentUserMessages.length > 0
    ? recentUserMessages.join(' / ')
    : 'チャット履歴はまだありません。';

  return `${PROJECT_CONTEXT_SOURCES.readme} ${PROJECT_CONTEXT_SOURCES.codebase} Chat: ${chatContext}`;
}

const PERSONA_POOL = buildPersonaPool(PERSONA_SEEDS, TOTAL_PERSONA_COUNT);

function buildJourneyData(persona) {
  const literacyOffset = persona.itLiteracy === '低' ? -8 : persona.itLiteracy === '高' ? 6 : 0;
  const baseScores = [62, 58, 46, 55, 74];
  const journeyData = JOURNEY_PHASES.map((phase, index) => ({
    phase,
    score: baseScores[index] + literacyOffset,
    phaseCenter: index + 0.5
  }));
  const wowScore = Math.max(...journeyData.map((point) => point.score));
  const lowScore = Math.min(...journeyData.map((point) => point.score));
  const lowThreshold = 50;

  return journeyData.map((point) => ({
    ...point,
    isWow: point.score === wowScore,
    isLow: point.score === lowScore && point.score <= lowThreshold
  }));
}

function buildJourneyGrid(persona, contextSummary) {
  const shortContext = contextSummary || 'README / コード / チャットから文脈取得中';
  const rows = [
    [
      '接点/オンライン',
      [
        '検索広告・SNS・成功事例記事・比較メディア',
        'Medial公式サイト・料金ページ・機能紹介動画',
        'オンボーディング画面・セグメント設定・プラットフォーム連携',
        'AI生成記事の確認画面・承認ボタン・投稿プレビュー',
        '分析ダッシュボード・AI改善提案・メールレポート'
      ]
    ],
    [
      '接点/オフライン',
      [
        `${persona.occupation}仲間からの口コミ・SNSでの評判`,
        '事業計画・発信戦略の見直し・知人への相談',
        '初期設定の目標確認・広める対象のメモ整理',
        `毎朝${persona.name}がスマホで記事を確認し承認するルーティン`,
        '月次の振り返り・次の発信テーマの検討'
      ]
    ],
    [
      'モチベーション',
      [
        `😟 ${persona.painPoint}。コンテンツを継続的に発信したいが時間もスキルも足りない`,
        '😐 本当に自動で質の高い記事が作れるか・投稿後の反応はどうなるか不安',
        '😬 設定を間違えて変な内容が公開されないか心配。まず安全に試したい',
        '🙂 承認した記事が公開され、最初のPVやいいねが来た。「これは使える」と実感',
        '😄 メディアが育ち、自然流入やフォロワーが増え続けている。影響力が拡大している'
      ]
    ],
    [
      'ユーザー行動',
      [
        `${persona.name}が「コンテンツ自動生成」「メディア運用 AI」で検索し、Medialの成功事例記事を2〜3件保存する`,
        '料金・投稿先プラットフォーム・記事品質・サポート体制を比較し、無料トライアルを申し込む',
        '広める対象を入力し、ターゲットセグメント・発信プラットフォーム・自動処理ルールを設定する',
        'AIが生成した記事を読み、必要に応じて編集したうえで承認する。投稿後の反応数値を確認する',
        '分析レポートを確認し、AI改善提案を受け取る。新たなテーマでオリジナル素材を生成させる'
      ]
    ],
    [
      'インサイト仮説',
      [
        `「${shortContext.slice(0, 20)}...」に近い業種の成功事例を見せると、認知段階の興味・申込率が上がる`,
        'トライアル期間中に1本の記事が公開されるまでを体験できると、本登録への転換率が高まる',
        '承認ステップで「人が確認してから公開される」安心感を強調すると、導入ハードルが下がる',
        '初回承認後すぐにPV・インプレッション数が見えると達成感が生まれ、継続意向が上がる',
        '改善提案が「やること」形式で届き、1クリックで実行できると運用の継続率が高まる'
      ]
    ]
  ];

  return rows.map(([row, values]) => ({
    row,
    values: JOURNEY_PHASES.map((_, index) => values[index] || '')
  }));
}

function buildMentalModel(persona, contextSummary) {
  const contextHint = (contextSummary || 'README / Codebase / Chat').slice(0, 28);

  const featureInventory = [
    { id: 'onboarding', label: 'オンボーディング（広める対象入力）' },
    { id: 'segmentSetting', label: 'セグメント・メディア・X設定' },
    { id: 'autoSettings', label: '自動処理設定' },
    { id: 'aiEditorial', label: 'AI編集部（AIからの提案）' },
    { id: 'trendWatch', label: 'トレンド確認' },
    { id: 'newsCollection', label: 'ニュース収集' },
    { id: 'originalContent', label: 'オリジナル素材生成' },
    { id: 'articleList', label: '記事一覧・承認管理' },
    { id: 'analytics', label: '分析・改善' }
  ];

  const featureById = Object.fromEntries(featureInventory.map((item) => [item.id, item]));

  const towerDefinitions = [
    {
      id: 'brandSetup',
      phaseId: 'prepare',
      title: '自分の「好き」や「売り」を整理する',
      mentalTasks: [
        `「${persona.value || '自分の強み'}」を軸に売りたいものをキーワードで書き出す`,
        `${persona.occupation || 'ユーザー'}として届けたい相手の悩みをセグメントで明確にする`,
        'キレイめ・エモい・信頼感など、メディアの世界観（トーン＆マナー）を決める',
        'フォロワー数・購入数・認知拡大など、最初の目標を設定する'
      ],
      gapIssue: '設定が難しくて挫折する：セグメント設定などのマーケティング用語が分からず、最初で止まってしまう。',
      gapOpportunity: 'オンボーディングUIを簡略化し、専門用語をやさしい言葉・具体例に置き換えることでドロップを防ぐ。'
    },
    {
      id: 'trendResearch',
      phaseId: 'prepare',
      title: '世の中の空気感を掴む',
      mentalTasks: [
        '今SNSでバズっているハッシュタグや話題をチェックする',
        '同じジャンルの競合・類似アカウントの発信動向を確認する',
        `${contextHint} に関連するニュースを自分のメディアで言及できるか考える`,
        'その情報が「今」出すべきものか、鮮度を判断する'
      ]
    },
    {
      id: 'selfPublish',
      phaseId: 'create',
      title: '自分らしさを添えて発信する',
      mentalTasks: [
        'AIの下書きを読み、自分の言葉遣いとして違和感がないか確認する',
        '「このキーワードは絶対入れて」と独自のこだわりをオリジナル素材で注入する',
        'ブランドイメージに合わない提案を却下してハズレを間引く',
        '最終的な「公開」の決定権を持ち、承認ボタンで納得感を得る'
      ],
      gapIssue: '「AI感」が強すぎて恥ずかしい：文章が硬く、自分のSNSアカウントに載せるのは抵抗がある。',
      gapOpportunity: 'トーン＆マナー設定の細かい指定や口調の学習機能を追加し、AI文章をより自然な表現に近づける。'
    },
    {
      id: 'autoOps',
      phaseId: 'automate',
      title: '運用の手間を最小化する',
      mentalTasks: [
        '投稿時間を気にせずAIにスケジュールを任せて自動投稿する',
        'Instagram・X・noteなど複数チャネルへ一度に展開する',
        '隙間時間にAIの提案を見て承認するだけのルーティンを確立する',
        '放置していても裏側で計測が回っている安心な状態を維持する'
      ]
    },
    {
      id: 'improveGrowth',
      phaseId: 'grow',
      title: '手応えを感じて改善する',
      mentalTasks: [
        'なぜこの記事が読まれたか、AIの分析結果で「伸びた理由」を理解する',
        'フォロワーの反応を楽しみながら影響力が育っている実感を得る',
        '改善案を受け入れ、徐々にAIの精度を自分好みに最適化させる',
        '成果を見て新しいテーマやセグメントに挑戦したくなる'
      ],
      gapIssue: '何が正解か分からない：数値は見れるが、次に何をすればいいかの具体的アクションが欲しい。',
      gapOpportunity: 'AI分析に「次のアクション提案」を付加し、改善の優先順位を明示する機能を追加する。'
    }
  ];

  const supportByTower = {
    brandSetup: ['onboarding'],
    trendResearch: ['trendWatch', 'newsCollection'],
    selfPublish: ['articleList'],
    autoOps: ['autoSettings', 'aiEditorial'],
    improveGrowth: ['analytics']
  };

  if (persona.itLiteracy === '低') {
    supportByTower.brandSetup = [];
    supportByTower.autoOps = ['autoSettings'];
  }

  if (persona.itLiteracy === '高') {
    supportByTower.brandSetup = ['onboarding', 'segmentSetting'];
    supportByTower.selfPublish = ['originalContent', 'articleList'];
    supportByTower.improveGrowth = ['analytics', 'aiEditorial'];
  }

  const towers = towerDefinitions.map((tower) => {
    const supportIds = supportByTower[tower.id] || [];
    const supportCards = supportIds.map((id) => featureById[id]).filter(Boolean);
    const coverageStatus = supportCards.length === 0 ? 'gap' : supportCards.length === 1 ? 'partial' : 'covered';
    return {
      ...tower,
      supportCards,
      coverageStatus
    };
  });

  const phaseOrder = [
    { id: 'prepare', title: '自分を準備する' },
    { id: 'create', title: '自分らしく発信する' },
    { id: 'automate', title: '運用を自動化する' },
    { id: 'grow', title: '成長を実感する' }
  ];

  const phases = phaseOrder.map((phase) => ({
    ...phase,
    towers: towers.filter((tower) => tower.phaseId === phase.id)
  }));

  const gaps = towers
    .filter((tower) => tower.coverageStatus !== 'covered')
    .map((tower) => ({
      towerTitle: tower.title,
      type: tower.coverageStatus,
      issue:
        tower.gapIssue ||
        (tower.coverageStatus === 'gap'
          ? '対応する機能・コンテンツが未配置。'
          : '一部機能はあるが、行動タスク全体を支え切れていない。'),
      opportunity:
        tower.gapOpportunity ||
        (tower.coverageStatus === 'gap'
          ? '新規機能追加または既存機能の適用範囲拡張が必要。'
          : '補助コンテンツや導線改善でカバー率を高める余地がある。')
    }));

  return {
    phases,
    gaps
  };
}

function buildStoryboard(persona, contextSummary) {
  return [
    {
      scene: 'Scene 1',
      title: '発信できない課題',
      description: `${persona.name}は${persona.occupation}として広めたいものがあるが、コンテンツ制作・投稿・計測を続ける時間とスキルが足りず、発信が止まってしまっている。`
    },
    {
      scene: 'Scene 2',
      title: 'Medialとの出会い',
      description: '「コンテンツ自動生成」で検索していたところMedialを発見。成功事例の記事を読み、「設定すれば自動でメディアが育つ」というコンセプトに共感して無料トライアルを申し込む。'
    },
    {
      scene: 'Scene 3',
      title: 'オンボーディング完了',
      description: '広める対象を入力し、ターゲットセグメントと発信プラットフォームを設定。AIが自動で生成したサンプル記事を確認し、内容に驚きながら最初の記事を承認・公開する。'
    },
    {
      scene: 'Scene 4',
      title: '日次承認ルーティン',
      description: `毎朝${persona.name}はスマホでAI編集部からの提案を確認。気に入った記事を承認するだけで、複数のプラットフォームに自動投稿される。作業は5分以内に完了する。`
    },
    {
      scene: 'Scene 5',
      title: 'メディアの成長実感',
      description: '分析ダッシュボードを開くと、PVとフォロワー数が着実に伸びていることが分かる。AIの改善提案を受け取りながら、影響力が自然に拡大していくサイクルが定着している。'
    }
  ];
}

function buildUsabilityResults(persona) {
  const literacy = persona.itLiteracy;
  const makeSubtask = (label, completed, confusionPoint = '') => ({
    label,
    completed,
    confusionPoint,
    status: completed ? '完了' : '未完了',
    severity: !completed ? '高' : confusionPoint ? '中' : '低'
  });

  const tasks = [
    {
      task: '初期セットアップを完了する',
      subtasks: [
        makeSubtask('アカウント作成を開始する', true),
        makeSubtask(
          '必須プロフィール項目を入力する',
          literacy !== '低',
          literacy === '低' ? '必須/任意の区別が見えず、入力途中で停止した。' : '入力優先順が分かりにくく、順番で迷った。'
        ),
        makeSubtask(
          '通知設定の初期値を確認する',
          true,
          literacy === '低' ? 'ON/OFF変更時の影響範囲が分かりにくい。' : ''
        ),
        makeSubtask(
          '権限リクエストの理由を確認する',
          literacy !== '低',
          literacy === '低' ? '権限用途の説明が短く、許可判断できなかった。' : literacy === '中' ? '権限が必要な場面を探すのに時間がかかった。' : ''
        ),
        makeSubtask(
          'サンプルプロジェクトを選択する',
          true,
          literacy === '低' ? 'テンプレート差分が見えにくく、選択で迷った。' : ''
        ),
        makeSubtask('セットアップ完了画面を確認する', true)
      ]
    },
    {
      task: '要件案に対するペルソナ反応を確認する',
      subtasks: [
        makeSubtask('対象セグメントを設定する', true, literacy === '低' ? 'セグメント用語の意味が直感的でなかった。' : ''),
        makeSubtask('顧問ペルソナを選択する', true),
        makeSubtask(
          '要件案を入力して生成を実行する',
          true,
          literacy === '低' ? 'どこまで書けば十分か判断に迷った。' : ''
        ),
        makeSubtask(
          '反応コメントの根拠を確認する',
          literacy !== '低',
          literacy === '低'
            ? '根拠情報への導線が見つからず、この工程で止まった。'
            : literacy === '中'
              ? '根拠の粒度が一定でなく、比較判断に迷った。'
              : '比較軸を切り替える操作位置が分かりづらかった。'
        ),
        makeSubtask(
          '課題メモとして保存する',
          true,
          literacy === '低' ? '保存ボタンが目立たず見落とした。' : ''
        ),
        makeSubtask(
          '別ペルソナで再実行して差分を確認する',
          true,
          literacy !== '高' ? '前回条件との差分表示が弱く、再実行条件で迷った。' : ''
        )
      ]
    },
    {
      task: '結果をチームへ共有する',
      subtasks: [
        makeSubtask(
          '共有したい結果セットを選択する',
          true,
          literacy === '低' ? '対象バージョンの見分けがつきにくい。' : ''
        ),
        makeSubtask('要点サマリーを自動生成する', true),
        makeSubtask(
          '重要課題の優先度を設定する',
          literacy !== '低',
          literacy === '低' ? '優先度ラベルの定義が分からず確定できなかった。' : literacy === '中' ? '優先度ラベルの違いで迷った。' : ''
        ),
        makeSubtask(
          '共有テンプレート形式を選択する',
          true,
          literacy === '低' ? 'テンプレート用途の説明が不足していた。' : ''
        ),
        makeSubtask('配信先チャンネルを指定する', true),
        makeSubtask(
          '共有後に既読とコメントを確認する',
          true,
          literacy !== '高' ? '既読更新タイミングが遅く、状態判断で迷った。' : ''
        )
      ]
    }
  ];

  const tasksWithSummary = tasks.map((task) => {
    const completedSubtaskCount = task.subtasks.filter((subtask) => subtask.completed).length;
    const confusedSubtaskCount = task.subtasks.filter((subtask) => Boolean(subtask.confusionPoint)).length;
    const severity = completedSubtaskCount < task.subtasks.length ? '高' : confusedSubtaskCount > 0 ? '中' : '低';
    return { ...task, completedSubtaskCount, confusedSubtaskCount, severity };
  });

  const allSubtasks = tasksWithSummary.flatMap((task) => task.subtasks);
  const completedCount = allSubtasks.filter((subtask) => subtask.completed).length;
  const incompleteCount = allSubtasks.length - completedCount;
  const confusedCount = allSubtasks.filter((subtask) => Boolean(subtask.confusionPoint)).length;
  const literacyBonus = literacy === '高' ? 4 : literacy === '低' ? -4 : 0;

  return {
    completionRate: Math.round((completedCount / allSubtasks.length) * 100),
    clarityScore: Math.max(45, Math.min(95, Math.round(92 - confusedCount * 2 - incompleteCount * 6 + literacyBonus))),
    confidenceScore: Math.max(45, Math.min(96, Math.round(90 - Math.round(confusedCount * 1.8) - incompleteCount * 7 + literacyBonus))),
    tasks: tasksWithSummary
  };
}

function Avatar({ persona, size = 'h-9 w-9' }) {
  return (
    <div className={`${size} overflow-hidden rounded-full border border-[#3d3d3d] bg-[#2a2a2a]`}>
      <img
        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(persona.id)}&backgroundColor=transparent`}
        alt={`${persona.name}のアバター`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function EmptyState({ title, description, onOpenSettings }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-xl rounded-xl border border-[#333333] bg-[#1f1f1f] p-8 text-center">
        <h3 className="mb-2 text-lg font-semibold text-[#e5e5e5]">{title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-[#9b9b9b]">{description}</p>
        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-md bg-[#047857] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#065f46]"
        >
          設定でペルソナを選択
        </button>
      </div>
    </div>
  );
}

function PersonaSwitcher({ personas, selectedId, onChange }) {
  return (
    <div>
      <label htmlFor="persona-switcher" className="mb-1 block text-xs text-[#8f8f8f]">
        対象ペルソナ
      </label>
      <select
        id="persona-switcher"
        value={selectedId || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
      >
        {personas.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.name} ({persona.age}歳 / {persona.occupation})
          </option>
        ))}
      </select>
    </div>
  );
}

function JourneyScoreDot({ cx, cy, payload }) {
  if (cx == null || cy == null || !payload) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#047857" stroke="#d1fae5" strokeWidth={1} />
      {payload.isWow && (
        <g>
          <circle cx={cx} cy={cy - 18} r={10} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={cx} y={cy - 14} textAnchor="middle" fill="#92400e" fontSize={11}>
            ☺
          </text>
        </g>
      )}
      {payload.isLow && (
        <g>
          <circle cx={cx} cy={cy + 18} r={10} fill="#fee2e2" stroke="#dc2626" strokeWidth={1.5} />
          <text x={cx} y={cy + 22} textAnchor="middle" fill="#7f1d1d" fontSize={11}>
            ☹
          </text>
        </g>
      )}
    </g>
  );
}

export default function PluginConnectPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('settings');

  const [segmentSettings, setSegmentSettings] = useState({
    country: '日本',
    age: '25-34',
    gender: '女性',
    itLiteracy: '中',
    occupation: '指定なし',
    education: '指定なし',
    hobby: '指定なし',
    family: '指定なし',
    environment: '指定なし',
    commute: '指定なし',
    driving: '指定なし'
  });
  const [projectRequirement, setProjectRequirement] = useState(
    'オンボーディング時の離脱を減らし、初回価値の体験までを短縮したい。'
  );
  const [catalogPage, setCatalogPage] = useState(1);

  const [assignedPersonaIds, setAssignedPersonaIds] = useState(['miyuki-1', 'miyuki-11', 'rin-13']);
  const [activePersonaId, setActivePersonaId] = useState(null);
  const [previewPersonaId, setPreviewPersonaId] = useState(null);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      senderType: 'system',
      personaId: null,
      text: '設定でペルソナを選択すると、ここで要件相談ができます。',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isContextEnabled, setIsContextEnabled] = useState(true);

  const [generatingSection, setGeneratingSection] = useState(null);
  const [generatedSections, setGeneratedSections] = useState({
    journey: false,
    mentalModel: false,
    storyboard: false,
    usability: false
  });
  const [advancedProfilesByPersonaId, setAdvancedProfilesByPersonaId] = useState({});
  const [loadingAdvancedProfileByPersonaId, setLoadingAdvancedProfileByPersonaId] = useState({});

  // ユーザー調査
  const [surveyTab, setSurveyTab] = useState('create'); // 'create' | 'target' | 'results'
  const [surveyTitle, setSurveyTitle] = useState('オンボーディング体験アンケート');
  const [surveyQuestions, setSurveyQuestions] = useState([
    { id: 1, text: 'このサービスを知ったきっかけは何ですか？', type: 'single', options: ['Web検索', 'SNS', '知人の紹介', 'その他'] },
    { id: 2, text: 'オンボーディングの操作は分かりやすかったですか？', type: 'rating', options: [] },
    { id: 3, text: '最も改善してほしい点を教えてください。', type: 'text', options: [] }
  ]);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyDetailQuestionId, setSurveyDetailQuestionId] = useState(null);
  const [surveyDetailPage, setSurveyDetailPage] = useState(1);
  const [surveyDetailSort, setSurveyDetailSort] = useState({ key: 'index', dir: 'asc' });
  const [surveyDetailFilter, setSurveyDetailFilter] = useState({ gender: '', itLiteracy: '', search: '' });

  const messageIdRef = useRef(2);
  const messageEndRef = useRef(null);
  const timeoutIdsRef = useRef([]);
  const pendingAdvancedProfileRef = useRef({});

  const filteredPersonas = useMemo(() => {
    return PERSONA_POOL.filter((persona) => {
      const countryOk = segmentSettings.country === '指定なし' || persona.country === segmentSettings.country;
      const ageOk = inAgeRange(persona.age, segmentSettings.age);
      const genderOk = segmentSettings.gender === '指定なし' || persona.gender === segmentSettings.gender;
      const itOk = segmentSettings.itLiteracy === '指定なし' || persona.itLiteracy === segmentSettings.itLiteracy;
      const occupationOk = segmentSettings.occupation === '指定なし' || persona.occupation === segmentSettings.occupation;
      const educationOk = segmentSettings.education === '指定なし' || persona.education === segmentSettings.education;
      const hobbyOk = segmentSettings.hobby === '指定なし' || persona.hobby === segmentSettings.hobby;
      const familyOk = segmentSettings.family === '指定なし' || persona.family === segmentSettings.family;
      const environmentOk = segmentSettings.environment === '指定なし' || persona.environment === segmentSettings.environment;
      const commuteOk = segmentSettings.commute === '指定なし' || persona.commute === segmentSettings.commute;
      const drivingOk = segmentSettings.driving === '指定なし' || persona.driving === segmentSettings.driving;
      return (
        countryOk &&
        ageOk &&
        genderOk &&
        itOk &&
        occupationOk &&
        educationOk &&
        hobbyOk &&
        familyOk &&
        environmentOk &&
        commuteOk &&
        drivingOk
      );
    });
  }, [segmentSettings]);

  const personaById = useMemo(() => {
    return Object.fromEntries(PERSONA_POOL.map((persona) => [persona.id, persona]));
  }, []);

  const assignedPersonas = useMemo(() => {
    return assignedPersonaIds
      .map((personaId) => personaById[personaId])
      .filter(Boolean);
  }, [assignedPersonaIds, personaById]);

  const activePersona = useMemo(() => {
    if (!activePersonaId) return null;
    return assignedPersonas.find((persona) => persona.id === activePersonaId) || null;
  }, [activePersonaId, assignedPersonas]);

  const previewPersona = useMemo(() => {
    if (!previewPersonaId) return null;
    return personaById[previewPersonaId] || null;
  }, [previewPersonaId, personaById]);

  const totalCatalogPages = Math.max(1, Math.ceil(filteredPersonas.length / PERSONAS_PER_PAGE));

  const paginatedPersonas = useMemo(() => {
    const start = (catalogPage - 1) * PERSONAS_PER_PAGE;
    return filteredPersonas.slice(start, start + PERSONAS_PER_PAGE);
  }, [catalogPage, filteredPersonas]);

  const visiblePageNumbers = useMemo(() => {
    const half = Math.floor(PAGE_WINDOW_SIZE / 2);
    const start = Math.max(1, Math.min(catalogPage - half, totalCatalogPages - PAGE_WINDOW_SIZE + 1));
    const end = Math.min(totalCatalogPages, start + PAGE_WINDOW_SIZE - 1);
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }, [catalogPage, totalCatalogPages]);

  const projectContextSummary = useMemo(() => {
    return buildProjectContextSummary(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    if (assignedPersonas.length === 0) {
      setActivePersonaId(null);
      return;
    }

    if (!activePersonaId || !assignedPersonas.some((persona) => persona.id === activePersonaId)) {
      setActivePersonaId(assignedPersonas[0].id);
    }
  }, [assignedPersonas, activePersonaId]);

  useEffect(() => {
    setCatalogPage(1);
  }, [segmentSettings]);

  useEffect(() => {
    if (catalogPage > totalCatalogPages) {
      setCatalogPage(totalCatalogPages);
    }
  }, [catalogPage, totalCatalogPages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (!previewPersonaId) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPreviewPersonaId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewPersonaId]);

  const appendMessage = (senderType, text, personaId = null) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: messageIdRef.current++,
        senderType,
        personaId,
        text,
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const registerTimeout = (callback, delay) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((id) => id !== timeoutId);
      callback();
    }, delay);
    timeoutIdsRef.current.push(timeoutId);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    window.history.back();
  };

  const requestAdvancedPersonaProfile = (personaId) => {
    const persona = personaById[personaId];
    if (!persona) return;

    const requirementKey = projectRequirement.trim();
    const cachedEntry = advancedProfilesByPersonaId[personaId];
    if (cachedEntry?.requirementKey === requirementKey) return;
    if (pendingAdvancedProfileRef.current[personaId] === requirementKey) return;

    pendingAdvancedProfileRef.current[personaId] = requirementKey;
    setLoadingAdvancedProfileByPersonaId((prev) => ({ ...prev, [personaId]: true }));

    registerTimeout(() => {
      if (pendingAdvancedProfileRef.current[personaId] !== requirementKey) return;

      const profile = buildAdvancedPersonaProfile(persona, requirementKey);
      setAdvancedProfilesByPersonaId((prev) => ({
        ...prev,
        [personaId]: { requirementKey, profile }
      }));
      setLoadingAdvancedProfileByPersonaId((prev) => {
        const next = { ...prev };
        delete next[personaId];
        return next;
      });
      if (pendingAdvancedProfileRef.current[personaId] === requirementKey) {
        delete pendingAdvancedProfileRef.current[personaId];
      }
    }, ADVANCED_PROFILE_LOADING_DELAY);
  };

  const resolveAdvancedProfile = (personaId) => {
    const requirementKey = projectRequirement.trim();
    const entry = advancedProfilesByPersonaId[personaId];
    if (!entry || entry.requirementKey !== requirementKey) return null;
    return entry.profile;
  };

  const openPreviewPersona = (personaId) => {
    setPreviewPersonaId(personaId);
    requestAdvancedPersonaProfile(personaId);
  };

  const togglePersonaAssignment = (personaId) => {
    const persona = personaById[personaId];
    if (!persona) return;

    setAssignedPersonaIds((prev) => {
      const exists = prev.includes(personaId);
      if (exists) {
        appendMessage('system', `${persona.name}さんをプロジェクトから外しました。`);
        return prev.filter((id) => id !== personaId);
      }
      appendMessage('system', `${persona.name}さんをプロジェクトに追加しました。`);
      requestAdvancedPersonaProfile(personaId);
      return [...prev, personaId];
    });
  };

  const handleSendChat = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    appendMessage('user', trimmed);
    setChatInput('');

    if (assignedPersonas.length === 0) {
      appendMessage('system', '先に「設定」でペルソナを選択してください。');
      return;
    }

    const responder =
      activePersona || assignedPersonas[Math.floor(Math.random() * assignedPersonas.length)];

    const randomReply = responder.mockReplies[Math.floor(Math.random() * responder.mockReplies.length)];
    const withContext = isContextEnabled
      ? `${randomReply}（要件コンテキスト: ${projectContextSummary.slice(0, 48)}...）`
      : randomReply;

    registerTimeout(() => {
      appendMessage('persona', withContext, responder.id);
    }, 1400);
  };

  const runGeneration = (sectionId) => {
    if (generatingSection) return;
    if (!activePersona) return;

    setGeneratingSection(sectionId);
    registerTimeout(() => {
      setGeneratingSection(null);
      setGeneratedSections((prev) => ({ ...prev, [sectionId]: true }));
    }, 1800);
  };

  const currentJourneyData = activePersona ? buildJourneyData(activePersona) : [];
  const currentJourneyGrid = activePersona ? buildJourneyGrid(activePersona, projectContextSummary) : [];
  const currentMentalModel = activePersona
    ? buildMentalModel(activePersona, projectContextSummary)
    : null;
  const currentStoryboard = activePersona ? buildStoryboard(activePersona, projectContextSummary) : [];
  const currentUsability = activePersona ? buildUsabilityResults(activePersona) : null;
  const activeAdvancedProfile = activePersona ? resolveAdvancedProfile(activePersona.id) : null;
  const activeAdvancedProfileLoading = activePersona ? Boolean(loadingAdvancedProfileByPersonaId[activePersona.id]) : false;
  const previewAdvancedProfile = previewPersona ? resolveAdvancedProfile(previewPersona.id) : null;
  const previewAdvancedProfileLoading = previewPersona ? Boolean(loadingAdvancedProfileByPersonaId[previewPersona.id]) : false;

  const renderSettings = () => {
    const outOfFilterCount = assignedPersonas.filter((persona) => !filteredPersonas.some((item) => item.id === persona.id)).length;
    const visibleStart = filteredPersonas.length === 0 ? 0 : (catalogPage - 1) * PERSONAS_PER_PAGE + 1;
    const visibleEnd = Math.min(catalogPage * PERSONAS_PER_PAGE, filteredPersonas.length);

    return (
      <section className="h-full overflow-y-auto p-5 lg:p-6">
        <div className="space-y-5">
          <div className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
            <h2 className="mb-4 text-sm font-semibold text-[#e4e4e4]">セグメント設定</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <div>
                <label htmlFor="segment-country" className="mb-1 block text-xs text-[#8f8f8f]">
                  国・地域
                </label>
                <select
                  id="segment-country"
                  value={segmentSettings.country}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, country: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-age" className="mb-1 block text-xs text-[#8f8f8f]">
                  年齢
                </label>
                <select
                  id="segment-age"
                  value={segmentSettings.age}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, age: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {AGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-gender" className="mb-1 block text-xs text-[#8f8f8f]">
                  性別
                </label>
                <select
                  id="segment-gender"
                  value={segmentSettings.gender}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, gender: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-it" className="mb-1 block text-xs text-[#8f8f8f]">
                  ITリテラシー
                </label>
                <select
                  id="segment-it"
                  value={segmentSettings.itLiteracy}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, itLiteracy: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {IT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-occupation" className="mb-1 block text-xs text-[#8f8f8f]">
                  職業
                </label>
                <select
                  id="segment-occupation"
                  value={segmentSettings.occupation}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, occupation: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {OCCUPATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-education" className="mb-1 block text-xs text-[#8f8f8f]">
                  学歴
                </label>
                <select
                  id="segment-education"
                  value={segmentSettings.education}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, education: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {EDUCATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-hobby" className="mb-1 block text-xs text-[#8f8f8f]">
                  趣味
                </label>
                <select
                  id="segment-hobby"
                  value={segmentSettings.hobby}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, hobby: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {HOBBY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-family" className="mb-1 block text-xs text-[#8f8f8f]">
                  家族
                </label>
                <select
                  id="segment-family"
                  value={segmentSettings.family}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, family: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {FAMILY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-environment" className="mb-1 block text-xs text-[#8f8f8f]">
                  環境
                </label>
                <select
                  id="segment-environment"
                  value={segmentSettings.environment}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, environment: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {ENVIRONMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-commute" className="mb-1 block text-xs text-[#8f8f8f]">
                  通勤手段
                </label>
                <select
                  id="segment-commute"
                  value={segmentSettings.commute}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, commute: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {COMMUTE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="segment-driving" className="mb-1 block text-xs text-[#8f8f8f]">
                  運転
                </label>
                <select
                  id="segment-driving"
                  value={segmentSettings.driving}
                  onChange={(event) =>
                    setSegmentSettings((prev) => ({ ...prev, driving: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  {DRIVING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          <div className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#e4e4e4]">候補ペルソナ選択</h2>
                <p className="text-xs text-[#8f8f8f]">
                  全{TOTAL_PERSONA_COUNT.toLocaleString()}名中、該当セグメント: {filteredPersonas.length.toLocaleString()}名
                </p>
              </div>
              <p className="text-xs text-[#8f8f8f]">
                表示: {visibleStart.toLocaleString()}-{visibleEnd.toLocaleString()} / {filteredPersonas.length.toLocaleString()}件
              </p>
            </div>

            <div className="mb-4 rounded-lg border border-[#2f5f51] bg-[#152d27] p-3">
              <p className="mb-2 text-xs font-medium text-[#9de4cc]">選択済みペルソナ（上部固定表示）</p>
              {assignedPersonas.length === 0 ? (
                <p className="text-xs text-[#87b9a8]">まだ選択されていません。下の一覧から追加してください。</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {assignedPersonas.map((persona) => (
                    <button
                      key={`selected-${persona.id}`}
                      type="button"
                      onClick={() => togglePersonaAssignment(persona.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#3b4f48] bg-[#1f312c] px-2.5 py-1.5 text-xs text-[#b9f4df] transition-colors hover:bg-[#27453d]"
                    >
                      <Avatar persona={persona} size="h-6 w-6" />
                      <span>{persona.name}</span>
                      <span className="text-[#88cbb4]">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {outOfFilterCount > 0 && (
              <div className="mb-4 rounded-md border border-[#3d3a26] bg-[#2a281d] px-3 py-2 text-xs text-[#c6b676]">
                現在のセグメント外に選択済みペルソナが {outOfFilterCount} 名います。
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {paginatedPersonas.map((persona) => {
                const assigned = assignedPersonaIds.includes(persona.id);
                return (
                  <article
                    key={persona.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openPreviewPersona(persona.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openPreviewPersona(persona.id);
                      }
                    }}
                    className="cursor-pointer rounded-lg border border-[#333333] bg-[#1a1a1a] p-4 transition-colors hover:border-[#3f3f3f]"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <Avatar persona={persona} size="h-11 w-11" />
                      <div>
                        <h3 className="text-sm font-semibold text-[#e5e5e5]">{persona.name}</h3>
                        <p className="text-xs text-[#8f8f8f]">
                          {persona.age}歳 / {persona.occupation}
                        </p>
                        <p className="text-xs text-[#8f8f8f]">
                          {persona.country} / {persona.gender} / IT: {persona.itLiteracy}
                        </p>
                      </div>
                    </div>

                    <p className="mb-2 text-xs leading-relaxed text-[#c8c8c8]">{persona.value}</p>
                    <p className="mb-3 text-xs leading-relaxed text-[#9b9b9b]">困っていること: {persona.painPoint}</p>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        togglePersonaAssignment(persona.id);
                      }}
                      className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        assigned
                          ? 'border border-[#3b4f48] bg-[#1f312c] text-[#8dd7be] hover:bg-[#27453d]'
                          : 'bg-[#047857] text-white hover:bg-[#065f46]'
                      }`}
                    >
                      {assigned ? '選択中（クリックで解除）' : 'プロジェクトに追加'}
                    </button>
                  </article>
                );
              })}
            </div>

            {totalCatalogPages > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCatalogPage((prev) => Math.max(1, prev - 1))}
                  disabled={catalogPage === 1}
                  className="rounded-md border border-[#333333] bg-[#252526] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:border-[#047857] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  前へ
                </button>

                {visiblePageNumbers.map((pageNumber) => (
                  <button
                    key={`page-${pageNumber}`}
                    type="button"
                    onClick={() => setCatalogPage(pageNumber)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      pageNumber === catalogPage
                        ? 'border-[#2f5f51] bg-[#17362d] text-[#c8f5e7]'
                        : 'border-[#333333] bg-[#252526] text-[#cccccc] hover:border-[#047857]'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCatalogPage((prev) => Math.min(totalCatalogPages, prev + 1))}
                  disabled={catalogPage === totalCatalogPages}
                  className="rounded-md border border-[#333333] bg-[#252526] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:border-[#047857] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  次へ
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderPersona = () => {
    if (assignedPersonas.length === 0) {
      return (
        <EmptyState
          title="ペルソナが未設定です"
          description="まず「設定」でセグメントを決め、プロジェクトにペルソナを追加してください。"
          onOpenSettings={() => setActiveSection('settings')}
        />
      );
    }

    return (
      <section className="h-full p-4 lg:p-5">
        <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
          <div className="flex min-h-0 flex-col rounded-xl border border-[#333333] bg-[#1f1f1f]">
            <div className="flex items-center justify-between border-b border-[#333333] px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-[#e5e5e5]">ペルソナ相談チャット</h2>
                <p className="text-xs text-[#8f8f8f]">要件の迷いを顧問ペルソナに相談できます。</p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-[#333333] bg-[#252526] px-2.5 py-1.5">
                <span className="text-xs text-[#b8b8b8]">コンテキスト共有</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isContextEnabled}
                  aria-label="コンテキスト共有"
                  onClick={() => setIsContextEnabled((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] focus-visible:ring-offset-2 focus-visible:ring-offset-[#252526] ${
                    isContextEnabled ? 'bg-[#047857]' : 'bg-[#4b5563]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      isContextEnabled ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {chatMessages.map((message) => {
                if (message.senderType === 'system') {
                  return (
                    <p key={message.id} className="text-center text-[11px] text-[#8f8f8f]">
                      {message.text}
                    </p>
                  );
                }

                if (message.senderType === 'user') {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-xl bg-[#047857] px-3 py-2 text-sm text-white">
                        <p>{message.text}</p>
                        <p className="mt-1 text-right text-[10px] text-[#d1fae5]">{message.timestamp}</p>
                      </div>
                    </div>
                  );
                }

                const persona = message.personaId ? personaById[message.personaId] : null;
                return (
                  <div key={message.id} className="flex items-start gap-2">
                    {persona ? <Avatar persona={persona} size="h-7 w-7" /> : null}
                    <div className="max-w-[88%] rounded-xl border border-[#333333] bg-[#252526] px-3 py-2 text-sm text-[#cccccc]">
                      <p className="mb-1 text-[11px] text-[#8f8f8f]">
                        {persona ? `${persona.name} / ${persona.occupation}` : 'Persona'}
                      </p>
                      <p>{message.text}</p>
                      <p className="mt-1 text-right text-[10px] text-[#888888]">{message.timestamp}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            <div className="border-t border-[#333333] px-4 py-3">
              <div className="rounded-md border border-[#333333] bg-[#252526] px-2 py-2">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendChat();
                    }
                  }}
                  rows={2}
                  placeholder="例: 登録フローで離脱しそうな箇所を指摘して"
                  className="w-full resize-none bg-transparent text-sm text-[#cccccc] placeholder:text-[#777777] focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#8f8f8f]">Enter送信 / Shift+Enter改行</span>
                  <button
                    type="button"
                    onClick={handleSendChat}
                    disabled={!chatInput.trim()}
                    className="inline-flex items-center gap-1 rounded-md bg-[#047857] px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-[#065f46] disabled:cursor-not-allowed disabled:bg-[#3b3b3b] disabled:text-[#8f8f8f]"
                  >
                    <Send size={12} />
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
            <PersonaSwitcher
              personas={assignedPersonas}
              selectedId={activePersonaId}
              onChange={setActivePersonaId}
            />

            {activePersona && (
              <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto">
                <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <Avatar persona={activePersona} size="h-12 w-12" />
                    <div>
                      <h3 className="text-base font-semibold text-[#e5e5e5]">{activePersona.name}</h3>
                      <p className="text-xs text-[#8f8f8f]">
                        {activePersona.age}歳 / {activePersona.occupation}
                      </p>
                      <p className="text-xs text-[#8f8f8f]">
                        {activePersona.country} / {activePersona.gender} / IT: {activePersona.itLiteracy}
                      </p>
                    </div>
                  </div>

                  <p className="mb-2 text-xs text-[#a5a5a5]">価値観</p>
                  <p className="mb-3 text-sm leading-relaxed text-[#d0d0d0]">{activePersona.value}</p>

                  <p className="mb-2 text-xs text-[#a5a5a5]">重視ポイント</p>
                  <div className="flex flex-wrap gap-2">
                    {activePersona.personality.map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full border border-[#2f5f51] bg-[#17362d] px-2 py-1 text-[11px] text-[#92d8bf]"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                  <p className="mb-2 text-xs text-[#a5a5a5]">関心事</p>
                  <p className="mb-3 text-sm leading-relaxed text-[#d0d0d0]">{activePersona.interest}</p>
                  <p className="mb-2 text-xs text-[#a5a5a5]">困っていること</p>
                  <p className="text-sm leading-relaxed text-[#d0d0d0]">{activePersona.painPoint}</p>
                  <div className="mt-4">
                    {activeAdvancedProfileLoading ? (
                      <div className="flex min-h-[120px] items-center justify-center gap-2 rounded-md border border-[#2b2b2b] bg-[#171717] p-3">
                        <Loader2 size={14} className="animate-spin text-[#8fceb8]" />
                        <p className="text-xs text-[#8f8f8f]">
                          心理・行動特性を生成しています...
                        </p>
                      </div>
                    ) : activeAdvancedProfile ? (
                      <div className="space-y-4">
                        {ADVANCED_PERSONA_SECTIONS.map((section) => (
                          <div key={section.title} className="rounded-md border border-[#2b2b2b] bg-[#171717] p-3">
                            <p className="mb-2 text-[11px] font-medium text-[#8fceb8]">{section.title}</p>
                            <div className="space-y-2">
                              {section.fields.map((field) => (
                                <div key={field.key}>
                                  <p className="text-[10px] text-[#8f8f8f]">{field.label}</p>
                                  <p className="text-xs leading-relaxed text-[#d0d0d0]">
                                    {activeAdvancedProfile[field.key] || '未設定'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-[#2b2b2b] bg-[#171717] px-3 py-4 text-xs text-[#8f8f8f]">
                        このペルソナの心理・行動特性はまだ生成されていません。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    );
  };

  const renderJourney = () => {
    if (assignedPersonas.length === 0) {
      return (
        <EmptyState
          title="ジャーニーマップを生成するペルソナがいません"
          description="設定ページで顧問ペルソナを追加すると、ジャーニーマップを生成できます。"
          onOpenSettings={() => setActiveSection('settings')}
        />
      );
    }

    const loading = generatingSection === 'journey';
    const ready = generatedSections.journey && !loading;

    return (
      <section className="h-full overflow-y-auto p-5 lg:p-6">
        <div className="mx-auto max-w-7xl rounded-xl border border-[#333333] bg-[#1f1f1f] p-4 lg:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#e5e5e5]">ジャーニーマップ生成</h2>
              <p className="text-sm text-[#8f8f8f]">要件とペルソナを元に体験の流れを可視化します。</p>
            </div>
            <div className="flex items-end gap-4">
              <div className="w-72 max-w-[55vw]">
                <PersonaSwitcher
                  personas={assignedPersonas}
                  selectedId={activePersonaId}
                  onChange={setActivePersonaId}
                />
              </div>
              <button
                type="button"
                onClick={() => runGeneration('journey')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-[#047857] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                生成する
              </button>
            </div>
          </div>

          {!ready && !loading && (
            <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-[#3a3a3a] bg-[#1a1a1a] text-sm text-[#8f8f8f]">
              「生成する」を押すと、感情推移とカスタマージャーニーマップを表示します。
            </div>
          )}

          {loading && (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-[#333333] bg-[#1a1a1a]">
              <Loader2 size={26} className="animate-spin text-[#047857]" />
              <p className="text-sm text-[#8f8f8f]">ジャーニーマップを生成しています...</p>
            </div>
          )}

          {ready && activePersona && (
            <div className="space-y-5">
              <div className="max-h-[70vh] overflow-auto rounded-lg border border-[#333333]">
                <div className="w-full" style={{ minWidth: `${JOURNEY_MIN_WIDTH}px` }}>
                  <div
                    className="grid border-b border-[#333333]"
                    style={{ gridTemplateColumns: `${JOURNEY_ROW_HEADER_WIDTH}px minmax(0, 1fr)` }}
                  >
                    <div className="border-r border-[#333333] bg-[#202020] px-3 py-3">
                      <p className="text-xs font-semibold text-[#d2d2d2]">感情スコア</p>
                      <p className="mt-1 text-[11px] text-[#9b9b9b]">☺ は WOW / ☹ は著しく低いポイント</p>
                    </div>
                    <div className="h-64 bg-[#1a1a1a] p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentJourneyData} margin={{ top: 28, right: 0, left: 0, bottom: 34 }}>
                          <CartesianGrid stroke="#2d2d2d" strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            type="number"
                            dataKey="phaseCenter"
                            domain={[0, JOURNEY_PHASES.length]}
                            hide
                          />
                          <YAxis domain={[0, 100]} hide />
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(value, _, item) => [`${value}${item?.payload?.isWow ? ' (WOW)' : ''}`, '感情スコア']}
                            labelFormatter={(_, payload) => `フェーズ: ${payload?.[0]?.payload?.phase || '-'}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#047857"
                            strokeWidth={3}
                            dot={<JourneyScoreDot />}
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#d1fae5', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <table className="w-full table-fixed border-collapse text-sm">
                    <colgroup>
                      <col style={{ width: `${JOURNEY_ROW_HEADER_WIDTH}px` }} />
                      {JOURNEY_PHASES.map((phase) => (
                        <col key={phase} />
                      ))}
                    </colgroup>
                    <thead className="bg-[#252526]">
                      <tr>
                        <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-[#9b9b9b]">フェーズ</th>
                        {JOURNEY_PHASES.map((phase, index) => (
                          <th
                            key={phase}
                            className={`border-b border-[#333333] px-3 py-2 text-left text-[#9b9b9b] ${
                              index < JOURNEY_PHASES.length - 1 ? 'border-r' : ''
                            }`}
                          >
                            {phase}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentJourneyGrid.map((row) => {
                        const isMotivationRow = row.row === 'モチベーション';

                        return (
                          <tr key={row.row} className="align-top">
                            <td className="border-r border-t border-[#333333] bg-[#202020] px-3 py-3 text-xs font-semibold text-[#d2d2d2]">
                              {row.row}
                            </td>
                            {JOURNEY_PHASES.map((phase, index) => {
                              const cellValue = row.values[index];
                              const motivationMatch =
                                typeof cellValue === 'string' ? cellValue.match(/^(\S+)\s+([\s\S]+)$/u) : null;
                              const motivationIcon = motivationMatch?.[1] || '';
                              const motivationText = motivationMatch?.[2] || cellValue;

                              return (
                                <td
                                  key={`${row.row}-${phase}`}
                                  className={`border-t border-[#333333] px-3 py-3 text-xs leading-relaxed text-[#c8c8c8] ${
                                    index < JOURNEY_PHASES.length - 1 ? 'border-r' : ''
                                  }`}
                                >
                                  {isMotivationRow && motivationIcon ? (
                                    <div className="space-y-2">
                                      <p className="text-center text-3xl leading-none">{motivationIcon}</p>
                                      <p>{motivationText}</p>
                                    </div>
                                  ) : (
                                    cellValue
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderMentalModel = () => {
    if (assignedPersonas.length === 0) {
      return (
        <EmptyState
          title="メンタルモデル生成の対象がありません"
          description="設定ページでペルソナを追加してから実行してください。"
          onOpenSettings={() => setActiveSection('settings')}
        />
      );
    }

    const loading = generatingSection === 'mentalModel';
    const ready = generatedSections.mentalModel && !loading;
    const phaseLayouts = currentMentalModel
      ? currentMentalModel.phases.map((phase) => ({
          ...phase,
          width: phase.towers.length * 186 + (phase.towers.length - 1) * 14
        }))
      : [];
    const diagramMinWidth = phaseLayouts.reduce((sum, phase) => sum + phase.width, 0) + Math.max(0, phaseLayouts.length - 1) * 24;

    return (
      <section className="h-full overflow-y-auto p-5 lg:p-6">
        <div className="mx-auto max-w-[1250px] rounded-xl border border-[#333333] bg-[#1f1f1f] p-4 lg:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#e5e5e5]">メンタル・モデル・ダイアグラム</h2>
              <p className="text-sm text-[#8f8f8f]">
                上段にユーザー行動タスク（メンタルモデル）、下段に機能・コンテンツを配置してギャップを分析します。
              </p>
            </div>
            <div className="flex items-end gap-4">
              <div className="w-72 max-w-[55vw]">
                <PersonaSwitcher
                  personas={assignedPersonas}
                  selectedId={activePersonaId}
                  onChange={setActivePersonaId}
                />
              </div>
              <button
                type="button"
                onClick={() => runGeneration('mentalModel')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-[#047857] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                生成する
              </button>
            </div>
          </div>

          {!ready && !loading && (
            <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-[#3a3a3a] bg-[#1a1a1a] text-sm text-[#8f8f8f]">
              生成後に、タワー構造のメンタルモデルと下段の機能配置を重ねてギャップを可視化します。
            </div>
          )}

          {loading && (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border border-[#333333] bg-[#1a1a1a]">
              <Loader2 size={26} className="animate-spin text-[#047857]" />
              <p className="text-sm text-[#8f8f8f]">メンタルモデルを生成しています...</p>
            </div>
          )}

          {ready && activePersona && currentMentalModel && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                <div className="space-y-4" style={{ minWidth: `${diagramMinWidth}px` }}>
                  <div className="flex gap-6">
                    {phaseLayouts.map((phase) => (
                      <div key={`phase-title-${phase.id}`} className="shrink-0" style={{ width: `${phase.width}px` }}>
                        <p className="text-center text-xs font-semibold tracking-wide text-[#9de4cc]">{phase.title}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-6">
                    {phaseLayouts.map((phase) => (
                      <div key={`phase-mental-${phase.id}`} className="shrink-0" style={{ width: `${phase.width}px` }}>
                        <div className="flex min-h-[420px] items-stretch gap-[14px]">
                          {phase.towers.map((tower) => (
                            <div key={tower.id} className="flex w-[186px] shrink-0 flex-col">
                              <p className="text-center text-[11px] font-medium text-[#d2d2d2]">{tower.title}</p>
                              <div className="mt-auto">
                                <div className="flex flex-col gap-1.5">
                                  {tower.mentalTasks.map((task, taskIndex) => (
                                    <div
                                      key={`${tower.id}-task-${taskIndex}`}
                                      className="rounded-sm border border-[#3d6a5a] bg-[#1f3a31] px-2 py-1.5 text-[11px] leading-relaxed text-[#d7f4e8]"
                                    >
                                      {task}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-[2px] bg-[#2f5f51]" />

                  <div className="flex gap-6">
                    {phaseLayouts.map((phase) => (
                      <div key={`phase-support-${phase.id}`} className="shrink-0" style={{ width: `${phase.width}px` }}>
                        <div className="flex min-h-[190px] items-stretch gap-[14px]">
                          {phase.towers.map((tower) => (
                            <div key={`${tower.id}-support`} className="flex h-full w-[186px] shrink-0 flex-col">
                              <div className="mb-2 flex min-h-[18px] items-center justify-between">
                                <p className="text-[10px] text-[#8f8f8f]">機能・コンテンツ</p>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                                    tower.coverageStatus === 'covered'
                                      ? 'bg-[#1d3f35] text-[#96e4c8]'
                                      : tower.coverageStatus === 'partial'
                                        ? 'bg-[#3b3320] text-[#e4cc7a]'
                                        : 'bg-[#3a1f24] text-[#f6b4bd]'
                                  }`}
                                >
                                  {tower.coverageStatus === 'covered'
                                    ? '対応済み'
                                    : tower.coverageStatus === 'partial'
                                      ? '一部対応'
                                      : 'ギャップ'}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                {tower.supportCards.length > 0 ? (
                                  tower.supportCards.map((feature) => (
                                    <div
                                      key={`${tower.id}-${feature.id}`}
                                      className="rounded-sm border border-[#34556a] bg-[#153247] px-2 py-1.5 text-[11px] leading-relaxed text-[#d4ecff]"
                                    >
                                      {feature.label}
                                    </div>
                                  ))
                                ) : (
                                  <div className="rounded-sm border border-dashed border-[#8a4047] bg-[#361f24] px-2 py-2 text-[11px] leading-relaxed text-[#f7bcc5]">
                                    GAP: 対応機能が未配置
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                <p className="mb-2 text-xs font-semibold text-[#8f8f8f]">ギャップ分析</p>
                {currentMentalModel.gaps.length === 0 ? (
                  <p className="text-sm text-[#c6c6c6]">現時点では主要タワーに対応機能を配置できています。</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {currentMentalModel.gaps.map((gap, index) => (
                      <li key={`${gap.towerTitle}-${index}`} className="rounded-md border border-[#3a3a3a] bg-[#222] px-3 py-2">
                        <p className="font-medium text-[#e2e2e2]">
                          {gap.towerTitle}（{gap.type === 'gap' ? 'ギャップ' : '一部対応'}）
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#b5b5b5]">{gap.issue}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#9de4cc]">機会: {gap.opportunity}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderStoryboard = () => {
    if (assignedPersonas.length === 0) {
      return (
        <EmptyState
          title="ストーリーボード生成の対象がありません"
          description="設定ページでペルソナを追加してから実行してください。"
          onOpenSettings={() => setActiveSection('settings')}
        />
      );
    }

    const loading = generatingSection === 'storyboard';
    const ready = generatedSections.storyboard && !loading;

    return (
      <section className="h-full overflow-y-auto p-5 lg:p-6">
        <div className="mx-auto max-w-7xl rounded-xl border border-[#333333] bg-[#1f1f1f] p-4 lg:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#e5e5e5]">ストーリーボード</h2>
              <p className="text-sm text-[#8f8f8f]">ユーザーの行動文脈をシーンとして可視化します。</p>
            </div>
            <div className="flex items-end gap-4">
              <div className="w-72 max-w-[55vw]">
                <PersonaSwitcher
                  personas={assignedPersonas}
                  selectedId={activePersonaId}
                  onChange={setActivePersonaId}
                />
              </div>
              <button
                type="button"
                onClick={() => runGeneration('storyboard')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-[#047857] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                生成する
              </button>
            </div>
          </div>

          {!ready && !loading && (
            <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-[#3a3a3a] bg-[#1a1a1a] text-sm text-[#8f8f8f]">
              生成後に5コマのストーリーボードを表示します。
            </div>
          )}

          {loading && (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border border-[#333333] bg-[#1a1a1a]">
              <Loader2 size={26} className="animate-spin text-[#047857]" />
              <p className="text-sm text-[#8f8f8f]">ストーリーボードを生成しています...</p>
            </div>
          )}

          {ready && activePersona && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentStoryboard.map((scene) => (
                <article key={scene.scene} className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                  <div className="mb-3 aspect-video rounded-md border border-[#34554a] bg-gradient-to-br from-[#17362d] to-[#1f1f1f] p-3">
                    <p className="text-xs text-[#92d8bf]">{scene.scene}</p>
                    <p className="mt-1 text-sm font-semibold text-[#e0e0e0]">{scene.title}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-[#cfcfcf]">{scene.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderUsability = () => {
    if (assignedPersonas.length === 0) {
      return (
        <EmptyState
          title="ユーザビリティテストの対象がありません"
          description="設定ページでペルソナを追加してから実行してください。"
          onOpenSettings={() => setActiveSection('settings')}
        />
      );
    }

    const loading = generatingSection === 'usability';
    const ready = generatedSections.usability && !loading;

    return (
      <section className="h-full overflow-y-auto p-5 lg:p-6">
        <div className="w-full rounded-xl border border-[#333333] bg-[#1f1f1f] p-4 lg:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#e5e5e5]">ユーザビリティテスト</h2>
              <p className="text-sm text-[#8f8f8f]">ペルソナの個性に合わせた模擬テスト結果を生成します。</p>
            </div>
            <div className="flex items-end gap-4">
              <div className="w-72 max-w-[55vw]">
                <PersonaSwitcher
                  personas={assignedPersonas}
                  selectedId={activePersonaId}
                  onChange={setActivePersonaId}
                />
              </div>
              <button
                type="button"
                onClick={() => runGeneration('usability')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-[#047857] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                テスト実行
              </button>
            </div>
          </div>

          {!ready && !loading && (
            <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-[#3a3a3a] bg-[#1a1a1a] text-sm text-[#8f8f8f]">
              テストを実行すると、完了率や課題ポイントを表示します。
            </div>
          )}

          {loading && (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-[#333333] bg-[#1a1a1a]">
              <Loader2 size={26} className="animate-spin text-[#047857]" />
              <p className="text-sm text-[#8f8f8f]">ユーザビリティテストを実行中...</p>
            </div>
          )}

          {ready && activePersona && currentUsability && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                  <p className="text-xs text-[#8f8f8f]">タスク完了率</p>
                  <p className="mt-1 text-2xl font-semibold text-[#e5e5e5]">{currentUsability.completionRate}%</p>
                </div>
                <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                  <p className="text-xs text-[#8f8f8f]">画面理解スコア</p>
                  <p className="mt-1 text-2xl font-semibold text-[#e5e5e5]">{currentUsability.clarityScore}</p>
                </div>
                <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                  <p className="text-xs text-[#8f8f8f]">継続利用意向</p>
                  <p className="mt-1 text-2xl font-semibold text-[#e5e5e5]">{currentUsability.confidenceScore}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#333333]">
                <table className="w-full min-w-[1120px] border-collapse text-sm">
                  <thead className="bg-[#252526]">
                    <tr>
                      <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-[#9b9b9b]">テストタスク</th>
                      <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-[#9b9b9b]">サブタスク</th>
                      <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-[#9b9b9b]">完了判定</th>
                      <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-[#9b9b9b]">迷ったポイント</th>
                      <th className="border-b border-[#333333] px-3 py-2 text-left text-[#9b9b9b]">重要度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsability.tasks.map((task) => (
                      <React.Fragment key={task.task}>
                        {task.subtasks.map((subtask, index) => (
                          <tr key={`${task.task}-${subtask.label}`}>
                            {index === 0 && (
                              <td
                                rowSpan={task.subtasks.length}
                                className="border-t border-r border-[#333333] bg-[#1d1d1d] px-3 py-3 align-top text-[#d1d1d1]"
                              >
                                <p className="font-medium">{task.task}</p>
                                <p className="mt-1 text-xs text-[#9f9f9f]">
                                  {task.completedSubtaskCount}/{task.subtasks.length} 完了
                                </p>
                                <p className="mt-1 text-xs text-[#9f9f9f]">
                                  迷い発生: {task.confusedSubtaskCount}件
                                </p>
                              </td>
                            )}
                            <td className="border-t border-r border-[#333333] px-3 py-3 text-[#d1d1d1]">
                              {subtask.label}
                            </td>
                            <td className="border-t border-r border-[#333333] px-3 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  subtask.completed
                                    ? 'bg-[#23312b] text-[#8dd7be]'
                                    : 'bg-[#3a2323] text-[#e7aaaa]'
                                }`}
                              >
                                {subtask.status}
                              </span>
                            </td>
                            <td className="border-t border-r border-[#333333] px-3 py-3 text-xs leading-relaxed text-[#c3c3c3]">
                              {subtask.confusionPoint || '迷いなし'}
                            </td>
                            <td className="border-t border-[#333333] px-3 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  subtask.severity === '高'
                                    ? 'bg-[#3a2323] text-[#f1b5b5]'
                                    : subtask.severity === '中'
                                      ? 'bg-[#3b3320] text-[#d5bb67]'
                                      : 'bg-[#23312b] text-[#8dd7be]'
                                }`}
                              >
                                {subtask.severity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderSurvey = () => {
    const addQuestion = () => {
      setSurveyQuestions((prev) => [
        ...prev,
        { id: Date.now(), text: '', type: 'single', options: ['', ''] }
      ]);
    };

    const removeQuestion = (id) => {
      setSurveyQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const updateQuestion = (id, field, value) => {
      setSurveyQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
      );
    };

    const addOption = (id) => {
      setSurveyQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, options: [...q.options, ''] } : q))
      );
    };

    const updateOption = (qId, idx, value) => {
      setSurveyQuestions((prev) =>
        prev.map((q) =>
          q.id === qId
            ? { ...q, options: q.options.map((opt, i) => (i === idx ? value : opt)) }
            : q
        )
      );
    };

    const removeOption = (qId, idx) => {
      setSurveyQuestions((prev) =>
        prev.map((q) =>
          q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q
        )
      );
    };

    const runSurvey = () => {
      setSurveyLoading(true);
      setSurveyTab('results');
      setTimeout(() => setSurveyLoading(false), 3000);
    };

    const TABS = [
      { id: 'create', label: 'アンケート作成' },
      { id: 'results', label: '結果' }
    ];

    const totalRespondents = Math.max(100, Math.round(filteredPersonas.length * 0.06));
    const results = buildMockSurveyResults(surveyQuestions, totalRespondents);

    const surveyDetailQuestion = results.find((r) => r.id === surveyDetailQuestionId) ?? null;

    const MODAL_PAGE_SIZE = 20;
    // アンケート実施対象 = filteredPersonas の先頭 totalRespondents 件
    const allRespondents = filteredPersonas.slice(0, totalRespondents);
    const allRespondentAnswers = surveyDetailQuestion
      ? buildRespondentAnswers(surveyDetailQuestion, allRespondents)
      : [];

    // フィルタリング
    const filteredRespondentAnswers = allRespondentAnswers.filter(({ persona, answer }) => {
      if (surveyDetailFilter.gender && persona.gender !== surveyDetailFilter.gender) return false;
      if (surveyDetailFilter.itLiteracy && persona.itLiteracy !== surveyDetailFilter.itLiteracy) return false;
      if (surveyDetailFilter.search) {
        const q = surveyDetailFilter.search.toLowerCase();
        if (!persona.name.toLowerCase().includes(q) && !answer.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // ソート
    const sortedRespondentAnswers = surveyDetailSort.key === 'index'
      ? filteredRespondentAnswers
      : [...filteredRespondentAnswers].sort((a, b) => {
          const dir = surveyDetailSort.dir === 'asc' ? 1 : -1;
          if (surveyDetailSort.key === 'name') return dir * a.persona.name.localeCompare(b.persona.name, 'ja');
          if (surveyDetailSort.key === 'age') return dir * (a.persona.age - b.persona.age);
          if (surveyDetailSort.key === 'answer') return dir * a.answer.localeCompare(b.answer, 'ja');
          return 0;
        });

    // ページネーション
    const modalTotalPages = Math.max(1, Math.ceil(sortedRespondentAnswers.length / MODAL_PAGE_SIZE));
    const modalCurrentPage = Math.min(surveyDetailPage, modalTotalPages);
    const visibleRespondentAnswers = sortedRespondentAnswers.slice(
      (modalCurrentPage - 1) * MODAL_PAGE_SIZE,
      modalCurrentPage * MODAL_PAGE_SIZE
    );

    // ソートトグル
    const toggleDetailSort = (key) => {
      if (surveyDetailSort.key === key) {
        setSurveyDetailSort((s) => ({ key, dir: s.dir === 'asc' ? 'desc' : 'asc' }));
      } else {
        setSurveyDetailSort({ key, dir: 'asc' });
      }
      setSurveyDetailPage(1);
    };
    const sortIndicator = (key) => {
      if (surveyDetailSort.key !== key) return <span className="ml-0.5 text-[#4a4a4a]">⇅</span>;
      return <span className="ml-0.5 text-[#047857]">{surveyDetailSort.dir === 'asc' ? '▲' : '▼'}</span>;
    };

    // 質問詳細を開く（state リセット付き）
    const openSurveyDetail = (id) => {
      setSurveyDetailQuestionId(id);
      setSurveyDetailPage(1);
      setSurveyDetailSort({ key: 'index', dir: 'asc' });
      setSurveyDetailFilter({ gender: '', itLiteracy: '', search: '' });
    };

    return (
      <>
      <section className="h-full overflow-y-auto p-5 lg:p-6">
        {/* ヘッダー */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#e5e5e5]">ユーザー調査</h2>
          <p className="text-sm text-[#8f8f8f]">アンケートの作成・配信・結果分析を行います。</p>
        </div>

        {/* タブ */}
        <div className="mb-5 flex gap-1 rounded-lg border border-[#333333] bg-[#1f1f1f] p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSurveyTab(tab.id)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                surveyTab === tab.id
                  ? 'bg-[#047857] text-white'
                  : 'text-[#a3a3a3] hover:text-[#d2d2d2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ====== アンケート作成タブ ====== */}
        {surveyTab === 'create' && (
          <div className="space-y-5">
            {/* タイトル */}
            <div className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
              <label className="mb-1 block text-xs text-[#8f8f8f]">アンケートタイトル</label>
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                className="w-full rounded-md border border-[#333333] bg-[#252526] px-3 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
              />
            </div>

            {/* 質問リスト */}
            <div className="space-y-4">
              {surveyQuestions.map((q, index) => (
                <div key={q.id} className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="mt-1 text-xs font-semibold text-[#047857]">Q{index + 1}</span>
                    <input
                      type="text"
                      placeholder="質問文を入力..."
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                      className="flex-1 rounded-md border border-[#333333] bg-[#252526] px-3 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                      className="rounded-md border border-[#333333] bg-[#252526] px-2 py-2 text-sm text-[#cccccc] focus:border-[#047857] focus:outline-none"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="mt-1 text-[#6b6b6b] hover:text-[#e05252] transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* 選択肢エディタ (single / multi) */}
                  {(q.type === 'single' || q.type === 'multi') && (
                    <div className="mt-2 space-y-2 pl-5">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-[#6b6b6b]">{i + 1}.</span>
                          <input
                            type="text"
                            placeholder={`選択肢 ${i + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(q.id, i, e.target.value)}
                            className="flex-1 rounded border border-[#333333] bg-[#252526] px-2 py-1 text-xs text-[#cccccc] focus:border-[#047857] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(q.id, i)}
                            className="text-[#6b6b6b] hover:text-[#e05252] transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(q.id)}
                        className="flex items-center gap-1 text-xs text-[#047857] hover:text-[#065f46] transition-colors"
                      >
                        <Plus size={12} />
                        選択肢を追加
                      </button>
                    </div>
                  )}

                  {/* 評価スケール プレビュー */}
                  {q.type === 'rating' && (
                    <div className="mt-2 flex gap-2 pl-5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="flex h-8 w-8 items-center justify-center rounded border border-[#333333] bg-[#252526] text-xs text-[#8f8f8f]">
                          {n}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 自由記述 プレビュー */}
                  {q.type === 'text' && (
                    <div className="mt-2 pl-5">
                      <div className="h-14 rounded border border-dashed border-[#3a3a3a] bg-[#1a1a1a] p-2 text-xs text-[#6b6b6b]">
                        自由記述欄（回答者が入力）
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 rounded-md border border-dashed border-[#3a3a3a] px-4 py-2.5 text-sm text-[#8f8f8f] hover:border-[#047857] hover:text-[#047857] transition-colors"
            >
              <Plus size={14} />
              質問を追加
            </button>

            {/* 実施ボタン */}
            <div className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#e4e4e4]">アンケートを実施</p>
                  <p className="mt-0.5 text-xs text-[#8f8f8f]">
                    対象セグメント: {filteredPersonas.length.toLocaleString()}人 ／ 質問数: {surveyQuestions.length}問
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runSurvey}
                  disabled={filteredPersonas.length === 0}
                  className="inline-flex items-center gap-2 rounded-md bg-[#047857] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={14} />
                  アンケートを実施
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== 結果タブ ====== */}
        {surveyTab === 'results' && (
          <div className="space-y-5">
            {surveyLoading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-[#333333] bg-[#1f1f1f]">
                <Loader2 size={28} className="animate-spin text-[#047857]" />
                <p className="text-sm text-[#8f8f8f]">アンケートを集計中...</p>
              </div>
            ) : (
              <>
                {/* 総回答者数 */}
                <div className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
                  <p className="text-xs text-[#8f8f8f]">総回答者数（セグメント対象）</p>
                  <p className="mt-1 text-2xl font-semibold text-[#e5e5e5]">{totalRespondents.toLocaleString()} 人</p>
                </div>

                {/* 質問ごとのグラフ */}
                {results.map((result, idx) => (
                  <div key={result.id} className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[#047857] px-2 py-0.5 text-xs font-semibold text-white">Q{idx + 1}</span>
                      <span className="text-sm font-medium text-[#e4e4e4]">{result.text || `質問 ${idx + 1}`}</span>
                      <span className="ml-auto text-xs text-[#6b6b6b]">{QUESTION_TYPES.find((t) => t.value === result.type)?.label}</span>
                    </div>

                    {/* 単一選択 → 円グラフ */}
                    {result.type === 'single' && result.chartData.length > 0 && (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="shrink-0 sm:w-52">
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie data={result.chartData} dataKey="count" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                                {result.chartData.map((_, i) => (
                                  <Cell key={i} fill={SURVEY_CHART_COLORS[i % SURVEY_CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v, name) => [`${v.toLocaleString()}人`, name]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                          {result.chartData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="h-3 w-3 shrink-0 rounded-sm" style={{ background: SURVEY_CHART_COLORS[i % SURVEY_CHART_COLORS.length] }} />
                              <span className="flex-1 text-xs text-[#cccccc]">{item.name}</span>
                              <span className="text-xs text-[#8f8f8f]">{item.count.toLocaleString()}人</span>
                              <span className="w-12 text-right text-xs text-[#6b6b6b]">{item.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 複数選択 → 横棒グラフ */}
                    {result.type === 'multi' && result.chartData.length > 0 && (
                      <ResponsiveContainer width="100%" height={result.chartData.length * 44 + 16}>
                        <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
                          <XAxis type="number" tick={{ fill: '#8f8f8f', fontSize: 11 }} tickFormatter={(v) => `${v}人`} />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#cccccc', fontSize: 11 }} />
                          <Tooltip formatter={(v) => [`${v.toLocaleString()}人`]} />
                          <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                            {result.chartData.map((_, i) => (
                              <Cell key={i} fill={SURVEY_CHART_COLORS[i % SURVEY_CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* 評価スケール → 縦棒グラフ */}
                    {result.type === 'rating' && (
                      <div>
                        <p className="mb-3 text-sm text-[#8f8f8f]">
                          平均評価: <span className="font-semibold text-[#e5e5e5]">{result.avg} / 5</span>
                        </p>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={result.chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#8f8f8f', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#8f8f8f', fontSize: 11 }} tickFormatter={(v) => `${v}人`} />
                            <Tooltip formatter={(v) => [`${v.toLocaleString()}人`]} />
                            <Bar dataKey="count" fill="#047857" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* 自由記述 → テーマ別横棒グラフ */}
                    {result.type === 'text' && (
                      <ResponsiveContainer width="100%" height={result.chartData.length * 44 + 16}>
                        <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
                          <XAxis type="number" tick={{ fill: '#8f8f8f', fontSize: 11 }} tickFormatter={(v) => `${v}件`} />
                          <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#cccccc', fontSize: 11 }} />
                          <Tooltip formatter={(v) => [`${v.toLocaleString()}件`]} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[0, 3, 3, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                ))}

                {/* 質問別サマリーテーブル */}
                <div className="rounded-xl border border-[#333333] bg-[#1f1f1f] p-4">
                  <h3 className="mb-4 text-sm font-semibold text-[#e4e4e4]">質問別サマリー</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                      <thead className="bg-[#252526]">
                        <tr>
                          <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-xs text-[#9b9b9b]">Q#</th>
                          <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-xs text-[#9b9b9b]">質問</th>
                          <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-xs text-[#9b9b9b]">形式</th>
                          <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-xs text-[#9b9b9b]">1位 / 平均評価</th>
                          <th className="border-b border-r border-[#333333] px-3 py-2 text-left text-xs text-[#9b9b9b]">2位</th>
                          <th className="border-b border-[#333333] px-3 py-2 text-left text-xs text-[#9b9b9b]">回答者数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, idx) => {
                          const d = result.chartData;
                          let col1 = '-';
                          let col2 = '-';
                          if (result.type === 'rating') {
                            col1 = `平均 ${result.avg} 点`;
                            const mode = d.reduce((a, b) => (b.count > a.count ? b : a), d[0]);
                            col2 = mode ? `最頻値: ${mode.name}` : '-';
                          } else if (d.length > 0) {
                            col1 = `${d[0].name} (${d[0].pct ?? Math.round((d[0].count / totalRespondents) * 100)}%)`;
                            col2 = d[1] ? `${d[1].name} (${d[1].pct ?? Math.round((d[1].count / totalRespondents) * 100)}%)` : '-';
                          }
                          return (
                            <tr
                              key={result.id}
                              className={`cursor-pointer transition-colors hover:bg-[#252526] ${idx % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#1f1f1f]'}`}
                              onClick={() => openSurveyDetail(result.id)}
                            >
                              <td className="border-b border-r border-[#2a2a2a] px-3 py-2 text-xs font-semibold text-[#047857]">Q{idx + 1}</td>
                              <td className="border-b border-r border-[#2a2a2a] px-3 py-2 text-xs text-[#cccccc]" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.text || `質問 ${idx + 1}`}</td>
                              <td className="border-b border-r border-[#2a2a2a] px-3 py-2 text-xs text-[#8f8f8f]">{QUESTION_TYPES.find((t) => t.value === result.type)?.label}</td>
                              <td className="border-b border-r border-[#2a2a2a] px-3 py-2 text-xs text-[#cccccc]">{col1}</td>
                              <td className="border-b border-r border-[#2a2a2a] px-3 py-2 text-xs text-[#8f8f8f]">{col2}</td>
                              <td className="border-b border-[#2a2a2a] px-3 py-2 text-xs text-[#cccccc]">
                                <div className="flex items-center justify-between gap-2">
                                  {totalRespondents.toLocaleString()}人
                                  <ChevronRight size={12} className="text-[#6b6b6b]" />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* 質問詳細モーダル（回答者別表示） */}
      {surveyDetailQuestion && (() => {
        const qIdx = results.findIndex((r) => r.id === surveyDetailQuestion.id);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSurveyDetailQuestionId(null)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#333333] bg-[#1f1f1f]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="shrink-0 flex items-start justify-between gap-3 border-b border-[#333333] bg-[#1f1f1f] px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#047857] px-2 py-0.5 text-xs font-semibold text-white">Q{qIdx + 1}</span>
                  <span className="text-sm font-medium text-[#e4e4e4]">{surveyDetailQuestion.text || `質問 ${qIdx + 1}`}</span>
                  <span className="text-xs text-[#6b6b6b]">{QUESTION_TYPES.find((t) => t.value === surveyDetailQuestion.type)?.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSurveyDetailQuestionId(null)}
                  aria-label="閉じる"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#333333] text-[#bdbdbd] transition-colors hover:bg-[#252526] hover:text-[#e0e0e0]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* フィルターバー */}
              <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-5 py-3">
                <div className="relative flex-1 min-w-[160px]">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b]" />
                  <input
                    type="text"
                    placeholder="名前・回答で検索..."
                    value={surveyDetailFilter.search}
                    onChange={(e) => { setSurveyDetailFilter((f) => ({ ...f, search: e.target.value })); setSurveyDetailPage(1); }}
                    className="w-full rounded-md border border-[#333333] bg-[#252526] py-1.5 pl-7 pr-3 text-xs text-[#cccccc] placeholder-[#5a5a5a] focus:border-[#047857] focus:outline-none"
                  />
                </div>
                <select
                  value={surveyDetailFilter.gender}
                  onChange={(e) => { setSurveyDetailFilter((f) => ({ ...f, gender: e.target.value })); setSurveyDetailPage(1); }}
                  className="rounded-md border border-[#333333] bg-[#252526] px-2.5 py-1.5 text-xs text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  <option value="">性別: すべて</option>
                  {GENDER_OPTIONS.filter((g) => g !== '指定なし').map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <select
                  value={surveyDetailFilter.itLiteracy}
                  onChange={(e) => { setSurveyDetailFilter((f) => ({ ...f, itLiteracy: e.target.value })); setSurveyDetailPage(1); }}
                  className="rounded-md border border-[#333333] bg-[#252526] px-2.5 py-1.5 text-xs text-[#cccccc] focus:border-[#047857] focus:outline-none"
                >
                  <option value="">ITリテラシー: すべて</option>
                  {IT_OPTIONS.filter((o) => o !== '指定なし').map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {(surveyDetailFilter.search || surveyDetailFilter.gender || surveyDetailFilter.itLiteracy) && (
                  <button
                    type="button"
                    onClick={() => { setSurveyDetailFilter({ gender: '', itLiteracy: '', search: '' }); setSurveyDetailPage(1); }}
                    className="text-xs text-[#8f8f8f] hover:text-[#cccccc] transition-colors"
                  >
                    リセット
                  </button>
                )}
                <span className="ml-auto text-xs text-[#6b6b6b]">
                  {filteredRespondentAnswers.length} / {allRespondentAnswers.length} 件
                </span>
              </div>

              {/* カラムヘッダー（ソート） */}
              <div className="shrink-0 grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-3 border-b border-[#2a2a2a] bg-[#252526] px-5 py-2">
                <span className="w-32 text-[11px] font-medium text-[#8f8f8f]">
                  <button type="button" onClick={() => toggleDetailSort('name')} className="flex items-center gap-1 hover:text-[#cccccc] transition-colors">
                    回答者{sortIndicator('name')}
                  </button>
                </span>
                <span className="text-[11px] font-medium text-[#8f8f8f]">
                  <button type="button" onClick={() => toggleDetailSort('answer')} className="flex items-center gap-1 hover:text-[#cccccc] transition-colors">
                    回答内容{sortIndicator('answer')}
                  </button>
                </span>
                <span className="text-[11px] font-medium text-[#8f8f8f]">
                  <button type="button" onClick={() => toggleDetailSort('age')} className="flex items-center gap-1 hover:text-[#cccccc] transition-colors">
                    年齢{sortIndicator('age')}
                  </button>
                </span>
                <span className="w-28 text-[11px] font-medium text-[#8f8f8f]">操作</span>
              </div>

              {/* 回答者リスト */}
              <div className="min-h-0 overflow-y-auto">
                <div className="divide-y divide-[#2a2a2a]">
                  {visibleRespondentAnswers.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-[#6b6b6b]">
                      {allRespondentAnswers.length === 0
                        ? 'セグメント対象者が0名です。設定でフィルターを見直してください。'
                        : '条件に一致する回答者が見つかりません。'}
                    </p>
                  ) : (
                    visibleRespondentAnswers.map(({ persona, answer }) => {
                      const assigned = assignedPersonaIds.includes(persona.id);
                      return (
                        <div key={persona.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-3 px-5 py-3 transition-colors hover:bg-[#252526]">
                          <div className="flex w-32 items-center gap-2 min-w-0">
                            <Avatar persona={persona} size="h-8 w-8 shrink-0" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-[#e4e4e4]">{persona.name}</p>
                              <p className="truncate text-[10px] text-[#6b6b6b]">IT: {persona.itLiteracy} / {persona.gender}</p>
                            </div>
                          </div>
                          <div className="min-w-0 text-xs leading-relaxed text-[#cccccc]">{answer}</div>
                          <div className="text-xs text-[#8f8f8f]">{persona.age}歳 / {persona.occupation}</div>
                          <div className="w-28 shrink-0">
                            <button
                              type="button"
                              onClick={() => togglePersonaAssignment(persona.id)}
                              className={`w-full rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                assigned
                                  ? 'border border-[#3b4f48] bg-[#1f312c] text-[#8dd7be] hover:bg-[#27453d]'
                                  : 'bg-[#047857] text-white hover:bg-[#065f46]'
                              }`}
                            >
                              {assigned ? '追加済み ✓' : '+ 追加'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ページネーション */}
              <div className="shrink-0 flex items-center justify-between border-t border-[#333333] px-5 py-2.5">
                <p className="text-xs text-[#6b6b6b]">
                  {filteredRespondentAnswers.length > 0
                    ? `${((modalCurrentPage - 1) * MODAL_PAGE_SIZE + 1).toLocaleString()}–${Math.min(modalCurrentPage * MODAL_PAGE_SIZE, filteredRespondentAnswers.length).toLocaleString()} / ${filteredRespondentAnswers.length.toLocaleString()} 件`
                    : '0 件'}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={modalCurrentPage <= 1}
                    onClick={() => setSurveyDetailPage((p) => Math.max(1, p - 1))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#333333] text-[#8f8f8f] transition-colors hover:bg-[#252526] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {Array.from({ length: Math.min(5, modalTotalPages) }, (_, i) => {
                    const half = 2;
                    let start = Math.max(1, Math.min(modalCurrentPage - half, modalTotalPages - 4));
                    const page = start + i;
                    if (page > modalTotalPages) return null;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setSurveyDetailPage(page)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs transition-colors ${
                          page === modalCurrentPage
                            ? 'border-[#047857] bg-[#17362d] text-[#c8f5e7]'
                            : 'border-[#333333] text-[#8f8f8f] hover:bg-[#252526]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={modalCurrentPage >= modalTotalPages}
                    onClick={() => setSurveyDetailPage((p) => Math.min(modalTotalPages, p + 1))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#333333] text-[#8f8f8f] transition-colors hover:bg-[#252526] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
    );
  };

  const renderMainSection = () => {
    if (activeSection === 'settings') return renderSettings();
    if (activeSection === 'survey') return renderSurvey();
    if (activeSection === 'persona') return renderPersona();
    if (activeSection === 'journey') return renderJourney();
    if (activeSection === 'mentalModel') return renderMentalModel();
    if (activeSection === 'storyboard') return renderStoryboard();
    return renderUsability();
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#181818] text-[#cccccc]">
      <div className="flex h-full flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-[#333333] bg-[#1e1e1e] md:w-64 md:border-b-0 md:border-r">
          <div className="border-b border-[#333333] px-3 py-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex w-full items-center gap-2 rounded-md border border-[#333333] px-3 py-2 text-sm text-[#d0d0d0] transition-colors hover:bg-[#252526]"
            >
              <ArrowLeft size={15} />
              戻る
            </button>
          </div>

          <nav className="grid grid-cols-2 gap-2 p-3 md:grid-cols-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border-[#2f5f51] bg-[#17362d] text-[#c8f5e7]'
                      : 'border-transparent text-[#a3a3a3] hover:border-[#333333] hover:bg-[#252526] hover:text-[#d2d2d2]'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-[#333333] px-3 py-3 text-xs text-[#8f8f8f]">
            <p>選択中ペルソナ: {assignedPersonas.length}名</p>
            <p className="mt-1">現在セクション: {NAV_ITEMS.find((item) => item.id === activeSection)?.label}</p>
          </div>
        </aside>

        <main className="min-h-0 flex-1 bg-[#181818]">{renderMainSection()}</main>
      </div>

      {previewPersona && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewPersonaId(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#333333] bg-[#1f1f1f]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 flex items-start justify-between gap-3 border-b border-[#333333] bg-[#1f1f1f] px-5 py-4">
              <div className="flex items-start gap-3">
                <Avatar persona={previewPersona} size="h-12 w-12" />
                <div>
                  <h2 className="text-lg font-semibold text-[#e5e5e5]">{previewPersona.name}</h2>
                  <p className="text-sm text-[#8f8f8f]">
                    {previewPersona.age}歳 / {previewPersona.occupation}
                  </p>
                  <p className="text-xs text-[#8f8f8f]">
                    {previewPersona.country} / {previewPersona.gender} / IT: {previewPersona.itLiteracy}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPersonaId(null)}
                aria-label="閉じる"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#333333] text-[#bdbdbd] transition-colors hover:bg-[#252526] hover:text-[#e0e0e0]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="persona-popup-scrollbar min-h-0 space-y-4 overflow-y-auto px-5 pb-5 pt-4">
              <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                <p className="mb-2 text-xs text-[#a5a5a5]">価値観</p>
                <p className="mb-3 text-sm leading-relaxed text-[#d0d0d0]">{previewPersona.value}</p>
                <p className="mb-2 text-xs text-[#a5a5a5]">重視ポイント</p>
                <div className="flex flex-wrap gap-2">
                  {previewPersona.personality.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full border border-[#2f5f51] bg-[#17362d] px-2 py-1 text-[11px] text-[#92d8bf]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                <p className="mb-2 text-xs text-[#a5a5a5]">関心事</p>
                <p className="mb-3 text-sm leading-relaxed text-[#d0d0d0]">{previewPersona.interest}</p>
                <p className="mb-2 text-xs text-[#a5a5a5]">困っていること</p>
                <p className="text-sm leading-relaxed text-[#d0d0d0]">{previewPersona.painPoint}</p>
              </div>

              <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                {previewAdvancedProfileLoading ? (
                  <div className="flex min-h-[120px] items-center justify-center gap-2 rounded-md border border-[#2b2b2b] bg-[#171717] p-3">
                    <Loader2 size={14} className="animate-spin text-[#8fceb8]" />
                    <p className="text-xs text-[#8f8f8f]">
                      心理・行動特性を生成しています...
                    </p>
                  </div>
                ) : previewAdvancedProfile ? (
                  <div className="space-y-4">
                    {ADVANCED_PERSONA_SECTIONS.map((section) => (
                      <div key={section.title} className="rounded-md border border-[#2b2b2b] bg-[#171717] p-3">
                        <p className="mb-2 text-[11px] font-medium text-[#8fceb8]">{section.title}</p>
                        <div className="space-y-2">
                          {section.fields.map((field) => (
                            <div key={field.key}>
                              <p className="text-[10px] text-[#8f8f8f]">{field.label}</p>
                              <p className="text-xs leading-relaxed text-[#d0d0d0]">
                                {previewAdvancedProfile[field.key] || '未設定'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-[#2b2b2b] bg-[#171717] px-3 py-4 text-xs text-[#8f8f8f]">
                    このペルソナの心理・行動特性はまだ生成されていません。
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-4">
                <p className="mb-2 text-xs text-[#a5a5a5]">想定発話</p>
                <ul className="space-y-2 text-sm leading-relaxed text-[#d0d0d0]">
                  {previewPersona.mockReplies.map((reply) => (
                    <li key={reply}>- {reply}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
