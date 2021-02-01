import { fetcher, idsToUri } from "@/utils/fetcher";

export default {

	async getCampAddress(id) {
		const { data } = await fetcher({ uri: `beneficiaries/addresses/camps/${id}` });
		return data;
	},

	async getResidenceAddress(id) {
		const { data } = await fetcher({ uri: `beneficiaries/addresses/residencies/${id}` });
		return data;
	},

	async getTemporarySettlementAddress(id) {
		const { data } = await fetcher({ uri: `beneficiaries/addresses/temporary-settlement/${id}` });
		return data;
	},

	async getCampAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `beneficiaries/addresses/camps?${idsText}` });
		return data;
	},

	async getResidenceAddresses(ids) {
		const idsText = ids ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `beneficiaries/addresses/residencies?${idsText}` });
		return data;
	},

	async getTemporarySettlementAddresses(ids) {
		const idsText = ids.length ? idsToUri(ids) : "";

		const { data } = await fetcher({ uri: `beneficiaries/addresses/temporary-settlement?${idsText}` });
		return data;
	},

	async getAddress(id) {
		// TODO Finish after BE prepare address endpoint
		// const { data } = await fetcher({ uri: `beneficiaries/addresses/${id}` });
		return {
			id,
			number: "1234",
			street: "Stara",
			postcode: "512 34",
			locationId: 59,
			adm1Id: 1,
			adm2Id: 1,
			adm3Id: 4,
			adm4Id: 53,
		};
	},
};
