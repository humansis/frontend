<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field label="Project Name">
				<b-input v-model="formModel.name" />
			</b-field>

			<b-field label="Internal ID">
				<b-input v-model="formModel.internalId" />
			</b-field>

			<b-field label="Sectors">
				<b-tag
					v-for="selectedSector in formModel.selectedSectors"
					:key="selectedSector"
					type="is-success"
					closable
				>
					{{ selectedSector }}
				</b-tag>
				<b-dropdown
					v-model="formModel.selectedSectors"
					multiple
				>
					<button class="button is-primary is-light" type="button" slot="trigger">
						<span>Select sectors</span>
						<b-icon icon="chevron-circle-down"></b-icon>
					</button>
					<b-dropdown-item
						v-for="{code, value} in formModel.sectors"
						:value="value"
						:key="value"
					>
						<span>{{ code }}</span>
					</b-dropdown-item>
				</b-dropdown>
			</b-field>

			<b-field label="Start date">
				<b-datepicker
					v-model="formModel.startDate"
					show-week-number
					locale="en-GB"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus>
				</b-datepicker>
			</b-field>

			<b-field label="Start end">
				<b-datepicker
					v-model="formModel.endDate"
					show-week-number
					locale="en-US"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus>
				</b-datepicker>
			</b-field>

			<b-field label="Donors">
				<b-tag
					v-for="selectedDonor in formModel.selectedDonors"
					:key="selectedDonor"
					type="is-success"
					closable
				>
					{{ selectedDonor }}
				</b-tag>
				<b-dropdown
					v-model="formModel.selectedDonors"
					multiple
				>
					<button class="button is-primary is-light" type="button" slot="trigger">
						<span>Select donors</span>
						<b-icon icon="chevron-circle-down"></b-icon>
					</button>
					<b-dropdown-item
						v-for="{id, shortname} in formModel.donors"
						:value="id"
						:key="id"
					>
						<span>{{ shortname }}</span>
					</b-dropdown-item>
				</b-dropdown>
			</b-field>

			<b-field label="Target Type">
				<b-tag
					v-for="selectedTargetType in formModel.selectedTargetType"
					:key="selectedTargetType"
					type="is-success"
					closable
				>
					{{ selectedTargetType }}
				</b-tag>
				<b-dropdown
					v-model="formModel.selectedTargetType"
					multiple
				>
					<button class="button is-primary is-light" type="button" slot="trigger">
						<span>Select donors</span>
						<b-icon icon="chevron-circle-down"></b-icon>
					</button>
					<b-dropdown-item
						v-for="{code, value} in formModel.targetTypes"
						:value="value"
						:key="value"
					>
						<span>{{ code }}</span>
					</b-dropdown-item>
				</b-dropdown>
			</b-field>

			<b-field label="Total Target">
				<b-numberinput v-model="formModel.totalTarget" min="0" />
			</b-field>

			<b-field label="Notes">
				<b-input v-model="formModel.notes" type="textarea"></b-input>
			</b-field>

		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel" />
		</footer>
	</form>
</template>

<script>
export default {
	name: "ProjectForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
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
