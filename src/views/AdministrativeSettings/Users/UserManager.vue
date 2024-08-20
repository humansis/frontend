<template>
	<v-container fluid>
		<v-card class="mx-auto mt-5">
			<v-card-title
				:data-cy="identifierBuilder(`${pageTitle}-text`)"
				class="text-h5 font-weight-bold"
			>
				{{ $t(pageTitle) }}
			</v-card-title>

			<v-card-text />
		</v-card>

		<v-row class="mt-5">
			<v-col class="d-flex justify-end">
				<v-btn
					color="blue-grey-lighten-4"
					variant="elevated"
					class="text-none"
					@click="goBack"
				>
					{{ goBackButtonName }}
				</v-btn>

				<v-btn
					v-if="!institutionAction.isDetail"
					color="primary"
					class="text-none ml-3"
					@click="validateNewInstitution"
				>
					{{ validateButtonName }}
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {

	computed: {
		validateButtonName() {
			return this.$t(this.institutionAction.isCreate ? "Create" : "Update");
		},

		goBackButtonName() {
			return this.$t(this.institutionAction.isDetail ? "Close" : "Cancel");
		},

		institutionId() {
			return this.$route.params.institutionId;
		},
	},
	mounted() {
		this.getUserAction();
	},

	methods: {
		getUserAction() {
			switch (this.$route.name) {
				case "InstitutionDetail":
					this.institutionAction = {
						isCreate: false,
						isEdit: false,
						isDetail: true,
					};

					this.pageTitle = `${this.$t("Detail of Institution")} (${this.$t("ID")}: ${this.institutionId})`;
					this.formDisabled = true;

					break;
				case "InstitutionEdit":
					this.institutionAction = {
						isCreate: false,
						isEdit: true,
						isDetail: false,
					};

					this.pageTitle = `${this.$t("Institution Edit")} (${this.$t("ID")}: ${this.institutionId})`;
					this.formDisabled = false;

					break;
				default:
					this.institutionAction = {
						isCreate: true,
						isEdit: false,
						isDetail: false,
					};

					this.pageTitle = this.$t("Create New Institution");
					this.formDisabled = false;

					break;
			}
		},
	},
};
</script>
