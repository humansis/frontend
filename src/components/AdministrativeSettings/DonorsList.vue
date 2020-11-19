<template>
	<div>
		<Modal
			:active="donorModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			@close="closeDonorModal"
		>
			<DonorForm
				close-button
				:formModel="donorModel"
				:submit-button-label="donorModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="donorModal.isDetail"
				@formSubmitted="submitDonorForm"
				@formClosed="closeDonorModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewDonor"
		>
			Add
		</b-button>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>

			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					v-slot="props"
					:key="column.id"
				>
					<Column :column="column" :data="props" />
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editDonor(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Donor"
						:id="props.row.id"
						@submitted="onRemoveDonor"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import DonorsService from "@/services/DonorsService";
import DonorForm from "@/components/AdministrativeSettings/DonorForm";
import SafeDelete from "@/components/SafeDelete";
import Modal from "@/components/Modal";
import { Toast } from "@/utils/UI";
import Column from "@/components/Column";

export default {
	name: "DonorsList",

	components: {
		Column,
		Modal,
		SafeDelete,
		DonorForm,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						type: "text",
						key: "fullname",
						label: "Donor Name",
					},
					{
						type: "text",
						key: "shortName",
						label: "Short Name",
					},
					{
						type: "image",
						key: "logo",
						label: "Organization Logo",
					},
					{
						type: "text",
						key: "notes",
						label: "Notes",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			donorModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			donorModel: {
				id: null,
				fullname: "",
				shortName: "",
				logo: null,
				notes: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.donorModal.isDetail) {
				result = "Detail of Donor";
			} else if (this.donorModal.isEditing) {
				result = "Edit Donor";
			} else {
				result = "Create new Donor";
			}
			return result;
		},
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await DonorsService.getListOfDonors(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		showDetailWithId(id) {
			const donor = this.table.data.find((item) => item.id === id);
			this.showDetail(donor);
		},

		showDetail(donor) {
			this.mapToFormModel(donor);
			this.donorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				fullname,
				shortName,
				logo,
				notes,
			},
		) {
			this.donorModel = {
				...this.donorModel,
				id,
				fullname,
				shortName,
				logo,
				notes,
			};
		},

		closeDonorModal() {
			this.donorModal.isOpened = false;
		},

		editDonor(id) {
			this.donorModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			const donor = this.table.data.find((item) => item.id === id);
			donor.logo = null;
			this.mapToFormModel(donor);
		},

		addNewDonor() {
			this.donorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.donorModel = {
				...this.donorModel,
				id: null,
				fullname: "",
				shortName: "",
				logo: null,
				notes: "",
			};
		},

		submitDonorForm(donorForm) {
			const {
				id,
				fullname,
				shortName,
				logo,
				notes,
			} = donorForm;

			const donorBody = {
				fullname,
				shortName,
				logo,
				notes,
			};

			if (this.donorModal.isEditing && id) {
				this.updateDonor(id, donorBody);
			} else {
				this.createDonor(donorBody);
			}

			this.closeDonorModal();
		},

		async createDonor(donorBody) {
			await DonorsService.createDonor(donorBody).then((response) => {
				if (response.status === 200) {
					Toast("Donor Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async updateDonor(id, donorBody) {
			await DonorsService.updateDonor(id, donorBody).then((response) => {
				if (response.status === 200) {
					Toast("Donor Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async onRemoveDonor(id) {
			await DonorsService.deleteDonor(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Donor successfully removed", "is-success");
						this.fetchData();
					}
				});
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
