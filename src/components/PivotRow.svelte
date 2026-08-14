<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
		/** Set for a row that acts on the whole group rather than one indicator,
		    so the extra space above it shows what it belongs to. */
		standalone?: boolean;
	}

	const { children, standalone = false }: Props = $props();
</script>

<div class="pivot-row" class:standalone>{@render children()}</div>

<style>
	/* Spacing goes above the row, never below: a trailing margin would push the
	   tree's guide line past the last row of a group. */
	.pivot-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2-3, 6px);
		margin-top: var(--size-2-2, 4px);
	}

	/* Outdented toward the category header, since it acts on the whole group
	   rather than on the indicator directly above it. */
	.pivot-row.standalone {
		margin-top: var(--size-4-4, 16px);
		margin-left: calc(-1 * var(--size-4-2, 8px));
	}
</style>
