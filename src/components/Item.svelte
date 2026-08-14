<script lang="ts">
    import Button from "./Button.svelte";
    import PivotRow from "./PivotRow.svelte";
	import { buildSearchUrl, type SearchSite } from "../sites";

    interface Props {
        item: string;
        buttons: SearchSite[] | undefined;
    }

    const { item, buttons }: Props = $props();
</script>

<div class="tree-item-self">
    <div class="tree-item-inner">{item}</div>
</div>
{#if buttons}
<PivotRow>
    {#each buttons as button}
        <Button href={buildSearchUrl(button, item)} title={button.name} content={button.shortName}/>
    {/each}
</PivotRow>
{/if}

<style>
    /* Obsidian indents tree-item-self, which would push the indicator label
       further right than the pivot buttons that belong to it. Both physical and
       logical properties, since either could be what the theme sets. */
    .tree-item-self {
        padding-left: 0;
        padding-inline-start: 0;
    }

    .tree-item-inner {
        margin-top: var(--size-4-2, 8px);
        word-break: break-all;
        text-wrap: wrap;
        overflow: hidden;
    }
</style>
