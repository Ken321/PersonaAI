"""
デフォルトペルソナ定義（5人）

旧 PERSONA_SEEDS（PluginConnectPage.jsx）から移植した仮データ。
user_id = NULL のグローバルデフォルトとして DB に1回だけ投入する。
ユーザーがカスタムペルソナを生成するまでの代替として使用。
"""

from app.models.persona import RegionType

DEFAULT_PERSONA_TEMPLATES = [
    # 1: 美雪 — 28歳・経理・慎重派
    {
        "name": "美雪",
        "display_name": "美雪（28歳・経理）",
        "one_line_summary": "業務効率と手戻り削減を重視する慎重派の経理担当。時短志向で実用的",
        "country": "日本",
        "age": 28,
        "gender": "女性",
        "city": "東京都",
        "prefecture": "東京都",
        "occupation": "経理",
        "interests": "業務効率化ツール、家計管理、読書",
        "region_type": RegionType.METRO,
        "narrative": (
            "東京都内の中堅企業で経理を担当する28歳。慎重・時短志向・実用重視がモットーで、"
            "業務の手戻りを減らし短時間で成果を出せることを最も重視している。"
            "ITリテラシーは中程度で、新しいツールへの参入ハードルには敏感。"
            "初期設定が複雑だと利用開始前に離脱しやすく、最初にサンプルや結果の見通しを"
            "示してもらえると安心して前に進める。一度設定すれば自動で回る仕組みを好み、"
            "週1回の確認程度で運用できる安定性を求めている。"
            "承認ステップがあることで「AIに勝手に動かれる」不安を解消できる。"
        ),
        "occupation_category": "会社員",
        "info_style": "news_app",
        "ad_attitude": "neutral",
        "disposable_income": "medium",
        "sns_activity": "low",
        "generated_by": "default",
    },
    # 2: 拓也 — 33歳・バックエンドエンジニア・合理的
    {
        "name": "拓也",
        "display_name": "拓也（33歳・エンジニア）",
        "one_line_summary": "透明性と再現性を重視する合理的なバックエンドエンジニア",
        "country": "日本",
        "age": 33,
        "gender": "男性",
        "city": "渋谷区",
        "prefecture": "東京都",
        "occupation": "バックエンドエンジニア",
        "interests": "技術ブログ、OSS、アーキテクチャ設計、ジム",
        "region_type": RegionType.METRO,
        "narrative": (
            "東京・渋谷区のITベンチャーでバックエンドエンジニアとして働く33歳。"
            "合理的・検証重視・再現性重視が行動原則で、権限や挙動が透明であること、"
            "失敗時にも復旧しやすい設計を強く好む。"
            "ブラックボックスな推論結果は信頼できないという立場で、ロジックの根拠と"
            "実行ログを常に確認したい。自動投稿失敗時のリカバリー設計が先に見えないと"
            "導入を躊躇する。既存の分析ツールとAPIで連携できるかどうかを重視しており、"
            "技術的な品質と透明性がすべての判断基準になっている。"
        ),
        "occupation_category": "会社員",
        "info_style": "news_app",
        "ad_attitude": "skeptical",
        "disposable_income": "medium",
        "sns_activity": "low",
        "generated_by": "default",
    },
    # 3: 凛 — 22歳・大学生・探究心
    {
        "name": "凛",
        "display_name": "凛（22歳・大学生）",
        "one_line_summary": "直感重視で探究心旺盛な大学生。難解な専門用語なしに試せることを重視",
        "country": "日本",
        "age": 22,
        "gender": "女性",
        "city": "目黒区",
        "prefecture": "東京都",
        "occupation": "大学生",
        "interests": "SNS、カフェ巡り、写真、トレンドチェック",
        "region_type": RegionType.METRO,
        "narrative": (
            "都内の大学に通う22歳。探究心があり直感を大切にするタイプで、"
            "学習しながら触れるチュートリアルやサンプルを重視している。"
            "空画面で次の行動が分からないと挫折しやすく、難解な専門用語が多いと"
            "最初の一歩が踏み出せない。ステップごとの案内があれば迷わず進める。"
            "最初にサンプルや完成イメージを見せてもらえると、どんなものが作れるか"
            "すぐに把握でき、安心して試すことができる。AIが承認なしに勝手に投稿しない"
            "ことへの安心感も、継続利用のカギになっている。"
        ),
        "occupation_category": "学生",
        "info_style": "sns",
        "ad_attitude": "neutral",
        "disposable_income": "low",
        "sns_activity": "high",
        "generated_by": "default",
    },
    # 4: 陽子 — 52歳・看護師・安全志向
    {
        "name": "陽子",
        "display_name": "陽子（52歳・看護師）",
        "one_line_summary": "安定性と安全性を最優先する現場重視の看護師。短時間で迷わず使えることが条件",
        "country": "日本",
        "age": 52,
        "gender": "女性",
        "city": "さいたま市",
        "prefecture": "埼玉県",
        "occupation": "看護師",
        "interests": "健康情報、家庭菜園、地域の集まり",
        "region_type": RegionType.METRO,
        "narrative": (
            "埼玉県在住の52歳看護師。堅実・安全志向・現場優先の価値観を持ち、"
            "短時間で迷わず操作できる安定性を最も重視している。"
            "毎回同じ場所に同じ操作があることへの安心感が強く、確認が不足している"
            "操作には不安を感じて使えない。副業として活用したいが設定が難しいと"
            "最初の一歩が踏み出せない。自動で動いてくれる仕組みは仕事との両立に魅力的だが、"
            "何かあった時にすぐ投稿を止められるボタンがないと信頼して任せられない。"
            "ITリテラシーは低めで、シンプルさと明示的な確認フローが使い続ける条件になっている。"
        ),
        "occupation_category": "会社員",
        "info_style": "traditional_media",
        "ad_attitude": "neutral",
        "disposable_income": "medium",
        "sns_activity": "low",
        "generated_by": "default",
    },
    # 5: 蒼 — 27歳・SaaS営業・成果志向
    {
        "name": "蒼",
        "display_name": "蒼（27歳・SaaS営業）",
        "one_line_summary": "導入メリットの早期可視化を求める成果志向のSaaS営業担当",
        "country": "日本",
        "age": 27,
        "gender": "男性",
        "city": "新宿区",
        "prefecture": "東京都",
        "occupation": "SaaS営業",
        "interests": "ビジネス書、業界ニュース、ゴルフ、テニス",
        "region_type": RegionType.METRO,
        "narrative": (
            "東京・新宿区のSaaS企業に勤める27歳営業担当。成果志向・説明力重視・スピード重視が特徴で、"
            "導入メリットが早く可視化されることを最も重視している。"
            "顧客や上司への提案に使える具体的なデータや数値が出るまでが遅いと、"
            "提案機会を逃してしまうという焦りを感じている。"
            "どのセグメントへのアプローチが最もコンバージョンに貢献するか比較データが欲しく、"
            "社内説明に使えるレポート出力機能があると导入がスムーズになる。"
            "SEO効果の数値が見えることで顧客へのアプローチ数増加を説明しやすくなる。"
        ),
        "occupation_category": "会社員",
        "info_style": "news_app",
        "ad_attitude": "positive",
        "disposable_income": "medium",
        "sns_activity": "medium",
        "generated_by": "default",
    },
]
