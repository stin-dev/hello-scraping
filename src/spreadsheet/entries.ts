import { Entity, entriesSheet } from "./sheets";
import { Theme, getThemeById } from "./themes";
import { Blog, getBlogById } from "./blogs";

/** Sheetに実際に保持する列数 */
const numberofEntryColumns = 5;

export class Entry implements Entity {
	private blog_id: number;
	private entry_id: number;
	private entry_title: string;
	private entry_created_datetime: string;
	private theme_id: number;
	private theme: Theme;
	private blog: Blog;

	get BlogId() { return this.blog_id }
	get EntryId() { return this.entry_id }
	get EntryTitle() { return this.entry_title }
	get EntryCreatedDatetime() { return this.entry_created_datetime }
	get ThemeId() { return this.theme_id }
	get EntryUrl() { return `${this.blog.BlogUrl}/entry-${this.entry_id}.html` }
	get Blog() { return this.blog }
	get Theme() { return this.theme }

	constructor(
		blog_id: number,
		entry_id: number,
		entry_title: string,
		entry_created_datetime: string,
		theme_id: number,
	) {
		this.blog_id = blog_id;
		this.entry_id = entry_id;
		this.entry_title = entry_title;
		this.entry_created_datetime = entry_created_datetime;
		this.theme_id = theme_id;
		this.blog = getBlogById(this.blog_id);
		this.theme = getThemeById(this.blog_id, this.theme_id);
	}

	getPropValues(): any[] {
		return [
			this.blog_id,
			this.entry_id,
			this.entry_title,
			this.entry_created_datetime,
			this.theme_id,
		];
	}
}

/**
 * 直近300件の`Entry`を保持しておく。この配列内に存在しなければ新規Entryとみなす。
 * 300のバッファはレスポンスや実際のブログの更新件数から調整する可能性がある。
 */
const latestEntries: Entry[] = createAllEntries();

/**
 * 新規に追加するEntryを保持しておく。プログラム終了時に一括でSheetに書きこむ。
 */
const newEntries: Entry[] = [];

/**
 * 直近のEntryを指定した件数分取得する
 * @param count 取得件数
 */
function createLatestEntries(count: number): Entry[] {
	const lastRow = entriesSheet.getLastRow();
	const startRow = lastRow - count + 1 < 2 ? 2 : lastRow - count + 1;
	const range = entriesSheet.getRange(startRow, 1, count, numberofEntryColumns);
	const values = range.getValues();

	const entries = values.map(v => new Entry(v[0], v[1], v[2], v[3], v[4]));
	return entries;
}

function createAllEntries():Entry[] {
	const lastRow = entriesSheet.getLastRow();
	const range = entriesSheet.getRange(2, 1, lastRow - 2 + 1, numberofEntryColumns);
	const values = range.getValues();

	const entries = values.map(v => new Entry(v[0], v[1], v[2], v[3], v[4]));
	return entries;
}

/**
* IDを条件として`Entry`を取得する。
* @param blogId 取得条件となる`blogId`
* @param entryId 取得条件となる`entryId`
*/
export function getEntryById(blogId: number, entryId: number): Entry {
	let entry = newEntries.filter(entry => entry.BlogId === blogId && entry.EntryId === entryId);
	if (entry[0] !== undefined) { return entry[0]; }
	else {
		entry = latestEntries.filter(entry => entry.BlogId === blogId && entry.EntryId === entryId);
		return entry[0];

		// TODO:newEntriesにもlatestEntriesにもEntryがない場合、Sheetに探しに行くべきか検討する

		// if (entry[0] !== undefined) { return entry[0]; }
		// else {
		// 	const rangeValue = entriesSheet.getRange(rowIndex, 1, 1, numberofEntryColumns).getValues()[0];
		// 	if (rangeValue[0] as String !== "") {
		// 		// entry_id列が空文字でなければその行はEntryとして情報が完備されているはず
		// 		return new Entry(rowIndex, rangeValue[0], rangeValue[1], rangeValue[2], rangeValue[3], rangeValue[4]);
		// 	}
		// 	else {
		// 		return undefined;
		// 	}
		// }
	}
}

/**
 * 新規Entryの配列を取得する。
 * このメソッドで取得できる`Entry`配列のデータは、Sheetに保存されていない。
 */
export function getNewEntries(): Entry[] {
	return newEntries;
}

/**
 * Entryインスタンスが存在するかどうか判定する。
 * @param blogId 判定する`Entry`の`blogId`
 * @param entryId 判定する`Entry`の`entryId`
 */
export function entryExists(blogId: number, entryId: number): boolean {
	return latestEntries.some(entry => entry.BlogId === blogId && entry.EntryId === entryId)
		|| newEntries.some(entry => entry.BlogId === blogId && entry.EntryId === entryId);
}

/**
 * `Entry`インスタンスを新しく作成して追加する。
 * @param entry_id 
 * @param entry_title 
 * @param entry_created_datetime 
 * @param theme_row_index 
 * @param blog_row_index 
 */
export function addNewEntry(
	blogId:number,
	entryId: number,
	entryTitle: string,
	entryCreatedDatetime: string,
	themeId:number,
): Entry {
	const newEntity = new Entry(blogId, entryId, entryTitle, entryCreatedDatetime, themeId);
	newEntries.push(newEntity);
	return newEntity;
}

/**
 * メモリ上に保持されている`Entry`インスタンスをSheetに書き込む。
 */
export function writeEntriesToSheet() {
	const rowsCount = newEntries.length;
	console.info(`新規Entry合計 ${rowsCount} 件をSheetに書き込みます。`);
	if (rowsCount === 0) return;

	const lastRow = entriesSheet.getLastRow();
	const range = entriesSheet.getRange(lastRow + 1, 1, rowsCount, numberofEntryColumns);
	range.setValues(newEntries.sort((a, b) => a.EntryCreatedDatetime.localeCompare(b.EntryCreatedDatetime))
		.map(entry => entry.getPropValues()));
}