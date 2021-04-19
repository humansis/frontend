<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field>
				<template #label>
					{{ $t('Address Number') }}
				</template>
				<b-input v-model="formModel.addressNumber" disabled />
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Street') }}
				</template>
				<b-input v-model="formModel.addressStreet" disabled />
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Postcode') }}
				</template>
				<b-input v-model="formModel.addressPostCode" disabled />
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Notes') }}
				</template>
				<b-input v-model="notes" />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!disabled"
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
	name: "EditCommunityForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		disabled: Boolean,
	},

	data() {
		return {
			notes: "",
		};
	},

	methods: {
		submitForm() {
			this.$emit("formSubmitted", this.notes);
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
