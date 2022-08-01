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
				track-by="code"
				:placeholder="$t('Click to select')"
				:loading="locationTypesLoading"
				:options="options.typeOfLocation"
				:searchable="false"
				:class="validateMultiselect('typeOfLocation')"
				@select="selectTypeOfLocation"
			>
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
				:label="$t('Camp')"
				:type="validateType('camp')"
				:message="validateMsg('camp')"
			>
				<MultiSelect
					v-model="formModel.camp"
					label="name"
					track-by="id"
					:placeholder="$t('Click to select')"
					:options="options.camps"
					:searchable="false"
					:class="validateMultiselect('camp')"
					@select="selectCamp"
				/>
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
				:label="$t('Tent Number')"
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
				:label="$t('Address Number')"
				:type="validateType('number')"
				:message="validateMsg('number')"
			>
				<b-input
					v-model="formModel.number"
					@blur="validate('number')"
				/>
			</b-field>

			<b-field
				:label="$t('Address Street')"
				:type="validateType('street')"
				:message="validateMsg('street')"
			>
				<b-input
					v-model="formModel.street"
					@blur="validate('street')"
				/>
			</b-field>

			<b-field
				:label="$t('Address Postcode')"
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
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import Validation from "@/mixins/validation";
import { normalizeText } from "@/utils/datagrid";
import AddressService from "@/services/AddressService";
import CONST from "@/const";

export default {
	name: "TypeOfLocationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	watch: {
		formModel: "mapLocations",
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

	validations: {
		formModel: {
			typeOfLocation: { required },
			camp: { required: requiredIf((form) => (
				form.typeOfLocation?.code === CONST.LOCATION_TYPE.camp.code && !form.campName
			)) },
			campName: { required: requiredIf((form) => (
				form.typeOfLocation?.code === CONST.LOCATION_TYPE.camp.code && !form.camp
			)) },
			tentNumber: { required: requiredIf((form) => (
				form.typeOfLocation?.code === CONST.LOCATION_TYPE.camp.code
			)) },
			number: { required: requiredIf((form) => (
				form.typeOfLocation?.code === CONST.LOCATION_TYPE.residence.code
			)) },
			street: { required: requiredIf((form) => (
				form.typeOfLocation?.code === CONST.LOCATION_TYPE.residence.code
			)) },
			postcode: { required: requiredIf((form) => (
				form.typeOfLocation?.code === CONST.LOCATION_TYPE.residence.code
			)) },
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
				this.campSelected = this.formModel.type === "camp";
				const typeOfLocation = this.options.typeOfLocation
					.find((item) => this.formModel.type?.toLowerCase() === item.value?.toLowerCase());
				if (typeOfLocation) {
					this.formModel.typeOfLocation = typeOfLocation;
				}
			}
			const campId = this.formModel?.campId || this.formModel.camp?.id;
			if (campId && !this.formModel.camp) {
				this.campSelected = this.formModel.type === "camp";
				this.formModel.camp = this.options.camps
					.find((item) => campId === item.id);
				this.campKey += 1;
			}
		},

		selectTypeOfLocation(value) {
			this.$v.$reset();
			this.campSelected = value.code === CONST.LOCATION_TYPE.camp.code;
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
