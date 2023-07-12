import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { DailyNoteBase } from "./daily-note-base";
import { Moment } from "moment";

export class Navigator extends DailyNoteBase {
	constructor(app: App, path: string | undefined, settings: any) {
		super(app, path, settings);
	}

	async openOffsetDays(offsetDays: number, from = this.today) {
		const nextMoment = from.clone().add(offsetDays, "day");
		let file = await this.createDailyNote(nextMoment);
		this.app.workspace.getMostRecentLeaf()?.openFile(file);
	}

	openNextExistingNote(offset: 1 | -1) {
		const range = this.getFirstAndLastDate();
		if (!range) {
			new Notice(`Could not find any daily notes`);
			return;
		}
		const file = this.getNextExistingFile(range, offset);
		if (!file) {
			new Notice(`No ${offset === 1 ? "next" : "previous"} daily note`);
			return;
		}
		this.app.workspace.getMostRecentLeaf()?.openFile(file);
	}

	getNextExistingFile(
		[min, max]: [Moment, Moment],
		offset: -1 | 1,
		currentDay = this.today
	): TFile | null {
		if (
			(offset === 1 && currentDay?.isSameOrAfter(max)) ||
			(offset === -1 && currentDay?.isSameOrBefore(min))
		) {
			return null;
		}
		// IMPROVEMENT: this is a bit inefficient
		// Might be best to use `getFiles()` api to get list of all
		// eligible dates and jump to the closest file...

		const nextMoment = currentDay.clone().add(offset, "day");
		const path = this.getPathFromMoment(nextMoment);
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			return this.getNextExistingFile([min, max], offset, nextMoment);
		}
		return file;
	}

	private getFirstAndLastDate(): [Moment, Moment] | null {
		const dailyNotes = this.app.vault.getAbstractFileByPath(
			this.settings.folder
		);
		if (!(dailyNotes instanceof TFolder)) {
			return null;
		}

		// assume something like Daily/YYYY/MM/YYYY-MM-DD.md
		const yearRegex = /^[1-9][0-9][0-9][0-9]/;
		const monthRegex = /^[0-1][0-9]/;
		const years = this.getFirstAndLastFolderByRegex(dailyNotes, yearRegex);
		if (!years) {
			return null;
		}
		const [firstYear, lastYear] = years;

		// could be more elegant but this will do for now
		const firstMonths = this.getFirstAndLastFolderByRegex(
			firstYear,
			monthRegex
		);
		const lastMonths = this.getFirstAndLastFolderByRegex(
			lastYear,
			monthRegex
		);

		if (!firstMonths || !lastMonths) {
			return null;
		}
		const [firstMonth] = firstMonths;
		const [, lastMonth] = lastMonths;

		const firstMoments = this.getFirstAndLastMoments(firstMonth);
		if (!firstMoments) {
			return null;
		}
		const [firstMoment] = firstMoments;

		const lastMoments = this.getFirstAndLastMoments(lastMonth);

		if (!lastMoments) {
			return null;
		}
		const [, lastMoment] = lastMoments;

		return [firstMoment, lastMoment];
	}

	private getFirstAndLastFolderByRegex = (folder: TFolder, regex: RegExp) => {
		const folders = folder.children
			.filter((file): file is TFolder => {
				return regex.test(file.name) && file instanceof TFolder;
			})
			.sort((a, b) => {
				return (
					this.extractNumber(a, regex) - this.extractNumber(b, regex)
				);
			});

		if (!folders.length) {
			return null;
		}

		return [folders[0], folders[folders.length - 1]];
	};

	private getFirstAndLastMoments = (folder: TFolder) => {
		const dayRegex = /^[0-9][0-9][0-9][0-9]-[0-1][0-9]-([0-3][0-9])/;
		const files = folder.children
			.filter((file): file is TFile => {
				return dayRegex.test(file.name) && file instanceof TFile;
			})
			.sort((a, b) => {
				return (
					this.extractNumberWithCapture(a, dayRegex) -
					this.extractNumberWithCapture(b, dayRegex)
				);
			});

		if (!files.length) {
			return null;
		}
		const dateRegex = /^[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]/;
		const first = this.extractMoment(files[0], dateRegex);
		const last = this.extractMoment(files[files.length - 1], dateRegex);

		if (!first || !last) {
			return null;
		}

		return [first, last];
	};

	private extractMoment = (file: TAbstractFile, regex: RegExp) => {
		const match = file.name.match(regex);
		if (!match) {
			return null;
		}
		const m = window.moment(match[0], "YYYY-MM-DD");
		if (!m.isValid()) {
			return null;
		}
		return m;
	};

	private extractNumber = (file: TAbstractFile, regex: RegExp) => {
		const match = file.name.match(regex);
		if (!match) {
			return 0;
		}
		return parseInt(match[0]);
	};

	private extractNumberWithCapture = (file: TAbstractFile, regex: RegExp) => {
		const match = file.name.match(regex);
		if (!match) {
			return 0;
		}
		return parseInt(match[1]);
	};
}
