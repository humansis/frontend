<template>
	<form>
		<div class="columns is-multiline">
			<div class="column is-half">
				<h4 class="title is-4">Current Location</h4>
				<LocationForm
					ref="currentLocationForm"
					:form-model="formModel.currentLocation"
					:form-disabled="false"
					:is-editing="true"
				/>
			</div>
			<div class="column is-half">
				<h4 class="title is-4">Type Of Location</h4>
				<TypeOfLocationForm
					ref="currentTypeOfLocationForm"
					:form-model="formModel.currentLocation"
					:is-editing="true"
				/>
			</div>
		</div>
		<div class="columns is-multiline">
			<div class="column is-one-third">
				<h4 class="title is-4">Livelihood</h4>
				<b-field
					label="Livelihood"
					:type="validateType('livelihood.livelihood')"
					:message="validateMsg('livelihood.livelihood')"
				>
					<MultiSelect
						v-model="formModel.livelihood.livelihood"
						searchable
						label="value"
						track-by="code"
						placeholder="Click to select..."
						:loading="livelihoodLoading"
						:options="options.livelihood"
						:class="validateMultiselect('livelihood.livelihood')"
						@blur="validate('livelihood.livelihood')"
					/>
				</b-field>

				<b-field
					label="Income Level"
					:type="validateType('livelihood.incomeLevel')"
					:message="validateMsg('livelihood.incomeLevel')"
				>
					<MultiSelect
						v-model="formModel.livelihood.incomeLevel"
						searchable
						label="value"
						track-by="id"
						placeholder="Click to select..."
						:options="options.incomeLevel"
						:class="validateMultiselect('livelihood.incomeLevel')"
						@blur="validate('livelihood.incomeLevel')"
					/>
				</b-field>

				<b-field
					label="Debt Level"
					:type="validateType('livelihood.debtLevel')"
					:message="validateMsg('livelihood.debtLevel')"
				>
					<b-numberinput
						v-model="formModel.livelihood.debtLevel"
						expanded
						min="0"
						controls-alignment="right"
						controls-position="compact"
						@input="validate('livelihood.debtLevel')"
					/>
				</b-field>

				<b-field
					label="Assets"
					:type="validateType('livelihood.assets')"
					:message="validateMsg('livelihood.assets')"
				>
					<MultiSelect
						v-model="formModel.livelihood.assets"
						searchable
						multiple
						label="value"
						track-by="code"
						placeholder="Click to select..."
						:loading="assetsLoading"
						:options="options.assets"
						:class="validateMultiselect('livelihood.assets')"
						@select="validate('livelihood.assets')"
					/>
				</b-field>

				<b-field
					label="Food Consumption Score"
					:type="validateType('livelihood.foodConsumptionScore')"
					:message="validateMsg('livelihood.foodConsumptionScore')"
				>
					<b-numberinput
						v-model="formModel.livelihood.foodConsumptionScore"
						expanded
						min="0"
						controls-alignment="right"
						controls-position="compact"
						@input="validate('livelihood.foodConsumptionScore')"
					/>
				</b-field>

				<b-field
					label="Coping Strategies Index"
					:type="validateType('livelihood.copingStrategiesIndex')"
					:message="validateMsg('livelihood.copingStrategiesIndex')"
				>
					<b-numberinput
						v-model="formModel.livelihood.copingStrategiesIndex"
						expanded
						min="0"
						controls-alignment="right"
						controls-position="compact"
						@input="validate('livelihood.copingStrategiesIndex')"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">External Support</h4>
				<b-field
					label="External Support Received Type"
					:type="validateType('externalSupport.externalSupportReceivedType')"
					:message="validateMsg('externalSupport.externalSupportReceivedType')"
				>
					<MultiSelect
						v-model="formModel.externalSupport.externalSupportReceivedType"
						searchable
						multiple
						label="value"
						track-by="code"
						placeholder="Click to select..."
						:options="options.externalSupportReceivedType"
						:class="validateMultiselect('externalSupport.externalSupportReceivedType')"
						@select="validate('externalSupport.externalSupportReceivedType')"
					/>
				</b-field>

				<b-field
					label="Support Date Received"
					:type="validateType('externalSupport.supportDateReceived')"
					:message="validateMsg('externalSupport.supportDateReceived')"
				>
					<b-datepicker
						v-model="formModel.externalSupport.supportDateReceived"
						show-week-number
						placeholder="Click to select..."
						icon="calendar-day"
						trap-focus
						@input="validate('externalSupport.supportDateReceived')"
					/>
				</b-field>

				<b-field
					label="Support Organization"
					:type="validateType('externalSupport.supportOrganization')"
					:message="validateMsg('externalSupport.supportOrganization')"
				>
					<b-input
						v-model="formModel.externalSupport.supportOrganization"
						@blur="validate('externalSupport.supportOrganization')"
					/>
				</b-field>
			</div>
			<div class="column is-one-third">
				<h4 class="title is-4">Country Specific Options</h4>
				<b-field>
					<template #label>
						ID Poor no
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-input v-model="formModel.countrySpecificOptions.idPoorNo" />
				</b-field>

				<b-field>
					<template #label>
						Equity Card No
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-input v-model="formModel.countrySpecificOptions.equityCardNo" />
				</b-field>

				<b-field>
					<template #label>
						Fields
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-input v-model="formModel.countrySpecificOptions.fields" />
				</b-field>
			</div>
		</div>
		<h4 class="title is-4">Household Status</h4>
		<b-field
			label="Shelter Type"
			:type="validateType('shelterStatus')"
			:message="validateMsg('shelterStatus')"
		>
			<MultiSelect
				v-model="formModel.shelterStatus"
				searchable
				label="value"
				track-by="code"
				placeholder="Click to select..."
				:loading="shelterStatusLoading"
				:options="options.shelterStatuses"
				:class="validateMultiselect('shelterStatus')"
				@select="validate('shelterStatus')"
			/>
		</b-field>
		<b-field>
			<template #label>
				<span class="is-size-5">Notes</span>
				<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
			</template>
			<b-input v-model="formModel.notes" type="textarea" />
		</b-field>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import TypeOfLocationForm from "@/components/Beneficiaries/Household/TypeOfLocationForm";
import BeneficiariesService from "@/services/BeneficiariesService";
import AddressService from "@/services/AddressService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import Validation from "@/mixins/validation";
import CountrySpecificOptionsService from "@/services/CountrySpecificOptionsService";

export default {
	name: "HouseholdForm",

	mixins: [Validation],

	props: {
		detailOfHousehold: Object,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	components: {
		LocationForm,
		TypeOfLocationForm,
	},

	validations: {
		formModel: {
			livelihood: {
				livelihood: { required },
				incomeLevel: { required },
				debtLevel: { required },
				assets: { required },
				foodConsumptionScore: { required },
				copingStrategiesIndex: { required },
			},
			externalSupport: {
				externalSupportReceivedType: { required },
				supportDateReceived: { required },
				supportOrganization: { required },
			},
			countrySpecificOptions: {
				idPoorNo: {},
				equityCardNo: {},
				fields: {},
			},
			shelterStatus: { required },
		},
	},

	data() {
		return {
			shelterStatusLoading: true,
			assetsLoading: true,
			livelihoodLoading: true,
			formModel: {
				id: null,
				currentLocation: {},
				isCurrentLocationOtherThanAddress: false,
				livelihood: {
					livelihood: [],
					incomeLevel: [],
					debtLevel: 0,
					assets: [],
					foodConsumptionScore: 0,
					copingStrategiesIndex: 0,
				},
				externalSupport: {
					externalSupportReceivedType: [],
					supportDateReceived: new Date(),
					supportOrganization: "",
				},
				countrySpecificOptions: {
					idPoorNo: "",
					equityCardNo: "",
					fields: "",
				},
				shelterStatus: [],
				notes: "",
			},
			options: {
				livelihood: [],
				incomeLevel: [
					{ code: 0, value: "Very Low (Income < 100 USD)" },
					{ code: 1, value: "Low (100 USD < Income < 100 USD)" },
					{ code: 2, value: "Average (150 USD < Income < 250 USD)" },
					{ code: 3, value: "High (250 USD < Income < 300 USD)" },
					{ code: 4, value: "Very High (300 USD < Income)" },
				],
				assets: [],
				externalSupportReceivedType: [],
				shelterStatuses: [],
			},
		};
	},

	async mounted() {
		await this.fetchLivelihoods();
		await this.fetchAssets();
		await this.fetchShelterStatuses();
		await this.fetchSupportReceivedTypes();
		if (this.isEditing) {
			this.mapDetailOfHouseholdToFormModel();
			await this.mapCurrentLocation().then((response) => {
				this.formModel.currentLocation = response;
			});
		}
	},

	methods: {
		getAddressTypeAndId() {
			const {
				temporarySettlementAddressId,
				residenceAddressId,
				campAddressId,
			} = this.detailOfHousehold;
			if (temporarySettlementAddressId) return { typeOfLocation: "temporary_settlement", addressId: temporarySettlementAddressId };
			if (residenceAddressId) return { typeOfLocation: "residence", addressId: residenceAddressId };
			if (campAddressId) return { typeOfLocation: "camp", addressId: campAddressId };
			return "";
		},

		async fetchSupportReceivedTypes() {
			await BeneficiariesService.getSupportReceivedTypes()
				.then(({ data }) => { this.options.externalSupportReceivedType = data; })
				.catch((e) => {
					Notification(`Support Received Types ${e}`, "is-danger");
				});
		},

		mapCurrentLocation() {
			if (this.detailOfHousehold) {
				const { typeOfLocation, addressId } = this.getAddressTypeAndId();

				switch (typeOfLocation) {
					case "camp":
						return AddressService.getCampAddress(addressId).catch((e) => {
							Notification(`Camp Address ${e}`, "is-danger");
						});
					case "residence":
						return AddressService.getResidenceAddress(addressId).catch((e) => {
							Notification(`Residence Address ${e}`, "is-danger");
						});
					case "temporary_settlement":
						return AddressService.getTemporarySettlementAddress(addressId).catch((e) => {
							Notification(`TemporarySettlementAddress ${e}`, "is-danger");
						});
					default:
						return null;
				}
			}
			return null;
		},

		mapDetailOfHouseholdToFormModel() {
			const {
				idPoorNo,
				equityCardNo,
				fields,
			} = this.prepareCountrySpecifics(this.detailOfHousehold.countrySpecificAnswerIds);
			this.formModel = {
				...this.formModel,
				id: this.detailOfHousehold.id,
				currentLocation: {},
				livelihood: {
					...this.formModel.livelihood,
					foodConsumptionScore: this.detailOfHousehold.foodConsumptionScore,
					assets: getArrayOfCodeListByKey(this.detailOfHousehold.assets, this.options.assets, "code", true),
					livelihood: getArrayOfCodeListByKey([this.detailOfHousehold.livelihood], this.options.livelihood, "code"),
					incomeLevel: getArrayOfCodeListByKey([this.detailOfHousehold.incomeLevel], this.options.incomeLevel, "code"),
					debtLevel: this.detailOfHousehold.debtLevel,
					copingStrategiesIndex: this.detailOfHousehold.copingStrategiesIndex,
				},
				externalSupport: {
					...this.formModel.externalSupport,
					externalSupportReceivedType: getArrayOfCodeListByKey(this.detailOfHousehold.supportReceivedTypes, this.options.externalSupportReceivedType, "code", false, true),
					supportDateReceived: new Date(this.detailOfHousehold.supportDateReceived),
					supportOrganization: this.detailOfHousehold.supportOrganizationName,
				},
				countrySpecificOptions: {
					...this.formModel.countrySpecificOptions,
					// TODO map countrySpecificOptions
					idPoorNo,
					equityCardNo,
					fields,
				},
				shelterStatus: getArrayOfCodeListByKey([`${this.detailOfHousehold.shelterStatus}`], this.options.shelterStatuses, "code"),
				notes: this.detailOfHousehold.notes,
			};
		},

		async prepareCountrySpecifics(answers) {
			const preparedAnswer = {
				idPoorNo: "",
				equityCardNo: "",
				fields: "",
			};
			if (!answers) return preparedAnswer;
			const promise = answers.map(async (item) => {
				await CountrySpecificOptionsService.getCountrySpecificAnswer(item)
					.then(({ answer }) => {
						if (answer) {
							preparedAnswer.idPoorNo = answer;
						}
					});
			});
			await Promise.all(promise);
			return preparedAnswer;
		},

		async fetchLivelihoods() {
			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => { this.options.livelihood = data; })
				.catch((e) => {
					Notification(`Livelihoods ${e}`, "is-danger");
				});
			this.livelihoodLoading = false;
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

		submit() {
			// TODO submit current or resident location forms
			const locationValid = this.$refs.currentLocationForm.submitLocationForm();
			const typeOfLocationValid = this.$refs.currentTypeOfLocationForm.submitTypeOfLocationForm();

			this.$v.$touch();
			return !this.$v.$invalid && !locationValid && !typeOfLocationValid;
		},
	},
};
</script>
