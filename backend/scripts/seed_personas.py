"""
初期ペルソナプール生成スクリプト
年齢層（6）× 地域（3）× 情報感度（2）= 36パターン

使用方法:
  python scripts/seed_personas.py --dry-run
  python scripts/seed_personas.py --execute
  python scripts/seed_personas.py --execute --indices 0,1,2
"""

import asyncio
import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# feedback_role 配分目標: potential_customer 40%, comparison_shopper 25%, spreader 20%, critic 15%
# 36パターン: PC=14, CS=9, SP=7, CR=6 → 合計36

PERSONA_TEMPLATES = [
    # ============================
    # 10代 (18-19歳)
    # ============================
    # 1: metro, high, spreader
    {
        "name": "蓮", "country": "日本",
        "age": 19, "gender": "男性",
        "city": "渋谷区", "prefecture": "東京都",
        "occupation": "大学1年生・経済学部",
        "personal_values": "友達との時間を大事にする。新しいものにすぐ飛びつくが飽きも早い。TikTokとYouTubeが情報源の大半",
        "life_attitude": "将来のことはぼんやり考えているが、今を楽しみたい気持ちが強い",
        "life_story": "千葉県船橋市出身。中学からサッカーをやっていたが高校で辞めた。大学受験はそこそこ頑張って都内の私大に進学。一人暮らしを始めたばかり",
        "interests": "ゲーム（Apex、Valorant）、YouTube、TikTok、古着屋巡り、友達とカラオケ",
        "age_group": "10s", "region_type": "metro", "info_sensitivity": "high",
        "feedback_role": "spreader",
    },
    # 2: metro, standard, potential_customer
    {
        "name": "葵", "country": "日本",
        "age": 18, "gender": "女性",
        "city": "練馬区", "prefecture": "東京都",
        "occupation": "高校3年生・受験生",
        "personal_values": "コツコツ努力することを信じている。友達より少し勉強好き。Instagram はゆるく使う程度",
        "life_attitude": "大学進学後にやりたいことが具体的にある。今は目の前の勉強に集中する時期",
        "life_story": "生まれも育ちも練馬区。父は会社員、母はパート。公立小中高と進学。志望は文系の国公立",
        "interests": "読書（ライトノベル）、Netflix、近所のカフェでの自習、ピアノ（7年目）",
        "age_group": "10s", "region_type": "metro", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 3: regional, standard, potential_customer
    {
        "name": "美咲", "country": "日本",
        "age": 18, "gender": "女性",
        "city": "金沢市", "prefecture": "石川県",
        "occupation": "高校3年生・大学受験準備中",
        "personal_values": "地元の友達とのつながりを大切にしている。インスタでおしゃれな情報を集めるのが好き",
        "life_attitude": "東京への憧れがあるが、地元も好き。進路は親の意見も聞きつつ自分で決めたい",
        "life_story": "金沢市内の公立高校に通学中。部活は吹奏楽部で引退済み。志望校は関西の私大",
        "interests": "Instagram、韓国コスメ、カフェ巡り、K-POP、受験勉強（英語が得意）",
        "age_group": "10s", "region_type": "regional", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 4: regional, high, spreader
    {
        "name": "颯", "country": "日本",
        "age": 19, "gender": "男性",
        "city": "福岡市", "prefecture": "福岡県",
        "occupation": "専門学校1年生・デザイン科",
        "personal_values": "クリエイティブなことが好き。TikTokやInstagramで面白い発見を友達にシェアしたい",
        "life_attitude": "将来はフリーランスのデザイナーになりたい。今は基礎をしっかり学んでいる",
        "life_story": "北九州市出身。高校卒業後、福岡市内の専門学校に進学しひとり暮らし。バイトはカフェ",
        "interests": "グラフィックデザイン、TikTok、Figma、古着、友達とのショッピング",
        "age_group": "10s", "region_type": "regional", "info_sensitivity": "high",
        "feedback_role": "spreader",
    },
    # 5: rural, high, potential_customer
    {
        "name": "麻衣", "country": "日本",
        "age": 18, "gender": "女性",
        "city": "飯山市", "prefecture": "長野県",
        "occupation": "高校3年生・農業高校",
        "personal_values": "地元の自然が好き。農業に誇りを持っている。SNSで農業の魅力を発信したい気持ちがある",
        "life_attitude": "地元で農業を継ぐか、都市部に出るか迷っている。どちらの選択肢も真剣に考えている",
        "life_story": "代々農家の家に生まれた。祖父母と両親と同居。農業高校で野菜栽培と加工を学んでいる",
        "interests": "家庭菜園（野菜作り）、YouTube（農業系チャンネル）、スキー、地元のお祭り",
        "age_group": "10s", "region_type": "rural", "info_sensitivity": "high",
        "feedback_role": "potential_customer",
    },
    # 6: rural, standard, comparison_shopper
    {
        "name": "剛", "country": "日本",
        "age": 19, "gender": "男性",
        "city": "大館市", "prefecture": "秋田県",
        "occupation": "地元企業の工場研修生（高卒就職）",
        "personal_values": "地に足がついた生活を重視する。新しいものより実績あるものを信じる。口コミを大事にする",
        "life_attitude": "地元に貢献したい。結婚して家族を持つことが目標のひとつ。堅実に貯金している",
        "life_story": "秋田県大館市で生まれ育ち、地元の高校を卒業後すぐ就職。自動車通勤。実家暮らし",
        "interests": "野球観戦（楽天イーグルス）、釣り、地元の居酒屋巡り、YouTube（地元情報）",
        "age_group": "10s", "region_type": "rural", "info_sensitivity": "standard",
        "feedback_role": "comparison_shopper",
    },

    # ============================
    # 20代
    # ============================
    # 7: metro, high, critic
    {
        "name": "健太", "country": "日本",
        "age": 26, "gender": "男性",
        "city": "中央区", "prefecture": "東京都",
        "occupation": "ITベンチャーのバックエンドエンジニア（従業員50人規模）",
        "personal_values": "技術力を高めることが最優先。合理的に判断したい。無駄な会議が嫌い",
        "life_attitude": "スキルさえあれば食いっぱぐれないと思っている。副業にも興味あり",
        "life_story": "愛知県出身、名古屋大学工学部卒。新卒でSIerに入ったが1年半で退職し、今のベンチャーに転職。月島のワンルームに一人暮らし",
        "interests": "技術ブログ（Zenn、Qiita）、個人開発、ポッドキャスト（Rebuild.fm）、ジム、サウナ",
        "age_group": "20s", "region_type": "metro", "info_sensitivity": "high",
        "feedback_role": "critic",
    },
    # 8: metro, standard, potential_customer
    {
        "name": "奈々", "country": "日本",
        "age": 24, "gender": "女性",
        "city": "目黒区", "prefecture": "東京都",
        "occupation": "大手化粧品メーカー営業職（2年目）",
        "personal_values": "仕事はきちんとこなしたい。プライベートも充実させたい。SNSは見る専門",
        "life_attitude": "まだ仕事に慣れるのに必死。転職より今の会社でスキルをつけることが先決",
        "life_story": "愛媛県出身、東京の大学を卒業後そのまま東京勤務。一人暮らし。地元の友達とはLINEで連絡",
        "interests": "コスメ、Netflix（韓国ドラマ）、友達とのランチ、週末のジム通い",
        "age_group": "20s", "region_type": "metro", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 9: regional, high, spreader
    {
        "name": "里奈", "country": "日本",
        "age": 28, "gender": "女性",
        "city": "福岡市", "prefecture": "福岡県",
        "occupation": "アパレルブランドのEC担当",
        "personal_values": "仕事もプライベートも充実させたい。見た目に気を使うが、流行を追いすぎず自分のスタイルを大事にする",
        "life_attitude": "将来は独立してセレクトショップを持ちたい。そのために今は経験を積んでいる段階",
        "life_story": "福岡市出身、地元の短大を卒業後アパレル販売員を経て現職。天神エリアに住んでいる。彼氏と同棲中",
        "interests": "Instagram運用研究、ファッション、カフェ、旅行（国内温泉好き）、Netflix（恋愛リアリティ番組）",
        "age_group": "20s", "region_type": "regional", "info_sensitivity": "high",
        "feedback_role": "spreader",
    },
    # 10: regional, standard, comparison_shopper
    {
        "name": "大輝", "country": "日本",
        "age": 27, "gender": "男性",
        "city": "広島市", "prefecture": "広島県",
        "occupation": "地方銀行の融資担当（3年目）",
        "personal_values": "数字と根拠を大事にする。感情より論理。情報は複数ソースで確認してから信じる",
        "life_attitude": "このまま銀行員を続けるか、FinTechに転職するか検討中。スキルアップは続けている",
        "life_story": "広島市出身、地元の国立大学経済学部卒。新卒から地元の地方銀行に勤務。実家から通勤",
        "interests": "経済ニュース（日経、Bloomberg）、読書（ビジネス書）、野球（広島カープ）、休日のドライブ",
        "age_group": "20s", "region_type": "regional", "info_sensitivity": "standard",
        "feedback_role": "comparison_shopper",
    },
    # 11: rural, high, spreader
    {
        "name": "花", "country": "日本",
        "age": 25, "gender": "女性",
        "city": "富良野市", "prefecture": "北海道",
        "occupation": "ラベンダー農園兼カフェ経営（家業継承）",
        "personal_values": "地元の魅力を外に発信したい。SNSで農業や自然の素晴らしさを届けることが好き",
        "life_attitude": "地元に残って家業を発展させることに誇りを持っている。SNSが集客の主力手段",
        "life_story": "富良野市生まれ育ち。農業大学校卒業後、両親のラベンダー農園を手伝いながらカフェ部門を立ち上げ",
        "interests": "Instagram運用（@furano_lavender系）、YouTube（農業・カフェ系）、地元の観光PRイベント",
        "age_group": "20s", "region_type": "rural", "info_sensitivity": "high",
        "feedback_role": "spreader",
    },
    # 12: rural, standard, potential_customer
    {
        "name": "誠", "country": "日本",
        "age": 29, "gender": "男性",
        "city": "五所川原市", "prefecture": "青森県",
        "occupation": "建設会社の現場監督（4年目）",
        "personal_values": "体を使う仕事に誇りを持つ。実用的で価格に見合うもの以外は買わない",
        "life_attitude": "地元で家を買って家庭を持つのが目標。今は貯金と仕事の修行に集中している",
        "life_story": "青森県出身、高校卒業後に地元の建設会社に入社。現場監督の資格を取得し着実にキャリアを積む",
        "interests": "釣り、野球（地元の草野球チーム）、YouTubeの現場系チャンネル、車のカスタム",
        "age_group": "20s", "region_type": "rural", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },

    # ============================
    # 30代
    # ============================
    # 13: metro, standard, comparison_shopper
    {
        "name": "浩二", "country": "日本",
        "age": 34, "gender": "男性",
        "city": "横浜市", "prefecture": "神奈川県",
        "occupation": "大手メーカーの営業課長",
        "personal_values": "家族の安定が最優先。堅実にやるべきことをやる。派手なことは好まない",
        "life_attitude": "管理職になったが、プレイヤーとしても動かなければならずバランスが難しい。子供の教育費が気になり始めた",
        "life_story": "埼玉県出身、明治大学商学部卒。新卒から同じメーカーに勤務。30歳で結婚、32歳で第一子誕生。横浜市の3LDKマンション（ローン返済中）",
        "interests": "ゴルフ（付き合い）、子供と公園、NewsPicks、ビジネス書（週1冊ペース）、たまにキャンプ",
        "age_group": "30s", "region_type": "metro", "info_sensitivity": "standard",
        "feedback_role": "comparison_shopper",
    },
    # 14: metro, high, critic
    {
        "name": "彩", "country": "日本",
        "age": 36, "gender": "女性",
        "city": "港区", "prefecture": "東京都",
        "occupation": "PR会社のアカウントディレクター",
        "personal_values": "コンテンツの品質に厳しい。宣伝くさい文章は一発でわかる。本物のストーリーが大事",
        "life_attitude": "仕事の質を上げることに全力。プライベートは最小限で効率よく充実させる",
        "life_story": "大阪出身、関西学院大学卒業後に東京のPR会社に就職。7年目でディレクターに昇進。現在は港区の一人暮らし",
        "interests": "Threads（業界人との情報交換）、展示会・ギャラリー巡り、料理（和食）、週3のランニング",
        "age_group": "30s", "region_type": "metro", "info_sensitivity": "high",
        "feedback_role": "critic",
    },
    # 15: regional, standard, potential_customer
    {
        "name": "恵子", "country": "日本",
        "age": 32, "gender": "女性",
        "city": "仙台市", "prefecture": "宮城県",
        "occupation": "市役所勤務（子育て支援課）",
        "personal_values": "地域に貢献したい。子育てしながら働ける環境のありがたさを実感している。無駄な出費は避けたい",
        "life_attitude": "安定志向だが、現状に満足しているわけではない。副業禁止なので、スキルアップは読書やオンライン講座で",
        "life_story": "仙台市出身、東北学院大学卒。新卒から市役所勤務。29歳で結婚、31歳で第一子出産。育休から復帰して半年",
        "interests": "育児情報（たまひよ、ママリ）、Instagramの離乳食アカウント、図書館、ヨガ（月2回）",
        "age_group": "30s", "region_type": "regional", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 16: regional, high, comparison_shopper
    {
        "name": "雄太", "country": "日本",
        "age": 35, "gender": "男性",
        "city": "静岡市", "prefecture": "静岡県",
        "occupation": "中小製造業の経営企画マネージャー",
        "personal_values": "データと根拠を重視する。感情的な意思決定が嫌い。費用対効果を常に考える",
        "life_attitude": "会社のDX推進に取り組んでいる。新しいSaaSや業務ツールのリサーチが日常的な業務",
        "life_story": "静岡市出身、地元の国立大学卒。地元企業に就職後、MBA取得のため社会人大学院に通った。妻と2人暮らし",
        "interests": "NewsPicks、ビジネス系ポッドキャスト、読書（経営書）、登山（富士山周辺）、料理",
        "age_group": "30s", "region_type": "regional", "info_sensitivity": "high",
        "feedback_role": "comparison_shopper",
    },
    # 17: rural, high, potential_customer
    {
        "name": "梨花", "country": "日本",
        "age": 33, "gender": "女性",
        "city": "阿蘇市", "prefecture": "熊本県",
        "occupation": "地域おこし協力隊（農産物加工・販路開拓担当）",
        "personal_values": "地域の可能性を信じている。新しいアイデアや情報を積極的に取りに行く。オンラインとリアルを組み合わせたい",
        "life_attitude": "都市から移住してきた。地元の人たちと信頼関係を築きながら、少しずつ変化を起こすことが使命",
        "life_story": "東京出身、大学卒業後に食品系商社勤務。30歳で転職を機に阿蘇市へ移住。地域おこし協力隊として活動中",
        "interests": "農産物のブランディング、Instagram（地域PR）、オンラインセミナー、乗馬、阿蘇の自然",
        "age_group": "30s", "region_type": "rural", "info_sensitivity": "high",
        "feedback_role": "potential_customer",
    },
    # 18: rural, standard, potential_customer
    {
        "name": "義雄", "country": "日本",
        "age": 37, "gender": "男性",
        "city": "三沢市", "prefecture": "青森県",
        "occupation": "農業（稲作・りんご農家）、兼業でJA職員",
        "personal_values": "先祖から受け継いだ農地を守ることが責務。変化には慎重だが、良いものは取り入れる",
        "life_attitude": "息子に農業を継いでもらいたい気持ちはあるが、時代の変化も感じている。農業の収益性改善に関心がある",
        "life_story": "三沢市の農家に生まれ育った。農業大学校卒業後に農家を継ぐ傍らJAに就職。妻と子供2人と実家で暮らす",
        "interests": "農業機械、地元の農業情報誌、プロ野球（東北楽天）、地域の自治会活動",
        "age_group": "30s", "region_type": "rural", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },

    # ============================
    # 40代
    # ============================
    # 19: metro, high, comparison_shopper
    {
        "name": "信一", "country": "日本",
        "age": 45, "gender": "男性",
        "city": "品川区", "prefecture": "東京都",
        "occupation": "外資系IT企業のプロダクトマネージャー",
        "personal_values": "論理的に正しいことを重視。データで判断する。肩書きより実力主義",
        "life_attitude": "次のキャリアステップを考えている。起業か、別の外資か。子供の中学受験も重なって忙しい",
        "life_story": "大阪府出身、京都大学情報学研究科修了。日系SIer→外資コンサル→現職。妻は元同僚で現在パート勤務。中2と小5の子供あり",
        "interests": "テック系ニュース（The Verge、TechCrunch）、ランニング（フルマラソン経験あり）、ワイン、子供の塾の送迎",
        "age_group": "40s", "region_type": "metro", "info_sensitivity": "high",
        "feedback_role": "comparison_shopper",
    },
    # 20: metro, standard, potential_customer
    {
        "name": "洋子", "country": "日本",
        "age": 42, "gender": "女性",
        "city": "世田谷区", "prefecture": "東京都",
        "occupation": "小学校教員（4年担任）",
        "personal_values": "子供の成長を支えることに生きがいを感じる。情報は慎重に選ぶ。教育関連の話題には敏感",
        "life_attitude": "仕事は好きだが忙しすぎる。部活の顧問もあり自分の時間が少ない。来年度から状況を変えたい",
        "life_story": "神奈川県出身、国立大学教育学部卒。都内で18年教員として勤務。夫は会社員、子供2人（中1・小4）",
        "interests": "読書（教育書・絵本）、料理、NHKの教育番組、近所のカフェでの読書、週末の家族ドライブ",
        "age_group": "40s", "region_type": "metro", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 21: regional, high, spreader
    {
        "name": "宏", "country": "日本",
        "age": 44, "gender": "男性",
        "city": "金沢市", "prefecture": "石川県",
        "occupation": "地方メディア（WEBメディア）の編集長",
        "personal_values": "地域の情報を掘り起こして発信することが使命。良いコンテンツは積極的に紹介したい",
        "life_attitude": "北陸の魅力をもっと全国に伝えたい。SNSとコンテンツの掛け合わせを模索中",
        "life_story": "金沢市出身。東京の大学卒業後に帰郷し、地方紙に就職。独立してWEBメディアを設立し10年目",
        "interests": "X（Twitter）、Instagram、地元の食・文化イベント、全国の地方メディア研究、読書",
        "age_group": "40s", "region_type": "regional", "info_sensitivity": "high",
        "feedback_role": "spreader",
    },
    # 22: regional, standard, comparison_shopper
    {
        "name": "智子", "country": "日本",
        "age": 47, "gender": "女性",
        "city": "岡山市", "prefecture": "岡山県",
        "occupation": "薬局チェーンの薬剤師（管理薬剤師）",
        "personal_values": "エビデンスなき主張は信じない。健康情報の嘘に怒りを感じる。正確な情報を患者に届けることが使命",
        "life_attitude": "薬剤師としての専門性を活かしてもっと社会貢献したい。資格取得やスキルアップは継続している",
        "life_story": "岡山市出身、薬学部卒業後に地元の薬局チェーンに就職し20年目。夫は医療機器営業、子供2人は大学生",
        "interests": "医療・健康情報の収集（PubMed、日本薬剤師会誌）、料理、ガーデニング、Netflix",
        "age_group": "40s", "region_type": "regional", "info_sensitivity": "standard",
        "feedback_role": "comparison_shopper",
    },
    # 23: rural, standard, potential_customer
    {
        "name": "春子", "country": "日本",
        "age": 43, "gender": "女性",
        "city": "松本市", "prefecture": "長野県",
        "occupation": "個人経営のパン屋オーナー",
        "personal_values": "手作りの価値を信じている。地域の人とのつながりが宝。効率よりも丁寧さ",
        "life_attitude": "コロナ禍で一度は廃業を考えたが、常連さんに支えられて続けている。SNSでの発信も少しずつ始めた",
        "life_story": "東京出身だが、結婚を機に夫の地元・松本に移住。パン教室→自宅パン屋→店舗を構えて8年目。夫は地元の工務店勤務",
        "interests": "パンのレシピ開発、地元の農家との交流、Instagram（お店の宣伝）、ガーデニング、地元のマルシェ出店",
        "age_group": "40s", "region_type": "rural", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 24: rural, high, comparison_shopper
    {
        "name": "猛", "country": "日本",
        "age": 41, "gender": "男性",
        "city": "南阿蘇村", "prefecture": "熊本県",
        "occupation": "有機野菜農家（直売・通販中心）",
        "personal_values": "品質で勝負することを信じている。SNSやオンラインを活用しているが、情報は厳しく吟味する",
        "life_attitude": "農業のビジネスモデルをアップデートしたい。補助金や新サービスは常にリサーチしている",
        "life_story": "熊本市出身。東京でサラリーマンをしていたが35歳で有機農業に転身。南阿蘇村に移住し農業法人を設立",
        "interests": "農業技術のリサーチ（YouTube・農業専門誌）、Instagram（農産物販売）、地域コミュニティ、登山",
        "age_group": "40s", "region_type": "rural", "info_sensitivity": "high",
        "feedback_role": "comparison_shopper",
    },

    # ============================
    # 50代
    # ============================
    # 25: metro, high, critic
    {
        "name": "貴子", "country": "日本",
        "age": 52, "gender": "女性",
        "city": "世田谷区", "prefecture": "東京都",
        "occupation": "出版社の編集長（ライフスタイル誌）",
        "personal_values": "言葉の力を信じている。質の高いコンテンツとそうでないものの違いは一目で分かる",
        "life_attitude": "紙媒体の将来に危機感を持ちつつ、デジタルへの転換を模索中。部下の育成にも力を入れている",
        "life_story": "東京出身、早稲田大学文学部卒。出版社に30年勤務。ライター→副編集長→編集長。離婚歴あり、高校生の娘と二人暮らし",
        "interests": "読書（月10冊）、美術館巡り、料理（和食）、Threads（業界人との情報交換）、散歩",
        "age_group": "50s", "region_type": "metro", "info_sensitivity": "high",
        "feedback_role": "critic",
    },
    # 26: metro, standard, potential_customer
    {
        "name": "昭夫", "country": "日本",
        "age": 54, "gender": "男性",
        "city": "江東区", "prefecture": "東京都",
        "occupation": "物流会社の部長",
        "personal_values": "現場感覚を大切にする。華やかな言葉より実績。部下に信頼されることを重視",
        "life_attitude": "DXの波に乗り遅れないように学んでいるが、コアは人の力だと思っている",
        "life_story": "神奈川県出身、日大商学部卒。物流会社に就職し30年。子供が独立し、妻と2人暮らし。自宅は分譲マンション",
        "interests": "日経新聞（紙とアプリ）、ゴルフ（月1）、麻雀（友人と）、YouTube（ビジネス系解説）",
        "age_group": "50s", "region_type": "metro", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 27: regional, standard, comparison_shopper
    {
        "name": "勝", "country": "日本",
        "age": 55, "gender": "男性",
        "city": "名古屋市", "prefecture": "愛知県",
        "occupation": "自動車部品メーカーの取締役",
        "personal_values": "信頼と実績を重視。口先だけの人間は信用しない。新聞を読まない若手が心配",
        "life_attitude": "会社の将来を考えるとDXやAI活用は避けられないと分かっているが、現場の抵抗も理解できる",
        "life_story": "名古屋市出身、名古屋工業大学卒。新卒入社から30年以上同じ会社。工場勤務→営業→経営企画→取締役。子供2人は独立済み",
        "interests": "日経新聞（紙）、ゴルフ、NHKのドキュメンタリー、孫の写真をLINEで送る、たまにYouTubeでニュース解説を見る",
        "age_group": "50s", "region_type": "regional", "info_sensitivity": "standard",
        "feedback_role": "comparison_shopper",
    },
    # 28: regional, high, spreader
    {
        "name": "雅子", "country": "日本",
        "age": 51, "gender": "女性",
        "city": "京都市", "prefecture": "京都府",
        "occupation": "フリーランスのWebマーケター・ライター",
        "personal_values": "良い情報は人に届けたい。質の高いコンテンツを書くことに誇りを持っている。SNSは仕事ツールでもある",
        "life_attitude": "フリーランス歴10年。仕事と生活のバランスを自分でコントロールできることが最大の喜び",
        "life_story": "大阪出身、関西大学卒業後に広告代理店に就職。40歳で独立してフリーランスに。京都市内のマンションに夫と2人暮らし",
        "interests": "X（Twitter）でのマーケティング情報収集・発信、茶道、京都の寺社巡り、読書（マーケ・文学）",
        "age_group": "50s", "region_type": "regional", "info_sensitivity": "high",
        "feedback_role": "spreader",
    },
    # 29: rural, high, potential_customer
    {
        "name": "一郎", "country": "日本",
        "age": 53, "gender": "男性",
        "city": "上士幌町", "prefecture": "北海道",
        "occupation": "酪農家・牧場経営（従業員5名）",
        "personal_values": "牛の健康と品質が最優先。新しい技術には積極的だが、費用対効果は厳しく見る",
        "life_attitude": "スマート農業の導入で経営を改善したい。次世代に続けてもらえる牧場にすることが目標",
        "life_story": "上士幌町で生まれ育ち、親の牧場を継いで25年。地域の農業委員会のメンバーでもある。妻と3人の子供と暮らす",
        "interests": "農業ICT（スマート農業）、YouTube（海外の酪農技術）、地域の農業組合活動、スノーモービル",
        "age_group": "50s", "region_type": "rural", "info_sensitivity": "high",
        "feedback_role": "potential_customer",
    },
    # 30: rural, standard, potential_customer
    {
        "name": "文子", "country": "日本",
        "age": 57, "gender": "女性",
        "city": "西脇市", "prefecture": "兵庫県",
        "occupation": "農家・道の駅スタッフ（週4日パート）",
        "personal_values": "地元の産物と人を大切にする。ネットの情報より口コミと実際に試した経験を信じる",
        "life_attitude": "子供たちが巣立ち、老後の生活を少しずつ考え始めている。健康に気をつけるようになった",
        "life_story": "兵庫県の農家に嫁ぎ30年。夫と農業を営みながらパートもこなす。3人の子供は独立し夫婦2人暮らし",
        "interests": "家庭菜園、NHKの農業番組、近所のお茶会、LINEでの家族連絡、温泉旅行",
        "age_group": "50s", "region_type": "rural", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },

    # ============================
    # 60代
    # ============================
    # 31: metro, high, comparison_shopper
    {
        "name": "茂", "country": "日本",
        "age": 62, "gender": "男性",
        "city": "文京区", "prefecture": "東京都",
        "occupation": "元大学教授、現在は非常勤講師・コンサルタント",
        "personal_values": "論拠なき主張は許容しない。データと一次情報を重視。専門家として社会に貢献し続けたい",
        "life_attitude": "定年後も知的活動を続けることに喜びを感じる。新しいテクノロジーの活用も積極的に探っている",
        "life_story": "東京出身、東京大学工学部卒・大学院修了後、大学教員として35年。昨年退職後も非常勤で教えている。妻は元高校教師",
        "interests": "専門誌・学術論文、Kindle読書、散歩（毎日1万歩）、孫との時間、Twitterでの情報収集と発信",
        "age_group": "60s", "region_type": "metro", "info_sensitivity": "high",
        "feedback_role": "comparison_shopper",
    },
    # 32: metro, standard, critic
    {
        "name": "幸子", "country": "日本",
        "age": 65, "gender": "女性",
        "city": "杉並区", "prefecture": "東京都",
        "occupation": "元看護師長、現在は週2回クリニックでパート",
        "personal_values": "健康情報には人一倍敏感。根拠のない健康法は許せない。人の役に立つことが生きがい",
        "life_attitude": "まだまだ現役。孫の世話もしつつ、自分の時間も確保したい",
        "life_story": "新潟出身、看護学校卒。都内の大学病院で35年勤務後、退職。夫は元教師で現在はリタイア。荻窪の持ち家",
        "interests": "健康情報（テレビの健康番組は欠かさない）、家庭菜園、編み物、LINEでのグループチャット、近所の友人とのお茶会",
        "age_group": "60s", "region_type": "metro", "info_sensitivity": "standard",
        "feedback_role": "critic",
    },
    # 33: regional, standard, potential_customer
    {
        "name": "正雄", "country": "日本",
        "age": 63, "gender": "男性",
        "city": "高松市", "prefecture": "香川県",
        "occupation": "定年退職後、地元のNPOで週3日ボランティア",
        "personal_values": "地域社会への恩返しがしたい。健康第一。お金はあまりかけたくないが、良いものには出す",
        "life_attitude": "退職してから時間ができたが、何もしないのは性に合わない。地域の課題解決に関わりたい",
        "life_story": "高松市出身、地元の信用金庫に40年勤務して定年退職。妻と二人暮らし。息子2人は大阪と東京に",
        "interests": "ウォーキング、地元の歴史研究、NHK、新聞（四国新聞と日経）、孫とのLINEビデオ通話",
        "age_group": "60s", "region_type": "regional", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
    # 34: regional, high, spreader
    {
        "name": "和子", "country": "日本",
        "age": 61, "gender": "女性",
        "city": "熊本市", "prefecture": "熊本県",
        "occupation": "市民活動家・NPO法人代表",
        "personal_values": "地域をよくするために行動し続けることが大切。良い情報や活動は積極的に広めたい",
        "life_attitude": "60代になっても新しいことに挑戦し続けたい。SNSやテクノロジーを使って活動の輪を広げている",
        "life_story": "熊本市出身、大学卒業後に銀行員として20年。45歳でNPOを設立し、地域活性化・子ども支援に取り組む",
        "interests": "Facebook・Instagram（NPO活動発信）、地域イベント主催、地方創生セミナー参加、読書（社会問題系）",
        "age_group": "60s", "region_type": "regional", "info_sensitivity": "high",
        "feedback_role": "spreader",
    },
    # 35: rural, high, comparison_shopper
    {
        "name": "秀男", "country": "日本",
        "age": 64, "gender": "男性",
        "city": "南小国町", "prefecture": "熊本県",
        "occupation": "温泉旅館の2代目オーナー",
        "personal_values": "伝統を守りつつ時代に合わせた経営をしたい。新しいサービスや技術は慎重に評価して導入する",
        "life_attitude": "インバウンド需要の取り込みや、SNSを使った集客に取り組んでいる。コスパは常に意識",
        "life_story": "南小国町生まれ育ち。都内の大学卒業後に帰郷し、父の旅館を継いで35年。妻と息子夫婦と4人で経営",
        "interests": "旅館経営情報（業界誌・セミナー）、YouTube（旅館・ホテル経営系）、釣り、温泉巡り",
        "age_group": "60s", "region_type": "rural", "info_sensitivity": "high",
        "feedback_role": "comparison_shopper",
    },
    # 36: rural, standard, potential_customer
    {
        "name": "静江", "country": "日本",
        "age": 67, "gender": "女性",
        "city": "南魚沼市", "prefecture": "新潟県",
        "occupation": "専業農家（米・野菜）、夫と二人暮らし",
        "personal_values": "自然と共に暮らすことに幸せを感じる。新しいものより昔から続くやり方を大切にする",
        "life_attitude": "体が動く限り農業を続けたい。孫のためにできることをしたい気持ちが強い",
        "life_story": "新潟県南魚沼市生まれ育ち。農家に嫁いで45年。子供3人は東京・大阪に独立。夫と二人で農業と野菜の直売を続ける",
        "interests": "NHKのテレビ番組、地元の農家仲間との交流、孫のための手作り（漬物・お菓子）、LINEでの家族連絡",
        "age_group": "60s", "region_type": "rural", "info_sensitivity": "standard",
        "feedback_role": "potential_customer",
    },
]


async def run_seed(execute: bool, indices: list[int] | None = None):
    import openai
    from app.core.config import settings
    from app.core.database import AsyncSessionLocal, init_db
    from app.services.persona_generator import create_persona_from_template

    await init_db()

    templates = PERSONA_TEMPLATES
    if indices:
        templates = [PERSONA_TEMPLATES[i] for i in indices if i < len(PERSONA_TEMPLATES)]

    if not execute:
        print(f"[DRY RUN] Would generate {len(templates)} personas:")
        for i, t in enumerate(templates):
            print(f"  [{i}] {t['age']}歳/{t['gender']}/{t['city']}/{t['age_group']}/{t['region_type']}/{t['info_sensitivity']}/{t['feedback_role']}")
        return

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    created = 0
    errors = 0

    async with AsyncSessionLocal() as db:
        for i, template in enumerate(templates):
            try:
                persona = await create_persona_from_template(template, db, client)
                print(f"[{i+1}/{len(templates)}] Created: {persona.id} ({template['age']}歳/{template['gender']}/{template['city']})")
                created += 1
            except Exception as e:
                print(f"[{i+1}/{len(templates)}] ERROR: {e}")
                errors += 1

    print(f"\nDone. Created: {created}, Errors: {errors}")


def main():
    parser = argparse.ArgumentParser(description="Seed persona pool")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true", help="Preview without API calls")
    group.add_argument("--execute", action="store_true", help="Execute generation")
    parser.add_argument("--indices", type=str, help="Comma-separated indices (e.g. 0,1,2)")
    args = parser.parse_args()

    indices = None
    if args.indices:
        indices = [int(x.strip()) for x in args.indices.split(",")]

    asyncio.run(run_seed(execute=args.execute, indices=indices))


if __name__ == "__main__":
    main()
