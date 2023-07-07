import { Moment } from "moment";
import { App, Notice, TFile, normalizePath } from "obsidian";

export class DailyNoteNavigator {
	private app: App;
	private settings: any;
	private day: number;

	constructor(app: App, settings: any) {
		this.app = app;
		this.settings = settings;
	}

	private moment(basename: string) {
		const moment = window.moment(basename);
		if (!moment.isValid()) {
			return;
		}
		return moment;
	}

	private dailyNotePath(moment: Moment) {
		const YYYY = moment.format("YYYY");
		const MM = moment.format("MM");
		const Date = moment.format("YYYY-MM-DD");

		return normalizePath(
			`${this.settings.folder}/${YYYY}/${MM}/${Date}.md`
		);
	}

	openOffsetDays(path: string | null | undefined, offsetDays: number) {
		if (!path) {
			return;
		}
		const curFile = this.app.vault.getAbstractFileByPath(path);
		if (
			!(curFile instanceof TFile) ||
			!path.startsWith(this.settings.folder)
		) {
			new Notice("Not a daily note");
			return;
		}

		const moment = this.moment(curFile.basename);
		if (!moment) {
			new Notice("Not a valid daily note");
			return;
		}

		const nextMoment = moment.add(offsetDays, "day");
		const filePath = this.dailyNotePath(nextMoment);
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) {
			new Notice("Adjacent Daily Note does not exist");
			return;
		}

		this.app.workspace.getMostRecentLeaf()?.openFile(file);
	}
}
