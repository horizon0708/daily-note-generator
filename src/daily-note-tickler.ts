import { App } from "obsidian";
import { DailyNoteBase } from "./daily-note-base";
import { Moment } from "moment";

export class DailyNoteTickler extends DailyNoteBase {
	constructor(app: App, path: string | undefined, settings: any) {
		super(app, path, settings);
	}

	async appendToDailyNote(
		text: string,
		dateObj: Record<string, number> = { months: 1 }
	) {
		const moment = this.today.add(dateObj);
		console.log(moment.format("YYYY-MM-DD"));
		const file = await this.createDailyNote(moment);
		await this.app.vault.append(file, text);
	}
}
