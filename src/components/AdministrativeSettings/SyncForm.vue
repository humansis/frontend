<template>
	<form>
		<section class="modal-card-body">
			<b-field :label="$t('Raw Data')">
				<pre><code>{{ formModel.rawData }}</code></pre>
			</b-field>
			<b-field :label="$t('Validation Error Messages')">
				<pre><code>{{ formModel.violations }}</code></pre>
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
