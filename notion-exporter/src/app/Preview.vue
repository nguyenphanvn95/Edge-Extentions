<template>
    <template v-if="format === FormatType.card">
        <CardPreview v-if="article" :article="article" />
    </template>
    <template v-else-if="format === FormatType.image">
        <ImagePreview v-if="article" :article="article" />
    </template>
    <template v-else-if="format === FormatType.pdf">
        <PDFPreview v-if="article" :article="article" />
    </template>
    <template v-else-if="format === FormatType.slide">
        <SlidePreview v-if="article" :article="article" />
    </template>
    <template v-else-if="format === FormatType.plainText">
        <PlainTextPreview v-if="article" :article="article" />
    </template>
    <template v-else-if="format === FormatType.gzh">
        <WechatPreview v-if="article" :article="article" />
    </template>
    <template v-else>
        <OtherPreview v-if="article" :article="article" />
    </template>
</template>

<script setup lang="ts">
import CardPreview from "./views/card/view.vue";
import ImagePreview from "./views/image/view.vue";
import WechatPreview from "./views/wechat/view.vue";
import OtherPreview from "./views/other/view.vue";
import { Article } from "@/common/types/block";
import PDFPreview from "./views/pdf/view.vue";
import SlidePreview from "./views/slide/view.vue";
import PlainTextPreview from "./views/plain-text/view.vue";
import { FormatType } from "@/common/types";

const article = inject<Article>("article");

const route = useRoute();

const format = computed(() => {
    const parts = route.path.split("/");
    if (parts.length < 2) {
        return null;
    }
    return parts[1];
});
</script>
