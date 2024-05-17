<template>
	<v-card-text>
		<DataInput
			v-model="formModel.familyName"
			:data-cy="prepareComponentIdentifier()"
			label="Local family name"
			name="local-family-name"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.givenName"
			:data-cy="prepareComponentIdentifier()"
			label="Local given name"
			name="local-given-name"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.members"
			:data-cy="prepareComponentIdentifier()"
			label="Members"
			name="members"
			class="mb-4"
			disabled
		/>

		<DataSelect
			v-model="formModel.vulnerabilities"
			:items="options.vulnerabilities"
			:data-cy="prepareComponentIdentifier()"
			label="Vulnerability criteria"
			name="vulnerability-criteria"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DataInput
			v-model="formModel.projects"
			:data-cy="prepareComponentIdentifier()"
			label="Projects"
			name="projects"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.incomeLevel"
			:data-cy="prepareComponentIdentifier()"
			label="Income"
			name="income"
			class="mb-4"
			disabled
		/>

		<DataSelect
			v-model="formModel.supportReceivedTypes"
			:items="options.externalSupportReceivedType"
			:data-cy="prepareComponentIdentifier()"
			label="Support received types"
			name="support-received-types"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DatePicker
			v-model="formModel.supportDateReceived"
			:clearable="false"
			:data-cy="prepareComponentIdentifier()"
			label="Support date receive"
			name="support-date-receive"
			class="mb-4"
			disabled
		/>

		<DataSelect
			v-model="formModel.assets"
			:items="options.assets"
			:data-cy="prepareComponentIdentifier()"
			label="Assets"
			name="assets"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DataSelect
			v-model="formModel.shelterStatus"
			:items="options.shelterStatuses"
			:data-cy="prepareComponentIdentifier()"
			label="Shelter status"
			name="shelter-status"
			class="mb-4"
			multiple
			chips
			disabled
		/>

		<DataInput
			v-model="formModel.currentLocation"
			:data-cy="prepareComponentIdentifier()"
			label="Current Location"
			name="current-location"
			disabled
		/>
	</v-card-text>

	<v-card-actions class="mt-n2">
		<v-spacer />

		<v-btn
			:data-cy="identifierBuilder('close-button')"
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
import identifierBuilder from "@/mixins/identifierBuilder";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "HouseholdDetail",

	components: {
		DatePicker,
		DataSelect,
		DataInput,
	},

	mixins: [identifierBuilder],

	props: {
		householdModel: {
			type: Object,
			required: true,
		},

		dataCy: {
			type: String,
			default: "",
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
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getListOfAssets();

				checkResponseStatus(status, message);

				this.options.assets = data;
			} catch (e) {
				Notification(`${this.$t("Assets")}: ${e.message || e}`, "error");
			} finally {
				this.assetsLoading = false;
			}
		},

		async fetchShelterStatuses() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getListOfShelterStatuses();

				checkResponseStatus(status, message);

				this.options.shelterStatuses = data;
			} catch (e) {
				Notification(`${this.$t("Shelter Status")}: ${e.message || e}`, "error");
			} finally {
				this.shelterStatusLoading = false;
			}
		},

		async fetchSupportReceivedTypes() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getSupportReceivedTypes();

				checkResponseStatus(status, message);

				this.options.externalSupportReceivedType = data;
			} catch (e) {
				Notification(`${this.$t("Support Received Types")}: ${e.message || e}`, "error");
			}
		},

		async fetchVulnerabilities() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getListOfVulnerabilities();

				checkResponseStatus(status, message);

				this.options.vulnerabilities = data;
			} catch (e) {
				Notification(`${this.$t("Vulnerabilities")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
