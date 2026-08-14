<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<div class="pivot-row">{@render children()}</div>

<style>
	.pivot-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2-3, 6px);
		margin: var(--size-2-2, 4px) 0 var(--size-4-2, 8px);
	}
</style>
