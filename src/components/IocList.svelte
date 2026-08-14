<script lang="ts">
	import { buildMultisearchUrl, type ParsedIndicators } from "../sites";

    import Item from "./Item.svelte";
	import Button from "./Button.svelte";
	import PivotRow from "./PivotRow.svelte";

    interface Props {
        indicatorList: ParsedIndicators;
    }

    const { indicatorList }: Props = $props();

    // Only the initial value: this sets the default expansion, and must not fight
    // the user's own toggling of the <details> element on later updates. The each
    // block in Sidebar is keyed by title, so an instance never changes category.
    // svelte-ignore state_referenced_locally
    const open = !indicatorList.title.includes("Private");

    const multisearchLinks = $derived.by(() => {
        const links = new Map<string, string>();
        indicatorList.sites?.forEach((site) => {
            const url = buildMultisearchUrl(site, indicatorList.items);
            if (url) links.set(site.shortName, url);
        });
        return links;
    });
</script>

<details class="sidebar-container tree-item" {open}>
    <summary class="tree-item-inner">{indicatorList.title}</summary>
    <div class="tree-item-children">
        {#each indicatorList.items as item}
            <Item item={item} buttons={indicatorList.sites}/>
        {/each}
    </div>
    {#if indicatorList.sites}
    <PivotRow>
        {#each indicatorList.sites as site}
            {@const href = multisearchLinks.get(site.shortName)}
            {#if site.multisearch && href}
                <Button
                    {href}
                    title={`Search all - ${site.name}`}
                    content={`Search all - ${site.shortName}`}
                />
            {/if}
        {/each}
    </PivotRow>
    {/if}
</details>

<style>
    /* The category header is a click target for expanding the group, so dragging
       across it should not select its text. Indicator values below stay selectable. */
    summary {
        user-select: none;
    }

    .sidebar-container {
        margin-bottom: var(--size-4-3, 12px);
        user-select: text;
        word-break: break-all;
        white-space: normal;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>
