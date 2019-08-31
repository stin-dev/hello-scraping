import { themesSheet, Entity } from "./sheets";
import { Blog, getBlogById } from "./blogs";

/** Sheetに実際に保持する列数 */
const numberofThemeColumns = 3;

export class Theme implements Entity {
	private blog_id: number;
	private theme_id: number;
	private theme_name: string;
	private blog: Blog;

	get BlogId() { return this.blog_id }
	get ThemeId() { return this.theme_id }
	get ThemeName() { return this.theme_name }
	get Blog() { return this.blog }

	constructor(blog_id: number, theme_id: number, theme_name: string) {
		this.blog_id = blog_id;
		this.theme_id = theme_id;
		this.theme_name = theme_name;
		this.blog = getBlogById(this.blog_id);
	}
	getPropValues(): any[] {
		return [this.blog_id, this.theme_id, this.theme_name];
	}
}

const themes: Theme[] = createAllThemes();

/**
 * themesシートからすべての`Theme`インスタンスを生成する
 */
function createAllThemes(): Theme[] {
	const lastRow = themesSheet.getLastRow();
	const range = themesSheet.getRange(2, 1, lastRow - 2 + 1, numberofThemeColumns);
	const values = range.getValues();

	const themes = values.map(v => new Theme(v[0], v[1], v[2]));
	return themes;
}

/**
* `ThemeId`を条件として`Theme`を取得する。
* @param blogId 取得条件となる`blogId`
* @param themeId 取得条件となる`themeId`
*/
export function getThemeById(blogId:number, themeId: number): Theme {
	const theme = themes.filter(theme => theme.BlogId === blogId && theme.ThemeId === themeId);
	return theme[0];
}

/**
 * `BlogId`を条件として`Theme`の配列を取得する
 * @param blogId 取得条件となる`blogId`
 */
export function getThemesByBlogId(blogId: number): Theme[] {
	return themes.filter(theme => theme.BlogId === blogId);
}

/**
 * `Theme`インスタンスが存在するかどうかをIDで判定する。
 * @param theme_id 判定する`theme_id`
 */
export function themeExists(blogId:number, themeId:number) :boolean{
	return themes.some(theme => theme.BlogId === blogId && theme.ThemeId === themeId);
}

/**
 * `Theme`インスタンスを新しく作成して追加する。
 * @param blogId
 * @param themeId
 * @param themeName
 */
export function addNewTheme(blogId:number, themeId: number, themeName: string): Theme {
	const newEntity = new Theme(blogId, themeId, themeName);
	themes.push(newEntity);
	return newEntity;
}

/**
 * メモリ上に保持されている`Theme`インスタンスをSheetに書き込む。
 */
export function writeThemesToSheet() {
	const rowsCount = themes.length;
	const range = themesSheet.getRange(2, 1, rowsCount, numberofThemeColumns);
	range.setValues(themes.map(theme => theme.getPropValues()));
}



//************
// 以下、テスト
//************

export function testThemeFunction() {
	const theme_ami = getThemeById(11, 10090188551);
	Logger.log(theme_ami ? theme_ami.ThemeName : "取得失敗");

	const theme_kudo = addNewTheme(8, 10109826771, "工藤由愛");
	const juiceblog = theme_kudo.Blog;
	Logger.log(juiceblog ? juiceblog.EntrylistUrl : "Blog取得失敗");

	writeThemesToSheet();

}