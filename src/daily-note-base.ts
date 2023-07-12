import { Moment } from "moment";
import { App, Notice, TFile, TFolder, normalizePath } from "obsidian";

export class DailyNoteBase {
	protected app: App;
	protected settings: any;
	protected path?: string;
	protected today: Moment;
	public message: string = "";

	constructor(
		app: App,
		pathOrMoment: string | Moment | undefined,
		settings: any
	) {
		this.app = app;
		this.settings = settings;
		if (!pathOrMoment) {
			this.message = "invalid path or moment";
			return;
		}

		if (typeof pathOrMoment === "string") {
			this.path = pathOrMoment;
			if (!pathOrMoment.startsWith(this.settings.folder)) {
				this.message = "Not a daily note";
				return;
			}

			this.today = this.getMomentFromPath(pathOrMoment);
			return;
		}
		this.today = pathOrMoment;
	}

	get isValid() {
		return this.today?.isValid() ?? false;
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

	protected getMomentFromPath(path: string) {
		// IMPROVEMENT: regex for YYYY-MM-DD instead?
		// But this is more flexible with the custom formatting
		const p = path.slice(this.settings.folder.length + 1, -3);
		return window.moment(p, this.settings.dailyFormat);
	}

	protected getPathFromMoment(moment: Moment) {
		const filepath = `${moment.format(this.settings.dailyFormat)}.md`;
		return normalizePath(`${this.settings.folder}/${filepath}`);
	}

	protected async createDailyNote(moment: Moment) {
		const path = this.getPathFromMoment(moment);
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			// IMPROVEMENT: apply template?
			await this.createFolder(moment);
			const file = await this.app.vault.create(path, "");
			new Notice(
				"Created daily note for " + moment.format("YYYY-MM-DD") + "."
			);
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
