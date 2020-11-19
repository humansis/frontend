<template>
	<div>
		<Modal
			can-cancel
			:active="myOrganizationModal.isOpened"
			:header="modalHeader"
			@close="closeMyOrganizationModal"
		>
			<MyOrganizationForm
				close-button
				:formModel="myOrganizationModel"
				:submit-button-label="myOrganizationModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="myOrganizationModal.isDetail"
				@formSubmitted="submitMyOrganizationForm"
				@formClosed="closeMyOrganizationModal"
			/>
		</Modal>

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
				<b-table-column  v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editMyOrganization(props.row.id)"
					/>
					<ActionButton
						icon="print"
						type="is-dark"
						@click.native="printMyOrganization(props.row.id)"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import MyOrganizationsService from "@/services/MyOrganizationsService";
import { Toast } from "@/utils/UI";
import MyOrganizationForm from "@/components/AdministrativeSettings/MyOrganizationForm";
import Modal from "@/components/Modal";

export default {
	name: "MyOrganizationsList",

	components: {
		Modal,
		MyOrganizationForm,
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
						key: "name",
						label: "Organization Name",
					},
					{
						key: "logo",
						label: "Organization Logo",
					},
					{
						key: "font",
						label: "Font To Apply To The Pdf",
					},
					{
						key: "primaryColor",
						label: "Organization Primary Color",
					},
					{
						key: "secondaryColor",
						label: "Organization Secondary Color",
					},
					{
						key: "footerContent",
						label: "Pdf Footer Content",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			myOrganizationModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			myOrganizationModel: {
				id: null,
				name: "",
				logo: "",
				font: "",
				primaryColor: "",
				secondaryColor: "",
				footerContent: "",
				uploadedImage: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.myOrganizationModal.isDetail) {
				result = "Detail of MyOrganization";
			} else if (this.myOrganizationModal.isEditing) {
				result = "Edit MyOrganization";
			}
			return result;
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await MyOrganizationsService.getListOfMyOrganizations(
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
			const myOrganization = this.table.data.find((item) => item.id === id);
			this.showDetail(myOrganization);
		},

		showDetail(myOrganization) {
			this.mapToFormModel(myOrganization);
			this.myOrganizationModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				name,
				logo,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
				uploadedImage,
			},
		) {
			this.myOrganizationModel = {
				...this.myOrganizationModel,
				id,
				name,
				logo,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
				uploadedImage,
			};
		},

		closeMyOrganizationModal() {
			this.myOrganizationModal.isOpened = false;
		},

		editMyOrganization(id) {
			this.myOrganizationModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			const myOrganization = this.table.data.find((item) => item.id === id);
			myOrganization.image = null;
			this.mapToFormModel(myOrganization);
		},

		submitMyOrganizationForm(myOrganizationForm) {
			const {
				id,
				name,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
				uploadedImage,
			} = myOrganizationForm;

			const myOrganizationBody = {
				id,
				name,
				logo: uploadedImage,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
			};

			this.updateMyOrganization(id, myOrganizationBody);

			this.closeMyOrganizationModal();
		},

		async updateMyOrganization(id, myOrganizationBody) {
			await MyOrganizationsService.updateMyOrganization(id, myOrganizationBody).then((response) => {
				if (response.status === 200) {
					Toast("My Organization Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async printMyOrganization(id) {
			await MyOrganizationsService.printMyOrganization(id).then((response) => {
				if (response.status === 200) {
					Toast("Your Download is starting", "is-success");
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
