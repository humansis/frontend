<template>
	<div>
		<div v-if="projectSummary.length" ref="projectSummary">
			<h2 class="title has-text-centered">
				{{ projectSummary[0].name }}
			</h2>
			<nav class="level is-mobile">
				<div class="level-item has-text-centered">
					<div>
						<p class="heading">Sectors</p>
						<p class="title">{{ projectSummary[0].sectors }}</p>
					</div>
				</div>
				<div class="level-item has-text-centered">
					<div>
						<p class="heading">Start Date</p>
						<p class="title">{{ projectSummary[0].start_date }}</p>
					</div>
				</div>
				<div class="level-item has-text-centered">
					<div>
						<p class="heading">End Date</p>
						<p class="title">{{ projectSummary[0].end_date }}</p>
					</div>
				</div>
				<div class="level-item has-text-centered">
					<div>
						<p class="heading">Number of Households</p>
						<p class="title">{{ projectSummary[0].number_of_households }}</p>
					</div>
				</div>
				<div class="level-item has-text-centered">
					<div>
						<p class="heading">Donors</p>
						<p class="title">{{ projectSummary[0].donors }}</p>
					</div>
				</div>
				<div class="level-item has-text-centered">
					<div>
						<p class="heading">Total Target Beneficiaries</p>
						<p class="title">{{ projectSummary[0].total_target_beneficiaries }}</p>
					</div>
				</div>
				<div class="level-item has-text-centered">
					<div>
						<p class="heading">Beneficiaries Reached</p>
						<p class="title">{{ projectSummary[0].beneficiaries_reached }}</p>
					</div>
				</div>
			</nav>
			<hr />
		</div>
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";

export default {
	name: "ProjectSummary",

	data() {
		return {
			fetch: {
				error: null,
			},
			projectSummary: [],
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.projectSummary,
				});

				this.projectSummary = [];

				const uri = `project/${this.$route.params.id}`;

				const { data } = await fetcher({ uri, auth: true });

				this.projectSummary = data;
				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},
	},
};
</script>

<style scoped>
	.columns {
		margin-bottom: 20px;
	}
</style>
