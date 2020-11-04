<script>
import { Pie } from "vue-chartjs";

export default {
	name: "PieChart",

	extends: Pie,

	props: {
		dataCollection: Object,
		options: Object,
	},

	mounted() {
		this.renderChart(this.dataCollection, this.options);
	},

	watch: {
		dataCollection() {
			this.renderChart(this.dataCollection, this.options);
		},
	},

};
</script>
