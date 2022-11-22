<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Name')"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled || editing"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Unit') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.unit"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field
				:label="$t('Category')"
				:type="validateType('productCategoryId')"
				:message="validateMsg('productCategoryId')"
			>
				<MultiSelect
					v-model="formModel.productCategoryId"
					searchable
					label="name"
					track-by="id"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					:options="categories"
					:class="validateMultiselect('productCategoryId')"
					@select="validate('productCategoryId')"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<span v-if="isCategoryTypeCashback()">
				<b-field
					:label="$t('Price')"
					:type="validateType('unitPrice')"
					:message="validateMsg('unitPrice')"
				>
					<b-numberinput
						v-model="formModel.unitPrice"
						expanded
						min="0.01"
						step="0.01"
						type="is-dark"
						:disabled="formDisabled"
						:controls="false"
						@input="validate('unitPrice')"
					/>
				</b-field>

				<b-field
					:label="$t('Currency')"
					:type="validateType('currency')"
					:message="validateMsg('currency')"
					class="mb-3"
				>
					<MultiSelect
						v-model="formModel.currency"
						searchable
						label="value"
						:placeholder="$t('Click to select')"
						:disabled="formDisabled"
						:options="options.currencies"
						:class="validateMultiselect('currency')"
						@select="validate('currency')"
					>
						<span slot="noOptions">{{ $t("List is empty")}}</span>
					</MultiSelect>
				</b-field>
			</span>

			<b-field
				:label="$t('Image')"
				:type="validateType('uploadedImage')"
				:message="validateMsg('uploadedImage')"
			>
				<b-field
					v-if="!formDisabled"
					class="file"
				>
					<b-upload v-model="formModel.uploadedImage" expanded>
						<a class="button is-primary is-fullwidth">
							<b-icon icon="upload" />
							<span>
								{{ formModel.uploadedImage ? formModel.uploadedImage.name : $t("Click to Upload")}}
							</span>
						</a>
					</b-upload>
				</b-field>
			</b-field>

			<b-field v-if="formDisabled && formModel.image">
				<b-image
					alt="Image"
					ratio="601by235"
					:src="formModel.image"
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
import { required, requiredIf, minValue } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import currencies from "@/utils/currencies";

export default {
	name: "ProductForm",

	mixins: [Validation],

	data() {
		return {
			options: {
				currencies,
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		editing: Boolean,
		categories: {
			type: Array,
			default: () => [],
		},
	},

	validations: {
		formModel: {
			name: { required },
			productCategoryId: { required },
			currency: { required: requiredIf((form) => form.productCategoryId.name === "Cashback") },
			unitPrice: {
				required: requiredIf((form) => form.productCategoryId.name === "Cashback"),
				minValue: minValue(0),
			},
			uploadedImage: { required: requiredIf((form) => !form.image) },
		},
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		isCategoryTypeCashback() {
			return this.formModel.productCategoryId?.type === "Cashback";
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
