<template>
	<div>
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
								centered
								v-bind="column"
								:key="column.id"
								v-slot="props"
							>
								<ColumnField :data="props" :column="column" />
							</b-table-column>
						</template>
						<b-table-column v-slot="props" label="Actions">
							<ActionButton
								icon="trash"
								centered
								type="is-danger"
								tooltip="Delete"
								@click.native="remove(props.index)"
							/>
						</b-table-column>
					</Table>
				</div>
			</div>
			<footer class="card-footer">
				<a class="card-footer-item" @click="addCriteria">
					Add
				</a>
				<a class="card-footer-item" @click="showDetail">
					0 {{ targetType }}
				</a>
				<a class="card-footer-item" @click="removeGroup">
					Remove
				</a>
			</footer>
		</b-collapse>
	</div>
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
		data: Array,
		groupId: Number,
		targetType: String,
	},

	computed: {
		groupName() {
			return `Group ${(this.groupId + 1)}`;
		},

		criteriaGroups() {
			const criteriaGroups = this.data.map((
				{ criteria, criteriaTarget, value, scoreWeight, condition },
			) => ({
				criteriaTarget: criteriaTarget?.value,
				criteria: criteria?.code,
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
					{ field: "criteriaTarget", label: "Criteria Target" },
					{ field: "criteria", label: "Criteria" },
					{ field: "condition", label: "Condition" },
					{ field: "value", label: "Value", type: "customValue" },
					{ field: "scoreWeight", label: "Score Weight" },
				],
			},
			criteriaLocation: "",
		};
	},

	methods: {
		prepareCriteriaValue(value) {
			let newValue = value?.code || value;

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
					Notification(`Location ${e}`, "is-danger");
				});
		},

		remove(index) {
			this.data.splice(index, 1);
		},

		addCriteria() {
			this.$emit("addCriteria", this.groupId);
		},

		removeGroup() {
			this.$emit("removeGroup");
		},

		showDetail() {
			this.$emit("showDetail", this.data);
		},
	},
};
</script>
