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

			<b-field class="mt-2" :label="$t('Date of Assistance')">
				<b-datepicker
					v-model="formModel.dateDistribution"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:max-date="maxDateOfAssistance"
					:placeholder="$t('Click to select')"
					:disabled="!editing"
				/>
			</b-field>

			<b-field :label="$t('Expiration Date')">
				<b-datepicker
					v-model="formModel.dateExpiration"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:min-date="formModel.dateDistribution"
					:max-date="maxDateOfAssistance"
					:placeholder="$t('Click to select')"
					:disabled="!editing"
				/>
			</b-field>

			<b-field :label="$t('Target')">
				<b-input v-model="formModel.target" disabled />
			</b-field>

			<b-field :label="$t('Allowed Product Category Types')" :addons="false">
				<div
					v-for="item of options.allowedProductCategoryTypes"
					:key="`product-category-type-${item}`"
				>
					<b-checkbox
						v-model="formModel.allowedProductCategoryTypes"
						:native-value="item"
						:disabled="!editing"
					>
						<div class="is-flex is-align-items-center">
							{{ item }}
							<SvgIcon class="ml-2" :items="[{code: item, value: item}]" />
						</div>
					</b-checkbox>
				</div>
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
import SvgIcon from "@/components/SvgIcon";

export default {
	name: "AssistanceForm",

	components: {
		LocationForm,
		SvgIcon,
	},

	data() {
		return {
			options: {
				allowedProductCategoryTypes: [
					"Food", "Non-Food", "Cashback",
				],
			},
		};
	},

	props: {
		formModel: Object,
		editing: Boolean,
		project: {
			type: Object,
			default: () => {},
		},
	},

	computed: {
		maxDateOfAssistance() {
			const { endDate } = this.project;
			return new Date(endDate);
		},
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
