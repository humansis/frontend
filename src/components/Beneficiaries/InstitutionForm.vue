<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Name"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field>
				<template #label>
					Contact Name
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.contactGivenName"
					:disabled="formDisabled"
					@blur="validate('contactGivenName')"
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

			<b-field
				label="Type"
				:type="validateType('type')"
				:message="validateMsg('type')"
			>
				<MultiSelect
					v-model="formModel.type"
					searchable
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="options.types"
					placeholder="Click to select..."
					:class="validateMultiselect('type')"
					@select="validate('type')"
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
					placeholder="Click to select..."
					label="value"
					track-by="code"
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
					placeholder="Contact ID Number"
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
					placeholder="Click to select..."
					label="name"
					track-by="id"
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
					placeholder="Address Number"
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
					placeholder="Address Street"
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
					placeholder="Address Postcode"
					:disabled="formDisabled"
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
						placeholder="Latitude"
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
						placeholder="Longitude"
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
import InstitutionService from "@/services/InstitutionService";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import PhoneCodes from "@/utils/phoneCodes";
import Validation from "@/mixins/validation";
import { normalizeText } from "@/utils/datagrid";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import ProjectsService from "@/services/ProjectsService";
import LocationForm from "@/components/LocationForm";

export default {
	name: "InstitutionForm",
	components: { LocationForm },
	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			type: { required },
			name: { required },
			projects: { required },
			longitude: {},
			latitude: {},
			contactGivenName: {},
			contactFamilyName: {},
			phonePrefix: {},
			phoneNumber: {},
			phoneProxy: {},
			phoneType: {},
			addressStreet: {},
			addressNumber: {},
			addressPostCode: {},
			nationalCardNumber: {},
			nationalCardType: {},
			adm1Id: { required },
			adm2Id: {},
			adm3Id: {},
			adm4Id: {},
		},
	},

	data() {
		return {
			options: {
				types: [],
				nationalCardTypes: [],
				phonePrefixes: PhoneCodes,
				phoneTypes: [],
				projects: [],
			},
			phoneTypesLoading: true,
			institutionTypesLoading: true,
			nationalCardTypesLoading: true,
			projectsLoading: true,
		};
	},

	async created() {
		await this.fetchTypes();
		await this.fetchNationalCardTypes();
		await this.fetchPhoneTypes();
		await this.fetchProjects();
	},

	watch: {
		formModel: "mapSelects",
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async mapSelects() {
			const { phonePrefix, type, nationalCardType, phoneType, projects } = this.formModel;
			if (phonePrefix && typeof phonePrefix !== "object") {
				this.formModel.phonePrefix = await PhoneCodes
					.find((item) => item.code === phonePrefix);
			}
			if (type && typeof type !== "object") {
				this.formModel.type = await this.options.types
					.find((item) => item.code === type);
			}
			if (nationalCardType && typeof nationalCardType !== "object") {
				this.formModel.nationalCardType = await this.options.nationalCardTypes
					.find((item) => item.code === nationalCardType);
			}
			if (phoneType && typeof phoneType !== "object") {
				this.formModel.phoneType = await this.options.phoneTypes
					.find((item) => item.code === phoneType);
			}
			if (projects) {
				this.formModel.projects = getArrayOfCodeListByKey(projects, this.options.projects, "id");
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		async fetchTypes() {
			await InstitutionService.getListOfInstitutionTypes()
				.then(({ data }) => {
					this.options.types = data;
				})
				.catch((e) => {
					Notification(`Institution Types ${e}`, "is-danger");
				});

			this.institutionTypesLoading = false;
		},

		async fetchNationalCardTypes() {
			await BeneficiariesService.getListOfTypesOfNationalIds()
				.then(({ data }) => {
					this.options.nationalCardTypes = data;
				})
				.catch((e) => {
					Notification(`National IDs ${e}`, "is-danger");
				});

			this.nationalCardTypesLoading = false;
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
			await ProjectsService.getListOfProjects()
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
