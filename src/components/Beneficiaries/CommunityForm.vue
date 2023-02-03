<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field>
				<template #label>
					{{ $t('Contact Name') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.contactGivenName"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Contact Family Name') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.contactFamilyName"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Phone') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-field grouped>
					<b-field
						:type="validateType('phonePrefix', true)"
						:message="validateMsg('phonePrefix')"
					>
						<MultiSelect
							v-model="formModel.phonePrefix"
							searchable
							:placeholder="$t('Phone Ext')"
							label="value"
							track-by="code"
							:disabled="formDisabled"
							:options="options.phonePrefixes"
							:class="validateMultiselect('phonePrefix', true)"
							@select="validate('phonePrefix')"
						>
							<span slot="noOptions">{{ $t("List is empty")}}</span>
						</MultiSelect>
					</b-field>
					<b-field
						grouped
						:type="validateType('phoneType', true)"
						:message="validateMsg('phoneType')"
					>
						<MultiSelect
							v-model="formModel.phoneType"
							searchable
							selectLabel=""
							deselectLabel=""
							label="value"
							track-by="code"
							:placeholder="$t('Phone Type')"
							:disabled="formDisabled"
							:loading="phoneTypesLoading"
							:options="options.phoneTypes"
							:class="validateMultiselect('phoneType', true)"
							@select="validate('phoneType')"
						>
							<span slot="noOptions">{{ $t("List is empty")}}</span>
						</MultiSelect>

					</b-field>
					<b-field
						expanded
						:type="validateType('phoneNumber', true)"
						:message="validateMsg('phoneNumber')"
					>
						<b-input
							v-model="formModel.phoneNumber"
							:placeholder="$t('Phone No.')"
							:disabled="formDisabled"
							@blur="validate('phoneNumber')"
						/>
					</b-field>
				</b-field>
			</b-field>
			<b-checkbox
				v-model="formModel.phoneProxy"
				class="mb-4"
				:disabled="formDisabled"
			>
				{{ $t('Proxy') }}
			</b-checkbox>

			<b-field
				:type="validateType('nationalCardType', true)"
				:message="validateMsg('nationalCardType')"
			>
				<template #label>
					{{ $t('Contact ID Type') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<MultiSelect
					v-model="formModel.nationalCardType"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:loading="nationalCardTypesLoading"
					:disabled="formDisabled"
					:options="options.nationalCardTypes"
					:class="validateMultiselect('nationalCardType', true)"
					@select="validate('nationalCardType')"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				:type="validateType('nationalCardNumber', true)"
				:message="validateMsg('nationalCardNumber')"
			>
				<template #label>
					{{ $t('Contact ID Number') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.nationalCardNumber"
					expanded
					:disabled="formDisabled"
					@blur="validate('nationalCardNumber')"
				/>
			</b-field>

			<b-field
				:label="$t('Projects')"
				:type="validateType('projects')"
				:message="validateMsg('projects')"
			>
				<MultiSelect
					v-model="formModel.projects"
					searchable
					multiple
					label="name"
					track-by="id"
					:placeholder="$t('Click to select')"
					:loading="projectsLoading"
					:disabled="formDisabled"
					:options="options.projects"
					:class="validateMultiselect('projects')"
					@select="validate('projects')"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<LocationForm
				ref="locationForm"
				:form-model="formModel"
				:form-disabled="formDisabled"
				@mapped="mapping = false"
			/>

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
				/>
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
					v-model="formModel.addressPostCode"
					:disabled="formDisabled"
					@blur="validate('addressPostCode')"
				/>
			</b-field>

			<b-field grouped>
				<b-field>
					<template #label>
						{{ $t('Latitude') }}
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>
					<b-input
						v-model="formModel.latitude"
						:disabled="formDisabled"
					/>
				</b-field>
				<b-field>
					<template #label>
						{{ $t('Longitude') }}
						<span class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
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
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				class="is-primary"
				native-type="submit"
				:label="submitButtonLabel"
				:disabled="mapping"
			/>
		</footer>
	</form>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
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
			phonePrefix: { required: requiredIf((form) => form.phoneNumber || form.phoneType) },
			phoneNumber: { required: requiredIf((form) => form.phonePrefix || form.phoneType) },
			phoneType: { required: requiredIf((form) => form.phoneNumber || form.phonePrefix) },
			phoneProxy: {},
			addressStreet: {},
			addressNumber: {},
			addressPostCode: {},
			nationalCardNumber: { required: requiredIf((form) => form.nationalCardType) },
			nationalCardType: { required: requiredIf((form) => form.nationalCardNumber) },
			projects: { required },
			adm1: { required },
			adm2: {},
			adm3: {},
			adm4: {},
		},
	},

	data() {
		return {
			mapping: true,
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

	async created() {
		await Promise.all([
			this.fetchNationalCardTypes(),
			this.fetchProjects(),
			this.fetchPhoneTypes(),
		]);
		this.mapSelects();
	},

	methods: {
		mapSelects() {
			const { phonePrefix, nationalCardType, phoneType, projectIds } = this.formModel;
			if (phonePrefix && typeof phonePrefix !== "object") {
				this.formModel.phonePrefix = PhoneCodes
					.find((item) => item.code === phonePrefix);
			}
			if (nationalCardType && typeof nationalCardType !== "object") {
				this.formModel.nationalCardType = this.options.nationalCardTypes
					.find((item) => item.code === nationalCardType);
			}
			if (phoneType && typeof phoneType !== "object") {
				this.formModel.phoneType = this.options.phoneTypes
					.find((item) => item.code === phoneType);
			}
			if (projectIds) {
				this.formModel.projects = getArrayOfCodeListByKey(projectIds, this.options.projects, "id");
			}
			this.mapping = this.$refs.locationForm.mapping;
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
					if (e.message) Notification(`${this.$t("National IDs")} ${e}`, "is-danger");
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
					if (e.message) Notification(`${this.$t("Phone Types")} ${e}`, "is-danger");
				});

			this.phoneTypesLoading = false;
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.options.projects = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});

			this.projectsLoading = false;
		},
	},
};
</script>
