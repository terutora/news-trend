// app/api/trends/route.js

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    // Yahoo!リアルタイム検索ページへのリクエスト
    // 実際のブラウザのように振る舞うためのヘッダーを追加
    const response = await fetch("https://search.yahoo.co.jp/realtime", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo response error: ${response.status}`);
    }

    // レスポンスのHTMLを取得
    const html = await response.text();

    // cheerioを使用してHTMLをパース
    const $ = cheerio.load(html);

    // 正確なセレクタを使用してトレンドワードを取得
    const trends = [];

    // HTMLから直接確認したセレクタを使用
    // section.Trend_container__d7dWI > ol > li > a > article > h1
    $(".Trend_container__d7dWI li article h1").each((index, element) => {
      const word = $(element).text().trim();

      if (word) {
        trends.push({
          word: word,
          rank: index + 1,
        });
      }
    });

    console.log(`Found ${trends.length} trends`);

    // トレンドが見つからない場合はエラー
    if (trends.length === 0) {
      // HTMLの一部をログに出力して問題を診断
      console.error("トレンドが見つかりませんでした。HTMLの一部:", html.substring(0, 500));
      throw new Error("No trends found. Yahoo structure might have changed.");
    }

    // トレンドを返す
    return NextResponse.json(trends, { status: 200 });
  } catch (error) {
    console.error("Error scraping Yahoo trends:", error);

    // エラー時はモックトレンドを返す
    const mockTrends = [
      { word: "オレの司", rank: 1 },
      { word: "アカデミー飯", rank: 2 },
      { word: "引用元の消失", rank: 3 },
      { word: "明浦路先生", rank: 4 },
      { word: "田中樹アクターズスクール", rank: 5 },
      { word: "でゃまれ", rank: 6 },
      { word: "アリの王", rank: 7 },
      { word: "菊池風磨構文", rank: 8 },
      { word: "束縛グッズ", rank: 9 },
      { word: "コメ不足", rank: 10 },
    ];

    return NextResponse.json(mockTrends, { status: 200 });
  }
}
