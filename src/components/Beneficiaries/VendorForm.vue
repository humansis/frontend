<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Username')"
				:type="validateType('username')"
				:message="validateMsg('username')"
			>
				<b-input
					v-model="formModel.username"
					:disabled="formDisabled || isEditing"
					@blur="validate('username')"
				/>
			</b-field>

			<b-field
				:label="$t('Password')"
				:type="validateType('password')"
				:message="validateMsg('password')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					password-reveal
					:disabled="formDisabled"
					@blur="validate('password')"
				/>
			</b-field>

			<b-field
				:label="$t('Name')"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled || isEditing"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				:label="$t('Allowed Category Types')"
				:type="validateType('categoryType')"
				:message="validateMsg('categoryType')"
				:addons="false"
			>
				<div
					v-for="({code, value}) of options.categoryTypes"
					class="mb-3"
					:key="`category-type-${code}`"
				>
					<b-checkbox
						v-model="formModel.categoryType"
						:native-value="code"
						:disabled="formDisabled"
						@blur="validate('categoryType')"
					>
						<div class="is-flex is-align-items-center">
							{{ value }}
							<SvgIcon class="ml-2" :items="[{code, value}]" />
						</div>
					</b-checkbox>
				</div>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Vendor No.') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.vendorNo"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Contract No.') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.contractNo"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Remote Distribution Permission') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-checkbox
					v-model="formModel.canDoRemoteDistributions"
					:disabled="formDisabled"
				>
					{{ $t('Allowed') }}
				</b-checkbox>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Street') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.addressStreet"
					:disabled="formDisabled"
					@blur="validate('addressStreet')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Number') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.addressNumber"
					:disabled="formDisabled"
					@blur="validate('addressNumber')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Postcode') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.addressPostcode"
					:disabled="formDisabled"
					@blur="validate('addressPostcode')"
				/>
			</b-field>

			<LocationForm
				ref="locationForm"
				:form-model="formModel"
				:form-disabled="formDisabled"
				@mapped="mapping = false"
			/>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				class="is-primary"
				native-type="submit"
				:label="submitButtonLabel"
				:loading="formLoading"
				:disabled="mapping || formLoading"
			/>
		</footer>
	</form>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import Validation from "@/mixins/validation";
import SvgIcon from "@/components/SvgIcon";

export default {
	name: "VendorForm",

	components: {
		LocationForm,
		SvgIcon,
	},

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		formLoading: Boolean,
		isEditing: Boolean,
	},

	validations: {
		formModel: {
			username: { required },
			// eslint-disable-next-line func-names
			password: { required: requiredIf(function () {
				return !this.isEditing;
			}) },
			name: { required },
			categoryType: { required },
			shop: {},
			addressStreet: {},
			addressNumber: {},
			addressPostcode: {},
			adm1Id: { required },
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
			vendorNo: {},
			contractNo: {},
		},
	},

	data() {
		return {
			mapping: true,
			options: {
				categoryTypes: [
					{
						code: "Food",
						value: "Food",
					},
					{
						code: "Non-Food",
						value: "Non-Food",
					},
					{
						code: "Cashback",
						value: "Cashback",
					},
				],
			},
		};
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			this.$refs.locationForm.submitLocationForm();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
