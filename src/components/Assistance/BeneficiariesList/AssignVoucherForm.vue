<template>
	<v-card-text>
		<h6 class="text-subtitle-1 font-weight-bold">{{ $t('Project') }}</h6>

		<p class="text-body-1 mb-5">{{ projectName }}</p>

		<h6 class="text-subtitle-1 font-weight-bold">{{ $t('Assistance') }}</h6>

		<p class="text-body-1 mb-5">{{ assistanceName }}</p>

		<h6 class="text-subtitle-1 font-weight-bold">{{ $t('Beneficiary') }}</h6>

		<p class="text-body-1 mb-5">{{ beneficiaryName }}</p>

		<h3 class="text-body-1 mb-5">
			{{ $t('Scan Booklet QR Code') }}

			<v-icon
				v-if="scannedResult"
				color="success"
				icon="check"
			/>
		</h3>

		<v-alert
			v-if="noStreamApiSupport"
			variant="outlined"
			type="warning"
			border="top"
			class="mt-5"
		>
			{{ $t('No Stream Api Support') }}.
		</v-alert>

		<v-alert
			v-if="cameraMissingError"
			variant="outlined"
			type="warning"
			border="top"
			class="mt-5"
		>
			{{ $t('Camera is Missing') }}.
		</v-alert>

		<div class="scan-container">
			<qrcode-drop-zone @decode="onDecode" @init="onLogErrors">
				<qrcode-stream @decode="onDecode" @init="onInit" />
			</qrcode-drop-zone>

			<qrcode-capture v-if="noStreamApiSupport" @decode="onDecode" />
		</div>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="close"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			:disabled="!scannedResult"
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="submit"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { QrcodeCapture, QrcodeDropZone, QrcodeStream } from "vue-qrcode-reader";

export default {
	name: "AssignVoucherForm",

	emits: ["scannedCode", "formClosed"],

	components: {
		QrcodeStream,
		QrcodeDropZone,
		QrcodeCapture,
	},

	props: {
		closeButton: Boolean,

		beneficiary: {
			type: Object,
			required: true,
		},

		assistance: {
			type: Object,
			required: true,
		},

		project: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			scannedResult: "",
			noStreamApiSupport: false,
			cameraMissingError: false,
		};
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

		onLogErrors(promise) {
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

			this.scannedResult = "";
		},

		close() {
			this.$emit("formClosed");
		},

	},
};
</script>

<style scoped>
.scan-container {
	max-width: 37.5rem;
	margin: 0 auto;
}
</style>
