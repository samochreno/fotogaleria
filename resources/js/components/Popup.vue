<template>
    <TransitionRoot as="template" :show="open">
        <Dialog
            :style="{ 'z-index': zIndex ?? 100 }"
            class="absolute"
            @close="onClose"
        >
            <TransitionChild
                as="template"
                enter="ease-out duration-[200ms]"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-[100ms]"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 w-screen transform">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-[200ms]"
                    enter-from="opacity-0 scale-90"
                    enter-to="opacity-100 scale-100"
                    leave="ease-in duration-[100ms]"
                    leave-from="opacity-100 scale-100"
                    leave-to="opacity-0 scale-75"
                >
                    <DialogPanel
                        class="popup-panel w-full h-full pointer-events-none pb-[env(safe-area-inset-bottom)]"
                    >
                        <slot></slot>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { watch } from "vue";
import {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
} from "@headlessui/vue";

const props = defineProps(["open", "zIndex"]);
const emit = defineEmits(["opened", "close", "closed"]);

watch(
    () => props.open,
    () => {
        if (props.open) {
            onOpened();
        }
    }
);

function onOpened() {
    emit("opened");
}

async function onClose() {
    emit("close");

    await sleep(100);
    onClosed();
}

function onClosed() {
    emit("closed");
}
</script>
