<template>
	<h2 class="mb-4">{{ $t('Summary') }}</h2>

	<v-row>
		<v-col
			v-for="{ id, code, value, icon } in summary"
			cols="6"
			:ref="code"
			:key="id"
		>
			<v-card
				:loading="!(value || value === 0)"
				min-height="76"
			>
				<template v-slot:prepend>
					<v-icon :icon="icon" color="primary" class="pb-2" />
				</template>

				<template v-slot:item>
					<v-card-subtitle class="pt-1 pb-0">{{ $t(normalizeText(code)) }}</v-card-subtitle>
					<v-card-title>{{ value || value === 0 ? value : "&nbsp;" }}</v-card-title>
				</template>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
import HomeService from "@/services/HomeService";
import { normalizeText } from "@/utils/datagrid";
// import { Notification } from "@/utils/UI";

export default {
	name: "Summary",

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
					// if (e.message) Notification(`${this.$t("Summaries")} ${e}`, "is-danger");
				});
			});
		},
	},
};
</script>
