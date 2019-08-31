# HelloScraping

ハロー！プロジェクトメンバーのブログをスクレイピングする。

## 環境

- TypeScript (GoogleAppsScript)
- GoogleSpreadSheets

`npm run deploy`することでJavaScriptにコンパイルされ、さらにGoogleAppsScriptとしてGoogleドライブにデプロイされる。

GoogleSpreadSheetsをデータストアシステムに利用する。

## 仕様

### Sheet

スクレイピングの結果を保存するSheetは以下の通り。

- `units`
- `blogs`
- `themes`
- `entries`
- `imageurls`

`units`と`blogs`はSheetを直接修正する。
それ以外はスクリプトの実行結果で追加されていく。

### Script

GoogleDriveの機能で一定時間毎にスクレイピングが実行される。
処理の内容は下記の通り。

- https://ameblo.jp/{ameba_id}/entrylist.html にアクセスする。
- 新規テーマが存在すれば`Theme`を生成し、メモリ上にキープする。
- 新規エントリが存在すれば`Entry`を生成し、メモリ上にキープする。
- 新規作成された`Entry`のURLにアクセスして画像が存在すれば`ImageUrl`を生成し、メモリ上にキープする。
- メモリ上にキープされた各インスタンスをSheetに書き込む。

新規のインスタンスをメモリキープするのはSheetアクセスを最小限にするため。
