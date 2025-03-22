// app/page.js
"use client";

import { useState, useEffect } from "react";

export default function TrendApp() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("general");
  const [trends, setTrends] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // カテゴリーリスト
  const categories = [
    { id: "general", name: "総合" },
    { id: "business", name: "ビジネス" },
    { id: "technology", name: "テクノロジー" },
    { id: "entertainment", name: "エンタメ" },
    { id: "health", name: "健康" },
    { id: "science", name: "科学" },
    { id: "sports", name: "スポーツ" },
  ];

  // モックニュースを生成する関数
  const generateMockNews = (selectedCategory, count = 5) => {
    const categoryMap = {
      general: "総合",
      business: "ビジネス",
      technology: "テクノロジー",
      entertainment: "エンタメ",
      health: "健康",
      science: "科学",
      sports: "スポーツ",
    };

    const localizedCategory = categoryMap[selectedCategory] || selectedCategory;

    return Array(count)
      .fill(0)
      .map((_, i) => ({
        id: `mock-${Date.now()}-${i}`,
        title: `${localizedCategory}に関する最新ニュース ${i + 1}`,
        description: "これはモックデータです。APIキーが設定されていないか、APIの呼び出し制限に達した可能性があります。",
        url: "#",
        urlToImage: null, // 画像なし
        publishedAt: new Date().toISOString(),
        source: { name: "モックニュース" },
      }));
  };

  // ニュースを取得する関数
  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      // GNews APIキーを確認
      const API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY || "YOUR_API_KEY";
      console.log("Using API Key:", API_KEY ? "キーが存在します" : "APIキーが設定されていません");

      // APIキーが未設定または無効な場合はモックデータを使用
      if (!API_KEY || API_KEY === "YOUR_API_KEY") {
        console.log("有効なAPIキーがないため、モックデータを使用します");
        const mockNews = generateMockNews(category);
        setNews(mockNews);
        return;
      }

      // GNews APIへのリクエスト
      // カテゴリとトピックのマッピング
      const topicMapping = {
        general: "world", // 総合は world トピックにマッピング
        business: "business",
        technology: "technology",
        entertainment: "entertainment",
        health: "health",
        science: "science",
        sports: "sports",
      };

      const topic = topicMapping[category] || "world";
      const url = `https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=ja&country=jp&max=10&apikey=${API_KEY}`;

      console.log("リクエストURL:", url);

      const response = await fetch(url);
      console.log("APIステータス:", response.status, response.statusText);

      const data = await response.json();
      console.log("APIレスポンス構造:", JSON.stringify(data, null, 2));

      // エラーレスポンスの確認
      if (data.errors) {
        throw new Error(`APIエラー: ${JSON.stringify(data.errors)}`);
      }

      // 記事があるか確認
      if (data.articles && data.articles.length > 0) {
        console.log("記事が見つかりました:", data.articles.length);

        // GNewsのレスポンス形式をアプリの形式に変換
        const formattedArticles = data.articles.map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.image,
          publishedAt: article.publishedAt,
          source: { name: article.source.name },
        }));

        setNews(formattedArticles);
      } else {
        console.log("記事が見つかりませんでした。モックデータを使用します");
        const mockNews = generateMockNews(category);
        setNews(mockNews);
      }
    } catch (err) {
      console.error("ニュース取得エラー:", err);
      setError("ニュースの取得中にエラーが発生しました: " + err.message);

      // エラー時はモックデータを使用
      const mockNews = generateMockNews(category);
      setNews(mockNews);
    } finally {
      setLoading(false);
    }
  };

  // Yahoo!リアルタイム検索からトレンドを取得する改良された関数
  const fetchTrends = async () => {
    setTrendLoading(true);

    try {
      // 自作のAPI RouteにGETリクエスト
      const response = await fetch("/api/trends");

      if (!response.ok) {
        throw new Error("トレンドの取得に失敗しました");
      }

      const data = await response.json();
      console.log("Yahooトレンドデータ:", data);

      if (!data || data.length === 0) {
        // データがない場合はモックデータを使用
        displayMockTrends();
        return;
      }

      // Yahoo!のトレンドデータをアプリの形式に変換
      const formattedTrends = data.map((item) => ({
        name: `#${item.word}`, // 先頭に#を付与
        tweet_volume: Math.floor(Math.random() * 50000) + 10000, // ボリュームはダミー
      }));

      setTrends(formattedTrends.slice(0, 5));
      console.log("Yahoo!リアルタイム検索からトレンドを取得しました");
    } catch (err) {
      console.error("トレンド取得エラー:", err);
      // エラー時はモックデータにフォールバック
      displayMockTrends();
    } finally {
      setTrendLoading(false);
    }
  };

  // モックトレンドデータを使用する関数（最新のトレンドで更新）
  const displayMockTrends = () => {
    const mockTrends = [
      { name: "#オレの司", tweet_volume: 87500 },
      { name: "#アカデミー飯", tweet_volume: 64300 },
      { name: "#引用元の消失", tweet_volume: 52800 },
      { name: "#明浦路先生", tweet_volume: 45200 },
      { name: "#田中樹アクターズスクール", tweet_volume: 38100 },
      { name: "#でゃまれ", tweet_volume: 31600 },
      { name: "#アリの王", tweet_volume: 28700 },
      { name: "#菊池風磨構文", tweet_volume: 25400 },
      { name: "#束縛グッズ", tweet_volume: 19800 },
      { name: "#コメ不足", tweet_volume: 17300 },
    ];

    // カテゴリに関連するトレンドだけをフィルタリング（オプション）
    const filteredTrends = mockTrends.filter(
      (trend) =>
        Math.random() > 0.7 || // 70%の確率でランダムに選択
        categoryKeywords[category]?.some((keyword) => trend.name.toLowerCase().includes(keyword.toLowerCase().replace("#", "")))
    );

    // 十分なトレンドがない場合は元のリストから追加
    const finalTrends = filteredTrends.length >= 5 ? filteredTrends : [...filteredTrends, ...mockTrends.filter((t) => !filteredTrends.includes(t))];

    setTrends(finalTrends.slice(0, 5));
    console.log("モックトレンドデータを使用しています");
  };

  // カテゴリー変更時にニュースとトレンドを取得
  useEffect(() => {
    fetchNews();
    fetchTrends();
  }, [category]);

  // 日付フォーマット関数
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("ja-JP", options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">トレンドビューアー</h1>
          <p className="text-center text-gray-600">最新のニュースとトレンドトピックを一度に確認</p>
        </header>

        {/* カテゴリー選択 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${category === cat.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* メインコンテンツ (ニュース) */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">最新ニュース</h2>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                <p>{error}</p>
                <p className="text-sm mt-1">モックデータを表示しています</p>
              </div>
            )}

            {/* ローディング表示 */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              /* ニュース一覧 */
              <div className="space-y-6">
                {news.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">ニュースが見つかりませんでした</p>
                ) : (
                  news.slice(0, 8).map((item, index) => (
                    <div key={item.id || index} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                      {item.urlToImage && (
                        <div className="h-48 overflow-hidden">
                          {/* 画像表示 */}
                          <div className="relative w-full h-full">
                            <img
                              src={item.urlToImage}
                              alt={item.title || "ニュース画像"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                // 代替画像を設定（Next.jsのpublicディレクトリにある画像）
                                e.target.src = "/news-placeholder.jpg";
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{item.title || `${categories.find((c) => c.id === category)?.name}ニュース`}</h3>
                        {item.description && <p className="text-gray-600 mb-3 line-clamp-3">{item.description}</p>}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{item.source?.name || "不明なソース"}</span>
                          <span>{formatDate(item.publishedAt || new Date())}</span>
                        </div>
                        {item.url && item.url !== "#" && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                            続きを読む
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* サイドバー (トレンド) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">日本のトレンドトピック</h2>

              {/* トレンドローディング表示 */}
              {trendLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {trends.map((trend, index) => (
                    <li key={index} className="p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="text-gray-500 text-sm mr-2">{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-800">{trend.name}</p>
                          <p className="text-xs text-gray-500">約{(trend.tweet_volume / 1000).toFixed(1)}K件のツイート</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">おすすめトピック</h3>
                <div className="flex flex-wrap gap-2">
                  {["#トレンド", "#話題", "#人気", "#今日のニュース"].map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>
            このアプリはGNews APIとYahoo!リアルタイム検索APIのデータを使用しています。
            <br />
            エラー時はモックデータが表示されます。
          </p>
          <p className="mt-2 text-gray-400 text-sm">© {new Date().getFullYear()} トレンドビューアー - Next.js & Tailwind CSS製</p>
        </div>
      </footer>
    </div>
  );
}
