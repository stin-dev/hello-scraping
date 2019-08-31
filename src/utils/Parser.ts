type fromtoType = { text: string, offset: number };

class Parser {
	private content: string;
	private direction: "from" | "to";
	private _from: fromtoType;
	private _to: fromtoType;
	private index?: number;
	private log: boolean;
	private position: number;
	private end?: number;
	private last?: number;

	constructor(content: string) {
		this.content = content;
		this.direction = "from";
		this._from = { text: "", offset: 0 };
		this._to = { text: "", offset: 0 };
		this.index = 0;
		this.log = false;
		this.position = 0;
	}

	from(pattern: string, offset?: number): Parser {
		if (this.log) Logger.log("Parser.from: " + pattern)
		this._from.text = pattern;
		this._from.offset = offset || 0;
		return this;
	}

	to(pattern: string, offset?: number): Parser {
		if (this.log) Logger.log("Parser.to: " + pattern);
		this._to.text = pattern;
		this._to.offset = offset || 0;
		return this;
	}

	offset(index: number): Parser {
		this.index = index
		return this;
	}

	setDeirection(way: "from" | "to"): Parser {
		this.direction = way;
		return this;
	}

	setLog(): Parser {
		this.log = true;
		return this;
	}

	build(): string {
		let txt = this.content;
		let temp = 0;

		let obj = {
			from: this._from,
			to: this._to,
			index: this.index,
		};

		if (this.log) Logger.log("Index offset %s", this.index);

		let keyword: { from?: number, to?: number } = {};

		if (this.direction == "from") {
			if (this.log) Logger.log("from_mode");
			this.position = txt.indexOf(obj.from.text, obj.index);
			if (this.log) Logger.log("Iterate offset: %s", this.position);
			keyword.from = this.position + obj.from.offset + obj.from.text.length;
			keyword.to = txt.indexOf(obj.to.text, keyword.from + 1) + obj.to.offset;
			if (this.log) Logger.log("to:" + txt.indexOf(obj.to.text, keyword.from + 1))
		} else {
			if (this.log) Logger.log("to_mode");
			keyword.to = txt.indexOf(obj.to.text) + obj.to.offset;
			keyword.from = txt.lastIndexOf(obj.from.text, keyword.to) + obj.from.offset + obj.from.text.length;
		}
		if (this.log) Logger.log(keyword);

		this.end = keyword.to;
		this.last = txt.lastIndexOf(obj.from.text);
		return txt.substring(keyword.from, keyword.to);
	}

	iterate(): string[] {
		var keywords = [];
		var start = true;

		while (start || this.last != this.position) {
			var keyword = this.build();
			if (this.log) {
				Logger.log("LastIndexOf: %s", this.last);
				Logger.log("Now indexOf: %s", this.position);
				Logger.log(keyword);
				Logger.log("End at %s", this.end)
				Logger.log("------------------------");
			}
			this.index = this.end;
			keywords.push(keyword);
			start = false;
		}
		return keywords;
	}
}

export function parse(content: string): Parser {
	return new Parser(content);
}