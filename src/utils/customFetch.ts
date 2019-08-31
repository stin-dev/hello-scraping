/**
 * UrlFetchApp.fetch()を指定された試行回数だけ実行する。
 * 最初に成功したRequestのResponseからContentを返却する。
 * @param url URL
 * @param trials 試行回数
 * @param charset 文字コード
 */
export function customFetch(url: string, trials: number, charset = "UTF-8"): string {
let content = "";

	for (let i = 0; i < trials; i++) {
		try {
			const response = UrlFetchApp.fetch(url);
			content = response.getContentText(charset);

			break;
		} catch (error) {
			if (i < 4) {
				console.error(`${url}へのアクセスが失敗しました。`);
				continue;
			} else {
				throw error;
			}
		}
	}

	return content;
}