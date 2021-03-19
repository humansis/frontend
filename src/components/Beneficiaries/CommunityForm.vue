<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field>
				<template #label>
					Contact Name
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.contactGivenName"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					Contact Family Name
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.contactFamilyName"
					:disabled="formDisabled"
					@blur="validate('contactFamilyName')"
				/>
			</b-field>

			<b-field>
				<template #label>
					Phone
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-field grouped>
					<b-field>
						<MultiSelect
							v-model="formModel.phonePrefix"
							searchable
							placeholder="Phone Ext"
							label="value"
							track-by="code"
							:disabled="formDisabled"
							:options="options.phonePrefixes"
						/>
					</b-field>
					<b-field grouped>
						<MultiSelect
							v-model="formModel.phoneType"
							searchable
							selectLabel=""
							deselectLabel=""
							label="value"
							track-by="code"
							placeholder="Phone Type"
							:disabled="formDisabled"
							:loading="phoneTypesLoading"
							:options="options.phoneTypes"
						/>

					</b-field>
					<b-field expanded>
						<b-input
							v-model="formModel.phoneNumber"
							placeholder="Phone No."
							:disabled="formDisabled"
						/>
					</b-field>
				</b-field>
			</b-field>
			<b-checkbox v-model="formModel.phoneProxy" class="mb-4" :disabled="formDisabled">
				Proxy
			</b-checkbox>

			<b-field>
				<template #label>
					Contact ID Type
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<MultiSelect
					v-model="formModel.nationalCardType"
					searchable
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:loading="nationalCardTypesLoading"
					:disabled="formDisabled"
					:options="options.nationalCardTypes"
				/>
			</b-field>

			<b-field>
				<template #label>
					Contact ID Number
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.nationalCardNumber"
					expanded
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field
				label="Projects"
				:type="validateType('projects')"
				:message="validateMsg('projects')"
			>
				<MultiSelect
					v-model="formModel.projects"
					searchable
					multiple
					label="name"
					track-by="id"
					placeholder="Click to select..."
					:loading="projectsLoading"
					:disabled="formDisabled"
					:options="options.projects"
					:class="validateMultiselect('projects')"
					@select="validate('projects')"
				/>
			</b-field>

			<LocationForm
				ref="locationForm"
				:form-model="formModel"
				:form-disabled="formDisabled"
			/>

			<b-field>
				<template #label>
					Address Number
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.addressNumber"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					Address Street
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.addressStreet"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					Address Postcode
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.addressPostCode"
					:disabled="formDisabled"
					@blur="validate('addressPostCode')"
				/>
			</b-field>

			<b-field grouped>
				<b-field>
					<template #label>
						Latitude
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-input
						v-model="formModel.latitude"
						:disabled="formDisabled"
					/>
				</b-field>
				<b-field>
					<template #label>
						Longitude
						<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
					</template>
					<b-input
						v-model="formModel.longitude"
						:disabled="formDisabled"
					/>
				</b-field>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				Close
			</b-button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import BeneficiariesService from "@/services/BeneficiariesService";
import Validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import PhoneCodes from "@/utils/phoneCodes";
import ProjectService from "@/services/ProjectService";

export default {
	name: "CommunityForm",

	mixins: [Validation],

	components: { LocationForm },

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			longitude: {},
			latitude: {},
			contactGivenName: {},
			contactFamilyName: {},
			phonePrefix: {},
			phoneNumber: {},
			phoneType: {},
			phoneProxy: {},
			addressStreet: {},
			addressNumber: {},
			addressPostCode: {},
			nationalCardNumber: {},
			nationalCardType: {},
			projects: { required },
			adm1Id: { required },
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
		},
	},

	data() {
		return {
			phoneTypesLoading: true,
			nationalCardTypesLoading: true,
			projectsLoading: true,
			options: {
				nationalCardTypes: [],
				phonePrefixes: PhoneCodes,
				phoneTypes: [],
				projects: [],
			},
		};
	},

	watch: {
		formModel: "mapSelects",
	},

	async mounted() {
		await this.fetchNationalCardTypes();
		await this.fetchPhoneTypes();
		await this.fetchProjects();
	},

	methods: {
		async mapSelects() {
			const { phonePrefix, nationalCardType, phoneType, projectIds } = this.formModel;
			if (phonePrefix && typeof phonePrefix !== "object") {
				this.formModel.phonePrefix = await PhoneCodes
					.find((item) => item.code === phonePrefix);
			}
			if (nationalCardType && typeof nationalCardType !== "object") {
				this.formModel.nationalCardType = await this.options.nationalCardTypes
					.find((item) => item.code === nationalCardType);
			}
			if (phoneType && typeof phoneType !== "object") {
				this.formModel.phoneType = await this.options.phoneTypes
					.find((item) => item.code === phoneType);
			}
			if (projectIds) {
				this.formModel.projects = getArrayOfCodeListByKey(projectIds, this.options.projects, "id");
			}
		},

		submitForm() {
			this.$v.$touch();
			this.$refs.locationForm.submitLocationForm();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then(({ data }) => { this.options.nationalCardTypes = data; })
				.catch((e) => {
					Notification(`National IDs ${e}`, "is-danger");
				});

			this.nationalCardTypesLoading = false;
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		async fetchPhoneTypes() {
			await BeneficiariesService.getListOfTypesOfPhones()
				.then(({ data }) => {
					this.options.phoneTypes = data;
				})
				.catch((e) => {
					Notification(`Phone types ${e}`, "is-danger");
				});

			this.phoneTypesLoading = false;
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.options.projects = data;
				})
				.catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});

			this.projectsLoading = false;
		},
	},
};
</script>
