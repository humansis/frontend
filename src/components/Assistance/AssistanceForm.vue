<template>
	<form>
		<section class="modal-card-body">
			<b-field :label="$t('Name')">
				<b-input v-model="formModel.name" disabled />
			</b-field>

			<LocationForm
				v-if="!editing"
				ref="locationForm"
				form-disabled
				:form-model="formModel"
			/>

			<b-field :label="$t('Date of Assistance')">
				<b-datepicker
					v-model="formModel.dateDistribution"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:placeholder="$t('Click to select')"
					:disabled="!editing"
				/>
			</b-field>

			<b-field :label="$t('Target')">
				<b-input v-model="formModel.target" disabled />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="editing"
				:value="$t('Update')"
				tag="input"
				class="is-primary"
				@click="submitForm"
			/>
		</footer>
	</form>
</template>

<script>
import LocationForm from "@/components/LocationForm";

export default {
	name: "AssistanceForm",

	components: {
		LocationForm,
	},

	props: {
		formModel: Object,
		editing: Boolean,
	},

	methods: {
		submitForm() {
			this.$emit("formSubmitted", this.formModel);
			this.closeForm();
		},

		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
