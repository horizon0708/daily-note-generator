import { App, Notice } from "obsidian";
import { DailyNoteBase } from "./daily-note-base";
import { Moment } from "moment";

export class GTD extends DailyNoteBase {
	private text: string = "";

	constructor(
		app: App,
		path: string | Moment | undefined,
		text: string,
		settings: any
	) {
		super(app, path, settings);
		this.text = text;
	}

	prependDate(moment = this.today) {
		const datestamp = moment.format("YYYY-MM-DD");
		this.text = `[[${datestamp}]]: ${this.text}`;
		return this;
	}

	async appendToDailyNote(
		dateObj: Record<string, number> = { months: 1 },
		from = this.today
	) {
		const moment = from.clone().add(dateObj);
		const file = await this.createDailyNote(moment);
		await this.app.vault.append(file, `\n${this.text}`);
		new Notice(`Line sent to ${moment.format("YYYY-MM-DD")}`);
	}
}
