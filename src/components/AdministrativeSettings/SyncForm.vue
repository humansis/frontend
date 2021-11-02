<template>
	<form>
		<section class="modal-card-body">
			<b-field :label="$t('Raw Data')">
				<b-input
					v-model="formModel.rawData"
					type="textarea"
					:disabled="formDisabled"
				/>
			</b-field>
			<b-field :label="$t('Validation Error Messages')">
				<b-input
					v-model="formModel.violations"
					type="textarea"
					:disabled="formDisabled"
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
		</footer>
	</form>
</template>

<script>
import Validation from "@/mixins/validation";

export default {
	name: "SyncForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	methods: {
		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
