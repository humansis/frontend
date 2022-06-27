<template>
	<div>
		<div v-for="({ idNumber, beneficiaries }, index) of data" :key="index">
			<Table
				class="distributed-table duplicity-distributed-table mb-3"
				has-search
				:data="beneficiaries"
				:total="beneficiaries.length"
				:columns="table.visibleColumns"
				:backend-pagination="false"
				:backend-searching="false"
				:backend-sorting="false"
				:paginated="false"
			>
				<template #title>
					<p>{{ $t('Conflicts with ID Number') }}
						<b-tag class="ml-2 mr-2" type="is-primary" size="is-medium">
							{{ idNumber }}
						</b-tag>
					</p>
				</template>
				<template v-for="column in table.columns">
					<b-table-column
						v-bind="column"
						v-slot="props"
						:key="column.id"
					>
						<ColumnField :column="column" :data="props" />
					</b-table-column>
				</template>
			</Table>
		</div>
		<b-notification
			v-if="!data.length"
			class="notification-no-data"
			type="is-light"
			has-icon
			icon="eye-slash"
			:closable="false"
		>
			<p class="mt-3">{{ $t('No data') }}</p>
		</b-notification>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "BeneficiariesModalList",

	components: {
		ColumnField,
		Table,
	},

	props: {
		data: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
			table: {
				columns: [],
				visibleColumns: [
					{ key: "id", sortable: true, searchable: true },
					{ key: "householdId", sortable: true, searchable: true },
					{ key: "localGivenName", sortable: true, searchable: true },
					{ key: "localFamilyName", sortable: true, searchable: true },
					{ key: "dateOfBirth", type: "date", sortable: true, searchable: true },
				],
				total: 0,
			},
		};
	},

	mounted() {
		this.table.columns = generateColumns(this.table.visibleColumns);
	},
};
</script>
