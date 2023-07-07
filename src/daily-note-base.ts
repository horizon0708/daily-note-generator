import { Moment } from "moment";
import { App, TFile, TFolder, normalizePath } from "obsidian";

export class DailyNoteBase {
	protected app: App;
	protected settings: any;
	protected path?: string;
	protected today: Moment;
	public isValid: boolean = false;
	public message: string = "";

	constructor(app: App, path: string | undefined, settings: any) {
		this.app = app;
		this.path = path;
		this.settings = settings;

		if (!path || !path.startsWith(this.settings.folder)) {
			this.message = "Not a daily note";
			return;
		}

		// IMPROVEMENT: regex for YYYY-MM-DD instead?
		// But this is more flexible with the custom formatting
		const p = path.slice(this.settings.folder.length + 1, -3);
		this.today = window.moment(p, this.settings.dailyFormat);
		this.isValid = this.today.isValid();
	}

	get todayFile() {
		const filepath = this.today.format(this.settings.dailyFormat);
		const path = normalizePath(`${this.settings.folder}/${filepath}.md`);
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) {
			return;
		}
		return file;
	}

	protected async createDailyNote(moment: Moment) {
		const filepath = `${moment.format(this.settings.dailyFormat)}.md`;
		const path = normalizePath(`${this.settings.folder}/${filepath}`);
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			// IMPROVEMENT: apply template?
			await this.createFolder(moment);
			const file = await this.app.vault.create(path, "");
			return file;
		}
		return file;
	}

	private async createFolder(moment: Moment) {
		// TODO: extract this from dailyFormat
		const basename = moment.format("YYYY/MM");
		const path = normalizePath(`${this.settings.folder}/${basename}`);
		const folder = this.app.vault.getAbstractFileByPath(path);
		if (folder instanceof TFolder) {
			return folder;
		}
		return this.app.vault.createFolder(path);
	}
}
