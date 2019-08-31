import { Entity, imageurlsSheet } from "./sheets";
import { Entry, getEntryById } from "./entries";

/** Sheetに実際に保持する列数 */
const numberofImageUrlColumns = 4;

export class ImageUrl implements Entity {
	private blog_id: number;
	private image_id: number;
	private image_url: string;
	private entry_id: number;
	private entry: Entry;

	get BlogId() { return this.blog_id }
	get ImageId() { return this.image_id }
	get ImageUrl() { return this.image_url }
	get EntryId() { return this.entry_id }
	get Entry() { return this.entry }

	constructor(blog_id: number, image_id: number, image_url: string, entry_id: number) {
		this.blog_id = blog_id;
		this.image_id = image_id;
		this.image_url = image_url;
		this.entry_id = entry_id;
		this.entry = getEntryById(this.blog_id, this.entry_id);
	}
	getPropValues(): any[] {
		return [this.blog_id, this.image_id, this.image_url, this.entry_id];
	}
}

const newImageUrls: ImageUrl[] = [];

/**
 * `ImageUrl`インスタンスを新しく作成して追加する。
 * @param image_id 
 * @param image_url 
 * @param entry_row_index 
 */
export function addNewImageUrl(
	blogId:number,
	imageId: number,
	imageUrl: string,
	entryId: number,
) {
	const newEntity = new ImageUrl(blogId, imageId, imageUrl, entryId);
	newImageUrls.push(newEntity);
	return newEntity;
}

/**
 * メモリ上に保持されている`ImageUrl`インスタンスをSheetに書き込む。
 */
export function writeImageUrlsToSheet() {
	const rowsCount = newImageUrls.length;
	console.info(`新規ImageUrl合計 ${rowsCount} 件をSheetに書き込みます。`);
	if (rowsCount === 0) return;

	const lastRow = imageurlsSheet.getLastRow();
	const range = imageurlsSheet.getRange(lastRow + 1, 1, rowsCount, numberofImageUrlColumns);
	range.setValues(newImageUrls.map(imageurl => imageurl.getPropValues()));
}