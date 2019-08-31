import { endofFunction } from "./endof_function";
import { scrapeNewEntries, scrapeEntrylist } from "./scraping";
import { nextEntrylistPageSheet } from "./spreadsheet/sheets";

/**
 * 過去データを取得するためのスクリプト。next_entrylist_pageシートの
 * 値が0になったら停止する。
 */
export function executeScrapingPastdata() {
	const nextpageRange = nextEntrylistPageSheet.getRange(2, 1);
	const nextpage: number = nextpageRange.getValue();

	if (nextpage < 1) return;

	scrapeEntrylist(nextpage);

	scrapeNewEntries();

	endofFunction();

	nextpageRange.setValue(nextpage - 1);
}