import { fetcher } from "@/utils/fetcher";
import { queryBuilder } from "@/utils/helpers";

export default {
	getListOfAdm1() {
		return fetcher({
			uri: `adm1`,
		});
	},

	getListOfAdm2(id) {
		return fetcher({
			uri: id
				? `adm1/${id}/adm2`
				: "adm2",
		});
	},

	getListOfAdm3(id) {
		return fetcher({
			uri: id
				? `adm2/${id}/adm3`
				: "adm3",
		});
	},

	getListOfAdm4(id) {
		return fetcher({
			uri: id
				? `adm3/${id}/adm4`
				: "adm4",
		});
	},

	getLocation(id) {
		return fetcher({
			uri: `locations/${id}`,
		});
	},

	getLocations({ ids, param }) {
		return fetcher({
			uri: `locations${queryBuilder({ ids, param })}`,
		});
	},

	getAdm1s({ ids, param }) {
		return fetcher({
			uri: `adm1${queryBuilder({ ids, param })}`,
		});
	},

	getAdm2s({ ids, param }) {
		return fetcher({
			uri: `adm2${queryBuilder({ ids, param })}`,
		});
	},

	getAdm3s({ ids, param }) {
		return fetcher({
			uri: `adm3${queryBuilder({ ids, param })}`,
		});
	},

	getAdm4s({ ids, param }) {
		return fetcher({
			uri: `adm4${queryBuilder({ ids, param })}`,
		});
	},

	getAdmNames() {
		return fetcher({
			uri: `adms`,
		});
	},
};
