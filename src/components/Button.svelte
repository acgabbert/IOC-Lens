<script lang="ts">
	interface Props {
		title: string;
		content: string;
		href: string;
	}

	const { title, content, href }: Props = $props();
</script>

<a {href}>
	<button {title}>{content}</button>
</a>

<style>
	button {
		transform: scale(0.8, 0.8);
	}
</style>
