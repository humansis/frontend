<template>
	<section>
		<b-field
			label="Type Of Location"
			:type="validateType('typeOfLocation')"
			:message="validateMsg('typeOfLocation')"
		>
			<MultiSelect
				v-model="formModel.typeOfLocation"
				label="value"
				track-by="code"
				placeholder="Click to select..."
				:loading="locationTypesLoading"
				:options="options.typeOfLocation"
				:searchable="false"
				:class="validateMultiselect('typeOfLocation')"
				@select="validate('typeOfLocation')"
			/>
		</b-field>
		<div v-if="formModel.typeOfLocation.code === 'camp'">
			<b-field
				label="Camp"
				:type="validateType('camp')"
				:message="validateMsg('camp')"
			>
				<MultiSelect
					v-model="formModel.selectedTargetType"
					placeholder="Click to select..."
					:options="options.camps"
					:searchable="false"
					:class="validateMultiselect('camp')"
					@select="validate('camp')"
				/>
			</b-field>

			<b-field
				grouped
				label="Camp Name"
				:type="validateType('campName')"
				:message="validateMsg('campName')"
			>
				<b-checkbox v-model="createCamp">Create A Camp</b-checkbox>
				<b-input
					v-if="createCamp"
					v-model="formModel.campName"
					placeholder="Camp name"
					@blur="validate('campName')"
				/>
			</b-field>

			<b-field
				label="Tent Number"
				:type="validateType('tentNumber')"
				:message="validateMsg('tentNumber')"
			>
				<b-input
					v-model="formModel.tentNumber"
					placeholder="Tent Number"
					@blur="validate('tentNumber')"
				/>
			</b-field>
		</div>
		<div v-else>
			<b-field
				label="Address Number"
				:type="validateType('addressNumber')"
				:message="validateMsg('addressNumber')"
			>
				<b-input
					v-model="formModel.addressNumber"
					placeholder="Address Number"
					@blur="validate('addressNumber')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="validateType('addressStreet')"
				:message="validateMsg('addressStreet')"
			>
				<b-input
					v-model="formModel.addressStreet"
					placeholder="Address Street"
					@blur="validate('addressStreet')"
				/>
			</b-field>

			<b-field
				label="Address Postcode"
				:type="validateType('addressPostcode')"
				:message="validateMsg('addressPostcode')"
			>
				<b-input
					v-model="formModel.addressPostcode"
					placeholder="Address Postcode"
					@blur="validate('addressPostcode')"
				/>
			</b-field>
		</div>
	</section>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import Validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";
import { required, requiredIf } from "vuelidate/lib/validators";

export default {
	name: "TypeOfLocationForm",

	props: {
		formModel: Object,
		locationObject: Promise,
		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	mixins: [Validation],

	data() {
		return {
			locationTypesLoading: false,
			createCamp: false,
			options: {
				typeOfLocation: [],
				// TODO camps
				camps: [],
			},
		};
	},

	validations: {
		formModel: {
			typeOfLocation: { required },
			camp: { required: requiredIf((form) => form.typeOfLocation.code === "camp") },
			campName: { required: requiredIf((form) => form.typeOfLocation.code === "camp") },
			tentNumber: { required: requiredIf((form) => form.typeOfLocation.code === "camp") },
			addressNumber: { required: requiredIf((form) => form.typeOfLocation.code !== "camp") },
			addressStreet: { required: requiredIf((form) => form.typeOfLocation.code !== "camp") },
			addressPostcode: { required: requiredIf((form) => form.typeOfLocation.code !== "camp") },
		},
	},

	async mounted() {
		await this.fetchLocationsTypes();
		this.locationObject.then((location) => {
			if (this.isEditing) {
				this.formModel.typeOfLocation = this.options.typeOfLocation
					.find((item) => item.code === location.type);
				this.formModel.camp = location.camp;
				this.formModel.campName = location.name;
				this.formModel.tentNumber = location.tentNumber;
				this.formModel.addressNumber = location.number;
				this.formModel.addressStreet = location.street;
				this.formModel.addressPostcode = location.postcode;
				this.formModel.locationId = location.id;
			}
		});
	},

	methods: {
		async fetchLocationsTypes() {
			this.locationTypesLoading = true;
			await BeneficiariesService.getListOfLocationsTypes()
				.then((result) => { this.options.typeOfLocation = result.data; })
				.catch((e) => {
					Notification(`Location Types ${e}`, "is-danger");
				});
			this.locationTypesLoading = false;
		},

		submitTypeOfLocationForm() {
			this.$v.$touch();
			return this.$v.$invalid;
		},
	},
};
</script>
