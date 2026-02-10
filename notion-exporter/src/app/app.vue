<template>
    <div class="flex flex-col h-screen text-gray-800 bg-[#fefefe]">
        <div class="border-b-[1px] sticky top-0 z-50 bg-stone-100">
            <Header />
        </div>
        <div class="hide-scrollbar flex-1 overflow-auto">
            <router-view />
        </div>
    </div>
</template>

<script setup lang="ts">
import Header from "./Header.vue";
import { Article } from "@/common/types/block";
import {
    MSG_SIDEBAR_MOUNTED,
    MSG_UPDATE_SIDEBAR,
} from "@/common/config/message";
import { parseContent } from "@/app/parser/parse";
import { useSidebarStore } from "./store/store";

const article = ref<Article>();

const sidebarStore = useSidebarStore();

provide("article", article);

const { t } = useI18n();

const tagPropertyName = computed(() => {
    return t("setting.template.tag.label");
});

onMounted(() => {
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === MSG_UPDATE_SIDEBAR) {
            parseContent(message.html, tagPropertyName.value).then((data) => {
                article.value = data;
            });
            sidebarStore.setTabId(message.tabId);
            sidebarStore.setIsIframe(message.isIframe);
        }
    });
    chrome.runtime.sendMessage({
        action: MSG_SIDEBAR_MOUNTED,
    });
});
</script>

<style>
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow-y: auto;
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
</style>
