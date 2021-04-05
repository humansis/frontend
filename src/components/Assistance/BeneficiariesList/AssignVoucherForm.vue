<template>
	<form @submit.prevent="submit">
		<section class="modal-card-body">
			<div class="level-left">
				<div class="level-item has-text-centered">
					<div class="box">
						<p class="heading">{{ $t('Project') }}</p>
						<p class="subtitle is-4">{{projectName}}</p>
					</div>
				</div>

				<div class="level-item has-text-centered">
					<div class="box">
						<p class="heading">{{ $t('Assistance') }}</p>
						<p class="subtitle is-4">{{assistanceName}}</p>
					</div>
				</div>

				<div class="level-item has-text-centered">
					<div class="box">
						<p class="heading">{{ $t('Beneficiary') }}</p>
						<p class="subtitle is-4">{{beneficiaryName}}</p>
					</div>
				</div>
			</div>
			<h3 class="subtitle is-5 has-text-centered mb-5 mt-5">
				{{ $t('Scan booklet QR code') }}
			</h3>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="close">
				{{ $t('Close') }}
			</b-button>
			<b-button
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>
<script>

export default {
	name: "AssignVoucherForm",

	props: {
		beneficiary: Object,
		assistance: Object,
		project: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	computed: {
		projectName() {
			return this.project?.name || "";
		},

		assistanceName() {
			return this.assistance?.name || "";
		},

		beneficiaryName() {
			return `
				${this.beneficiary?.localGivenName || ""}
				${this.beneficiary?.localFamilyName || ""}
			`;
		},
	},

	data() {
		return {

		};
	},

	methods: {
		submit() {
			this.$emit("formClosed");
		},

		close() {
			this.$emit("formClosed");
		},

	},
};
</script>
