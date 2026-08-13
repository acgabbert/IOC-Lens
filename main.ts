import { Events, MarkdownView, Plugin, type Editor, type EventRef } from 'obsidian';

import { IOC_LENS_DEFAULT_SETTINGS, type IocLensSettings, IocLensSettingTab } from 'src/settings';
import { DEFAULT_VIEW_TYPE, IndicatorSidebar } from 'src/iocLensView';
import { defangText } from 'src/iocUtils';
import { defaultSites } from 'src/sites';
import { normalizeSettings, reconcileSearchSites } from 'src/settingsData';
import { fetchValidTlds } from 'src/tlds';

export default class IocLens extends Plugin {
    settings: IocLensSettings;
    validTld: string[] | null = null;
    private readonly events = new Events();
    private isUnloaded = false;

	async onload() {
		await this.loadSettings();
		this.validTld = this.settings.validTld.length > 0 ? this.settings.validTld : null;
		this.register(() => {
			this.isUnloaded = true;
		});
		
		this.registerView(DEFAULT_VIEW_TYPE, (leaf) => new IndicatorSidebar(leaf, this));

		this.addRibbonIcon('scan-eye', 'Activate IOC Lens', () => {
			void this.activateView(DEFAULT_VIEW_TYPE);
		});

		this.addCommand({
			id: 'activate-ioc-lens-view',
			name: 'Activate IOC view',
			callback: () => {
				void this.activateView(DEFAULT_VIEW_TYPE);
			}
		});

		this.addCommand({
			id: 'ioc-lens-defang-selection',
			name: 'Defang selected text',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				const replaced = defangText(selection);
				editor.replaceSelection(replaced);
			}
		});

		this.registerEvent(this.app.workspace.on("editor-menu", (menu) => {
			menu.addItem((item) => {
				item.setTitle('Defang selection')
					.setIcon('scan-eye')
					.onClick(() => {
						const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
						if (!editor) return;
						const selection = editor.getSelection();
						const replaced = defangText(selection);
						editor.replaceSelection(replaced);
					});
			});
		}));

		this.addSettingTab(new IocLensSettingTab(this.app, this));

		void this.refreshValidTlds();
	}

	private async refreshValidTlds(): Promise<void> {
		const fetchedTlds = await fetchValidTlds();
		if (!fetchedTlds || this.isUnloaded) return;

		this.validTld = fetchedTlds;
		if (
			fetchedTlds.length === this.settings.validTld.length &&
			fetchedTlds.every((tld, index) => tld === this.settings.validTld[index])
		) return;

		this.settings.validTld = fetchedTlds;
		await this.saveSettings();
	}

	async loadSettings() {
		this.settings = normalizeSettings(await this.loadData(), IOC_LENS_DEFAULT_SETTINGS);
		await this.updateSites();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.events.trigger('settings-change');
	}

	onSettingsChange(callback: () => void): EventRef {
		return this.events.on('settings-change', callback);
	}

	async activateView(type: string): Promise<void> {
		await this.app.workspace.ensureSideLeaf(type, 'right', { active: true });
	}

	async updateSites() {
		const { searchSites, changed } = reconcileSearchSites(this.settings.searchSites, defaultSites);
		if (!changed) return;

		this.settings.searchSites = searchSites;
		await this.saveSettings();
	}
}
