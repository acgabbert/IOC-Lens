import { ItemView, TAbstractFile, TFile, WorkspaceLeaf } from "obsidian";

import Sidebar from "./components/Sidebar.svelte";
import type IocLens from "main";
import { findIndicators, isPrivateIpv4, refangIndicator, uniqueIndicators, validateDomains } from "./ioc";
import type { ParsedIndicators, SearchSite } from "./sites";

export const DEFAULT_VIEW_TYPE = "ioc-lens-view";

export class IndicatorSidebar extends ItemView {
    sidebar: Sidebar | undefined;
    iocs: ParsedIndicators[] | undefined;
    plugin: IocLens | undefined;
    splitLocalIp: boolean;

    constructor(leaf: WorkspaceLeaf, plugin: IocLens) {
        super(leaf);
        this.iocs = [];
        this.plugin = plugin;
        this.splitLocalIp = true;
        this.icon = 'scan-eye';
        this.registerActiveFileListener();
        this.registerOpenFile();
        this.registerSettingsListener();
    }

    getViewType(): string {
        return DEFAULT_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "IOC Lens view";
    }

    registerSettingsListener() {
        if (!this.plugin) return;
        this.registerEvent(
            this.plugin.onSettingsChange(() => {
                const file = this.app.workspace.getActiveFile();
                if (!file) return;
                void this.parseIndicators(file);
            })
        );
    }

    registerActiveFileListener() {
        if (!this.plugin) return;
        this.registerEvent(
            this.plugin.app.vault.on('modify', (file: TAbstractFile) => {
                if (!this.plugin) return;
                if (file === this.plugin.app.workspace.getActiveFile() && file instanceof TFile) {
                    void this.parseIndicators(file);
                }
            })
        );
    }

    registerOpenFile() {
        this.registerEvent(
            this.app.workspace.on('file-open', (file: TFile | null) => {
                if (file && file === this.app.workspace.getActiveFile()) {
                    void this.parseIndicators(file);
                }
            })
        );
    }

    protected async onOpen(): Promise<void> {
        if (!this.plugin) return;
        const file = this.plugin.app.workspace.getActiveFile();
        if (file) {
            await this.parseIndicators(file);
        }
    }

    async getMatches(file: TFile) {
        if (!this.plugin) return;
        const fileContent = await this.plugin.app.vault.cachedRead(file);
        this.iocs = [];
        const ips: ParsedIndicators = {
            title: "IPs",
            items: findIndicators(fileContent, 'IPv4'),
            sites: this.plugin?.settings?.searchSites.filter((x: SearchSite) => x.enabled && x.ip)
        }
        const domains: ParsedIndicators = {
            title: "Domains",
            items: findIndicators(fileContent, 'Domain'),
            sites: this.plugin?.settings?.searchSites.filter((x: SearchSite) => x.enabled && x.domain)
        }
        let sha256Hashes: ParsedIndicators | null = null;
        let md5Hashes: ParsedIndicators | null = null;
        if (this.plugin.settings.sha256Enabled) {
            sha256Hashes = {
                title: "Hashes (SHA256)",
                items: findIndicators(fileContent, 'SHA256'),
                sites: this.plugin?.settings?.searchSites.filter((x: SearchSite) => x.enabled && x.hash)
            }
        }
        if (this.plugin.settings.md5Enabled) {
            md5Hashes = {
                title: "Hashes (MD5)",
                items: findIndicators(fileContent, 'MD5'),
                sites: this.plugin?.settings?.searchSites.filter((x: SearchSite) => x.enabled && x.hash)
            }
        }
        const privateIps: ParsedIndicators = {
            title: "IPs (Private)",
            items: [],
            sites: this.plugin?.settings?.searchSites.filter((x: SearchSite) => x.enabled && x.ip)
        }
        const ipv6: ParsedIndicators = {
            title: "IPv6",
            items: findIndicators(fileContent, 'IPv6'),
            sites: this.plugin?.settings?.searchSites.filter((x: SearchSite) => x.enabled && x.ipv6)
        }
        if (this.plugin?.validTld) 
            domains.items = validateDomains(domains.items, this.plugin.validTld);
        if (this.splitLocalIp) {
            ips.title = "IPs (Public)";
            for (let i = 0; i < ips.items.length; i++) {
                const item = ips.items[i];
                if(isPrivateIpv4(item)) {
                    ips.items.splice(i, 1);
                    i--;
                    privateIps.items.push(item);
                }
            }
        }
        this.iocs.push(ips);
        if (this.splitLocalIp) this.iocs.push(privateIps);
        this.iocs.push(domains);
        if (sha256Hashes) this.iocs.push(sha256Hashes);
        if (md5Hashes) this.iocs.push(md5Hashes);
        this.iocs.push(ipv6)
        this.refangIocs();
    }

    private refangIocs() {
        this.iocs?.forEach((iocList, index, array) => {
            iocList.items = iocList.items.map((x) => refangIndicator(x));
            iocList.items = uniqueIndicators(iocList.items);
            array[index] = iocList;
        })
    }

    async parseIndicators(file: TFile) {
        await this.getMatches(file);
        if (!this.sidebar && this.iocs && this.plugin) {
            this.sidebar = new Sidebar({
                target: this.contentEl,
                props: {
                    indicators: this.iocs,
                    app: this.plugin.app
                }
            });
        } else if (this.plugin) {
            this.sidebar?.$set({
                indicators: this.iocs,
                app: this.plugin.app
            });
        }
    }

    async onClose() {
        if (this.sidebar) {
            this.sidebar.$destroy();
            this.sidebar = undefined;
        }
    }
}
