<template>
	<div>
		<h4 class="title is-4 has-text-centered mt-5">
			{{ $t('Please add this household to one or more project') }}
		</h4>
		<div class="columns mb-5">
			<div class="column is-half is-offset-one-quarter">
				<b-field
					:label="$t('Projects')"
					:type="validateType('selectedProjects')"
					:message="validateMsg('selectedProjects', )"
				>
					<MultiSelect
						v-model="formModel.selectedProjects"
						searchable
						track-by="id"
						label="name"
						multiple
						:placeholder="$t('Click to select')"
						:options="options.projects"
						:class="validateMultiselect('selectedProjects')"
						@select="validate('selectedProjects')"
					/>
				</b-field>
			</div>
		</div>
		<h4 class="title is-4 has-text-centered">{{ $t('Household Information Summary') }}</h4>
		<div class="columns mb-5">
			<div class="column is-half">
				<div class="box">
					<p class="title is-6">{{ $t('Current Address') }}</p>
					<p class="subtitle is-4">{{ address }}</p>
				</div>
			</div>
			<div class="column is-half">
				<div class="box">
					<p class="title is-6">{{ $t('Current Location') }}</p>
					<p class="subtitle is-4">{{ location }}</p>
				</div>
			</div>
		</div>
		<h4 class="title is-4 has-text-centered">{{ $t('Household Members') }}</h4>
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
					{ field: "firstName", label: this.$t("First Name") },
					{ field: "familyName", label: this.$t("Family Name") },
					{ field: "gender", label: this.$t("Gender"), type: "object" },
					{ field: "dateBirth", label: this.$t("Date of Birth"), type: "date" },
					{ field: "phone", label: this.$t("Phone") },
					{ field: "nationalId", label: this.$t("National ID") },
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
					Notification(`${this.$t("Projects")} ${e}`, "is-danger");
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
