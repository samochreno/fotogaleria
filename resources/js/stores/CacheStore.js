import { defineStore } from "pinia";

export const useCacheStore = defineStore('cacheStore', {
    state: () => ({
        hash: Math.random().toString(),
    }),
    getters: {
    },
    actions: {
        markDirty() {
            this.hash = Math.random().toString();
        },
    },
});
