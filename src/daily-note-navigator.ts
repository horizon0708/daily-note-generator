import { App, Notice, TFile } from "obsidian";
import { DailyNoteBase } from "./daily-note-base";

export class DailyNoteNavigator extends DailyNoteBase {
	constructor(app: App, path: string | undefined, settings: any) {
		super(app, path, settings);
	}

	async openOffsetDays(offsetDays: number) {
		const nextMoment = this.today.add(offsetDays, "day");
		console.log("??");
		let file = await this.createDailyNote(nextMoment);
		console.log("---", file);
		console.log(file);

		this.app.workspace.getMostRecentLeaf()?.openFile(file);
	}
}
