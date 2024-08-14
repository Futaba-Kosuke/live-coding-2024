// deno.landに公開されているモジュールをimport
// denoではURLを直に記載してimportできます
import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";

// ランダムな単語を返す
const initializeWords = ["しりとり", "りんご", "ごりら", "らっぱ"];
const getInitializeWord = () => {
    return initializeWords[Math.floor(Math.random() * initializeWords.length)];
}

// 入力された単語一覧を保持しておく
let previousWords = [getInitializeWord()];

// localhostにDenoのHTTPサーバーを展開
Deno.serve(async (request) => {
    // パス名を取得する
    // http://localhost:8000/hoge に接続した場合"/hoge"が取得できる
    const pathname = new URL(request.url).pathname;
    console.log(`pathname: ${pathname}`);

    // GET /shiritori: 直前の単語を返す
    if (request.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWords);
    }

    // POST /reset: 単語をリセットする
    if (request.method === "POST" && pathname === "/reset") {
        previousWords = [getInitializeWord()];
        return new Response(previousWords);
    }

    // POST /shiritori: 次の単語を入力する
    if (request.method === "POST" && pathname === "/shiritori") {
        // リクエストのペイロードを取得
        const requestJson = await request.json();
        // JSONの中からnextWordを取得
        const nextWord = requestJson["nextWord"];

        // 文字数が1文字以下の場合
        if (nextWord.length <= 1) {
            return new Response(
                JSON.stringify({
                    "errorMessage": "2文字以上の単語にしてください",
                    "errorCode": "10002"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }

        // ひらがな以外の文字が使用されている場合
        if (!(/^[\p{scx=Hiragana}]+$/u).test(nextWord)) {
            return new Response(
                JSON.stringify({
                    "errorMessage": "ひらがなのみで入力してください",
                    "errorCode": "10003"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }

        if (previousWords.includes(nextWord)) {
            return new Response(
                JSON.stringify({
                    "errorMessage": "前に使用した単語です。ゲームを終了します",
                    "errorCode": "10004"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }

        // previousWordsの末尾とnextWordの先頭が同一か確認
        if (previousWords[previousWords.length - 1].slice(-1) === nextWord.slice(0, 1)) {
            // 同一であれば、previousWordsを更新
            previousWords.push(nextWord);
        }
        // 同一でない単語の入力時に、エラーを返す
        else {
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10001"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }

        // 最後が「ん」で終わってしまった
        if (nextWord.slice(-1) === "ん") {
            return new Response(
                JSON.stringify({
                    "errorMessage": "語尾に「ん」が付きました。ゲームを終了します",
                    "errorCode": "10005"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            ); 
        }

        // 現在の単語を返す
        return new Response(previousWords);
    }

    // ./public以下のファイルを公開
    return serveDir(
        request,
        {
            /*
            - fsRoot: 公開するフォルダを指定
            - urlRoot: フォルダを展開するURLを指定。今回はlocalhost:8000/に直に展開する
            - enableCors: CORSの設定を付加するか
            */
            fsRoot: "./public/",
            urlRoot: "",
            enableCors: true,
        }
    )
    
});