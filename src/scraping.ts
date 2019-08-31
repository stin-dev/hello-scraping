import { getAllUnits, Unit, getUnitById } from "./spreadsheet/units";
import { Blog, getBlogsByUnitId } from "./spreadsheet/blogs";
import { Parser } from "./utils/Parser";
import { EntryListState } from "./ameba_blog/entrylist";
import { themeExists, getThemeById, addNewTheme, Theme } from "./spreadsheet/themes";
import { entryExists, addNewEntry, getNewEntries, Entry, getEntryById } from "./spreadsheet/entries";
import { endofFunction } from "./endof_function";
import Extract from "./utils/StringExtractor";
import { addNewImageUrl } from "./spreadsheet/imageurls";

export default function executeScraping() {
	scrapeEntrylist();

	scrapeNewEntries();

	endofFunction();
}

/**
 * 全ユニットの全Blogにアクセスして新規Entryを取得する。
 * @param nth Enntrylist-nth.htmlにアクセスする場合指定する。
 */
export function scrapeEntrylist(nth = 1) {
	const units = getAllUnits();

	for (let i = 0; i < units.length; i++) {
		scrapeUnitEntryList(units[i], nth);
	}
}

/**
 * 1つのUnitのBlogすべてのEntrylist.htmlにアクセスして新規Entryを取得する。
 * @param unit 対象Unit
 * @param nth Enntrylist-nth.htmlにアクセスする場合指定する。
 */
export function scrapeUnitEntryList(unit: Unit, nth = 1) {
	const blogs = getBlogsByUnitId(unit.UnitId);

	for (let i = 0; i < blogs.length; i++) {
		scrapeBlogEntryList(blogs[i], nth);
	}
}

/**
 * 1件のBlogのEntrylist.htmlにアクセスして新規Entryを取得する。
 * @param blog 対象Blog
 * @param nth Enntrylist-nth.htmlにアクセスする場合指定する。
 */
function scrapeBlogEntryList(blog: Blog, nth:number = 1) {
	const response = UrlFetchApp.fetch(blog.getEntrylistNthUrl(nth));
	const content = response.getContentText("UTF-8");
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
	const response = UrlFetchApp.fetch(entry.EntryUrl);
	const content = response.getContentText("UTF-8");
	const imghtmls = Extract(content).Target("PhotoSwipeImage").from("<img").to(">").iterate();

	const wellFormedImghtmls = imghtmls.map(html => {
		// "/>"で終わらないimgタグがwell-formed xmlにならないため、修正を加える必要がある
		if (html.slice(-2) === "/>") {
			return html;
		} else {
			return html.slice(0, -1) + "/>";
		}
	});

	for (let i = 0; i < wellFormedImghtmls.length; i++) {
		try {
			const html = XmlService.parse(wellFormedImghtmls[i]).getRootElement();
			const image_id = html.getAttribute("data-image-id").getValue();
			const image_url = html.getAttribute("src").getValue();

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
}


// 以下テスト用

export function testScrapingKobushi() {
	const kobushi = getUnitById(4);
	const amiFirstEntry = getEntryById(11, 12027493828);

	scrapeEntry(amiFirstEntry);
	scrapeUnitEntryList(kobushi);

	scrapeNewEntries();

	endofFunction();
}