<template>
	<div>
		<h4 class="title is-4 has-text-centered mt-5">
			Please Add This Household To One Or More Project
		</h4>
		<div class="columns mb-5">
			<div class="column is-half is-offset-one-quarter">
				<b-field label="Projects">
					<MultiSelect
						v-model="selectedProjects"
						searchable
						multiple
						:options="options.projects"
					/>
				</b-field>
			</div>
		</div>
		<h4 class="title is-4 has-text-centered">Household Information Summary</h4>
		<div class="columns mb-5">
			<div class="column is-half">
				<div class="box">
					<p class="title is-6">Current Address</p>
					<p class="subtitle is-4">edbwwkeh</p>
				</div>
			</div>
			<div class="column is-half">
				<div class="box">
					<p class="title is-6">Current Location</p>
					<p class="subtitle is-4">edbwwkeh</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Summary",

	data() {
		return {
			selectedProjects: [],
			options: {
				projects: [],
			},
		};
	},
};
</script>
