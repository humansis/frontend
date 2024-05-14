<template>
	<v-container fluid>
		<v-card class="mx-auto mt-16" max-width="800">
			<v-card-text>
				<div>
					<p class="text-h6">{{ $t('User Information') }}</p>

					<DataInput
						v-model="userForm.email"
						label="Email"
						name="email"
						class="mt-4 mb-4"
						disabled
					/>
				</div>

				<form @submit.prevent="submitTelephoneForm">
					<p class="text-h6"> {{ $t('Change Phone Number') }}</p>

					<v-row class="mt-2 mb-2" :class="{ 'flex-column': isMobile }">
						<v-col>
							<DataSelect
								v-model="phone.prefix"
								:items="options.phonePrefixes"
								:error-messages="validationMsg('prefix', 'phone')"
								label="Phone Ext"
								name="phone-ext"
								is-search-enabled
								clearable
								@blur="onValidate('prefix', 'phone')"
							/>
						</v-col>

						<v-col>
							<DataInput
								v-model="phone.number"
								:error-messages="validationMsg('number', 'phone')"
								label="Phone Number"
								name="phone-number"
								@blur="onValidate('number', 'phone')"
							/>
						</v-col>
					</v-row>

					<div class="text-end">
						<v-btn
							class="text-none ml-0"
							color="primary"
							type="submit"
						>
							{{ $t('Save') }}
						</v-btn>
					</div>
				</form>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import { requiredIf } from "@vuelidate/validators";
import UsersService from "@/services/UsersService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import usersHelper from "@/mixins/usersHelper";
import validation from "@/mixins/validation";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { PHONE } from "@/consts";

export default {
	name: "Profile",

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [vuetifyHelper, validation, usersHelper],

	validations() {
		return {
			phone: {
				prefix: { required: requiredIf(this.phone.number) },
				number: { required: requiredIf(this.phone.prefix?.value || this.phone.prefix?.length) },
			},
		};
	},

	data() {
		return {
			userProfile: null,
			phone: {
				prefix: null,
				number: "",
			},
			userForm: {
				email: "",
			},
			twoFactorEnabled: false,
			options: {
				phonePrefixes: PHONE.CODES,
			},
			changePhoneLoading: false,
			twoFactorLoading: false,
		};
	},

	computed: {
		...mapState(["user"]),
	},

	created() {
		this.getUserData();
	},

	methods: {
		async submitTelephoneForm() {
			this.v$.phone.$touch();

			if (this.v$.phone.$invalid) return;
			this.changePhoneLoading = true;
			this.phone.number = this.phone.number?.replace(/\s+/g, "");

			const { id } = this.userProfile;

			try {
				const {
					data,
					status,
					message,
				} = await UsersService.patchUser({
					body: {
						phoneNumber: this.phone.number || null,
						phonePrefix: this.phone.prefix?.code || null,
					},
					id,
				});

				checkResponseStatus(status, message);

				this.mapUser(data);
				Notification(`${this.$t("Phone Updated")}`, "success");
				await this.getUserData();
			} catch (e) {
				Notification(`${this.$t("Phone Update")}: ${e.message || e}`, "error");
			} finally {
				this.v$.phone.$reset();
				this.changePhoneLoading = false;
			}
		},

		async getUserData() {
			const { userId } = this.user;
			const user = this.getDetailOfUser(userId);

			this.mapUser(user);
		},

		mapUser(data) {
			this.userProfile = data;
			this.userForm.email = data.email;
			this.phone.prefix = getArrayOfCodeListByKey([data.phonePrefix], PHONE.CODES, "code");
			this.phone.number = data.phoneNumber;
			this.twoFactorEnabled = data["2fa"];
		},
	},
};
</script>
