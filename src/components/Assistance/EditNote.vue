<template>
	<div class="edit-note">
		<div v-if="!edit">
			<div
				class="note-text"
			>
				{{ noteComputed }}
			</div>
			<b-tooltip v-if="!completed" class="edit-btn-tooltip" label="Edit note">
				<b-button
					class="edit-btn"
					icon-left="pen"
					@click="toggleEdit"
				/>
			</b-tooltip>
		</div>
		<b-field v-else>
			<b-input
				v-model.trim="noteComputed"
				type="textarea"
				:placeholder="$t('Type note...')"
				@change.native="saveNote"
			/>
		</b-field>
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
			edit: false,
		};
	},

	props: {
		assistance: {
			type: Object,
			default: () => {},
		},
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
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
				});
		},

		toggleEdit() {
			this.edit = !this.edit;
		},
	},
};
</script>

<style lang="scss" scoped>
.edit-note {
	margin-bottom: 20px;
	margin-right: 15px;
	.note-text {
		margin-left: 15px;
		display: inline-block;
		width: 95%;
		@media only screen and (max-width: 750px) {
			width: 90%;
		}
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.edit-btn-tooltip {
		float: right;
	}
	.edit-btn {
		margin-top: -15px;
	}
}
</style>
