<template>
	<div>
		<b-collapse class="card" animation="slide" aria-id="selectionCriteriaGroup">
			<div
				slot="trigger"
				slot-scope="props"
				class="card-header"
				role="button"
				aria-controls="selectionCriteriaGroup"
			>
				<p class="card-header-title">
					{{ groupName }}
				</p>
				<a class="card-header-icon">
					<b-icon
						:icon="props.open ? 'arrow-down' : 'arrow-up'"
					/>
				</a>
			</div>
			<div class="card-content">
				<div class="content">
					<Table
						:paginated="false"
						:data="data"
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
						<b-table-column v-slot="props" label="Actions">
							<ActionButton
								icon="trash"
								centered
								type="is-danger"
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
	},

	data() {
		return {
			table: {
				columns: [
					{
						field: "criteriaTarget",
						label: "Criteria Target",
					},
					{
						field: "criteria",
						label: "Criteria",
					},
					{
						field: "condition",
						label: "Condition",
					},
					{
						field: "value",
						label: "Value",
						type: "customValue",
					},
					{
						field: "scoreWeight",
						label: "Score Weight",
					},
					{
						field: "action",
						label: "Action",
					},
				],
			},
		};
	},

	methods: {
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
