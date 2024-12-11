<script lang="ts">
    import Button from "./Button.svelte";
	import type { SearchSite } from "obsidian-cyber-utils";

    export let item: string;
    export let buttons: SearchSite[] | undefined;
</script>

<div class="sidebar-list-item tree-item-self">
    <div class="tree-item-inner">{item}</div>
</div>
{#if buttons}
<div class="grid-container">
    {#each buttons as button}
        <Button href={button.site.replace('%s', item)} title={button.name} content={button.shortName}/>
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