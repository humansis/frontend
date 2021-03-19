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
						placeholder="Click to select..."
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
					<p class="subtitle is-4">{{ address }}</p>
				</div>
			</div>
			<div class="column is-half">
				<div class="box">
					<p class="title is-6">Current Location</p>
					<p class="subtitle is-4">{{ location }}</p>
				</div>
			</div>
		</div>
		<h4 class="title is-4 has-text-centered">Household Members</h4>
		<Table
			:data="membersData"
			:total="table.total"
			:paginated="false"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
		</Table>
	</div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import Table from "@/components/DataGrid/Table";
import ColumnField from "@/components/DataGrid/ColumnField";
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import Validation from "@/mixins/validation";

export default {
	name: "Summary",

	mixins: [Validation],

	components: {
		Table,
		ColumnField,
	},

	props: {
		members: Array,
		detailOfHousehold: Object,
		location: String,
		address: String,
		isEditing: {
			type: Boolean,
			default: false,
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
				selectedProjects: [],
			},
			options: {
				projects: [],
			},
			table: {
				columns: [
					{ field: "firstName", label: "First Name (Local)" },
					{ field: "familyName", label: "Family Name (Local)" },
					{ field: "gender", label: "Gender", type: "object" },
					{ field: "dateBirth", label: "Date Of Birth", type: "date" },
					{ field: "phone", label: "Phone" },
					{ field: "nationalId", label: "National ID" },
				],
				total: 0,
			},
		};
	},

	async mounted() {
		await this.fetchProjects();
	},

	computed: {
		membersData() {
			return this.members;
		},
	},

	methods: {
		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then((response) => {
					this.options.projects = response.data;
				})
				.catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});

			if (this.isEditing) {
				this.formModel.selectedProjects = getArrayOfCodeListByKey(this.detailOfHousehold.projectIds, this.options.projects, "id");
			}
		},

		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>
