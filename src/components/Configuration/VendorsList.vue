<template>
	<div>
		<h2 class="title">Vendors</h2>
		<Modal
			:active="vendorModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			@close="closeVendorModal"
		>
			<VendorForm
				close-button
				:formModel="vendorModel"
				:submit-button-label="vendorModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="vendorModal.isDetail"
				@formSubmitted="submitVendorForm"
				@formClosed="closeVendorModal"
			/>
		</Modal>

		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewVendor"
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
				<b-table-column v-bind="column" :key="column.id">
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
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editVendor(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Vendor"
						:id="props.row.id"
						@submitted="onVendorDelete"
					/>
					<ActionButton icon="print" type="is-dark" />
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import { Toast } from "@/utils/UI";
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import VendorForm from "@/components/Configuration/VendorForm";
import SafeDelete from "@/components/SafeDelete";
import VendorsService from "@/services/VendorsService";
import LocationsService from "@/services/LocationsService";
import Modal from "@/components/Modal";

export default {
	name: "VendorsList",

	components: {
		Modal,
		SafeDelete,
		VendorForm,
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
						key: "username",
						label: "Username",
					},
					{
						key: "name",
						label: "Name",
					},
					{
						key: "description",
						label: "Description",
					},
					{
						key: "addressStreet",
						label: "Address Street",
					},
					{
						key: "addressNumber",
						label: "Description",
					},
					{
						key: "addressPostcode",
						label: "Description",
					},
					{
						key: "location",
						label: "Location",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			vendorModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			vendorModel: {
				creating: false,
				id: null,
				username: "",
				password: "",
				name: "",
				description: "",
				addressStreet: "",
				addressNumber: "",
				addressPostCode: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.vendorModal.isDetail) {
				result = "Detail of Vendor";
			} else if (this.vendorModal.isEditing) {
				result = "Edit Vendor";
			} else {
				result = "Create new Vendor";
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

				await VendorsService.getListOfVendors(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.buildLocationsForVendors(response.data).then((result) => {
						this.table.data = result;
						this.table.total = response.totalCount;
						this.table.columns = generateColumns(
							this.table.visibleColumns,
						);
					});
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		async buildLocationsForVendors(data) {
			const preparedVendors = [];
			data.forEach((vendor) => {
				const preparedVendor = vendor;
				if (vendor.adm4Id) {
					LocationsService.getDetailOfAdm4(vendor.adm4Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						});
				} else if (vendor.adm3Id) {
					LocationsService.getDetailOfAdm3(vendor.adm3Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						});
				} else if (vendor.adm2Id) {
					LocationsService.getDetailOfAdm2(vendor.adm2Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						});
				} else if (vendor.adm1Id) {
					LocationsService.getDetailOfAdm1(vendor.adm1Id)
						.then((response) => {
							preparedVendor.location = response.data.name;
							preparedVendors.push(preparedVendor);
						});
				}
			});
			return preparedVendors;
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		editVendor(id) {
			this.vendorModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			this.mapToFormModel(this.table.data.find((item) => item.id === id));
		},

		addNewVendor() {
			this.vendorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.vendorModel = {
				...this.vendorModel,
				creating: true,
				id: null,
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
				type: "",
				addressStreet: "",
				addressNumber: "",
				addressPostCode: "",
				nationalCardNumber: "",
				nationalCardType: "",
				phonePrefix: "",
				phoneNumber: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
			};
		},

		submitVendorForm(vendorForm) {
			const {
				id,
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			} = vendorForm;

			const vendorBody = {
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			};
			if (this.vendorModal.isEditing && id) {
				this.updateVendor(id, vendorBody);
			} else {
				this.createVendor(vendorBody);
			}

			this.closeVendorModal();
		},

		async createVendor(vendorBody) {
			await VendorsService.createVendor(vendorBody).then((response) => {
				if (response.status === 200) {
					Toast("Vendor Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async updateVendor(id, vendorBody) {
			await VendorsService.updateVendor(id, vendorBody).then((response) => {
				if (response.status === 200) {
					Toast("Vendor Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async onVendorDelete(id) {
			await VendorsService.deleteVendor(id).then((response) => {
				if (response.status === 204) {
					Toast("Vendor Successfully Deleted", "is-success");
					this.fetchData();
				}
			});
		},

		closeVendorModal() {
			this.vendorModal.isOpened = false;
		},

		showDetailWithId(id) {
			const vendor = this.table.data.find((item) => item.id === id);
			this.showDetail(vendor);
		},

		showDetail(vendor) {
			this.mapToFormModel(vendor);
			this.vendorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			},
		) {
			this.vendorModel = {
				...this.vendorModel,
				creating: !this.vendorModal.isEditing && !this.vendorModal.isDetail,
				id,
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			};
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
