<script lang="ts">
    import Button from "./Button.svelte";
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
<div>
    {#each buttons as button}
        <Button href={buildSearchUrl(button, item)} title={button.name} content={button.shortName}/>
    {/each}
</div>
{/if}

<style>
    .tree-item-inner {
        word-break: break-all;
        text-wrap: wrap;
        overflow: hidden;
    }
</style>
