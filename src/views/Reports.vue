<template>
	<div class="reports-container">
		<h1 class="title has-text-centered">Reports</h1>

		<iframe
			class="reports"
			src="https://app.powerbi.com/reportEmbed?reportId=d5a81245-560f-4114-bd05-525ddf55ceea&appId=92536ae3-49e4-4156-92a1-ba70dee78455&autoAuth=true&ctid=c8342453-69ce-4b7b-a3e2-cda219f2985e&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLWV1cm9wZS1ub3J0aC1iLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9"
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
