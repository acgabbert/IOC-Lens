import { WorkspaceLeaf } from 'obsidian';
import { CyberPlugin, getValidTld } from 'obsidian-cyber-utils';

import { IOC_LENS_DEFAULT_SETTINGS, type IocLensSettings, IocLensSettingTab } from 'src/settings';
import { DEFAULT_VIEW_TYPE, IndicatorSidebar } from 'src/iocLensView';
import { defaultSites, type searchSite } from 'src/sites';

// Remember to rename these classes and interfaces!



export default class IocLens extends CyberPlugin {
	declare settings: IocLensSettings;

	async onload() {
		await this.loadSettings();
		
		// retrieve valid top-level domain identifiers from IANA
		this.validTld = await getValidTld();
		if (this.validTld) this.settings.validTld = this.validTld;
		
		this.registerView(DEFAULT_VIEW_TYPE, (leaf) => new IndicatorSidebar(leaf, this));

		const ribbonIconEl = this.addRibbonIcon('scan-eye', 'Activate IOC Lens', (evt: MouseEvent) => {
			this.activateView(DEFAULT_VIEW_TYPE);
		});

		this.addCommand({
			id: 'activate-ioc-lens-view',
			name: 'Activate IOC View',
			callback: () => {
				this.activateView(DEFAULT_VIEW_TYPE);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new IocLensSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, IOC_LENS_DEFAULT_SETTINGS, await this.loadData());
		this.updateSites();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateSites() {
		const retval = [];
		defaultSites.forEach(async (site: searchSite) => {
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
}