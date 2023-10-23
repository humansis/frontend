<template>
	<section>
		<b-field
			:label="$t('Type of Location')"
			:type="validateType('typeOfLocation')"
			:message="validateMsg('typeOfLocation')"
		>
			<MultiSelect
				v-model="formModel.typeOfLocation"
				label="value"
				:select-label="$t('Press enter to select')"
				:selected-label="$t('Selected')"
				:deselect-label="$t('Press enter to remove')"
				track-by="code"
				:placeholder="$t('Click to select')"
				:loading="locationTypesLoading"
				:options="options.typeOfLocation"
				:searchable="false"
				:class="validateMultiselect('typeOfLocation')"
				@select="selectTypeOfLocation"
			>
				<span slot="noOptions">{{ $t("List is empty")}}</span>
				<template slot="singleLabel" slot-scope="props">
					<div class="option__desc">
						<span class="option__title">{{ normalizeText(props.option.value) }}</span>
					</div>
				</template>
				<template slot="option" slot-scope="props">
					<div class="option__desc">
						<span class="option__title">{{ normalizeText(props.option.value) }}</span>
					</div>
				</template>
			</MultiSelect>
		</b-field>
		<div v-if="campSelected || this.formModel.type === 'camp'" :key="campKey">
			<b-field
				v-if="!createCamp"
				:label="$t('Camp name')"
				:type="validateType('camp')"
				:message="validateMsg('camp')"
			>
				<MultiSelect
					v-model="formModel.camp"
					label="name"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					track-by="id"
					:placeholder="$t('Click to select')"
					:options="options.camps"
					:searchable="false"
					:class="validateMultiselect('camp')"
					@select="selectCamp"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				grouped
				:type="validateType('campName')"
				:message="validateMsg('campName')"
			>
				<b-checkbox v-model="createCamp">{{ $t('Create a Camp') }}</b-checkbox>
				<b-input
					v-if="createCamp"
					v-model="formModel.campName"
					:placeholder="$t('Camp Name')"
					@blur="validate('campName')"
				/>
			</b-field>

			<b-field
				:label="$t('Tent number')"
				:type="validateType('tentNumber')"
				:message="validateMsg('tentNumber')"
			>
				<b-input
					v-model="formModel.tentNumber"
					@blur="validate('tentNumber')"
				/>
			</b-field>
		</div>
		<div v-else>
			<b-field
				:label="$t('Address number')"
				:type="validateType('number')"
				:message="validateMsg('number')"
			>
				<b-input
					v-model="formModel.number"
					@blur="validate('number')"
				/>
			</b-field>

			<b-field
				:label="$t('Address street')"
				:type="validateType('street')"
				:message="validateMsg('street')"
			>
				<b-input
					v-model="formModel.street"
					@blur="validate('street')"
				/>
			</b-field>

			<b-field
				:label="$t('Address postcode')"
				:type="validateType('postcode')"
				:message="validateMsg('postcode')"
			>
				<b-input
					v-model="formModel.postcode"
					@blur="validate('postcode')"
				/>
			</b-field>
		</div>
	</section>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import AddressService from "@/services/AddressService";
import BeneficiariesService from "@/services/BeneficiariesService";
import validation from "@/mixins/validation";
import { normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "TypeOfLocationForm",

	mixins: [validation],

	validations: {
		formModel: {
			typeOfLocation: { required },
			camp: { required: requiredIf((form) => (
					form.typeOfLocation?.code === GENERAL.LOCATION_TYPE.camp.code && !form.campName
			)) },
			campName: { required: requiredIf((form) => (
					form.typeOfLocation?.code === GENERAL.LOCATION_TYPE.camp.code && !form.camp
			)) },
			tentNumber: { required: requiredIf((form) => (
					form.typeOfLocation?.code === GENERAL.LOCATION_TYPE.camp.code
			)) },
			number: { required: requiredIf((form) => (
					form.typeOfLocation?.code === GENERAL.LOCATION_TYPE.residence.code
			)) },
			street: { required: requiredIf((form) => (
					form.typeOfLocation?.code === GENERAL.LOCATION_TYPE.residence.code
			)) },
			postcode: { required: requiredIf((form) => (
					form.typeOfLocation?.code === GENERAL.LOCATION_TYPE.residence.code
			)) },
		},
	},

	props: {
		formModel: Object,

		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			campKey: 0,
			locationTypesLoading: true,
			createCamp: false,
			campSelected: false,
			options: {
				typeOfLocation: [],
				camps: [],
			},
			campsLoading: true,
		};
	},

	watch: {
		formModel: "mapLocations",
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
					if (e.message) Notification(`${this.$t("Location Types")} ${e}`, "is-danger");
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
					if (e.message) Notification(`${this.$t("Camps")} ${e}`, "is-danger");
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
				this.campSelected = this.formModel.type === GENERAL.LOCATION_TYPE.camp.type;
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
				this.campSelected = this.formModel.type === GENERAL.LOCATION_TYPE.camp.type;
				this.formModel.camp = this.options.camps
					.find((item) => campId === item.id);
				this.campKey += 1;
			}
		},

		selectTypeOfLocation(selectedType) {
			this.$v.$reset();
			this.campSelected = selectedType.code === GENERAL.LOCATION_TYPE.camp.code;
			this.formModel.type = selectedType.value.toLowerCase();
			this.validate("typeOfLocation");
		},

		submitTypeOfLocationForm() {
			this.$v.$touch();
			return this.$v.$invalid;
		},

		selectCamp() {
			this.validate("camp");
			this.campKey += 1;
		},
	},
};
</script>
