import { MarkdownView, type Editor, type EventRef } from 'obsidian';
import { CyberPlugin, getValidTld } from 'obsidian-cyber-utils';

import { IOC_LENS_DEFAULT_SETTINGS, type IocLensSettings, IocLensSettingTab } from 'src/settings';
import { DEFAULT_VIEW_TYPE, IndicatorSidebar } from 'src/iocLensView';
import { DefangMethods, defangText } from 'src/iocUtils';
import { defaultSites, type SearchSite } from 'src/sites';

export default class IocLens extends CyberPlugin {
	declare settings: IocLensSettings;
	private transformRef: EventRef;

	async onload() {
		await this.loadSettings();
		
		// retrieve valid top-level domain identifiers from IANA
		this.validTld = await getValidTld();
		if (this.validTld) this.settings.validTld = this.validTld;
		
		this.registerView(DEFAULT_VIEW_TYPE, (leaf) => new IndicatorSidebar(leaf, this));

		this.addRibbonIcon('scan-eye', 'Activate IOC Lens', (evt: MouseEvent) => {
			this.activateView(DEFAULT_VIEW_TYPE);
		});

		this.addCommand({
			id: 'activate-ioc-lens-view',
			name: 'Activate IOC view',
			callback: () => {
				this.activateView(DEFAULT_VIEW_TYPE);
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

		this.transformRef = this.app.workspace.on("editor-menu", (menu) => {
			menu.addItem((item) => {
				item.setTitle('Defang selection')
					.setIcon('scan-eye')
					.onClick(() => {
						const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
						if (!editor) return;
						const selection = editor.getSelection();
						const replaced = defangText(selection);
						editor.replaceSelection(replaced);
					})
			})
		})

		this.addSettingTab(new IocLensSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, IOC_LENS_DEFAULT_SETTINGS, await this.loadData());
		this.updateSites();
	}

	async saveSettings() {
		super.saveSettings();
	}

	updateSites() {
		defaultSites.forEach(async (site: SearchSite) => {
			const settingSite = this.settings.searchSites.find(obj => obj.name === site.name);
			const enabled = settingSite?.enabled ?? site.enabled;
			const index = this.settings.searchSites.findIndex(obj => obj.name === site.name);
			if (index >= 0) {
				this.settings.searchSites[index] = {...site, enabled: enabled};
			} else {
				this.settings.searchSites.push({...site, enabled: enabled});
			}
			await this.saveSettings();
		})
	}

	onunload(): void {
		super.onunload();
		this.app.workspace.offref(this.transformRef);
	}
}