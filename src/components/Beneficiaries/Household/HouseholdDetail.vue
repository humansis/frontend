<template>
	<v-card-text>
		<DataInput
			v-model="formModel.familyName"
			label="Family Name"
			name="family-name"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.givenName"
			label="First Name"
			name="given-name"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.members"
			label="Members"
			name="members"
			class="mb-4"
			disabled
		/>

		<DataSelect
			v-model="formModel.vulnerabilities"
			:items="options.vulnerabilities"
			item-title="value"
			label="Vulnerabilities"
			name="vulnerabilities"
			item-value="code"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DataInput
			v-model="formModel.projects"
			label="Projects"
			name="projects"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.incomeLevel"
			label="Income"
			name="income-level"
			class="mb-4"
			disabled
		/>

		<DataSelect
			v-model="formModel.supportReceivedTypes"
			:items="options.externalSupportReceivedType"
			item-title="value"
			label="Support received types"
			name="support-received-types"
			item-value="code"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DatePicker
			v-model="formModel.supportDateReceived"
			label="Support date receive"
			name="support-date-receive"
			class="mb-4"
			disabled
		/>

		<DataSelect
			v-model="formModel.assets"
			:items="options.assets"
			item-title="value"
			label="Assets"
			name="assets"
			item-value="code"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DataSelect
			v-model="formModel.shelterStatuses"
			:items="options.shelterStatuses"
			item-title="value"
			label="Shelter status"
			name="shelter-status"
			item-value="code"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DataInput
			v-model="formModel.currentLocation"
			label="Current Location"
			name="current-location"
			disabled
		/>
	</v-card-text>

	<v-card-actions class="mt-n2">
		<v-spacer />

		<v-btn
			class="text-none mx-4"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="$emit('formClosed')"
		>
			{{ $t('Close') }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { Notification } from "@/utils/UI";

export default {
	name: "HouseholdDetail",

	components: { DatePicker, DataSelect, DataInput },

	props: {
		householdModel: {
			type: Object,
			required: true,
		},
	},

	emits: ["formClosed"],

	data() {
		return {
			formModel: this.householdModel,
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

		async fetchAssets() {
			await BeneficiariesService.getListOfAssets()
				.then(({ data }) => { this.options.assets = data; })
				.catch((e) => {
					Notification(`${this.$t("Assets")} ${e.message || e}`, "error");
				});
			this.assetsLoading = false;
		},

		async fetchShelterStatuses() {
			await BeneficiariesService.getListOfShelterStatuses()
				.then(({ data }) => { this.options.shelterStatuses = data; })
				.catch((e) => {
					Notification(`${this.$t("Shelter Status")} ${e.message || e}`, "error");
				});
			this.shelterStatusLoading = false;
		},

		async fetchSupportReceivedTypes() {
			await BeneficiariesService.getSupportReceivedTypes()
				.then(({ data }) => { this.options.externalSupportReceivedType = data; })
				.catch((e) => {
					Notification(`${this.$t("Support Received Types")} ${e.message || e}`, "error");
				});
		},

		async fetchVulnerabilities() {
			await BeneficiariesService.getListOfVulnerabilities()
				.then(({ data }) => { this.options.vulnerabilities = data; })
				.catch((e) => {
					Notification(`${this.$t("Vulnerabilities")} ${e.message || e}`, "error");
				});
		},
	},
};
</script>
