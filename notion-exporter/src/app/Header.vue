<template>
    <div class="flex flex-row justify-between px-3 py-2 items-center">
        <div>
            <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item :to="{ path: '/' }">
                    {{ t("nav.homepage") }}
                </el-breadcrumb-item>
                <el-breadcrumb-item v-if="format">
                    {{ formatText }}
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="flex flex-row items-center">
            <div v-if="showGZH" class="mr-3 flex items-center">
                <button
                    class="hover:cursor-pointer w-5 h-5"
                    @click="openMedia(WECHAT_GZH)"
                >
                    <MediaShortcut :media="WECHAT_GZH" />
                </button>
            </div>

            <div v-if="showXhs" class="mr-3 flex items-center">
                <button
                    class="hover:cursor-pointer w-5 h-5"
                    @click="openMedia(XIAOHONGSHU)"
                >
                    <MediaShortcut :media="XIAOHONGSHU" />
                </button>
            </div>

            <div v-if="showPresent" class="mr-3 flex items-center">
                <ProcessIcon :func="present" size="1.1rem">
                    <TooltipIcon :tooltip="playTooltip">
                        <DataBoard class="text-blue-500" />
                    </TooltipIcon>
                </ProcessIcon>
            </div>
            <div v-if="showCopy" class="mr-3 flex items-center">
                <ProcessIcon :func="copy" size="1.1rem">
                    <TooltipIcon :tooltip="copyTooltip">
                        <CopyDocument class="text-blue-500" />
                    </TooltipIcon>
                </ProcessIcon>
            </div>
            <div v-if="showDownload" class="mr-3 flex items-center">
                <ProcessIcon :func="download" size="1.1rem">
                    <TooltipIcon :tooltip="downloadTooltip">
                        <Download class="text-blue-500" />
                    </TooltipIcon>
                </ProcessIcon>
            </div>
            <div class="mr-3 flex items-center">
                <ProcessIcon :func="refresh" size="1.1rem">
                    <TooltipIcon :tooltip="refreshTooltip">
                        <Refresh class="text-blue-500" />
                    </TooltipIcon>
                </ProcessIcon>
            </div>
            <el-icon
                v-if="isUpdate"
                class="hover:cursor-pointer mr-3"
                color="red"
                size="1.1rem"
                @click="openUpdatePage"
            >
                <InfoFilled />
            </el-icon>
            <el-icon
                class="hover:cursor-pointer"
                size="1.1rem"
                @click="openOptions"
            >
                <Setting />
            </el-icon>
            <el-icon
                v-if="showCloseIcon"
                class="hover:cursor-pointer ml-3"
                size="1.1rem"
                @click="closeSidebar"
            >
                <Close />
            </el-icon>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowRight, Refresh, CopyDocument } from "@element-plus/icons-vue";
import {
    Setting,
    InfoFilled,
    Download,
    Close,
    DataBoard,
} from "@element-plus/icons-vue";
import {
    useCopyStore,
    useDownloadStore,
    usePresentStore,
    useRerenderStore,
    useSidebarStore,
} from "./store/store";
import { getUpdateLogURL } from "@/common/utils";
import {
    MSG_CHECK_UPDATE,
    MSG_CLOSE_IFRAME,
    MSG_SEND_ACTIVITY,
    MSG_UPDATE_CHECKED,
} from "@/common/config/message";
import ProcessIcon from "@/widgets/ProcessIcon.vue";
import TooltipIcon from "@/widgets/TooltipIcon.vue";
import { FormatType } from "@/common/types";
import { WECHAT_GZH, XIAOHONGSHU } from "@/common/config/media";
import { MediaInfo } from "@/common/types/media";
import MediaShortcut from "@/widgets/MediaShortcut.vue";

const route = useRoute();
const { t, locale } = useI18n();

const sidebarStore = useSidebarStore();
const tabId = computed(() => sidebarStore.tabId);

const format = computed(() => {
    const parts = route.path.split("/");
    if (parts.length < 2) {
        return null;
    }
    return parts[1];
});

const formatText = computed(() => {
    switch (format.value) {
        case FormatType.image:
            return t("format.image");
        case FormatType.card:
            return t("format.card");
        case FormatType.gzh:
            return t("format.gzh");
        case FormatType.pdf:
            return t("format.pdf");
        case FormatType.slide:
            return t("format.slide");
        case FormatType.plainText:
            return t("format.plain_text");
        case FormatType.markdown:
            return t("format.markdown");
        default:
            return null;
    }
});

const showDownload = computed(() => {
    const formats = [
        FormatType.image,
        FormatType.card,
        FormatType.pdf,
        FormatType.slide,
        FormatType.plainText,
    ];
    return format.value && formats.includes(format.value as FormatType);
});

const showPresent = computed(() => {
    return format.value === "slide";
});

const showGZH = computed(() => {
    return locale.value === "zh-hans" && format.value === FormatType.gzh;
});

const showXhs = computed(() => {
    return locale.value === "zh-hans" && format.value === FormatType.card;
});

const showCopy = computed(() => {
    return format.value === FormatType.image;
});

const openMedia = (media: MediaInfo) => {
    chrome.tabs.create({ url: media.media.url });
    let activityType;
    if (media.media.id === "wechat-gzh") {
        activityType = "open_gzh";
    }
    if (media.media.id === "xiaohongshu") {
        activityType = "open_xhs";
    }
    if (activityType) {
        chrome.runtime.sendMessage({
            action: MSG_SEND_ACTIVITY,
            activityType,
        });
    }
};

const openOptions = () => {
    chrome.runtime.openOptionsPage();
};

const playTooltip = computed(() => {
    return t("common.play");
});

const copyTooltip = computed(() => {
    return t("common.copy");
});

const downloadTooltip = computed(() => {
    return t("common.download");
});

const download = async () => {
    const downloadStore = useDownloadStore();
    chrome.runtime.sendMessage({
        action: MSG_SEND_ACTIVITY,
        activityType: `download_${format.value}`,
    });
    await downloadStore.download();
};

const present = async () => {
    usePresentStore().present();
};

const copy = async () => {
    useCopyStore().copy();
};

const refreshTooltip = computed(() => {
    return t("common.refresh");
});

const refresh = async () => {
    const rerenderStore = useRerenderStore();
    rerenderStore.rerender(tabId.value);
};

const isUpdate = ref(false);
const showCloseIcon = computed(() => sidebarStore.isIframe);

const openUpdatePage = () => {
    chrome.tabs.create({ url: getUpdateLogURL(locale.value) });
    isUpdate.value = false;
    chrome.runtime.sendMessage({ action: MSG_UPDATE_CHECKED });
};

onMounted(() => {
    chrome.runtime.sendMessage({ action: MSG_CHECK_UPDATE }, (res) => {
        isUpdate.value = res;
    });
});

const closeSidebar = () => {
    chrome.runtime.sendMessage({ action: MSG_CLOSE_IFRAME });
};
</script>
