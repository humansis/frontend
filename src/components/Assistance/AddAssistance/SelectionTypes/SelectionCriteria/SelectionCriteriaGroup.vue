<template>
	<v-expansion-panels v-model="openedGroups" class="mt-5 criteria-group">
		<v-expansion-panel :title="groupName">
			<v-expansion-panel-text>
				<DataGrid
					:headers="table.columns"
					:items="criteriaGroups"
					:loading="loading"
					is-row-click-disabled
					is-footer-disabled
				>
					<template v-slot:actions="{ index }">
						<ButtonAction
							tooltip="Delete"
							icon="trash"
							icon-color="red"
							@actionConfirmed="onRemove(index)"
						/>
					</template>
				</DataGrid>

				<v-row>
					<v-col>
						<v-btn
							class="text-none"
							@click="onAddCriteria"
						>
							{{ $t('Add') }}
						</v-btn>
					</v-col>

					<v-col>
						<v-btn
							v-if="countOfCriteriaBeneficiaries"
							class="text-none"
							@click="onShowDetail"
						>
							{{ countOfCriteriaBeneficiaries }} {{ $t(targetType) }}
						</v-btn>
					</v-col>

					<v-col>
						<v-btn
							class="text-none"
							@click="onRemoveGroup"
						>
							{{ $t('Remove') }}
						</v-btn>
					</v-col>
				</v-row>
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script>
import LocationsService from "@/services/LocationsService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "SelectionCriteriaGroup",

	components: {
		DataGrid,
		ButtonAction,
	},

	props: {
		groupId: Number,
		targetType: String,
		count: Number,

		data: {
			type: Array,
			default: () => [],
		},

		loading: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			table: {
				columns: generateColumns([
					{ key: "criteriaTarget", title: "Criteria Target", sortable: false },
					{ key: "criteria", title: "Criteria", sortable: false },
					{ key: "condition", title: "Condition", type: "textOrNone", sortable: false },
					{ key: "value", title: "Value", type: "customValue", sortable: false },
					{ key: "scoreWeight", title: "Score Weight", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
			},
			criteriaLocation: "",
			openedGroups: [0],
		};
	},

	computed: {
		groupName() {
			return `${this.$t("Group")} ${(this.groupId + 1)}`;
		},

		countOfCriteriaBeneficiaries() {
			return this.count;
		},

		criteriaGroups() {
			const criteriaGroups = this.data.map((
				{ criteria, criteriaTarget, value, scoreWeight, condition },
			) => ({
				criteriaTarget: criteriaTarget?.value || criteriaTarget?.code,
				criteria: criteria?.value || criteria?.code,
				value: this.prepareCriteriaValue(value),
				scoreWeight,
				condition: condition?.code,
			}));

			return criteriaGroups || [];
		},
	},

	methods: {
		prepareCriteriaValue(value) {
			let newValue = value?.code || value;

			if (!value) {
				return value;
			}

			if (typeof newValue === "string" && newValue.indexOf("locationId-") > -1) {
				const locationId = Number(newValue.replace("locationId-", ""));
				this.fetchLocation(locationId);
				newValue = this.criteriaLocation;
			}

			return newValue;
		},

		async fetchLocation(id) {
			await LocationsService.getLocation(id)
				.then((data) => {
					this.criteriaLocation = data?.code;
				})
				.catch((e) => {
					Notification(`Location ${e.message || e}`, "error");
				});
		},

		onRemove(index) {
			this.data.splice(index, 1);
			this.$emit("updatedCriteria", { groupKey: this.groupId });
		},

		onAddCriteria() {
			this.$emit("addCriteria", this.groupId);
		},

		onRemoveGroup() {
			this.$emit("removeGroup");
		},

		onShowDetail() {
			if (this.countOfCriteriaBeneficiaries) {
				this.$emit("showDetail", this.data);
			}
		},
	},
};
</script>

<style lang="scss">
.criteria-group .v-expansion-panel-text__wrapper {
	padding: 0;

	.v-card {
		z-index: 999;
	}

	.v-row .v-col > button {
		width: 100%;
	}
}
</style>
