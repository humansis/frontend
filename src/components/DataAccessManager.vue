<template>
	<v-col v-if="!isLoading" class="py-4 pl-0 pr-3">
		<v-row>
			<v-col :cols="isNotePanelVisible && 8" class="pt-0 pb-0 pr-0">
				<v-expansion-panels
					v-for="(group, index) in dataAccessGroups"
					v-model="group.expanded"
					:key="group.groupName"
					variant="accordion"
					:style="{ 'background-color': '#fbfcfe' }"
				>
					<v-expansion-panel eager>
						<v-expansion-panel-title>
							<h4 class="ml-3">
								<v-icon
									v-if="group.groupIcon"
									:icon="group.groupIcon"
									class="mr-2"
								/>

								{{ $t(group.groupName) }}
							</h4>

							<template v-slot:actions="{ expanded }">
								<div class="d-flex align-center">
									<v-icon :icon="expanded ? 'arrow-up' : 'arrow-down'" />
								</div>
							</template>
						</v-expansion-panel-title>

						<v-expansion-panel-text class="pl-5 py-5">
							<v-row>
								<v-btn
									:disabled="isSelectAllDisabled(group)"
									color="blue-grey-lighten-4"
									variant="elevated"
									size="small"
									class="text-none mr-4"
									@click="selectOrUnselectAllDataInGroup(group, index, true)"
								>
									{{ $t('Select All') }}
								</v-btn>

								<v-btn
									:disabled="isUnselectAllDisabled(group)"
									color="blue-grey-lighten-4"
									variant="elevated"
									size="small"
									class="text-none mr-4"
									@click="selectOrUnselectAllDataInGroup(group, index, false)"
								>
									{{ $t('Unselect All') }}
								</v-btn>

								<slot :index="index" />

								<v-divider class="my-2" />
							</v-row>

							<v-row>
								<v-col
									v-for="dataAccess in group[propertyNameForAccessGroup]"
									:key="dataAccess[propertyNameForAccessLabel]"
									class="pt-0 pl-0 pr-5 pb-0"
									cols="12"
									sm="6"
									md="4"
									lg="2"
								>
									<v-checkbox
										v-model="dataAccess.isSelected"
										:label="$t(dataAccess[propertyNameForAccessLabel])"
										:disabled="isCheckboxDisabled(group)"
										name="enabled"
										class="checkbox my-checkbox"
										hide-details
										@mouseenter="getDescription(dataAccess.description)"
										@mouseleave="resetDescription()"
										@focus="getDescription(dataAccess.description)"
										@focusout="resetDescription()"
										@update:modelValue="checkboxValueUpdated($event, group, index, dataAccess)"
									/>
								</v-col>
							</v-row>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</v-col>

			<v-col
				v-if="isNotePanelVisible"
				id="note-panel"
				cols="4"
				class="note-panel"
			>
				<div ref="notePanel" class="help-block">
					<span v-html-secure="description" />
				</div>
			</v-col>
		</v-row>
	</v-col>

	<Loading v-else is-large />

</template>

<script>
import Loading from "@/components/Loading";

export default {
	components: { Loading },

	props: {
		isNotePanelVisible: {
			type: Boolean,
			default: false,
		},

		groups: {
			type: [Array, Object],
			required: true,
		},

		propertyNameForAccessGroup: {
			type: String,
			required: true,
		},

		propertyNameForAccessLabel: {
			type: String,
			required: true,
		},

		isLoading: {
			type: Boolean,
			default: false,
		},

		isFormDisabled: {
			type: Boolean,
			default: false,
		},

	},

	data() {
		return {
			allFutureProjects: false,
			hideAfterEndDate: true,
			description: {},
			distance: 0,
			padding: 0,
			dataAccessGroups: [],
		};
	},

	watch: {
		groups: {
			deep: true,
			handler(value) {
				this.dataAccessGroups = value;
			},
		},

		isLoading(value) {
			if (!value && this.isNotePanelVisible) {
				window.addEventListener("scroll", this.handleScroll);

				this.$nextTick(() => {
					const element = document.getElementById("note-panel");
					const { top } = element.getBoundingClientRect();
					this.distance = top;
				});

				this.updatePadding();
			}
		},
	},

	mounted() {
		this.dataAccessGroups = this.groups;
	},

	beforeUnmount() {
		window.removeEventListener("scroll", this.handleScroll);
	},

	methods: {
		handleScroll() {
			this.updatePadding();
		},

		formatTitle(key) {
			return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
		},

		getDescription(description) {
			this.description = description;
		},

		resetDescription() {
			this.description = "";
		},

		updatePadding() {
			this.padding = window.pageYOffset || document.documentElement.scrollTop;

			if (this.$refs.notePanel && this.padding > this.distance) {
				this.$refs.notePanel.style.paddingTop = `${(this.padding - this.distance)}px`;
			}
		},

		selectOrUnselectAllDataInGroup(group, index, isSelectAll) {
			let specificDataAccessGroup = this.dataAccessGroups[index][this.propertyNameForAccessGroup];

			specificDataAccessGroup = group[this.propertyNameForAccessGroup]
				.map((item) => ({
					...item,
					isSelected: !!isSelectAll,
				}));

			this.dataAccessGroups[index][this.propertyNameForAccessGroup] = [...specificDataAccessGroup];
			this.$emit("data-in-group-updated", {
				group,
				groupIndex: index,
				dataAccess: null,
			});

			this.$emit(isSelectAll ? "selected-all" : "unselected-all", index);
		},

		isCheckboxDisabled(group) {
			return this.isFormDisabled || group.isGroupCheckboxesDisabled;
		},

		isSelectAllDisabled(group) {
			return this.isFormDisabled || group.isGroupSelectAllDisabled;
		},

		isUnselectAllDisabled(group) {
			return this.isFormDisabled || group.isGroupUnselectAllDisabled;
		},

		checkboxValueUpdated(modelValue, group, groupIndex, dataAccess) {
			this.$emit("update:modelValue", modelValue);
			this.$emit("data-in-group-updated", {
				group,
				groupIndex,
				dataAccess,
			});
		},
	},
};
</script>

<style lang="scss">
.note-panel {
	box-shadow:
		0px 3px 1px -2px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
		0px 2px 2px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
		0px 1px 5px 0px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
	background-color: #e9e9e9;
}

.help-block ul {
	padding-top: .5rem;
	padding-left: 2rem;
}

.permissions-info {
	background-color: #fff;
	border-radius: 12px;
	padding: 16px;
	margin: 12px;
}

.v-expansion-panel-title--active {
	background-color: #e9e9e9;
}

.my-checkbox {
	border-radius: 6px;

	&.head {
		max-width: fit-content;
	}

	&:not(.head):hover {
		background-color: #e9eaec;
	}

	.v-selection-control__wrapper {
		left: 0;
	}

	.v-label {
		width: 100%;
		padding-left: 12px;
	}

	.v-selection-control--density-default {
		--v-selection-control-size: 25px;
	}
}

.v-checkbox.my-checkbox .v-selection-control {
	--v-input-control-height: 45px !important;
}

.v-expansion-panel-text__wrapper .v-row {
	align-items: center;
}
</style>
