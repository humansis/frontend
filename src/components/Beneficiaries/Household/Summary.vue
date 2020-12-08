<template>
	<div>
		<h4 class="title is-4 has-text-centered mt-5">
			Please Add This Household To One Or More Project
		</h4>
		<div class="columns mb-5">
			<div class="column is-half is-offset-one-quarter">
				<b-field
					label="Projects"
					:type="validateType('selectedProjects')"
					:message="validateMsg('selectedProjects', 'Projects are Required')"
				>
					<MultiSelect
						v-model="formModel.selectedProjects"
						searchable
						track-by="id"
						label="name"
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
			:data="membersData"
			:total="table.total"
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
import ProjectsService from "@/services/ProjectsService";
import Validation from "@/mixins/validation";
import { required } from "vuelidate/lib/validators";
import { Toast } from "@/utils/UI";

export default {
	name: "Summary",

	mixins: [Validation],

	components: {
		Table,
	},

	props: {
		members: Array,
		detailOfHousehold: null || Object,
	},

	watch: {
		detailOfHousehold() {
			// TODO Map detailOfHousehold to formModel
		},
	},

	validations: {
		formModel: {
			selectedProjects: { required },
		},
	},

	data() {
		return {
			formModel: {
				selectedProjects: null,
			},
			options: {
				projects: [],
			},
			table: {
				columns: [
					{
						field: "firstName",
						label: "First Name (Local)",
					},
					{
						field: "familyName",
						label: "Family Name (Local)",
					},
					{ field: "gender" },
					{
						field: "dateBirth",
						label: "Date Of Birth",
					},
					{ field: "phone" },
					{ field: "nationalId" },
				],
				total: 0,
			},
		};
	},

	mounted() {
		this.fetchProjects();
	},

	computed: {
		membersData() {
			return this.members;
		},
	},

	methods: {
		async fetchProjects() {
			await ProjectsService.getListOfProjects(1, 15, "desc")
				.then((response) => {
					this.options.projects = response.data;
				})
				.catch((e) => {
					Toast(`(Projects) ${e}`, "is-danger");
				});
		},

		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>
