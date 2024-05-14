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
						<DataTextarea
							v-model.trim="noteComputed"
							label="Note"
							name="note"
							auto-grow
						/>
					</div>
				</v-col>

				<v-col cols="1">
					<v-row class="d-flex align-center justify-end">
						<ButtonAction
							v-if="noteComputed?.length"
							:icon="displayFull ? 'arrow-up' : 'arrow-down'"
							:tooltipText="displayFull ? 'Show less' : 'Show full note'"
							@actionConfirmed="displayFull = !displayFull"
						/>

						<ButtonAction
							v-if="!completed && !edit"
							tooltipText="Edit note"
							icon="pen"
							@actionConfirmed="edit = !edit"
						/>

						<ButtonAction
							v-if="!completed && edit"
							tooltipText="Save note"
							icon="save"
							@actionConfirmed="onSaveNote"
						/>

						<ButtonAction
							v-if="!completed && edit"
							tooltipText="Discard changes"
							icon="times-circle"
							@actionConfirmed="onDiscardNoteChanges"
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
import DataTextarea from "@/components/Inputs/DataTextarea";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "EditNote",

	components: {
		ButtonAction,
		DataTextarea,
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
				return this.note || this?.assistance?.note;
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
		async onSaveNote() {
			const updateData = {
				assistanceId: this.assistance.id,
				note: this.note,
			};

			try {
				const {
					status,
					message,
				} = await AssistancesService.updateAssistanceNote(updateData);

				this.assistance.note = this.note;

				checkResponseStatus(status, message);

				Notification(this.$t("Note Successfully Updated"), "success");
				this.edit = false;
			} catch (e) {
				Notification(`${this.$t("Assistance")}> ${e.message || e}`, "error");
			}
		},

		onDiscardNoteChanges() {
			this.note = this?.assistance?.note;
			this.edit = false;
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
