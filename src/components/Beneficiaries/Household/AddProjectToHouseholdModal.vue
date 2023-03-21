<template>
	<Modal
		can-cancel
		:header="$t('Add Beneficiary to a Project')"
		:active="isOpened"
		@close="closeAddToProjectModal"
	>
		<section
			class="modal-card-body overflow-visible"
			:style="{ 'min-height': selectOpened ? `${options.length * 50}px` : '100px' }"
		>
			<b-field label="Project">
				<MultiSelect
					v-model="selectedProject"
					searchable
					label="name"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					track-by="id"
					class="is-relative"
					:placeholder="$t('Click to select')"
					:loading="loading"
					:options="options"
					@open="selectOpened = true"
					@close="selectOpened = false"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button  @click="closeAddToProjectModal">
				{{ $t('Close') }}
			</b-button>
			<b-button
				type="is-primary"
				:loading="confirmButtonLoading"
				@click="addHouseholdsToProject"
			>
				{{ $t('Confirm') }}
			</b-button>
		</footer>
	</Modal>
</template>

<script>
import Modal from "@/components/Modal";

export default {
	name: "AddProjectToHouseholdModal",

	components: {
		Modal,
	},

	props: {
		confirmButtonLoading: Boolean,
		loading: Boolean,
		options: Array,
		isOpened: Boolean,
	},

	data() {
		return {
			selectOpened: false,
			selectedProject: null,
		};
	},

	methods: {
		closeAddToProjectModal() {
			this.$emit("close");
		},
		addHouseholdsToProject() {
			this.$emit("confirm", this.selectedProject);
			this.selectedProject = null;
		},
	},
};
</script>

<style scoped>
.modal-card-body {
	min-height: 350px;
}
</style>
