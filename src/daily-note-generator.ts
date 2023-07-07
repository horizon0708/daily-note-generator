import { App, TFile, TFolder, normalizePath } from "obsidian";

export class DailyNoteGenerator {
	private app: App;
	private settings: any;
	private year: number;
	private month: number;

	constructor(app: App, year: number, month: number, settings: any) {
		this.app = app;
		this.year = year;
		// offset month by 1 because moment js starts month from 0
		this.month = month - 1;
		this.settings = settings;
	}

	async generateNotes() {
		const { year, month } = this;
		const yFolder = await this.getOrCreateYearFolder();
		const mFolder = await this.getOrCreateMonthFolder(yFolder, month);

		const days = window.moment().year(year).month(month).daysInMonth();
		console.log(days);
		for (let day = 1; day <= days; day++) {
			console.log(day);
			await this.createDayFile(mFolder, day);
		}
	}

	private async getOrCreateYearFolder(): Promise<TFolder> {
		const yPath = normalizePath(`${this.settings.folder}/${this.year}`);
		const yearFolder = this.app.vault.getAbstractFileByPath(yPath);

		if (!yearFolder || !(yearFolder instanceof TFolder)) {
			await this.app.vault.createFolder(yPath);
			return this.app.vault.getAbstractFileByPath(yPath) as TFolder;
		}
		return yearFolder;
	}

	private async getOrCreateMonthFolder(
		yearFolder: TFolder,
		month: number
	): Promise<TFolder> {
		const moment = window.moment().year(this.year).month(month);

		const mPath = normalizePath(
			`${yearFolder.path}/${moment.format("MM")}`
		);
		const mFolder = this.app.vault.getAbstractFileByPath(mPath);

		if (!mFolder || !(mFolder instanceof TFolder)) {
			await this.app.vault.createFolder(mPath);
			return this.app.vault.getAbstractFileByPath(mPath) as TFolder;
		}
		return mFolder;
	}

	private async createDayFile(monthFolder: TFolder, day: number) {
		const moment = window
			.moment()
			.year(this.year)
			.month(this.month)
			.date(day);

		const filename = `${moment.format("YYYY-MM-DD")}.md`;
		const path = normalizePath(`${monthFolder.path}/${filename}`);
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!file || !(file instanceof TFile)) {
			// TODO: apply template
			const file = await this.app.vault.create(path, "");
			return file;
		}
		return file;
	}
}
