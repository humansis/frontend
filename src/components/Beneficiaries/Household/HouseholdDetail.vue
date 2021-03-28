<template>
	<form>
		<section class="modal-card-body">
			<b-field label="Family Name">
				<b-input v-model="formModel.familyName" disabled />
			</b-field>

			<b-field label="First Name">
				<b-input v-model="formModel.givenName" disabled />
			</b-field>

			<b-field label="Members">
				<b-input v-model="formModel.members" disabled />
			</b-field>

			<b-field label="Vulnerabilities">
				<b-input v-model="formModel.vulnerabilities" disabled />
			</b-field>

			<b-field label="Projects">
				<b-input v-model="formModel.projects" disabled />
			</b-field>

			<b-field label="Income">
				<b-input v-model="formModel.incomeLevel" disabled />
			</b-field>

			<b-field label="External Support Received Type">
				<MultiSelect
					v-model="formModel.supportReceivedTypes"
					multiple
					disabled
					label="value"
					track-by="code"
					:options="options.externalSupportReceivedType"
				/>
			</b-field>

			<b-field label="Support Date Received">
				<b-input v-model="formModel.supportDateReceived" disabled />
			</b-field>

			<b-field label="Assets">
				<MultiSelect
					v-model="formModel.assets"
					searchable
					multiple
					disabled
					label="value"
					track-by="code"
					:options="options.assets"
				/>
			</b-field>

			<b-field label="Shelter Type">
				<MultiSelect
					v-model="formModel.shelterStatus"
					searchable
					disabled
					label="value"
					track-by="code"
					:options="options.shelterStatuses"
				/>
			</b-field>

			<b-field label="Current Location">
				<b-input v-model="formModel.currentLocation" disabled />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				Close
			</b-button>
		</footer>
	</form>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";

export default {
	name: "HouseholdDetail",

	props: {
		formModel: Object,
	},

	data() {
		return {
			options: {
				assets: [],
				shelterStatuses: [],
				externalSupportReceivedType: [],
			},
		};
	},

	async mounted() {
		await this.fetchAssets();
		await this.fetchShelterStatuses();
		await this.fetchSupportReceivedTypes();
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
				"code", false, true,
			);
			this.formModel.supportReceivedTypes = getArrayOfCodeListByKey(
				this.formModel.supportReceivedTypes,
				this.options.externalSupportReceivedType,
				"code", false, true,
			);
		},

		closeForm() {
			this.$emit("formClosed");
		},

		async fetchAssets() {
			await BeneficiariesService.getListOfAssets()
				.then(({ data }) => { this.options.assets = data; })
				.catch((e) => {
					Notification(`Assets ${e}`, "is-danger");
				});
			this.assetsLoading = false;
		},

		async fetchShelterStatuses() {
			await BeneficiariesService.getListOfShelterStatuses()
				.then(({ data }) => { this.options.shelterStatuses = data; })
				.catch((e) => {
					Notification(`Shelter Types ${e}`, "is-danger");
				});
			this.shelterStatusLoading = false;
		},

		async fetchSupportReceivedTypes() {
			await BeneficiariesService.getSupportReceivedTypes()
				.then(({ data }) => { this.options.externalSupportReceivedType = data; })
				.catch((e) => {
					Notification(`Support Received Types ${e}`, "is-danger");
				});
		},
	},
};
</script>
