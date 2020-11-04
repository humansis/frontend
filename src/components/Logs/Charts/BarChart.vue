<script>
import { Bar } from "vue-chartjs";

export default {
	name: "BarChart",

	extends: Bar,

	props: {
		datacollection: {},
		options: {},
	},

	mounted() {
		this.renderChart(this.datacollection, this.options);
	},

	watch: {
		datacollection() {
			this.renderChart(this.datacollection, this.options);
		},
	},

};
</script>
