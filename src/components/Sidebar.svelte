<script lang="ts">
	import type { ParsedIndicators } from "../sites";
    import IocList from './IocList.svelte'
	import { App, Modal } from "obsidian";
    
    export let indicators: ParsedIndicators[];

    $: hasIndicators = indicators.some(list => list.items.length > 0);
    export let app: App;

    function helpButton() {
        const helpModal = new Modal(app);
        helpModal.setTitle("ⓘ IOC Lens help");
        helpModal.setContent(`Configure which search pivot buttons appear in the "IOC Lens" tab of Obsidian's settings.`);
        helpModal.open();
    }
</script>

<h4>IOC Lens</h4>
{#if hasIndicators}
    {#each indicators as indicatorList}
        {#if indicatorList.items.length > 0}
            <IocList indicatorList={indicatorList}/>
        {/if}
    {/each}
{:else}
    <div class="empty-state">
        No indicators found. IOC Lens will extract IP addresses, domains, and file hashes from the active note.
    </div>
{/if}
<button
    class="help-button"
    on:click={helpButton}
>
    ⓘ
</button>

<style>
    .help-button {
        position: fixed;
        bottom: 2rem;
        right: 1rem;
        scale: 0.8;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-muted);
        font-style: italic;
    }
</style>
