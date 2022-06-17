<template>
	<b-collapse class="card" animation="slide" aria-id="selectionCriteriaGroup">
		<template #trigger="props">
			<div
				class="card-header"
				role="button"
				aria-controls="selectionCriteriaGroup"
			>
				<p class="card-header-title">
					{{ groupName }}
				</p>
				<a class="card-header-icon">
					<b-icon :icon="props.open ? 'arrow-down' : 'arrow-up'" />
				</a>
			</div>
		</template>
		<div class="card-content">
			<div class="content">
				<Table
					:paginated="false"
					:data="criteriaGroups"
				>
					<template v-for="(column) in table.columns">
						<b-table-column
							sortable
							v-bind="column"
							:key="column.id"
							v-slot="props"
						>
							<ColumnField :data="props" :column="column" />
						</b-table-column>
					</template>
					<b-table-column
						v-slot="props"
						field="actions"
						:label="$t('Actions')"
					>
						<ActionButton
							icon="trash"
							type="is-danger"
							:tooltip="$t('Delete')"
							@click="remove(props.index)"
						/>
					</b-table-column>
				</Table>
			</div>
		</div>
		<footer class="card-footer">
			<a class="card-footer-item" @click="addCriteria">
				{{ $t('Add') }}
			</a>
			<a class="card-footer-item loading-ref" @click="showDetail">
				<b-loading
					v-model="loading"
					:is-full-page="false"
					:can-cancel="false"
				/>

				<span v-if="countOfCriteriaBeneficiaries">
					{{ countOfCriteriaBeneficiaries }} {{ targetType }}
				</span>
			</a>
			<a class="card-footer-item" @click="removeGroup">
				{{ $t('Remove') }}
			</a>
		</footer>
	</b-collapse>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";

export default {
	name: "SelectionCriteriaGroup",

	components: {
		Table,
		ActionButton,
		ColumnField,
	},

	props: {
		data: {
			type: Array,
			default: () => [],
		},
		groupId: Number,
		targetType: String,
		count: Number,
		loading: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		groupName() {
			return `Group ${(this.groupId + 1)}`;
		},

		countOfCriteriaBeneficiaries() {
			return this.count;
		},

		criteriaGroups() {
			const criteriaGroups = this.data.map((
				{ criteria, criteriaTarget, value, scoreWeight, condition },
			) => ({
				criteriaTarget: criteriaTarget?.code || criteriaTarget?.value,
				criteria: criteria?.code || criteria?.value,
				value: this.prepareCriteriaValue(value),
				scoreWeight,
				condition: condition?.code,
			}));

			return criteriaGroups || [];
		},
	},

	data() {
		return {
			table: {
				columns: [
					{ field: "criteriaTarget", label: this.$t("Criteria Target") },
					{ field: "criteria", label: this.$t("Criteria") },
					{ field: "condition", label: this.$t("Condition") },
					{ field: "value", label: this.$t("Value"), type: "customValue" },
					{ field: "scoreWeight", label: this.$t("Score Weight") },
				],
			},
			criteriaLocation: "",
		};
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
					if (e.message) Notification(`Location ${e}`, "is-danger");
				});
		},

		remove(index) {
			this.data.splice(index, 1);
			this.$emit("updatedCriteria", { groupKey: this.groupId });
		},

		addCriteria() {
			this.$emit("addCriteria", this.groupId);
		},

		removeGroup() {
			this.$emit("removeGroup");
		},

		showDetail() {
			if (this.countOfCriteriaBeneficiaries) {
				this.$emit("showDetail", this.data);
			}
		},
	},
};
</script>
