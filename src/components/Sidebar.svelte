<script lang="ts">
    import IocList from './IocList.svelte'
	import { Modal } from "obsidian";

	import type { SidebarProps } from "./sidebarProps.svelte";

    const { indicators, app }: SidebarProps = $props();

    const hasIndicators = $derived(indicators.some(list => list.items.length > 0));

    function helpButton() {
        const helpModal = new Modal(app);
        helpModal.setTitle("ⓘ IOC Lens help");
        helpModal.setContent(`Configure which search pivot buttons appear in the "IOC Lens" tab of Obsidian's settings.`);
        helpModal.open();
    }
</script>

<h4>IOC Lens</h4>
{#if hasIndicators}
    {#each indicators as indicatorList (indicatorList.title)}
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
    onclick={helpButton}
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
