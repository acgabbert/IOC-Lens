import { ItemView, TAbstractFile, TFile, WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";

import Sidebar from "./components/Sidebar.svelte";
import { createSidebarProps, type SidebarProps } from "./components/sidebarProps.svelte";
import type IocLens from "main";
import { findIndicators, isPrivateIpv4, refangIndicator, uniqueIndicators, validateDomains } from "./ioc";
import type { ParsedIndicators, SearchSite } from "./sites";

export const DEFAULT_VIEW_TYPE = "ioc-lens-view";

export class IndicatorSidebar extends ItemView {
    sidebar: Record<string, unknown> | undefined;
    sidebarProps: SidebarProps | undefined;
    iocs: ParsedIndicators[] | undefined;
    plugin: IocLens | undefined;
    splitLocalIp: boolean;
    private parseGeneration = 0;

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

    async getMatches(file: TFile): Promise<ParsedIndicators[] | undefined> {
        if (!this.plugin) return;
        const fileContent = await this.plugin.app.vault.cachedRead(file);
        const iocs: ParsedIndicators[] = [];
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
        iocs.push(ips);
        if (this.splitLocalIp) iocs.push(privateIps);
        iocs.push(domains);
        if (sha256Hashes) iocs.push(sha256Hashes);
        if (md5Hashes) iocs.push(md5Hashes);
        iocs.push(ipv6);
        return this.refangIocs(iocs);
    }

    private refangIocs(iocs: ParsedIndicators[]): ParsedIndicators[] {
        return iocs.map(iocList => ({
            ...iocList,
            items: uniqueIndicators(iocList.items.map(item => refangIndicator(item))),
        }));
    }

    async parseIndicators(file: TFile) {
        const generation = ++this.parseGeneration;
        const iocs = await this.getMatches(file);
        if (
            generation !== this.parseGeneration ||
            file !== this.app.workspace.getActiveFile() ||
            !iocs
        ) return;

        this.iocs = iocs;
        if (!this.sidebar && this.iocs && this.plugin) {
            this.sidebarProps = createSidebarProps(this.plugin.app, this.iocs);
            this.sidebar = mount(Sidebar, {
                target: this.contentEl,
                props: this.sidebarProps
            });
        } else if (this.sidebarProps) {
            this.sidebarProps.indicators = this.iocs;
        }
    }

    async onClose() {
        this.parseGeneration++;
        if (this.sidebar) {
            await unmount(this.sidebar);
            this.sidebar = undefined;
            this.sidebarProps = undefined;
        }
    }
}
