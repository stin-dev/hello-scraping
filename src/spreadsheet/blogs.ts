import { blogsSheet, Entity } from "./sheets";
import { getUnitById, Unit } from "./units";

/** Sheetに実際に保持する列数 */
const numberofBlogColumns = 3;

export class Blog implements Entity {
	private blog_id: number;
	private ameba_id: string;
	private unit_id: number;
	private unit: Unit;

	get BlogId() { return this.blog_id }
	get AmebaId() { return this.ameba_id }
	get UnitId() { return this.unit_id }
	get Unit() { return this.unit }
	get BlogUrl() { return `https://ameblo.jp/${this.ameba_id}` }
	get EntrylistUrl() { return `${this.BlogUrl}/entrylist.html` }

	constructor(blog_id: number, ameba_id: string, unit_id: number) {
		this.blog_id = blog_id;
		this.ameba_id = ameba_id;
		this.unit_id = unit_id;
		this.unit = getUnitById(this.unit_id);
	}

	getPropValues(): any[] {
		return [this.blog_id, this.ameba_id, this.unit_id];
	}

	getEntrylistNthUrl(num: number) {
		if (num === 1) { return this.EntrylistUrl; }
		return `${this.BlogUrl}/entrylist-${num}.html`;
	}
}

const blogs: Blog[] = createAllBlogs();


/**
 * blogsシートからすべてのBlogインスタンスを生成する
 */
function createAllBlogs(): Blog[] {
	const lastRow = blogsSheet.getLastRow();
	const range = blogsSheet.getRange(2, 1, lastRow - 2 + 1, numberofBlogColumns);
	const values = range.getValues();

	const blogs = values.map(v => new Blog(v[0], v[1], v[2]));
	return blogs;
}

/**
* `BlogId`を条件として`Blog`を取得する。
* @param blogId 取得条件となる`blogId`
*/
export function getBlogById(blogId: number): Blog {
	const blog = blogs.filter(blog => blog.BlogId === blogId);
	return blog[0];
}

/**
 * `Unit`の`UnitId`を条件として`Blog`の配列を取得する
 * @param unitId 取得条件となる`unitId`
 */
export function getBlogsByUnitId(unitId: number): Blog[] {
	return blogs.filter(blog => blog.UnitId === unitId);
}
