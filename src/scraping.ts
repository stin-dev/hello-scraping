import { getAllUnits, Unit, getUnitById } from "./spreadsheet/units";
import { Blog, getBlogsByUnitId } from "./spreadsheet/blogs";
import { Parser } from "./utils/Parser";
import { EntryListState } from "./ameba_blog/entrylist";
import { themeExists, getThemeById, addNewTheme, Theme } from "./spreadsheet/themes";
import { entryExists, addNewEntry, getNewEntries, Entry, getEntryById } from "./spreadsheet/entries";
import { endofFunction } from "./endof_function";
import Extract from "./utils/StringExtractor";
import { addNewImageUrl } from "./spreadsheet/imageurls";
import { customFetch } from "./utils/customFetch";

export default function executeScraping() {
	scrapeEntrylist();

	scrapeNewEntries();

	endofFunction();
}

/**
 * 全ユニットの全Blogにアクセスして新規Entryを取得する。
 * @param nth Entrylist-nth.htmlにアクセスする場合指定する。
 */
export function scrapeEntrylist(nth = 1) {
	console.info(`Entrylist.htmlから新規Entryを取得する処理を開始します。`);

	const units = getAllUnits();

	for (let i = 0; i < units.length; i++) {
		scrapeUnitEntryList(units[i], nth);
	}

	console.info(`新規Entry数は ${getNewEntries().length} 件です。`);
}

/**
 * 1つのUnitのBlogすべてのEntrylist.htmlにアクセスして新規Entryを取得する。
 * @param unit 対象Unit
 * @param nth Entrylist-nth.htmlにアクセスする場合指定する。
 */
export function scrapeUnitEntryList(unit: Unit, nth = 1) {
	console.info(`【${unit.UnitName}】の処理を開始します。`);

	const blogs = getBlogsByUnitId(unit.UnitId);

	for (let i = 0; i < blogs.length; i++) {
		scrapeBlogEntryList(blogs[i], nth);
	}
}

/**
 * 1件のBlogのEntrylist.htmlにアクセスして新規Entryを取得する。
 * @param blog 対象Blog
 * @param nth Entrylist-nth.htmlにアクセスする場合指定する。
 */
function scrapeBlogEntryList(blog: Blog, nth: number = 1) {
	console.info(`[${blog.AmebaId}]のEntryListのスクレイピングを実行します。`);

	const content = customFetch(blog.getEntrylistNthUrl(nth), 5);
	const stateJson = new Parser(content).from("<script>window.INIT_DATA=").to("};", 1).build();

	const entrylistState: EntryListState = JSON.parse(stateJson);

	const entryMap = entrylistState.entryState.entryMap;

	for (let entry_id in entryMap) {
		const entryitem = entryMap[entry_id];
		const theme: Theme = themeExists(blog.BlogId, entryitem.theme_id)
			? getThemeById(blog.BlogId, entryitem.theme_id)
			: addNewTheme(blog.BlogId, entryitem.theme_id, entryitem.theme_name);

		if (!entryExists(blog.BlogId, entryitem.entry_id)) {
			addNewEntry(
				blog.BlogId,
				entryitem.entry_id,
				entryitem.entry_title,
				entryitem.entry_created_datetime,
				theme.ThemeId);
		}
	}
}

/**
 * 新規Entryの各ページにアクセスしてImageUrlを取得する。
 */
export function scrapeNewEntries() {
	console.info(`取得した新規EntryのImageUrlを取得する処理を開始ます。`);

	const entries = getNewEntries();

	for (let i = 0; i < entries.length; i++) {
		scrapeEntry(entries[i]);
	}
}

/**
 * 1件のEntryのページにアクセスしてImageUrlを取得する。
 * @param entry 対象Entry
 */
function scrapeEntry(entry: Entry) {
	console.info(`[${entry.EntryUrl}]の画像を取得します。`);

	const content = customFetch(entry.EntryUrl, 5);

	const imghtmls = Extract(content).Target("PhotoSwipeImage").from("<img").to(">").iterate();

	const wellFormedImghtmls = imghtmls.map(html => {
		// "/>"で終わらないimgタグがwell-formed xmlにならないため、修正を加える必要がある
		if (html.slice(-2) === "/>") {
			return html;
		} else {
			return html.slice(0, -1) + "/>";
		}
	});

	let numofImage = 0;

	for (let i = 0; i < wellFormedImghtmls.length; i++) {
		try {
			const html = XmlService.parse(wellFormedImghtmls[i]).getRootElement();
			const image_id = html.getAttribute("data-image-id").getValue();
			const image_url = html.getAttribute("src").getValue();
			numofImage++;

			addNewImageUrl(
				entry.Blog.BlogId,
				Number(image_id),
				image_url.slice(0, image_url.indexOf("?")),
				entry.EntryId);
		} catch (error) {
			// 目的のimgタグではないゴミが混入するので無視する
			continue;
		}
	}

	console.info(`[${entry.EntryUrl}]から取得した画像は ${numofImage} 枚です。`);
}
