<template>
	<div>
		<h1>TODO</h1>

		<div>
			<pre>
fullPath: {{ $route.fullPath }}
hash: {{ $route.hash }}
meta: {{ $route.meta }}
name: {{ $route.name }}
params: {{ $route.params }}
path: {{ $route.path }}
query: {{ $route.query }}
</pre
			>
		</div>
	</div>
</template>

<script>
export default {
	beforeCreate() {
		console.log(this.$route);
	},
};
</script>
