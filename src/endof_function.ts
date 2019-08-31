import { writeThemesToSheet } from "./spreadsheet/themes";
import { writeEntriesToSheet } from "./spreadsheet/entries";
import { writeImageUrlsToSheet } from "./spreadsheet/imageurls";

/**
 * メモリ上に保持された値をSheetに書き込む等、
 * プログラム実行の最後に必ず実行しなければならない関数。
 * Sheet内データが不整合になるため途中に実行することも許されない。
 */
export function endofFunction() {
	writeThemesToSheet();
	writeEntriesToSheet();
	writeImageUrlsToSheet();
}