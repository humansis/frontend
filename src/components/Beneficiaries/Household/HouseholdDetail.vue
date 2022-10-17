<template>
	<form>
		<section class="modal-card-body">
			<b-field :label="$t('Family Name')">
				<b-input v-model="formModel.familyName" disabled />
			</b-field>

			<b-field :label="$t('First Name')">
				<b-input v-model="formModel.givenName" disabled />
			</b-field>

			<b-field :label="$t('Members')">
				<b-input v-model="formModel.members" disabled />
			</b-field>

			<b-field :label="$t('Vulnerabilities')">
				<MultiSelect
					v-model="formModel.vulnerabilities"
					multiple
					disabled
					label="value"
					track-by="code"
					:options="options.vulnerabilities"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field :label="$t('Projects')">
				<b-input v-model="formModel.projects" disabled />
			</b-field>

			<b-field :label="$t('Income')">
				<b-input v-model="formModel.incomeLevel" disabled />
			</b-field>

			<b-field :label="$t('External Support Received Type')">
				<MultiSelect
					v-model="formModel.supportReceivedTypes"
					multiple
					disabled
					label="value"
					track-by="code"
					:options="options.externalSupportReceivedType"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field :label="$t('Support Date Received')">
				<b-datepicker
					v-model="formModel.supportDateReceived"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					disabled
					:month-names="months()"
				/>
			</b-field>

			<b-field :label="$t('Assets')">
				<MultiSelect
					v-model="formModel.assets"
					searchable
					multiple
					disabled
					label="value"
					track-by="code"
					:options="options.assets"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field :label="$t('Shelter Type')">
				<MultiSelect
					v-model="formModel.shelterStatus"
					searchable
					disabled
					label="value"
					track-by="code"
					:options="options.shelterStatuses"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field :label="$t('Current Location')">
				<b-input v-model="formModel.currentLocation" disabled />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import calendarHelper from "@/mixins/calendarHelper";

export default {
	name: "HouseholdDetail",

	props: {
		formModel: Object,
	},

	mixins: [calendarHelper],

	data() {
		return {
			options: {
				assets: [],
				vulnerabilities: [],
				shelterStatuses: [],
				externalSupportReceivedType: [],
			},
		};
	},

	watch: {
		formModel: "mapSelects",
	},

	async mounted() {
		await this.fetchAssets();
		await this.fetchShelterStatuses();
		await this.fetchSupportReceivedTypes();
		await this.fetchVulnerabilities();
		this.mapSelects();
	},

	methods: {
		mapSelects() {
			this.formModel.assets = getArrayOfCodeListByKey(
				this.formModel.assets,
				this.options.assets,
				"code",
			);
			this.formModel.shelterStatus = getArrayOfCodeListByKey(
				[this.formModel.shelterStatus],
				this.options.shelterStatuses,
				"code",
			);
			this.formModel.supportReceivedTypes = getArrayOfCodeListByKey(
				this.formModel.supportReceivedTypes,
				this.options.externalSupportReceivedType,
				"code",
			);
			this.formModel.vulnerabilities = getArrayOfCodeListByKey(
				this.formModel.vulnerabilities,
				this.options.vulnerabilities,
				"code",
				true,
				"code",
			);
		},

		closeForm() {
			this.$emit("formClosed");
		},

		async fetchAssets() {
			await BeneficiariesService.getListOfAssets()
				.then(({ data }) => { this.options.assets = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assets")} ${e}`, "is-danger");
				});
			this.assetsLoading = false;
		},

		async fetchShelterStatuses() {
			await BeneficiariesService.getListOfShelterStatuses()
				.then(({ data }) => { this.options.shelterStatuses = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Shelter Types")} ${e}`, "is-danger");
				});
			this.shelterStatusLoading = false;
		},

		async fetchSupportReceivedTypes() {
			await BeneficiariesService.getSupportReceivedTypes()
				.then(({ data }) => { this.options.externalSupportReceivedType = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Support Received Types")} ${e}`, "is-danger");
				});
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => { this.options.vulnerabilities = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Vulnerabilities")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
