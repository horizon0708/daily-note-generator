import { App } from "obsidian";
import { DailyNoteBase } from "./daily-note-base";

export class Navigator extends DailyNoteBase {
	constructor(app: App, path: string | undefined, settings: any) {
		super(app, path, settings);
	}

	async openOffsetDays(offsetDays: number) {
		const nextMoment = this.today.clone().add(offsetDays, "day");
		let file = await this.createDailyNote(nextMoment);
		this.app.workspace.getMostRecentLeaf()?.openFile(file);
	}
}
