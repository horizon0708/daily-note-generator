import { App } from "obsidian";
import { DailyNoteBase } from "./daily-note-base";

export class GTD extends DailyNoteBase {
	private text: string = "";

	constructor(
		app: App,
		path: string | undefined,
		text: string,
		settings: any
	) {
		super(app, path, settings);
		this.text = text;
	}

	preprendDate() {
		const datestamp = this.today.format("YYYY-MM-DD");
		this.text = `[[${datestamp}]]: ${this.text}`;
		return this;
	}

	async appendToDailyNote(dateObj: Record<string, number> = { months: 1 }) {
		const moment = this.today.clone().add(dateObj);
		const file = await this.createDailyNote(moment);
		await this.app.vault.append(file, `\n${this.text}`);
	}
}
