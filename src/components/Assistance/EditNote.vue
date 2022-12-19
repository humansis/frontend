<template>
	<div class="box edit-note">
		<template v-if="!edit">
			<div
				class="note-text"
				:class="displayFull ? 'note-text__full' : ''"
			>{{ noteComputed }}</div>
			<b-tooltip
				v-if="noteComputed"
				class="btn-tooltip"
				:label="displayFull ? $t('Show less') : $t('Show full note')"
			>
				<b-button
					class="edit-btn"
					:icon-left="displayFull ? 'arrow-up' : 'arrow-down'"
					@click="toggleDisplayFull"
				/>
			</b-tooltip>
			<b-tooltip v-if="!completed" class="btn-tooltip" :label="$t('Edit note')">
				<b-button
					class="edit-btn"
					icon-left="pen"
					@click="toggleEdit"
				/>
			</b-tooltip>
		</template>
		<template v-else>
			<b-input
				v-model.trim="noteComputed"
				type="textarea"
				class="note-text-field"
				:placeholder="$t('Type note...')"
			/>
			<b-tooltip v-if="!completed" class="btn-tooltip" :label="$t('Save note')">
				<b-button
					class="edit-btn is-primary"
					icon-left="save"
					@click="saveNote"
				/>
			</b-tooltip>
			<b-tooltip v-if="!completed" class="btn-tooltip" :label="$t('Discard changes')">
				<b-button
					class="edit-btn"
					icon-left="times-circle"
					@click="discardNoteChanges"
				/>
			</b-tooltip>
		</template>
	</div>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";

export default {
	name: "EditNote",

	data() {
		return {
			note: "",
			displayFull: false,
			edit: false,
		};
	},

	props: {
		assistance: {
			type: Object,
			default: () => {},
		},
	},

	watch: {
		assistance() {
			this.note = this?.assistance?.note;
		},
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
						Notification(this.$t("Note Successfully Updated"), "is-success");
						this.edit = false;
					}
					this.assistance.note = this.note;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
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
	margin: 0 1rem 2rem;
	display: flex;
	justify-content: space-evenly;
	gap: 5px;

	.note-text {
		margin-left: 15px;
		margin-top: 8px;
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

	.btn-tooltip {
		float: right;
	}
}
</style>
