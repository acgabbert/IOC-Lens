<script lang="ts">
	import { buildMultisearchUrl, type ParsedIndicators } from "../sites";

    import Item from "./Item.svelte";
	import Button from "./Button.svelte";

    interface Props {
        indicatorList: ParsedIndicators;
    }

    const { indicatorList }: Props = $props();

    // Only the initial value: this sets the default expansion, and must not fight
    // the user's own toggling of the <details> element on later updates. The each
    // block in Sidebar is keyed by title, so an instance never changes category.
    // svelte-ignore state_referenced_locally
    const open = !indicatorList.title.contains("Private");

    const multisearchLinks = $derived.by(() => {
        const links = new Map<string, string>();
        indicatorList.sites?.forEach((site) => {
            const url = buildMultisearchUrl(site, indicatorList.items);
            if (url) links.set(site.shortName, url);
        });
        return links;
    });

    function getMultisearchLink(shortName: string): string {
        const href = multisearchLinks.get(shortName);
        if (href === undefined) {
            throw new Error(`No multisearch link found for ${shortName}`);
        }
        return href;
    }
</script>

<details class="sidebar-container tree-item" {open}>
    <summary class="tree-item-inner">{indicatorList.title}</summary>
    <div class="tree-item-children">
        {#each indicatorList.items as item}
            <Item item={item} buttons={indicatorList.sites}/>
        {/each}
    </div>
    {#if indicatorList.sites}
    <div class="grid-container">
        {#each indicatorList.sites as site}
            {#if site.multisearch && multisearchLinks.has(site.shortName)}
                <Button
                    href={getMultisearchLink(site.shortName)}
                    title={`Search all - ${site.name}`}
                    content={`Search all - ${site.shortName}`}
                />
            {/if}
        {/each}
    </div>
    {/if}
</details>

<style>
    .sidebar-container {
        user-select: text;
        word-break: break-all;
        white-space: normal;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>
