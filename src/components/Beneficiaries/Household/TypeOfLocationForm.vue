<template>
	<DataSelect
		v-model="formModel.typeOfLocation"
		:items="options.typeOfLocation"
		:loading="locationTypesLoading"
		:error-messages="validationMsg('typeOfLocation')"
		label="Type of Location"
		name="type-of-location"
		class="mb-4"
		@update:modelValue="onSelectTypeOfLocation"
	/>

	<template v-if="campSelected">
		<v-checkbox
			v-model="createCamp"
			:label="$t('Create a new Camp')"
			name="create-new-camp"
			density="compact"
			class="mb-4"
			hide-details="auto"
		/>

		<DataSelect
			v-if="!createCamp"
			v-model="formModel.camp"
			:items="options.camps"
			:error-messages="validationMsg('camp')"
			label="Camp name"
			name="camp-name"
			item-title="name"
			item-value="id"
			class="mb-4"
			@update:modelValue="onSelectCamp"
		/>

		<DataInput
			v-else
			v-model="formModel.campName"
			:error-messages="validationMsg('campName')"
			label="Camp name"
			name="camp-name"
			class="mb-4"
			@update:modelValue="onValidate('campName')"
		/>

		<DataInput
			v-model="formModel.tentNumber"
			:error-messages="validationMsg('tentNumber')"
			label="Tent number"
			name="tent-number"
			class="mb-4"
			@update:modelValue="onValidate('tentNumber')"
		/>
	</template>

	<template v-else>
		<DataInput
			v-model="formModel.number"
			:error-messages="validationMsg('number')"
			:optional="!residenceSelected"
			label="Address number"
			name="address-number"
			class="mb-4"
			@update:modelValue="onValidate('number')"
		/>

		<DataInput
			v-model="formModel.street"
			:error-messages="validationMsg('street')"
			:optional="!residenceSelected"
			label="Address street"
			name="address-street"
			class="mb-4"
			@update:modelValue="onValidate('street')"
		/>

		<DataInput
			v-model="formModel.postcode"
			:error-messages="validationMsg('postcode')"
			:optional="!residenceSelected"
			label="Address postcode"
			name="address-postcode"
			class="mb-4"
			@update:modelValue="onValidate('postcode')"
		/>
	</template>
</template>

<script>
import { required, requiredIf } from "@vuelidate/validators";
import AddressService from "@/services/AddressService";
import BeneficiariesService from "@/services/BeneficiariesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "TypeOfLocationForm",

	components: { DataInput, DataSelect },

	mixins: [validation],

	validations() {
		return {
			formModel: {
				typeOfLocation: { required },
				camp: {
					required: requiredIf(this.campSelected && !this.createCamp),
				},
				campName: {
					required: requiredIf(this.campSelected && this.createCamp),
				},
				tentNumber: {
					required: requiredIf(this.campSelected),
				},
				number: {
					required: requiredIf(this.residenceSelected),
				},
				street: {
					required: requiredIf(this.residenceSelected),
				},
				postcode: {
					required: requiredIf(this.residenceSelected),
				},
			},
		};
	},

	props: {
		formModel: {
			type: Object,
			required: true,
		},

		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			locationTypesLoading: true,
			createCamp: false,
			options: {
				typeOfLocation: [],
				camps: [],
			},
			campsLoading: true,
		};
	},

	computed: {
		campSelected() {
			return this.formModel.type === GENERAL.LOCATION_TYPE.camp.type;
		},

		residenceSelected() {
			return this.formModel.type === GENERAL.LOCATION_TYPE.residence.type;
		},
	},

	watch: {
		formModel: "mapLocations",

		createCamp() {
			this.formModel.camp = "";
			this.formModel.campName = null;
		},
	},

	async mounted() {
		await this.fetchLocationsTypes();
		await this.mapLocations();
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchLocationsTypes() {
			this.locationTypesLoading = true;
			await BeneficiariesService.getListOfLocationsTypes()
				.then((result) => {
					this.options.typeOfLocation = result.data;
				})
				.catch((e) => {
					Notification(`${this.$t("Location Types")} ${e.message || e}`, "error");
				});
			this.locationTypesLoading = false;
		},

		async fetchCamps() {
			this.campsLoading = true;

			await AddressService.getCampsByLocation(this.formModel.locationId)
				.then(({ data }) => {
					this.options.camps = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Camps")} ${e.message || e}`, "error");
				})
				.finally(() => {
					this.campsLoading = false;
				});
		},

		async mapLocations() {
			if (this.formModel.locationId) {
				await this.fetchCamps();
			}
			if (this.formModel.type) {
				const typeOfLocation = this.options.typeOfLocation
					.find((item) => {
						const isCamp = this.formModel.type === GENERAL.LOCATION_TYPE.camp.type
							&& item.code === GENERAL.LOCATION_TYPE.camp.code;

						const isResidence = this.formModel.type === GENERAL.LOCATION_TYPE.residence.type
							&& item.code === GENERAL.LOCATION_TYPE.residence.code;

						// Save settlement.type to const variable to shorten line length
						const TEMPORARY_SETTLEMENT_TYPE = GENERAL.LOCATION_TYPE.temporarySettlement.type;
						const isTemporarySettlement = this.formModel.type === TEMPORARY_SETTLEMENT_TYPE
							&& item.code === GENERAL.LOCATION_TYPE.temporarySettlement.code;

						return isCamp || isResidence || isTemporarySettlement;
					});

				if (typeOfLocation) {
					this.formModel.typeOfLocation = typeOfLocation;
				}
			}
			const campId = this.formModel?.campId || this.formModel.camp?.id;
			if (campId && !this.formModel.camp) {
				this.formModel.camp = this.options.camps
					.find((item) => campId === item.id);
			}
		},

		onSelectTypeOfLocation(selectedType) {
			this.v$.$reset();
			this.formModel.type = selectedType.value.toLowerCase();
			this.onValidate("typeOfLocation");
		},

		submitTypeOfLocationForm() {
			this.v$.$touch();
			return this.v$.$invalid;
		},

		onSelectCamp() {
			this.onValidate("camp");
		},
	},
};
</script>
