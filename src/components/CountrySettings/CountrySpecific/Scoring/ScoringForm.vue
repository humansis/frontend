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
					:placeholder="$t('Insert name of scoring')"
					@blur="validate('name')"
				/>
			</b-field>

			<p class="help is-danger mb-2">
				{{ $t("Name cannot be changed afterwards.") }}
			</p>

			<b-field
				:label="$t('Note')"
			>
				<b-input
					v-model.trim="formModel.note"
					type="textarea"
					maxlength="100"
					:placeholder="$t('Type…')"
				/>
			</b-field>

			<b-field
				:type="validateType('dropFiles')"
				:message="validateMsg('dropFiles')"
			>
				<b-upload
					v-model="formModel.dropFiles"
					multiple
					drag-drop
					:accept="allowedFileExtensions"
					@blur="validate('dropFiles')"
				>
					<section class="section">
						<div class="content has-text-centered">
							<p>
								<b-icon
									icon="file-upload"
									size="is-large"
								/>
							</p>
							<p>{{ $t("Drop your file here or click to upload") }}</p>
						</div>
					</section>
				</b-upload>
			</b-field>

			<b-message v-if="formModel.dropFiles.length > 1" type="is-warning">
				{{ $t('You can upload only one file.') }}
			</b-message>

			<div class="tags">
				<span v-for="(file, index) in formModel.dropFiles"
					:key="index"
					class="tag is-primary"
				>
					{{ file.name }}
					<button class="delete is-small"
						type="button"
						@click="deleteDropFile(index)"
					/>
				</span>
			</div>
		</section>
		<section class="modal-card-foot">
			<b-button
				@click="closeForm"
			>
				{{ $t('Close') }}
			</b-button>
			<b-button
				class="is-primary"
				native-type="submit"
				:disabled="formModel.dropFiles.length > 1"
			>
				{{ $t('Create') }}
			</b-button>
		</section>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";
import { IMPORT } from "@/consts";

export default {
	name: "ScoringForm",

	mixins: [validation],

	validations: {
		formModel: {
			name: { required },
			dropFiles: { required },
		},
	},

	props: {
		closeButton: Boolean,

		formModel: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			allowedFileExtensions: IMPORT.SUPPORT_CSV_XLSX_XLS_FILES,
		};
	},

	computed: {
	},

	methods: {
		deleteDropFile(index) {
			this.formModel.dropFiles.splice(index, 1);
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
