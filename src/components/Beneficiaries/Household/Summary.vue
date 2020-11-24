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
					<p class="subtitle is-4">address</p>
				</div>
			</div>
			<div class="column is-half">
				<div class="box">
					<p class="title is-6">Current Location</p>
					<p class="subtitle is-4">location</p>
				</div>
			</div>
		</div>
		<h4 class="title is-4 has-text-centered">Household Members</h4>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";

export default {
	name: "Summary",

	components: {
		Table,
	},

	data() {
		return {
			selectedProjects: [],
			options: {
				projects: [],
			},
			table: {
				data: [],
				columns: [
					{
						field: "firstName",
						label: "First Name (Local)",
					},
					{
						field: "familyName",
						label: "Family Name (Local)",
					},
					{
						field: "gender",
						label: "Gender",
					},
					{
						field: "dateOfBirth",
						label: "Date Of Birth",
					},
					{
						field: "phone",
						label: "Phone",
					},
					{
						field: "nationalId",
						label: "National ID",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
		};
	},
};
</script>
