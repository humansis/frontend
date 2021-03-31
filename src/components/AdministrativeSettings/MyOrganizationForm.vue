<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Organization Name')"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				:type="validateType('logo')"
			>
				<template #label>
					{{ $t('Organizational Logo') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-field class="file">
					<b-upload
						v-model="formModel.uploadedImage"
						expanded
					>
						<a class="button is-primary is-fullwidth">
							<b-icon icon="upload" />
							<span>
								{{ formModel.uploadedImage ? formModel.uploadedImage.name : $t("Click to Upload")}}
							</span>
						</a>
					</b-upload>
				</b-field>
			</b-field>

			<b-field
				v-if="formDisabled && formModel.logo"
				:label="$t('Image')"
			>
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.logo"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Font To Apply To The Pdf') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<MultiSelect
					v-model="formModel.font"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('Click to select...')"
					:disabled="formDisabled"
					:options="fonts"
					@blur="validate('font')"
				>
					<template #singleLabel="props">
						<div class="option__desc">
							<span
								class="option__title"
								:style="`font-family: ${props.option.value}, sans-serif`"
							>
								{{ props.option.value }}
							</span>
						</div>
					</template>
					<template #option="props">
						<div class="option__desc">
							<span
								class="option__title"
								:style="`font-family: ${props.option.value}, sans-serif`"
							>
								{{ props.option.value }}
							</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Organization Primary Color') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<VSwatches
					v-model="formModel.primaryColor"
					popover-x="right"
					popover-y="top"
					swatches="text-advanced"
					:disabled="formDisabled"
					@blur="validate('primaryColor')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Organization Secondary Color') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<VSwatches
					v-model="formModel.secondaryColor"
					row-lenght="6"
					popover-x="right"
					popover-y="top"
					swatches="text-advanced"
					:disabled="formDisabled"
					@blur="validate('secondaryColor')"
				/>
			</b-field>

			<b-field
				:label="$t('Pdf Footer Content')"
				:type="validateType('footerContent')"
			>
				<b-input
					v-model="formModel.footerContent"
					:disabled="formDisabled"
					@blur="validate('footerContent')"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button
				v-if="closeButton"
				@click="closeForm"
			>
				{{ $t('Close') }}
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
import Validation from "@/mixins/validation";

export default {
	name: "MyOrganizationForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: { required },
			logo: {},
			font: {},
			primaryColor: {},
			secondaryColor: {},
			footerContent: { required },
		},
	},

	data() {
		return {
			fonts: [
				{ code: "Arial", value: "Arial" },
				{ code: "Helvetica", value: "Helvetica" },
				{ code: "Courier", value: "Courier" },
			],
		};
	},

	computed: {
		fontFamily() {
			return `font-family: ${this.data.row[this.column.field]}, sans-serif`;
		},
	},

	mounted() {
		this.mapSelects();
	},

	methods: {
		mapSelects() {
			if (typeof this.formModel.font !== "object") {
				this.formModel.font = this.fonts.find((item) => item.code === this.formModel.font);
			}
		},

		submitForm() {
			this.$v.$touch();
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
