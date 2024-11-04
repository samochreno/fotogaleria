<template>
  <img ref="element" class="loading" :class="name"></img>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps(['name']);

const element = ref(null);

let interval;

onMounted(() => {
    setLoadingImage(0);
    interval = setInterval(() => { changeLoadingImage(); }, 85);
});

onUnmounted(() => {
    clearInterval(interval);
});

function changeLoadingImage() {
    setLoadingImage(parseInt(element.value.getAttribute('index')) + 1);
}

function setLoadingImage(index) {
    index = index % 12;
    element.value.setAttribute('index', index);
    element.value.src = `/images/${props.name}/${index}.png`;
}
</script>

