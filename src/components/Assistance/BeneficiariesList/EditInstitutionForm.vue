<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field>
				<template #label>
					{{ $t('Address Number') }}
				</template>
				<b-input
					v-model="formModel.addressNumber"
					:placeholder="$t('Address Number')"
					disabled
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Street') }}
				</template>
				<b-input
					v-model="formModel.addressStreet"
					:placeholder="$t('Address Street')"
					disabled
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Postcode') }}
				</template>
				<b-input
					v-model="formModel.addressPostCode"
					:placeholder="$t('Address Postcode')"
					disabled
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Address Postcode') }}
				</template>
				<b-input
					v-model="formModel.notes"
					:placeholder="$t('Notes')"
				/>
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
	name: "EditBeneficiaryForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		disabled: Boolean,
	},

	methods: {
		submitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
