import App from "./app.vue";
import "@/common/global.css";
import { getDefaultLocale } from "@/common/utils";
import { MSG_GET_LANGUAGE } from "@/common/config/message";
import { createI18n } from "vue-i18n";

import Home from "./Home.vue";
import Preview from "./Preview.vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { createPinia } from "pinia";
import zhHans from "@/locales/zh-hans.json";

const language = await chrome.runtime.sendMessage({
    action: MSG_GET_LANGUAGE,
});

let locale = getDefaultLocale();

if (language) {
    locale = language.locale;
}

type LocaleSchema = typeof zhHans;

const i18n = createI18n<[LocaleSchema], "en" | "zh-hans" | "zh-hant" | "ja">({
    locale: locale,
    fallbackLocale: "en",
    messages: {
        en: await import("@/locales/en.json"),
        "zh-hans": await import("@/locales/zh-hans.json"),
        "zh-hant": await import("@/locales/zh-hant.json"),
        ja: await import("@/locales/ja.json"),
    },
});

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: "/", component: Home },
        { path: "/:id", component: Preview },
    ],
});

const app = createApp(App);

const pinia = createPinia();
app.use(i18n).use(router).use(pinia).mount("#app");
