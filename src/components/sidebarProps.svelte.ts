import type { App } from "obsidian";

import type { ParsedIndicators } from "../sites";

export type SidebarProps = {
    indicators: ParsedIndicators[];
    app: App;
};

/**
 * Holds the Sidebar's props in reactive state so the view can update a mounted
 * component by assigning to `indicators`, which replaced `$set` in Svelte 5.
 */
export function createSidebarProps(app: App, indicators: ParsedIndicators[]): SidebarProps {
    let current = $state.raw(indicators);
    return {
        app,
        get indicators() {
            return current;
        },
        set indicators(value: ParsedIndicators[]) {
            current = value;
        },
    };
}
