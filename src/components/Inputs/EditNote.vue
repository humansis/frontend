<template>
	<v-card class="pa-4 note">
		<div class="edit-note">
			<v-row>
				<v-col cols="11" class="note-column">
					<div
						v-if="!edit"
						class="note-text"
						:class="displayFull ? 'note-text__full' : ''"
					>
						<span>{{ noteComputed }}</span>
					</div>

					<div v-else>
						<v-textarea
							v-model.trim="noteComputed"
							:label="$t('Note')"
							name="note"
							variant="outlined"
							density="compact"
							hide-details="auto"
							auto-grow
						/>
					</div>
				</v-col>

				<v-col cols="1">
					<v-row class="d-flex align-center justify-end">
						<ButtonAction
							v-if="!completed && !edit"
							:icon="displayFull ? 'arrow-up' : 'arrow-down'"
							:tooltipText="displayFull ? $t('Show less') : $t('Show full note')"
							@actionConfirmed="toggleDisplayFull"
						/>

						<ButtonAction
							v-if="!completed && !edit"
							tooltipText="Edit note"
							icon="pen"
							@actionConfirmed="toggleEdit"
						/>

						<ButtonAction
							v-if="!completed && edit"
							tooltipText="Save note"
							icon="save"
							@actionConfirmed="saveNote"
						/>

						<ButtonAction
							v-if="!completed && edit"
							tooltipText="Discard changes"
							icon="times-circle"
							@actionConfirmed="discardNoteChanges"
						/>
					</v-row>
				</v-col>
			</v-row>
		</div>
	</v-card>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ButtonAction from "@/components/ButtonAction";
import { Notification } from "@/utils/UI";

export default {
	name: "EditNote",

	components: {
		ButtonAction,
	},

	props: {
		assistance: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			note: "",
			displayFull: false,
			edit: false,
		};
	},

	computed: {
		noteComputed: {
			get() {
				return (this.note !== undefined) ? this.note : this?.assistance?.note;
			},
			set(val) {
				this.note = val;
			},
		},

		completed() {
			return this.assistance?.completed || false;
		},
	},

	watch: {
		assistance() {
			this.note = this?.assistance?.note;
		},
	},

	created() {
		this.note = this?.assistance?.note;
	},

	methods: {
		async saveNote() {
			const updateData = {
				assistanceId: this.assistance.id,
				note: this.note,
			};

			await AssistancesService.updateAssistanceNote(
				updateData,
			)
				.then((response) => {
					if (response.status === 200) {
						Notification(this.$t("Note Successfully Updated"), "success");
						this.edit = false;
					}
					this.assistance.note = this.note;
				}).catch((e) => {
					Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
				});
		},

		discardNoteChanges() {
			this.note = this?.assistance?.note;
			this.edit = false;
		},

		toggleDisplayFull() {
			this.displayFull = !this.displayFull;
		},

		toggleEdit() {
			this.edit = !this.edit;
		},
	},
};
</script>

<style lang="scss" scoped>
.edit-note {
	.note-text {
		margin-left: .9375rem;
		flex-grow: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		&__full {
			white-space: break-spaces;
			overflow: auto;
		}
	}

	.note-text-field {
		flex-grow: 1;
	}

	.note-column {
		max-width: 90%;
	}

	.btn-tooltip {
		float: right;
	}
}
</style>
