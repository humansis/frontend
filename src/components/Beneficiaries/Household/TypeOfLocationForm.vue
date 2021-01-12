<template>
	<section>
		<b-field
			label="Type Of Location"
			:type="validateType('typeOfLocation')"
			:message="validateMsg('typeOfLocation')"
		>
			<MultiSelect
				v-model="formModel.typeOfLocation"
				placeholder="Type Of Location"
				label="value"
				track-by="code"
				:loading="locationTypesLoading"
				:options="options.typeOfLocation"
				:searchable="false"
				:class="validateMultiselect('typeOfLocation')"
				@select="validate('typeOfLocation')"
			/>
		</b-field>
		<div v-if="formModel.typeOfLocation === 'Camp'">
			<b-field>
				<template #label>
					Camp<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<MultiSelect
					v-model="formModel.selectedTargetType"
					placeholder="Camp"
					:options="options.camps"
					:searchable="false"
				/>
			</b-field>

			<b-field grouped>
				<template #label>
					Camp Name<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-checkbox v-model="createCamp">Create A Camp</b-checkbox>
				<b-input
					v-if="createCamp"
					v-model="formModel.campName"
					placeholder="Camp name"
				/>
			</b-field>

			<b-field>
				<template #label>
					Tent Number<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.tentNumber"
					placeholder="Tent Number"
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
import { required } from "vuelidate/lib/validators";

export default {
	name: "TypeOfLocationForm",

	props: {
		formModel: Object,
	},

	mixins: [Validation],

	data() {
		return {
			locationTypesLoading: false,
			createCamp: false,
			options: {
				typeOfLocation: [],
				camps: [],
			},
		};
	},

	validations: {
		formModel: {
			typeOfLocation: { required },
			camp: {},
			campName: {},
			tentNumber: {},
			addressNumber: { required },
			addressStreet: { required },
			addressPostcode: { required },
		},
	},

	mounted() {
		this.fetchLocationsTypes();
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
