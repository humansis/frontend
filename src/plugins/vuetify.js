import App from '../App'
import 'vuetify/styles'
import { createVuetify, ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const humansisTheme = {
	dark: false,
	colors: {
		primary: '#074f60',
	},
}

const vuetify = createVuetify({
	icons: {
		defaultSet: 'mdi',
	},
	theme: {
		defaultTheme: 'humansisTheme',
		themes: {
			humansisTheme,
		},
	},
	components,
	directives,
})

export default vuetify;
