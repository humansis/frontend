<script>
import { Line } from "vue-chartjs";

export default {
	name: "LineChart",

	extends: Line,

	props: {
		dataCollection: {},
		options: {},
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
