import Vue from "vue";
import VueResource from "vue-resource";
import CONST from "@/const";

Vue.use(VueResource);

Vue.http.options.root = CONST.API;
Vue.http.headers.common.Authorization = "";
