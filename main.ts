import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { Navigator } from "src/navigator";
import { GTD } from "src/gtd";

interface DailyGTDSettings {
	folder: string;
	maybe: string;
	dailyFormat: string;
}

const DEFAULT_SETTINGS: DailyGTDSettings = {
	folder: "Daily",
	maybe: "Maybe",
	dailyFormat: "YYYY/MM/YYYY-MM-DD",
};

export default class DailyGTD extends Plugin {
	settings: DailyGTDSettings;

	async onload() {
		// this.registerEditorExtension(cm);
		await this.loadSettings();

		this.addCommand({
			id: "open-next-daily-note",
			name: "Next Daily Note",
			callback: async () => {
				const path = this.app.workspace.activeEditor?.file?.path;
				const nav = new Navigator(this.app, path, DEFAULT_SETTINGS);
				nav.openNextExistingFile(1);
			},
		});

		this.addCommand({
			id: "open-previous-daily-note",
			name: "Previous Daily Note",
			callback: async () => {
				const path = this.app.workspace.activeEditor?.file?.path;
				const nav = new Navigator(this.app, path, DEFAULT_SETTINGS);
				nav.openNextExistingFile(-1);
			},
		});

		this.addCommand({
			id: "create-and-open-next-daily-note",
			name: "Create And Open Next Daily Note",
			callback: async () => {
				const path = this.app.workspace.activeEditor?.file?.path;
				const nav = new Navigator(this.app, path, DEFAULT_SETTINGS);
				nav.openOffsetDays(1);
			},
		});

		this.addCommand({
			id: "append-selection-tomorrow",
			name: "Send Selection to Tomorrow",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (!selection) {
					return;
				}
				const path = view.file?.path;
				const dnt = new GTD(
					this.app,
					path,
					selection,
					DEFAULT_SETTINGS
				);
				await dnt.appendToDailyNote({ day: 1 });
			},
		});

		this.addCommand({
			id: "append-line-tomorrow",
			name: "Send Line to Tomorrow",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const cursor = editor.getCursor();
				const selection = editor.getLine(cursor.line);
				if (!selection) {
					return;
				}
				const path = view.file?.path;
				const dnt = new GTD(
					this.app,
					path,
					selection,
					DEFAULT_SETTINGS
				);
				await dnt.appendToDailyNote({ day: 1 });
			},
		});

		this.addCommand({
			id: "append-selection-one-month-later",
			name: "Send Selection to one month later",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (!selection) {
					return;
				}
				const path = view.file?.path;
				const dnt = new GTD(
					this.app,
					path,
					selection,
					DEFAULT_SETTINGS
				);
				await dnt.prependDate().appendToDailyNote();
			},
		});

		this.addCommand({
			id: "append-line-one-month-later",
			name: "Send Line to one month later",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const cursor = editor.getCursor();
				const selection = editor.getLine(cursor.line);
				if (!selection) {
					return;
				}
				const path = view.file?.path;
				const dnt = new GTD(
					this.app,
					path,
					selection,
					DEFAULT_SETTINGS
				);

				await dnt.prependDate().appendToDailyNote();
			},
		});

		this.addCommand({
			id: "debug",
			name: "Debug Normal",
			callback: async () => {
				const path = this.app.workspace.activeEditor?.file?.path;
				const nav = new Navigator(this.app, path, DEFAULT_SETTINGS);
				// const range = nav.getFirstAndLastDate();
				// console.log(range?.map((x) => x.format("YYYY-MM-DD")));
				// if (!range) {
				// 	return;
				// }
				// const d = nav.getNextExistingFile(range, -1);
				// console.log(d?.path);
			},
		});

		this.addCommand({
			id: "debug-editor",
			name: "Debug Editor",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const cursor = editor.getCursor();
				const selection = editor.getLine(cursor.line);
			},
		});
		// TODO: Create setting tab
		// this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleSettingTab extends PluginSettingTab {
// 	plugin: DailyGTD;

// 	constructor(app: App, plugin: DailyGTD) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		const { containerEl } = this;

// 		containerEl.empty();

// 		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

// 		new Setting(containerEl)
// 			.setName("Setting #1")
// 			.setDesc("It's a secret")
// 			.addText((text) =>
// 				text
// 					.setPlaceholder("Enter your secret")
// 					.setValue(this.plugin.settings.mySetting)
// 					.onChange(async (value) => {
// 						console.log("Secret: " + value);
// 						this.plugin.settings.mySetting = value;
// 						await this.plugin.saveSettings();
// 					})
// 			);
// 	}
// }
