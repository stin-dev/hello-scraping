import { unitsSheet, Entity } from "./sheets";

/** Sheetに実際に保持する列数 */
const numberofUnitColumns = 3;

export class Unit implements Entity {
	private unit_id: number;
	private screen_name: string;
	private unit_name: string;

	get UnitId() { return this.unit_id }
	get ScreenName() { return this.screen_name }
	get UnitName() { return this.unit_name }

	constructor(unit_id: number, screen_name: string, unit_name: string) {
		this.unit_id = unit_id;
		this.screen_name = screen_name;
		this.unit_name = unit_name;
	}

	getPropValues(): any[] {
		return [this.unit_id, this.ScreenName, this.UnitName];
	}
}

const units: Unit[] = createAllUnits();

/**
 * unitsシートからすべての`Unit`インスタンスを生成する
 */
function createAllUnits(): Unit[] {
	const lastRow = unitsSheet.getLastRow();
	const range = unitsSheet.getRange(2, 1, lastRow - 2 + 1, numberofUnitColumns);
	const values = range.getValues();

	const units = values.map(v => new Unit(v[0], v[1], v[2]));
	return units;
}

/**
* `UnitId`を条件として`Unit`を取得する。
* @param unitId 取得条件となる`unitId`
*/
export function getUnitById(unitId: number): Unit {
	const unit = units.filter(unit => unit.UnitId === unitId);
	return unit[0];
}

/**
 * すべての`Unit`インスタンスを取得する。
 */
export function getAllUnits():Unit[] {
	return units;
}
