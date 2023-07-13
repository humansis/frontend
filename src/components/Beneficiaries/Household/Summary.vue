<template>
	<div ref="summary">
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
						:select-label="$t('Press enter to select')"
						:selected-label="$t('Selected')"
						:deselect-label="$t('Press enter to remove')"
						multiple
						:placeholder="$t('Click to select')"
						:options="options.projects"
						:class="validateMultiselect('selectedProjects')"
						@select="validate('selectedProjects')"
					>
						<span slot="noOptions">{{ $t("List is empty")}}</span>
					</MultiSelect>
				</b-field>

				<b-field :label="$t('Enumerator')">
					<b-input v-model="formModel.enumerator" />
				</b-field>
			</div>
		</div>
		<h4 class="title is-4 has-text-centered">{{ $t('Household Information Summary') }}</h4>
		<div class="columns mb-5">
			<div v-if="livelihoodFilled" class="column is-one-third">
				<div class="box">
					<p class="title is-6">{{ $t('Livelihood') }}</p>
					<p class="subtitle is-4">{{ livelihood }}</p>
				</div>
			</div>
			<div class="column" :class="{'is-half': !livelihoodFilled, 'is-one-third': livelihoodFilled}">
				<div class="box">
					<p class="title is-6">{{ $t('Current Address') }}</p>
					<p class="subtitle is-4">{{ address }}</p>
				</div>
			</div>
			<div class="column" :class="{'is-half': !livelihoodFilled, 'is-one-third': livelihoodFilled}">
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

	components: {
		Table,
		ColumnField,
	},

	mixins: [Validation],

	props: {
		members: Array,
		detailOfHousehold: Object,
		livelihood: String,
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
			loadingComponent: null,
			formModel: {
				selectedProjects: [],
				enumerator: "",
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
					{ field: "nationalId", label: this.$t("ID Number") },
				],
				total: 0,
			},
		};
	},

	async created() {
		this.loadingComponent = this.$buefy.loading.open({
			container: this.$refs.summary,
		});
		await this.fetchProjects();
		this.loadingComponent.close();
		this.$emit("loaded");
	},

	computed: {
		membersData() {
			return this.members;
		},
		livelihoodFilled() {
			return this.livelihood;
		},
	},

	methods: {
		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then((response) => {
					this.options.projects = response.data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});

			if (this.isEditing) {
				this.formModel.selectedProjects = getArrayOfCodeListByKey(this.detailOfHousehold.projectIds, this.options.projects, "id");
				this.formModel.enumerator = this.detailOfHousehold.enumeratorName;
			}
		},

		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>
