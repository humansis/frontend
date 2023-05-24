<template>
	<Table
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:has-clickable-rows="false"
		@pageChanged="onPageChange"
		@changePerPage="onChangePerPage"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				:sortable="column.sortable"
				:key="column.id"
				v-slot="props"
			>
				<ColumnField :data="props" :column="column" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="180"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					:icon="scoringStatusChangeButtonIcon(props.row)"
					:tooltip="$t(scoringStatusChangeButtonTooltip(props.row))"
					:disabled="!userCan.editScoring"
					@click="statusChange( props.row.id, !props.row.enabled)"
				/>
				<ActionButton
					icon="download"
					type="is-primary"
					:tooltip="$t('Download')"
					@click="download(props.row)"
				/>
				<SafeDelete
					icon="trash"
					:entity="$t('Scoring')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					:disabled="!userCan.deleteScoring || !props.row.deletable"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import consts from "@/utils/scoringConst";
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";

const statusTags = [
	{ code: consts.STATUS.INACTIVE, type: "is-light" },
	{ code: consts.STATUS.ACTIVE, type: "is-success" },
];

export default {
	name: "ScoringList",

	components: {
		ColumnField,
		Table,
		ActionButton,
		SafeDelete,
	},

	mixins: [grid, permissions],

	data() {
		return {
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", label: "Scoring ID" },
					{ key: "name" },
					{ key: "status", type: "tag", customTags: statusTags },
					{ key: "uploaded", type: "datetime" },
					{ key: "note" },
				]),
				total: 0,
				currentPage: 1,
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			try {
				const { data: { data, totalCount } } = await AssistancesService.getScoringTypes(
					this.table.currentPage,
					this.perPage,
				);

				this.table.data = [];
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				if (e.message) Notification(`${this.$t("Scoring Types")} ${e}`, "is-danger");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].status = item.enabled ? consts.STATUS.ACTIVE : consts.STATUS.INACTIVE;
				this.table.data[key].uploaded = item.createdAt;
			});
		},

		scoringStatusChangeButtonIcon(scoring) {
			return scoring.enabled ? "toggle-off" : "toggle-on";
		},

		scoringStatusChangeButtonTooltip(scoring) {
			return scoring.enabled ? "Deactivate" : "Activate";
		},
	},
};
</script>
