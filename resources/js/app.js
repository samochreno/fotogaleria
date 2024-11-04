import "./bootstrap";

window.sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
}

import { createApp } from "vue";
import { createPinia } from "pinia";

const pinia = createPinia();

const app = createApp({});

app.use(pinia);

window.props = {};

window.props.cacheHash = Math.random().toString();
app.config.globalProperties.window = { props: window.props };

import heic2any from "heic2any";
window.heic2any = heic2any;

app.config.globalProperties.csrf = () => {
    return document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");
};

window.compressImage = async (imageData, max) => {
    const image = new Image();
    image.src = imageData;
    await image.decode();

    if (image.width <= max && image.height <= max) {
        return imageData;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const factor =
        image.width > image.height ? image.width / max : image.height / max;

    canvas.width = image.width / factor;
    canvas.height = image.height / factor;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.9);
};

window.dataUrlToFile = (dataURL, fileName) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
};

async function validateFile(file) {
    const name = file.name;
    const extension = name
        .substr(name.lastIndexOf(".") + 1, name.length)
        .toLowerCase();

    if (extension == "jpg" || extension == "jpeg" || extension == "png") {
        return file;
    }

    if (extension == "heic") {
        const resultBlob = await heic2any({
            blob: file,
            toType: "image/jpg",
            quality: 100,
        });

        return new File([resultBlob], "heic" + ".jpg", {
            type: "image/jpeg",
            lastModified: new Date().getTime(),
        });
    }

    alert("Sú povolené iba .jpg, .jpeg, .png a .heic");
    return null;
}

window.sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
}

window.validateFileType = async (input) => {
    const validFile = await validateFile(input.files[0]);

    let container = new DataTransfer();
    container.items.add(validFile);
    input.files = container.files;

    return !!validFile;
};

window.validateFileTypes = async (input) => {
    if (!input.files.length) {
        alert("Vyber aspoň 1 fotku");
        input.value = null;
        return false;
    }

    let container = new DataTransfer();

    for (const file of [...input.files]) {
        const validFile = await validateFile(file);
        if (!validFile) {
            input.value = null;
            return false;
        }

        container.items.add(validFile);
    }

    input.files = container.files;
    return true;
};

Object.entries(import.meta.glob("./**/*.vue", { eager: true })).forEach(
    ([path, definition]) => {
        app.component(
            path
                .split("/")
                .pop()
                .replace(/\.\w+$/, ""),
            definition.default
        );
    }
);

app.mount("#app");

function getParentClass(node, cls) {
    while (node) {
        if (node.classList && node.classList.contains(cls)) {
            return node;
        }

        node = node.parentElement;
    }

    return null;
}

const disableOptions = { once: true };

let hoveredElement = null;
let disableCurrentHover = null;

document.addEventListener("mouseover", function (e) {
    const element = getParentClass(e.target, "pressable");
    if (!element) {
        hoveredElement = null;

        if (disableCurrentHover) {
            disableCurrentHover();
        }

        return;
    }

    if (element == hoveredElement) {
        return;
    }

    if (disableCurrentHover) {
        disableCurrentHover();
    }

    hoveredElement = element;
    const overlay = enableHover(element);
    disableCurrentHover = () => {
        disableHover(element, overlay);
    };
});

document.addEventListener("mousedown", function (e) {
    const element = getParentClass(e.target, "pressable");
    if (element) {
        const overlay = enablePress(element);

        element.addEventListener(
            "mouseup",
            () => {
                disablePress(element, overlay);
            },
            disableOptions
        );

        element.addEventListener(
            "mouseleave",
            () => {
                disablePress(element, overlay);
            },
            disableOptions
        );
    }
});

document.addEventListener("touchstart", function (e) {
    const element = getParentClass(e.target, "pressable");
    if (element) {
        const overlay = enablePress(element);

        element.addEventListener(
            "touchend",
            () => {
                disablePress(element, overlay);
            },
            disableOptions
        );

        element.addEventListener(
            "touchcancel",
            () => {
                disablePress(element, overlay);
            },
            disableOptions
        );
    }
});

function enableOverlay(element) {
    const overlay = document.createElement("div");
    element.appendChild(overlay);

    const computedStyle = window.getComputedStyle(element);

    overlay.style.zIndex = computedStyle.zIndex;
    overlay.style.borderRadius = computedStyle.borderRadius;

    element.style.scale = "1";

    return overlay;
}

function disableOverlay(element, overlay) {
    if (!overlay.parentNode) {
        return;
    }

    element.removeChild(overlay);
}

function enableHover(element) {
    const overlay = enableOverlay(element);

    overlay.classList.add("overlay-hover");

    return overlay;
}

function disableHover(element, overlay) {
    disableOverlay(element, overlay);
}

function enablePress(element) {
    //const overlay = enableOverlay(element);

    //overlay.classList.add("overlay-press");
    element.style.scale = calculateTouchScale(element);

    //return overlay;
    return null;
}

function disablePress(element, overlay) {
    //disableOverlay(element, overlay);

    element.style.scale = "1";
}

function calculateTouchScale(element) {
    const scalePx = 4;

    const elementRect = element.getBoundingClientRect();

    const scaleX = (elementRect.width - scalePx) / elementRect.width;
    const scaleY = (elementRect.height - scalePx) / elementRect.height;
    const scale = scaleX + " " + scaleY;

    return scale;
}

document.addEventListener("mousedown", (e) => {
    const element = getParentClass(e.target, "input");
    if (element) {
        enableInputHighlight(element);
    }
});

document.addEventListener("mouseup", (e) => {
    const element = getParentClass(e.target, "input");
    if (element) {
        disableInputHighlight(element);
    }
});

document.addEventListener("mouseleave", (e) => {
    const element = getParentClass(e.target, "input");
    if (element) {
        disableInputHighlight(element);
    }
});

document.addEventListener("touchstart", (e) => {
    const element = getParentClass(e.target, "input");
    if (element) {
        enableInputHighlight(element);
    }
});

document.addEventListener("touchend", (e) => {
    const element = getParentClass(e.target, "input");
    if (element) {
        disableInputHighlight(element);
    }
});

document.addEventListener("touchcancel", (e) => {
    const element = getParentClass(e.target, "input");
    if (element) {
        disableInputHighlight(element);
    }
});

function enableInputHighlight(input) {
    input.classList.add("bg-zinc-100");
}

function disableInputHighlight(input) {
    input.classList.remove("bg-zinc-100");
}
