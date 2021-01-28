<template>
	<div>
		<h2 class="title">Summary</h2>
		<div class="columns is-multiline" ref="summary">
			<div
				v-for="{ id, code, value, icon } in summary"
				class="column is-half"
				:ref="code"
				:key="id"
			>
				<div class="box">
					<article class="media">
						<div class="media-left">
							<b-icon
								size="is-large"
								type="is-primary"
								:icon="icon"
							/>
						</div>
						<div class="media-content">
							<div class="content">
								<p class="title is-6 mb-5">{{ normalizeText(code) }}</p>
								<p v-if="value" class="subtitle is-4 p-0 ml-0">{{ value }}</p>
								<Loading v-else type="bubbles" is-small class="subtitle p-0 ml-0" />
							</div>
						</div>
					</article>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Loading from "@/components/Loading";
import HomeService from "@/services/HomeService";
import { normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "Summary",

	components: {
		// eslint-disable-next-line vue/no-unused-components
		Loading,
	},

	data() {
		return {
			summary: [],
			summaryCodes: [
				{
					code: "total_registrations",
					icon: "users",
				},
				{
					code: "active_projects",
					icon: "clipboard-list",
				},
				{
					code: "enrolled_beneficiaries",
					icon: "user-plus",
				},
				{
					code: "served_beneficiaries",
					icon: "user-check",
				},
				{
					code: "completed_assistances",
					icon: "clipboard-check",
				},
			],
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchData() {
			this.summaryCodes.forEach((item, index) => {
				this.summary.push({
					id: index,
					code: item.code,
					icon: item.icon,
					value: "",
				});

				HomeService.getSummariesForHomePage(item.code)
					.then((response) => {
						if (response.data[0]) {
							const summaryIndex = this.summary.findIndex(
								(summary) => summary.code === response.data[0].code,
							);

							this.summary[summaryIndex].value = response.data[0].value;
						}
					}).catch((e) => {
						Notification(`Summaries ${e}`, "is-danger");
					});
			});
		},
	},
};
</script>

<style scoped>
.columns {
	position: relative;
	min-height: 64px;
}
</style>
