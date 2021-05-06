<template>
	<div class="reports-container">
		<h1 class="title has-text-centered">Reports</h1>

		<iframe
			class="reports"
			src="https://app.powerbi.com/reportEmbed?reportId=e3763506-6b37-45a9-a8c6-81a94c70f823&appId=73dcd2a9-d860-456d-b648-991c27a79de5&autoAuth=true&ctid=c8342453-69ce-4b7b-a3e2-cda219f2985e&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLWV1cm9wZS1ub3J0aC1iLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9"
			frameborder="0"
			allowFullScreen="true"
		/>
	</div>
</template>

<script>
export default {
	name: "Reports",
};
</script>

<style scoped>
.reports-container {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.reports {
	width: 100%;
	height: 100%;
	margin-bottom: -3rem;
}
</style>
