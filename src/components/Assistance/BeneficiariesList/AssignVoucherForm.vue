<template>
	<div class="modal-card">
		<section class="modal-card-body">
			<div class="level-left">
				<div class="level-item mb-3">
					<div>
						<p class="heading">{{ $t('Project') }}</p>
						<p class="subtitle is-5">{{projectName}}</p>
					</div>
				</div>
				<div class="level-item mb-3">
					<div>
						<p class="heading">{{ $t('Assistance') }}</p>
						<p class="subtitle is-5">{{ assistanceName }}</p>
					</div>
				</div>
			</div>
			<div class="level-left">
				<div class="level-item mb-3">
					<div>
						<p class="heading">{{ $t('Beneficiary') }}</p>
						<p class="subtitle is-5">{{ beneficiaryName }}</p>
					</div>
				</div>
			</div>
			<hr>
			<h3 class="subtitle is-5 has-text-centered mb-5 mt-5">
				{{ $t('Scan Booklet QR Code') }}
				<b-icon
					v-if="scannedResult"
					type="is-success" icon="check"
				/>
			</h3>
			<b-message v-if="noStreamApiSupport" type="is-warning">
				{{ $t('No Stream Api Support') }}.
			</b-message>

			<b-message v-if="cameraMissingError" type="is-warning">
				{{ $t('Camera is Missing') }}.
			</b-message>

			<div class="scan-container">
				<qrcode-drop-zone @decode="onDecode" @init="logErrors">
					<qrcode-stream @decode="onDecode" @init="onInit" />
				</qrcode-drop-zone>
				<qrcode-capture v-if="noStreamApiSupport" @decode="onDecode" />
			</div>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="close">
				{{ $t('Close') }}
			</b-button>
			<b-button
				class="is-primary"
				:disabled="!scannedResult"
				@click="submit"
			>
				{{ submitButtonLabel }}
			</b-button>
		</footer>
	</div>
</template>

<script>
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from "vue-qrcode-reader";

export default {
	name: "AssignVoucherForm",

	components: {
		QrcodeStream,
		QrcodeDropZone,
		QrcodeCapture,
	},

	data() {
		return {
			scannedResult: "",
			noStreamApiSupport: false,
			cameraMissingError: false,
		};
	},

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

	methods: {
		onDecode(scannedResult) {
			this.scannedResult = scannedResult;
		},

		logErrors(promise) {
			promise.catch(console.error);
		},

		async onInit(promise) {
			try {
				await promise;
			} catch (error) {
				this.noStreamApiSupport = (error.name === "StreamApiNotSupportedError");
				this.cameraMissingError = (error.name === "OverconstrainedError");
			}
		},

		submit() {
			this.$emit("scannedCode", {
				beneficiaryId: this.beneficiary.id,
				code: this.scannedResult,
			});
		},

		close() {
			this.$emit("formClosed");
		},

	},
};
</script>

<style scoped>
.scan-container {
	max-width: 600px;
	margin: 0 auto;
}
</style>
