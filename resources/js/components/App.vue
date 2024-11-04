<template>
    <TransitionRoot
        :show="isLoading"
        as="template"
        enter="ease-out duration-[200ms]"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-[100ms]"
        leave-from="opacity-100"
        leave-to="opacity-0"
    >
        <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity flex-center z-[500] bottom-0"
        >
            <loading-white> </loading-white>
        </div>
    </TransitionRoot>

    <div
        v-if="props.isAdmin"
        class="relative h-fit p-4"
    >
        <h1 class="mb-3 font-bold">
            Nahrajte jednu alebo viac fotiek
        </h1>

        <input
            multiple
            ref="uploadInput"
            type="file"
            @click="beginUpload"
            @change="upload"
        />
    </div>

    <div class="my-0">
        <div
            v-if="postStore.isFetching && postStore.page == 1"
            ref="placeholdersGrid"
            class="w-[100vw] p-[--spacing-post]"
        >
            <div
                v-for="placeholder in placeholders"
                class="post p-[--spacing-post]"
                :style="{
                    'aspect-ratio': placeholder,
                }"
            >
                <div class="placeholder w-full h-full"></div>
            </div>
        </div>

        <div
            :style="{
                display:
                    postStore.isFetching && postStore.page == 1
                        ? 'none'
                        : 'block',
            }"
            ref="grid"
            class="w-[100vw] p-[--spacing-post]"
        >
            <div
                v-for="item in postStore.posts"
                :key="item.id"
                class="post p-[--spacing-post]"
                :style="{
                    'aspect-ratio': item.width / item.height,
                }"
            >
                <div
                    class="pressable relative drop-shadow-[0_3px_3px_rgba(0,0,0,20%)] w-full h-full"
                    @click="postStore.id = item.id"
                >
                    <div>
                        <div
                            class="absolute inset-0 w-full h-full"
                            :style="{
                                'background-color': item['average_color'],
                            }"
                        />
                        <img
                            class="absolute inset-0 w-full h-full"
                            :src="item['mini_thumbnail']"
                        />
                        <img
                            class="absolute inset-0 w-full h-full"
                            :src="item.attachment_thumbnail_url"
                            decoding="async"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div :style="{ height: postStore.isFetching ? '3rem' : '0' }">
        <div v-if="postStore.isFetching" class="h-12 flex-center">
            <loading-black> </loading-black>
        </div>
    </div>

    <Popup :open="!!postStore.post">
        <img
            v-if="!!postStore.post"
            class="w-full h-full object-contain p-16"
            :src="postStore.post?.attachment_thumbnail_url"
        />

        <div
            class="absolute w-16 top-0 bottom-0 left-0 flex justify-center items-center"
        >
            <div
                @click="previous()"
                class="w-full h-32 opacity-80 hover:opacity-100 cursor-pointer"
                style="
                    background-image: url('/images/arrow-left.png');
                    background-size: 40px;
                    background-repeat: no-repeat;
                    background-position: 50% 50%;
                "
            ></div>
        </div>
        <div
            class="absolute w-16 top-0 bottom-0 right-0 flex justify-center items-center"
        >
            <div
                @click="next()"
                class="w-full h-32 opacity-80 hover:opacity-100 cursor-pointer"
                style="
                    background-image: url('/images/arrow-right.png');
                    background-size: 40px;
                    background-repeat: no-repeat;
                    background-position: 50% 50%;
                "
            ></div>
        </div>

        <div
            class="pointer-events-auto absolute mr-4 h-16 top-0 left-0 right-0 flex justify-end items-center"
        >
            <button
                v-if="props.isAdmin"
                @click="delete_"
                class="opacity-80 hover:opacity-100 rounded-full w-12 h-16 flex justify-center items-center"
            >
                <span
                    class="material-symbols-rounded text-white"
                    style="font-size: 35px; font-weight: 600"
                >delete</span>
            </button>

            <a
                download
                :href="postStore.post?.attachment_url"
                class="opacity-80 hover:opacity-100 rounded-full w-12 h-16 flex justify-center items-center"
            >
                <span
                    class="material-symbols-rounded text-white"
                    style="font-size: 35px; font-weight: 600"
                    >download</span
                >
            </a>

            <button
                @click="postStore.id = null"
                class="opacity-80 hover:opacity-100 rounded-full w-12 h-16 flex justify-center items-center"
            >
                <span
                    class="material-symbols-rounded text-white"
                    style="font-size: 35px; font-weight: 600"
                    >close</span
                >
            </button>
        </div>
    </Popup>
</template>

<script setup>
import { TransitionRoot } from "@headlessui/vue";
import { onMounted, ref, reactive, watch, nextTick, onUnmounted } from "vue";
import Masonry from "masonry-layout";
import { usePostStore } from "../stores/PostStore";
import { useCacheStore } from "../stores/CacheStore";

const props = defineProps(['isAdmin']);

const cacheStore = useCacheStore();
const postStore = usePostStore();

const isLoading = ref(false);

const placeholders = ref(createPlaceholders([16 / 9, 4 / 3, 9 / 16, 3 / 4]));

const grid = ref(null);
const placeholdersGrid = ref(null);

var masonry = null;

onMounted(() => {
    refetch();
});

function refetch() {
    cacheStore.markDirty();
    const postStore = usePostStore();
    postStore.refetch();
}

onMounted(() => {
    onIsFetchingChanged();

    window.addEventListener("scroll", onScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
});

watch(
    () => postStore.posts,
    () => {
        if (!masonry) {
            return;
        }

        nextTick(() => {
            nextTick(() => {
                masonry.reloadItems();
                masonry.layout();
            });
        });
    },
    { deep: true }
);

function onIsFetchingChanged() {
    if (postStore.isFetching) {
        onStartedFetching();
    } else {
        onEndedFetching();
    }
}

function onStartedFetching() {
    if (postStore.page != 1) {
        return;
    }

    nextTick(() => {
        const placeholders = new Masonry(placeholdersGrid.value, {
            itemSelector: ".post",
        });
        placeholders.options.transitionDuration = "0s";
        placeholders.reloadItems();
        placeholders.layout();
        placeholders.options.transitionDuration = "0.4s";
    });
}

function onEndedFetching() {
    masonry = new Masonry(grid.value, {
        itemSelector: ".post",
    });
    nextTick(() => {
        masonry.options.transitionDuration = "0s";
        masonry.reloadItems();
        masonry.layout();
        masonry.options.transitionDuration = "0.4s";
    });
}

watch(
    () => postStore.isFetching,
    () => {
        onIsFetchingChanged();
    }
);

function onScroll() {
    const bodyScrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

    const bodyScrollBottom = bodyScrollTop + window.innerHeight;

    const fetchBottomMargin = window.innerHeight * 3;
    if (bodyScrollBottom > document.body.scrollHeight - fetchBottomMargin) {
        postStore.fetch();
    }
}

function createPlaceholders(aspectRatios) {
    let value = [];
    for (let i = 0; i < 200; i++) {
        const placeholder =
            aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
        value.push(placeholder);
    }
    return value;
}

function previous() {
    const index = postStore.posts.findIndex((p) => p.id == postStore.id) - 1;
    if (index <= 0) {
        return;
    }

    postStore.id = postStore.posts[index].id;
}

function next() {
    const maxIndex = postStore.posts.length - 1;
    const index = postStore.posts.findIndex((p) => p.id == postStore.id) + 1;
    if (index == maxIndex + 1) {
        return;
    }

    if (index >= maxIndex - 3) {
        postStore.fetch();
    }

    postStore.id = postStore.posts[index].id;
}

async function upload(e) {
    isLoading.value = true;

    if (!(await validateFileTypes(e.target))) {
        e.target.value = null;
        return;
    }

    let didAnyFail = false;
    for (const file of [...e.target.files]) {
        const post = await uploadPost(file);
        if (!post) {
            didAnyFail = true;
        }

        let newPosts = [reactive(post)];
        postStore.posts.forEach((p) => newPosts.push(p));
        postStore.posts = newPosts;
        postStore.unvisitedCount++;
    }

    e.target.value = null;

    if (didAnyFail) {
        alert("Nepodarilo sa nahrať niektoré fotky.");
    } else {
        alert("Fotky boli úspešne nahrané.");
    }

    isLoading.value = false;
}

async function uploadPost(file) {
    const data = await blobToData(file);
    const imageData = await compressImage(data, 1920);

    const image = new Image();
    image.src = imageData;
    await image.decode();

    const formData = new FormData();

    formData.append("attachment", dataUrlToFile(imageData, "post.jpg"));
    formData.append("width", image.width);
    formData.append("height", image.height);

    let value = null;
    await fetch("/posts/upload", {
        method: "POST",
        body: formData,
        headers: csrfHeaders,
    }).then(async (res) => {
        if (res.ok) {
            value = await res.json();
        }
    });

    return value;
}

function blobToData(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function delete_() {
    if (!confirm('Naozaj odstrániť?')) {
        return;
    }

    fetch(`/posts/${postStore.id}/delete`, {
        method: "POST",
        headers: csrfHeaders,
    });

    const id = postStore.id;
    postStore.id = null;
    postStore.posts = postStore.posts.filter((p) => p.id != id);
}
</script>