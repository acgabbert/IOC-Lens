<script lang="ts">
	interface Props {
		title: string;
		content: string;
		href: string;
	}

	const { title, content, href }: Props = $props();
</script>

<!--
	A link, not a button: these navigate to an external search. Rendering a real
	<a> keeps middle-click, "copy link address" and the browser's own affordances,
	which nesting a <button> inside the anchor broke along with the HTML.
-->
<a class="pivot-link" {href} {title}>{content}</a>

<style>
	.pivot-link {
		display: inline-block;
		padding: var(--size-4-1) var(--size-4-2);
		border-radius: var(--radius-s);
		background-color: var(--interactive-normal);
		box-shadow: var(--shadow-s);
		color: var(--text-normal);
		font-size: var(--font-ui-smaller);
		line-height: 1;
		text-decoration: none;
		white-space: nowrap;
		cursor: var(--cursor-link);
	}

	.pivot-link:hover {
		background-color: var(--interactive-hover);
		color: var(--text-normal);
		text-decoration: none;
	}
</style>
