export const spreadSheet = SpreadsheetApp.openById("1s2WXgU7f75zWNhhlcpM_Q5uOEGFWZjX20Rek8ZNeVRg");

export const unitsSheet = spreadSheet.getSheetByName("units");

export const blogsSheet = spreadSheet.getSheetByName("blogs");

export const themesSheet = spreadSheet.getSheetByName("themes");

export const entriesSheet = spreadSheet.getSheetByName("entries");

export const imageurlsSheet = spreadSheet.getSheetByName("imageurls");

export const nextEntrylistPageSheet = spreadSheet.getSheetByName("next_entrylist_page");

export interface Entity {
	getPropValues(): any[],
}