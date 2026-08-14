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
    .tree-item-inner {
        margin-top: var(--size-4-2, 8px);
        word-break: break-all;
        text-wrap: wrap;
        overflow: hidden;
    }
</style>
