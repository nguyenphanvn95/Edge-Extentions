<template>
    <div class="flex flex-col h-full">
        <div class="flex-grow p-4">
            <div class="mb-8">
                <h2 class="text mb-4">{{ t("nav.format") }}</h2>
                <div class="flex flex-wrap gap-4">
                    <TooltipIcon :tooltip="image">
                        <button
                            class="p-2 hover:cursor-pointer rounded-md bg-amber-500"
                            @click="clickFormat(FormatType.image)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#fff"
                                class="bi bi-file-image w-6 h-6"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="M8.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
                                />
                                <path
                                    d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8l-2.083-2.083a.5.5 0 0 0-.76.063L8 11 5.835 9.7a.5.5 0 0 0-.611.076L3 12z"
                                />
                            </svg>
                        </button>
                    </TooltipIcon>
                    <TooltipIcon :tooltip="card">
                        <button
                            class="p-2 hover:cursor-pointer rounded-md bg-purple-500"
                            @click="clickFormat(FormatType.card)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="#fff"
                                class="bi bi-images w-6 h-6"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
                                />
                                <path
                                    d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"
                                />
                            </svg>
                        </button>
                    </TooltipIcon>

                    <TooltipIcon tooltip="PDF">
                        <button
                            class="p-2 hover:cursor-pointer rounded-md bg-red-500"
                            @click="clickFormat(FormatType.pdf)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="#fff"
                                class="bi bi-file-earmark-pdf w-6 h-6"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"
                                />
                                <path
                                    d="M4.603 14.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a11 11 0 0 0 .98 1.686 5.8 5.8 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.86.86 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.7 5.7 0 0 1-.911-.95 11.7 11.7 0 0 0-1.997.406 11.3 11.3 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.8.8 0 0 1-.58.029m1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8 8 0 0 0 .45-.606m1.64-1.33a13 13 0 0 1 1.01-.193 12 12 0 0 1-.51-.858 21 21 0 0 1-.5 1.05zm2.446.45q.226.245.435.41c.24.19.407.253.498.256a.1.1 0 0 0 .07-.015.3.3 0 0 0 .094-.125.44.44 0 0 0 .059-.2.1.1 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a4 4 0 0 0-.612-.053zM8.078 7.8a7 7 0 0 0 .2-.828q.046-.282.038-.465a.6.6 0 0 0-.032-.198.5.5 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z"
                                />
                            </svg>
                        </button>
                    </TooltipIcon>
                    <TooltipIcon :tooltip="slide">
                        <button
                            class="p-2 hover:cursor-pointer rounded-md bg-blue-500"
                            @click="clickFormat(FormatType.slide)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="#fff"
                                class="bi bi-easel w-6 h-6"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="M8 0a.5.5 0 0 1 .473.337L9.046 2H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1.85l1.323 3.837a.5.5 0 1 1-.946.326L11.092 11H8.5v3a.5.5 0 0 1-1 0v-3H4.908l-1.435 4.163a.5.5 0 1 1-.946-.326L3.85 11H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4.954L7.527.337A.5.5 0 0 1 8 0M2 3v7h12V3z"
                                />
                            </svg>
                        </button>
                    </TooltipIcon>
                    <TooltipIcon :tooltip="plainText">
                        <button
                            class="p-2 hover:cursor-pointer rounded-md bg-orange-500"
                            @click="clickFormat(FormatType.plainText)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="#fff"
                                class="bi bi-filetype-txt w-6 h-6"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M14 4.5V14a2 2 0 0 1-2 2h-2v-1h2a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.928 15.849v-3.337h1.136v-.662H0v.662h1.134v3.337zm4.689-3.999h-.894L4.9 13.289h-.035l-.832-1.439h-.932l1.228 1.983-1.24 2.016h.862l.853-1.415h.035l.85 1.415h.907l-1.253-1.992zm1.93.662v3.337h-.794v-3.337H6.619v-.662h3.064v.662H8.546Z"
                                />
                            </svg>
                        </button>
                    </TooltipIcon>
                    <TooltipIcon :tooltip="gzh" v-if="showGZH">
                        <button
                            class="hover:cursor-pointer"
                            @click="clickFormat(FormatType.gzh)"
                        >
                            <MediaLogo :media="WECHAT_GZH" />
                        </button>
                    </TooltipIcon>
                    <TooltipIcon :tooltip="comingSoon">
                        <button
                            class="p-2 hover:cursor-pointer rounded-md bg-gray-300"
                            @click="clickFormat(FormatType.markdown)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="#fff"
                                class="bi bi-markdown w-6 h-6"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
                                />
                                <path
                                    fill-rule="evenodd"
                                    d="M9.146 8.146a.5.5 0 0 1 .708 0L11.5 9.793l1.646-1.647a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 0-.708"
                                />
                                <path
                                    fill-rule="evenodd"
                                    d="M11.5 5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5"
                                />
                                <path
                                    d="M3.56 11V7.01h.056l1.428 3.239h.774l1.42-3.24h.056V11h1.073V5.001h-1.2l-1.71 3.894h-.039l-1.71-3.894H2.5V11z"
                                />
                            </svg>
                        </button>
                    </TooltipIcon>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TooltipIcon from "@/widgets/TooltipIcon.vue";
import MediaLogo from "@/widgets/MediaLogo.vue";
import { useRouter } from "vue-router";
import {
    useAuthorStore,
    useFontStore,
    useIsProStore,
    useMediaStore,
} from "./store/store";
import { MSG_UPDATE_MEDIA_INFOS } from "@/common/config/message";
import {
    useCardConfigStore,
    useImageConfigStore,
    usePDFConfigStore,
    useSlideConfigStore,
    useWechatRTFConfigStore,
    useXhsCardConfigStore,
} from "./store/config";
import { WECHAT_GZH } from "@/common/config/media";
import { FormatType } from "@/common/types";

const { t, locale } = useI18n();

const showGZH = computed(() => locale.value === "zh-hans");

const router = useRouter();

const image = computed(() => t("format.image"));
const card = computed(() => t("format.card"));
const slide = computed(() => t("format.slide"));
const plainText = computed(() => t("format.plain_text"));
const gzh = computed(() => t("format.gzh"));
const comingSoon = computed(() => t("common.coming_soon"));

const mediaStore = useMediaStore();

onMounted(() => {
    useMediaStore().init();
    useFontStore().init();
    mediaStore.init();
    useIsProStore().init();
    useAuthorStore().init();

    useWechatRTFConfigStore().init();
    useImageConfigStore().init();
    useCardConfigStore().init();
    useXhsCardConfigStore().init();
    usePDFConfigStore().init();
    useSlideConfigStore().init();

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === MSG_UPDATE_MEDIA_INFOS) {
            useMediaStore().init();
        }
    });
});

const clickFormat = (format: string) => {
    router.push(`/${format}`);
};
</script>
