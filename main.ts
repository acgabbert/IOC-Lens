import { Events, MarkdownView, Plugin, type Editor, type EventRef } from 'obsidian';

import { IOC_LENS_DEFAULT_SETTINGS, type IocLensSettings, IocLensSettingTab } from 'src/settings';
import { DEFAULT_VIEW_TYPE, IndicatorSidebar } from 'src/iocLensView';
import { defangText } from 'src/iocUtils';
import { defaultSites } from 'src/sites';
import { fetchValidTlds } from 'src/tlds';

export default class IocLens extends Plugin {
    settings: IocLensSettings;
    validTld: string[] | null = null;
    private readonly events = new Events();

	async onload() {
		await this.loadSettings();
		
		// retrieve valid top-level domain identifiers from IANA
		const fetchedTlds = await fetchValidTlds();
		this.validTld = fetchedTlds ?? this.settings.validTld;
		if (fetchedTlds) {
			this.settings.validTld = fetchedTlds;
			await this.saveSettings();
		}
		
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
	}

	async loadSettings() {
		this.settings = Object.assign({}, IOC_LENS_DEFAULT_SETTINGS, await this.loadData());
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
		for (const site of defaultSites) {
			const settingSite = this.settings.searchSites.find(obj => (obj.name === site.name || obj.shortName === site.shortName));
			const enabled = settingSite?.enabled ?? site.enabled;
			const index = this.settings.searchSites.findIndex(obj => (obj.name === site.name || obj.shortName === site.shortName));
			if (index >= 0) {
				this.settings.searchSites[index] = {...site, enabled: enabled};
			} else {
				this.settings.searchSites.push({...site, enabled: enabled});
			}
		}
		await this.saveSettings();
	}
}
