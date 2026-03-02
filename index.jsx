import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageCircleWarning,
  LayoutTemplate,
  Activity,
  Code2,
  PenTool,
  ChevronRight,
  Globe,
  Heart,
  Lightbulb,
  Search,
  Sparkles,
  Loader2,
  Send,
  Paperclip,
  ArrowUp
} from 'lucide-react';
import PluginConnectPage from './src/PluginConnectPage';
import CursorMockPage from './src/CursorMockPage';

export default function App() {
  const PLUGIN_PAGE_HASH = '#plugin-connect';
  const CURSOR_PAGE_HASH = '#cursor';
  const [scrolled, setScrolled] = useState(false);
  const [isPluginPage, setIsPluginPage] = useState(() => window.location.hash === PLUGIN_PAGE_HASH);
  const [isCursorPage, setIsCursorPage] = useState(() => window.location.hash === CURSOR_PAGE_HASH);
  const [ideaInput, setIdeaInput] = useState("");
  const [personaResponse, setPersonaResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personaCriteria, setPersonaCriteria] = useState({
    country: "日本",
    ageGroup: "25-34",
    gender: "指定なし",
    itLiteracy: "普通",
    mentalModel: "AIは提案し、人が最終判断するもの",
    decisionLogic: "データ・比較表で合理的に決める",
    cognitiveLoadTolerance: "3ステップ以内なら試す",
    behaviorTrigger: "困りごとが発生した瞬間",
    usageEnvironment: "移動中のスマホ利用",
    deviceEcosystem: "スマホとPCをシームレス連携したい",
    timeConstraint: "5分でタスク完了したい",
    stakeholders: "同僚・上司の承認が必要",
    aiLiteracy: "AI提案を検証してから使う",
    privacyPolicy: "利便性が高ければ匿名データ提供可",
    informationChannel: "検索エンジン中心",
    ethicsValue: "コストと利便性を優先しつつ確認",
    accessibilityNeed: "片手操作や短時間操作を重視",
    wellbeing: "時間の余白が増えることが幸福",
    expectedOutcome: "迷わず意思決定できる状態になりたい",
    alternativeSolution: "スプレッドシートやメモで管理"
  });

  const segmentFilterSections = [
    {
      title: "0. デモグラフィック（補助情報）",
      filters: [
        {
          key: "country",
          label: "国・地域",
          options: ["日本", "アメリカ", "東南アジア", "ヨーロッパ", "指定なし"]
        },
        {
          key: "ageGroup",
          label: "年齢層",
          options: ["18-24", "25-34", "35-44", "45-54", "55+"]
        },
        {
          key: "gender",
          label: "性別",
          options: ["女性", "男性", "ノンバイナリー", "指定なし"]
        },
        {
          key: "itLiteracy",
          label: "ITリテラシー",
          options: ["低め", "普通", "高め"]
        }
      ]
    },
    {
      title: "1. 心理・行動特性",
      filters: [
        {
          key: "mentalModel",
          label: "メンタルモデル",
          options: [
            "AIは提案し、人が最終判断するもの",
            "AIがほぼ自動で最適化してくれるもの",
            "人の専門家監修がないと不安",
            "今のやり方を補助する程度で十分"
          ]
        },
        {
          key: "decisionLogic",
          label: "意思決定ロジック",
          options: [
            "感情・共感を重視して決める",
            "データ・比較表で合理的に決める",
            "口コミ・周囲の評判を最優先する",
            "価格と手間の最小化を最優先する"
          ]
        },
        {
          key: "cognitiveLoadTolerance",
          label: "認知的負荷への耐性",
          options: [
            "3ステップ以内なら試す",
            "多少複雑でも学習コストを払える",
            "設定や専門用語が多いと離脱しやすい"
          ]
        },
        {
          key: "behaviorTrigger",
          label: "行動のトリガー",
          options: [
            "困りごとが発生した瞬間",
            "SNSやニュースで知った時",
            "周囲に勧められた時",
            "定期的な見直しタイミング"
          ]
        }
      ]
    },
    {
      title: "2. 文脈と環境",
      filters: [
        {
          key: "usageEnvironment",
          label: "物理的・デジタル環境",
          options: [
            "移動中のスマホ利用",
            "オフィスのPC利用",
            "自宅のマルチデバイス利用",
            "現場作業中のハンズフリー利用"
          ]
        },
        {
          key: "deviceEcosystem",
          label: "マルチデバイス連携",
          options: [
            "スマホ単体で完結したい",
            "スマホとPCをシームレス連携したい",
            "タブレット中心で使いたい",
            "音声デバイスとも連携したい"
          ]
        },
        {
          key: "timeConstraint",
          label: "時間の制約",
          options: [
            "30秒以内に要点だけ確認したい",
            "5分でタスク完了したい",
            "30分かけて比較検討できる",
            "時間制約は少ない"
          ]
        },
        {
          key: "stakeholders",
          label: "周囲のステークホルダー",
          options: [
            "家族の意向が強く影響する",
            "同僚・上司の承認が必要",
            "コミュニティの評価が影響する",
            "基本的に自分一人で判断する"
          ]
        }
      ]
    },
    {
      title: "3. リテラシーと技術スタック",
      filters: [
        {
          key: "aiLiteracy",
          label: "AIリテラシー",
          options: [
            "AI提案をそのまま採用しがち",
            "AI提案を検証してから使う",
            "AI利用に慎重で限定的",
            "AIを業務フローに積極統合"
          ]
        },
        {
          key: "privacyPolicy",
          label: "プライバシー・ポリシー",
          options: [
            "個人データは極力提供したくない",
            "利便性が高ければ匿名データ提供可",
            "明確なメリットがあれば詳細データ提供可",
            "企業ポリシー準拠なら提供可"
          ]
        },
        {
          key: "informationChannel",
          label: "情報の収集経路",
          options: [
            "検索エンジン中心",
            "SNS・動画で収集",
            "専門コミュニティで収集",
            "AIエージェント経由で収集"
          ]
        }
      ]
    },
    {
      title: "4. 価値観とインクルーシブ要素",
      filters: [
        {
          key: "ethicsValue",
          label: "倫理性・社会的価値観",
          options: [
            "環境負荷や倫理性を最重視",
            "コストと利便性を優先しつつ確認",
            "社会的インパクトが高いか重視",
            "まず自分の課題解決を優先"
          ]
        },
        {
          key: "accessibilityNeed",
          label: "アクセシビリティのニーズ",
          options: [
            "視認性（文字サイズ・配色）を重視",
            "音声操作・読み上げ対応が必要",
            "片手操作や短時間操作を重視",
            "状況に応じた配慮があれば十分"
          ]
        },
        {
          key: "wellbeing",
          label: "ウェルビーイングの定義",
          options: [
            "不安が減ることが幸福",
            "時間の余白が増えることが幸福",
            "自己成長を実感できることが幸福",
            "家族・チームとの関係改善が幸福"
          ]
        }
      ]
    },
    {
      title: "5. Jobs to be Done",
      filters: [
        {
          key: "expectedOutcome",
          label: "期待するアウトカム",
          options: [
            "迷わず意思決定できる状態になりたい",
            "作業時間を半分にしたい",
            "失敗リスクを減らしたい",
            "周囲に説明できる根拠を得たい"
          ]
        },
        {
          key: "alternativeSolution",
          label: "現状の代替手段",
          options: [
            "スプレッドシートやメモで管理",
            "人に相談して判断",
            "複数ツールを手作業で併用",
            "課題を先送りして対応"
          ]
        }
      ]
    }
  ];

  const updatePersonaCriteria = (key, value) => {
    setPersonaCriteria((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncPageState = () => {
      setIsPluginPage(window.location.hash === PLUGIN_PAGE_HASH);
      setIsCursorPage(window.location.hash === CURSOR_PAGE_HASH);
    };
    syncPageState();
    window.addEventListener('hashchange', syncPageState);
    return () => window.removeEventListener('hashchange', syncPageState);
  }, [PLUGIN_PAGE_HASH, CURSOR_PAGE_HASH]);

  const openPluginPage = () => {
    const baseUrl = window.location.href.split('#')[0];
    window.open(baseUrl + CURSOR_PAGE_HASH, '_blank');
  };

  const closePluginPage = () => {
    if (window.location.hash === PLUGIN_PAGE_HASH) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '';
      }
      return;
    }
    setIsPluginPage(false);
  };

  const fetchPersonaReaction = async () => {
    if (!ideaInput.trim()) return;
    setIsLoading(true);
    setPersonaResponse(null);

    const apiKey = "";
    const selectedSegments = segmentFilterSections
      .flatMap((section) => [
        `【${section.title}】`,
        ...section.filters.map((segment) => `- ${segment.label}: ${personaCriteria[segment.key]}`)
      ])
      .join("\n");

    const prompt = `あなたは「PersonaBank」という要件定義AIのデモ版です。
以下のペルソナ条件（デモグラフィック補助情報 + 行動・文脈・AIリテラシー・価値観・JTBD）に合うターゲットユーザー（ペルソナ）の1人になりきって、率直で少し厳しめな「使わない理由」や「懸念点」を指摘してください。
国・年齢・性別・ITリテラシーは背景として参照しつつ、行動背景と意思決定の癖が伝わるコメントにしてください。

ペルソナ条件:
${selectedSegments}

アイデア: ${ideaInput}`;

    const generateContent = async (retryCount = 0) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  personaName: { type: "STRING", description: "例: 美雪 / 5分で判断したい慎重派ワーカー" },
                  comment: { type: "STRING", description: "ペルソナとしてのコメント（100文字程度で、ハッとするような指摘）" },
                  avatarColor: { type: "STRING", description: "Avatar background hex color without # (e.g. fed7aa)" },
                  seedName: { type: "STRING", description: "A random english name for avatar seed (e.g. Felix)" }
                },
                required: ["personaName", "comment", "avatarColor", "seedName"]
              }
            }
          })
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          setPersonaResponse(JSON.parse(text));
        }
      } catch (error) {
        if (retryCount < 5) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(res => setTimeout(res, delay));
          return generateContent(retryCount + 1);
        } else {
          setPersonaResponse({
            personaName: "システムエラー",
            comment: "ペルソナの召喚に失敗しました。少し時間をおいて再度お試しください。",
            avatarColor: "fecaca",
            seedName: "Error"
          });
        }
      }
    };

    await generateContent();
    setIsLoading(false);
  };

  const whatWeProvideItems = [
    {
      title: '能動的な「口出し」機能',
      description:
        '要件や仕様を詰める途中で、想定ユーザーから見て違和感がある点を自動検知します。「その流れだと離脱しそう」のような指摘を即座に返し、手戻りを初期段階で減らします。',
      image: '/captures/1.png',
      icon: MessageCircleWarning
    },
    {
      title: 'ペルソナとのチャット機能',
      description:
        '担当ペルソナと会話しながら、要件の背景やユースケースを深掘りできます。曖昧な前提を質問でほどき、誰のどんな課題を解く機能なのかを言語化しやすくします。',
      image: '/captures/2.png',
      icon: Users
    },
    {
      title: 'ユーザー調査',
      description:
        'ターゲットを指定して、仮想インタビューやアンケートを短時間で実行できます。回答傾向をセグメント別に可視化し、優先すべき課題のあたりを素早く付けられます。',
      image: '/captures/3.png',
      icon: Search
    },
    {
      title: 'メンタルモデル・ダイアグラム',
      description:
        'ユーザーが頭の中でどう理解し、どこでつまずくかを図として整理します。プロダクト側の設計意図とのズレを見える化し、説明不足な導線や用語を洗い出せます。',
      image: '/captures/4.png',
      icon: LayoutTemplate
    },
    {
      title: 'カスタマージャーニーマップ',
      description:
        '認知から継続利用までの体験を時系列で俯瞰できます。感情の上下や離脱ポイントを把握し、どの接点を改善すべきかをチームで共通認識化できます。',
      image: '/captures/5.png',
      icon: Activity
    },
    {
      title: 'ストーリーボード',
      description:
        '「誰が、何のために、どの状況で使うか」をテンプレート化して整理します。仕様を単なる機能一覧ではなく、価値起点のストーリーとして定義できるようにします。',
      image: '/captures/6.png',
      icon: PenTool
    },
    {
      title: 'ユーザビリティ調査',
      description:
        '実際の操作シナリオを想定したタスクテストを実施し、迷いやすい箇所を評価します。完了率や負荷感の変化を比較でき、改善の効果検証まで一気通貫で進められます。',
      image: '/captures/7.png',
      icon: Globe
    }
  ];

  if (isCursorPage) return <CursorMockPage />;
  if (isPluginPage) return <PluginConnectPage onBack={closePluginPage} />;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-emerald-200 selection:text-stone-900">

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-stone-50/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="px-6 lg:px-10 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-6 md:col-span-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-stone-50 font-bold font-serif italic">P</div>
            <span className="text-xl font-semibold tracking-tight text-stone-800">PersonaBank</span>
          </div>
          <div className="col-span-6 md:col-span-8 flex items-center justify-end gap-8">
            <div className="hidden md:flex gap-8 text-sm font-medium text-stone-600">
              <a href="#why" className="hover:text-emerald-700 transition-colors">Why</a>
              <a href="#how" className="hover:text-emerald-700 transition-colors">How</a>
              <a href="#what" className="hover:text-emerald-700 transition-colors">What</a>
            </div>
            <button
              type="button"
              onClick={openPluginPage}
              className="bg-stone-800 text-stone-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-700 transition-all shadow-sm"
            >
              プラグインを連携する
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-orange-200/50 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-200/40 blur-3xl"></div>
        </div>

        <div className="grid grid-cols-12 relative z-10">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-800 mb-8 leading-[1.15]">
              誰もが作れる時代に、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-stone-600">
                「求められるもの」を作る。
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-12 leading-relaxed">
              PersonaBankは、あなたの開発環境（Cursor, VS Code, ChatGPT, Gemini, Claude）に常駐する「1万人の仮想ユーザー」です。<br />
              コードを書く前に、デザインを引く前に、彼らが勝手に口出しし、あなたのアイデアを現実に引き戻します。
            </p>
            <div className="flex flex-col gap-4 justify-center items-center">
              <button
                type="button"
                onClick={openPluginPage}
                className="bg-emerald-700 text-stone-50 px-8 py-4 rounded-full text-base font-medium hover:bg-emerald-800 transition-all shadow-md flex items-center gap-2"
              >
                プラグインを連携する <ChevronRight size={18} />
              </button>
              <div className="text-sm text-stone-500 text-center">
                <p className="font-medium mb-2">対応サービス</p>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  <span>Cursor</span>
                  <span>VS Code</span>
                  <span>ChatGPT</span>
                  <span>Gemini</span>
                  <span>Claude</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY Section (Golden Circle: Why) */}
      <section id="why" className="py-24 px-6 lg:px-10 bg-stone-100/50">
        <div className="grid grid-cols-12 gap-8 lg:gap-10">
          <div className="col-span-12 mb-8 md:mb-12">
            <h2 className="text-sm font-bold text-emerald-700 tracking-widest uppercase mb-3">Why we exist</h2>
            <h3 className="text-3xl md:text-4xl font-semibold text-stone-800 leading-tight mb-6">
              「作ってから検証する」時代は、もう終わり。
            </h3>
            <p className="text-stone-600 text-lg leading-relaxed">
              AIの進化でサービスの大量生産が可能になった今、大半のアイデアは誰の目にも留まらずに埋もれていきます。<br />
              だからこそ、コードを書く前に「誰が、なぜ使うのか」を研ぎ澄ます必要があります。<br />
              私たちは、1万人のAIペルソナをあなたの「最初のユーザー」にします。<br />
              リリース前に顧客のリアルな反応をシミュレーションし、独りよがりな思い込みを排除する。<br />
              あなたが「ユーザーを中心に」考えるのではなく、あなたとユーザーが一緒に要件を固めていくのがこれからの開発です。<br />
              PersonaBankは、本当に誰かの役に立つプロダクト創りを支援します。
            </p>
          </div>

          <div className="col-span-12 grid grid-cols-12 gap-6 lg:gap-8">
            <div className="col-span-12 md:col-span-4 bg-stone-50 p-8 rounded-3xl border border-stone-200/60 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700 mb-6">
                <Heart size={24} />
              </div>
              <h4 className="text-xl font-semibold mb-3">あなたの思い込みを壊す、<br />最初の「正直なユーザー」</h4>
              <p className="text-stone-600 leading-relaxed">情熱は時に視界を狭め、見たいものだけを見せてしまいます。そんな時、一番頼りになるのは「ちょっと難しくて分からない」と正直に言ってくれるユーザーの存在です。AIペルソナによる率直な反応が、独りよがりな開発からあなたを救い出します。</p>
            </div>
            <div className="col-span-12 md:col-span-4 bg-stone-50 p-8 rounded-3xl border border-stone-200/60 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-6">
                <Globe size={24} />
              </div>
              <h4 className="text-xl font-semibold mb-3">従来の調査では出会えなかった、<br />「たった一人」の熱狂的ファン</h4>
              <p className="text-stone-600 leading-relaxed">世の中には、まだ名前もついていないニッチな悩みを持つ人がたくさんいます。1万人のペルソナが待機しているということは、思いつきのマイナーな機能でも、それを心待ちにしている人と出会える確率が劇的に上がるということ。隠れた市場が、ここにはあります。</p>
            </div>
            <div className="col-span-12 md:col-span-4 bg-stone-50 p-8 rounded-3xl border border-stone-200/60 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-stone-200 flex items-center justify-center text-stone-700 mb-6">
                <Lightbulb size={24} />
              </div>
              <h4 className="text-xl font-semibold mb-3">「作る」を止めない。<br />迷った時は、一緒に探す</h4>
              <p className="text-stone-600 leading-relaxed">厳しいフィードバックは、決して開発を終わらせるためではありません。本当に愛されるサービスを作るためのステップです。どうすれば使ってもらえるのか悩んだら、ペルソナたちに話しかけてみてください。彼らとの対話から、予想もしなかった新しいニーズの種が見つかるはずです。</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW Section (Golden Circle: How) */}
      <section id="how" className="py-24 px-6 lg:px-10 border-y border-stone-200/60">
        <div className="grid grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="col-span-12 md:col-span-6">
            <h2 className="text-sm font-bold text-emerald-700 tracking-widest uppercase mb-3">How it works</h2>
            <h3 className="text-3xl md:text-4xl font-semibold text-stone-800 leading-tight mb-6">
              現実社会の10万分の1。<br />1万人の「生きたペルソナ」。
            </h3>
            <p className="text-stone-600 text-lg leading-relaxed mb-6">
              PersonaBankは、主要先進国の人口動態、価値観調査、リアルタイムのデジタル行動データを統合し、1万人の高解像度な「合成ユーザー」を構築しました。
            </p>
            <ul className="space-y-4">
              {[
                'あなたのサービスのターゲット層を自動でセグメント抽出',
                '数人の具体的なペルソナをプロジェクトの「顧問」としてアサイン',
                '時間の経過や社会トレンドの変化とともに、ペルソナの価値観も動的にアップデート'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Mockup */}
          <div className="col-span-12 md:col-span-6 w-full">
            <div className="bg-stone-950 rounded-3xl border border-stone-700 shadow-2xl text-stone-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-700/80 bg-stone-900/80">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 mb-2">Chat Preview</p>
                <p className="text-sm text-stone-300">実装中の要件に対して、ペルソナがリアルタイムで口出しします。</p>
              </div>

              <div className="px-5 py-5 space-y-4 bg-gradient-to-b from-stone-900 to-stone-950 min-h-[340px]">
                <div className="ml-auto max-w-[88%] rounded-2xl border border-stone-700 bg-stone-800 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-stone-400 mb-2">You</p>
                  <p className="text-sm leading-relaxed text-stone-100">
                    ユーザー登録時に、職業、年収、家族構成を必須入力にして、最初にユーザーを細かく分類したいです。
                  </p>
                </div>

                <div className="mr-auto max-w-[90%] rounded-2xl border border-emerald-400/30 bg-[#065f46] px-4 py-3 text-emerald-50 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-orange-200 border border-orange-300 overflow-hidden shrink-0">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Miyuki&backgroundColor=fed7aa" alt="美雪のアバター" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-100">美雪 (28) / 子育て中の経理</span>
                    <span className="text-[11px] text-emerald-200/80 ml-auto">Just now</span>
                  </div>
                  <p className="text-sm leading-relaxed text-emerald-50">
                    「登録の段階で入力項目が多いと、私は離脱しちゃいます。まずはメールだけで始めて、必要な情報は使いながら聞いてほしいです。」
                  </p>
                </div>

              </div>

              <div className="px-4 py-4 border-t border-stone-700/80 bg-stone-950">
                <div className="rounded-2xl border border-stone-700 bg-stone-900 px-3 py-2.5 flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg bg-stone-800 text-stone-400 flex items-center justify-center">
                    <Paperclip size={14} />
                  </button>
                  <div className="text-sm flex-1 flex items-center gap-1">
                    <span className="text-stone-200">なるほど、じゃあそうしようかな</span>
                    <span className="text-stone-500 animate-pulse">|</span>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-orange-800/90 text-orange-100 flex items-center justify-center">
                    <ArrowUp size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT Section (Golden Circle: What) */}
      <section id="what" className="py-24 px-6 lg:px-10 bg-stone-50">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 text-center mb-8">
            <h2 className="text-sm font-bold text-emerald-700 tracking-widest uppercase mb-3">What we provide</h2>
            <h3 className="text-3xl md:text-4xl font-semibold text-stone-800">
              ニーズとの一致やズレを<br />可視化するツールたち
            </h3>
          </div>

          <div className="col-span-12 grid grid-cols-12 gap-6">
            {whatWeProvideItems.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="col-span-12 md:col-span-6 lg:col-span-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                    <img
                      src={feature.image}
                      alt={`${feature.title}のキャプチャ`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-stone-800 leading-snug">{feature.title}</h4>
                    </div>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed mt-3">{feature.description}</p>
                </article>
              );
            })}
          </div>

          <div className="col-span-12 bg-stone-900 text-stone-50 p-8 rounded-3xl border border-stone-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Code2 size={18} />
              </div>
              <div>
                <h4 className="text-2xl font-semibold">開発環境・要件定義環境で使えるプラグイン</h4>
              </div>
            </div>
            <p className="text-stone-300 leading-relaxed">
              PersonaBankはあなたの開発環境・要件定義環境にプラグインとして導入できます。
              <br />普段お使いのCursor / VS Code / ChatGPT / Gemini / Claudeでの作業フローを変えずに、要件検討から設計、実装まで<br />
              ペルソナのフィードバックを横断的に取り込めます。
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section using Gemini API */}
      <section className="py-24 px-6 lg:px-10 bg-stone-800 text-stone-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="grid grid-cols-12 relative z-10">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <div className="text-center mb-12">
              <h2 className="text-sm font-bold text-emerald-400 tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
                <Sparkles size={16} /> Live Demo
              </h2>
              <h3 className="text-3xl md:text-4xl font-semibold mb-6">
                あなたのアイデアを、今すぐ試す。
              </h3>
              <p className="text-stone-400 text-lg leading-relaxed lg:px-20">
                作りたいサービスのアイデアを簡単に入力してみてください。<br />
                PerosonaBankから選ばれたペルソナが、忖度のないフィードバックを返します。
              </p>
            </div>

            <div className="bg-stone-900 p-2 rounded-3xl border border-stone-700 shadow-2xl">
              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-4 block">
                    Persona Blueprint (Demographic + Behavior)
                  </span>
                  <div className="space-y-5">
                    {segmentFilterSections.map((section) => (
                      <div key={section.title}>
                        <p className="text-xs font-semibold text-emerald-300 tracking-wider mb-2">{section.title}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                          {section.filters.map((segment) => (
                            <label key={segment.key} className="w-full">
                              <span className="text-xs font-medium text-stone-400 mb-1 block">{segment.label}</span>
                              <select
                                value={personaCriteria[segment.key]}
                                onChange={(e) => updatePersonaCriteria(segment.key, e.target.value)}
                                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              >
                                {segment.options.map((option) => (
                                  <option key={option} value={option} className="bg-stone-800 text-stone-100">
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <label htmlFor="idea" className="block text-sm font-medium text-stone-400 mb-3">サービスアイデア</label>
                <div className="relative">
                  <textarea
                    id="idea"
                    rows="3"
                    className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-6 py-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition-all"
                    placeholder="例：AIが毎日の冷蔵庫の残り物から、栄養バランスのとれた献立を提案してくれるアプリ。"
                    value={ideaInput}
                    onChange={(e) => setIdeaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        fetchPersonaReaction();
                      }
                    }}
                  ></textarea>
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className="text-xs text-stone-500 hidden md:inline-block">Cmd/Ctrl + Enter</span>
                    <button
                      onClick={fetchPersonaReaction}
                      disabled={isLoading || !ideaInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      <span className="font-medium pr-1 text-sm">✨ 判定する</span>
                    </button>
                  </div>
                </div>

                {/* Response Area */}
                <div className={`mt-8 transition-all duration-500 ${personaResponse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden'}`}>
                  <div className="border-t border-stone-700 pt-8">
                    <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-4 block">Feedback from synthetic user</span>

                    {personaResponse && (
                      <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 relative mt-4">
                        <div className="absolute -top-6 -left-2 md:-left-6 w-14 h-14 rounded-full border-4 border-stone-800 flex items-center justify-center overflow-hidden" style={{ backgroundColor: `#${personaResponse.avatarColor}` }}>
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${personaResponse.seedName}&backgroundColor=transparent`} alt="Persona Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="pl-8 md:pl-10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-emerald-100">{personaResponse.personaName}</span>
                            <span className="text-xs px-2 py-1 rounded bg-emerald-900/50 text-emerald-300">Generated by Gemini</span>
                          </div>
                          <p className="text-stone-300 leading-relaxed">「{personaResponse.comment}」</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-10 relative overflow-hidden bg-stone-900 text-stone-50 text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="grid grid-cols-12 relative z-10">
          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">ニーズのない開発を、今日で終わりに。</h2>
            <p className="text-stone-400 text-lg mb-12">
              PersonaBankは現在、クローズドベータとして選ばれた開発チームへ先行提供しています。<br />あなたのエディタに、ユーザーの声を宿しませんか？
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={openPluginPage}
                className="bg-emerald-600 text-stone-50 px-8 py-4 rounded-full font-medium hover:bg-emerald-500 transition-all"
              >
                プラグインを連携する
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-50 py-12 px-6 lg:px-10 border-t border-stone-200 text-stone-500 text-sm">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-12 md:col-span-3 flex items-center gap-2 font-medium text-stone-700">
            <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-stone-50 font-serif italic text-xs">P</div>
            PersonaBank
          </div>
          <div className="col-span-12 md:col-span-5 flex gap-6 justify-center">
            <a href="#" className="hover:text-stone-800 transition-colors">Vision</a>
            <a href="#" className="hover:text-stone-800 transition-colors">Privacy</a>
            <a href="#" className="hover:text-stone-800 transition-colors">Twitter</a>
          </div>
          <div className="col-span-12 md:col-span-4 text-center md:text-right">© 2026 PersonaBank. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
}
