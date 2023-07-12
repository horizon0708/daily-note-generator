import { App, Notice, TAbstractFile, TFile } from "obsidian";
import { DailyNoteBase } from "./daily-note-base";

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
		if (!this.isValid) {
			return new Notice(this.message);
		}

		const currentMoment = this.today.clone();

		if (!currentMoment.isValid()) {
			new Notice("Not in a daily note");
			return;
		}

		const dateString = currentMoment.format("YYYY-MM-DD");
		const index = this.dailyNotesDates.findIndex((d) => d === dateString);

		if (index === -1) {
			new Notice("Could not find current daily note");
			return;
		}
		const nextIndex = index + offset;

		if (nextIndex < 0 || nextIndex >= this.dailyNotesDates.length) {
			new Notice(
				`No ${offset === 1 ? "next" : "previous"} daily note available`
			);
			return;
		}

		const nextDate = this.dailyNotesDates[nextIndex];
		const moment = window.moment(nextDate, "YYYY-MM-DD");
		const filepath = this.getPathFromMoment(moment);
		const file = this.app.vault.getAbstractFileByPath(filepath);
		if (!(file instanceof TFile)) {
			new Notice(
				`No ${offset === 1 ? "next" : "previous"} daily note available`
			);
			return;
		}
		this.app.workspace.getMostRecentLeaf()?.openFile(file);
	}

	private get dailyNotesDates() {
		const dayRegex = /^[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9].*\.md/;
		const dailyNotes = this.app.vault
			.getFiles()
			.reduce((acc, file) => {
				if (
					!file.path.startsWith(this.settings.folder) ||
					!dayRegex.test(file.name)
				) {
					return acc;
				}
				const moment = this.extractMoment(file, dayRegex);
				if (!moment) {
					return acc;
				}
				return [...acc, moment];
			}, [])
			.sort((a, b) => {
				if (a.isSame(b)) return 0;
				return a.isAfter(b) ? 1 : -1;
			})
			.map((x) => x.format("YYYY-MM-DD"));

		return dailyNotes;
	}

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
}
