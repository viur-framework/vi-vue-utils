<template>
  <div
    class="file-wrapper"
    @dragover.prevent="state.droparea = true"
    @dragleave="state.droparea = false"
    @drop.prevent="handleDrop"
  >
    <div
      v-if="state.loading"
      class="loader"
    >
      <sl-spinner slot="suffix"></sl-spinner>
    </div>

    <div
      v-if="state.droparea"
      class="droparea"
    >
      Dateien hier hinziehen
    </div>
    <sl-button
      v-if="!boneState.readonly && (!value || state.loading)"
      :title="$t('bone.upload')"
      outline
      class="upload-btn"
      @click="uploadinput.click()"
    >
      <sl-icon name="upload"></sl-icon>
    </sl-button>
    <input
      ref="uploadinput"
      hidden
      type="file"
      :multiple="boneState.multiple"
      @change="handleUpload"
    />
    <sl-button
      v-if="value"
      :title="$t('bone.download')"
      @click="downloadFile"
    >
      <sl-icon
        slot="prefix"
        name="download"
      ></sl-icon>
    </sl-button>
    <div class="box">
      <div
        v-if="value?.['dest']?.['mimetype'].includes('image')"
        class="preview has-preview"
        @click="state.previewopen = !state.previewopen"
      >
        <img
          class="preview-img"
          :src="createBackgroundImage()"
          alt=""
        />
        <sl-dialog
          :label="decodeURIComponent(value?.['dest']?.['name'])"
          class="preview-overlay"
          :open="state.previewopen"
        >
          <img
            :src="createBackgroundImage()"
            alt=""
          />
        </sl-dialog>
      </div>
      <div
        v-else
        class="preview"
      >
        <sl-icon
          v-if="value?.['dest']?.['name']"
          name="file-earmark"
        ></sl-icon>
      </div>
      <div v-if="value?.['dest']?.['name']">
        {{ decodeURIComponent(value?.["dest"]?.["name"]) }}
      </div>
    </div>
    <sl-button
      v-if="!boneState.multiple"
      variant="danger"
      outline
      :title="$t('bone.del')"
      class="delete-btn"
      @click="$emit('change', name, '', lang, index)"
    >
      <sl-icon name="x"></sl-icon>
    </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, ref } from "vue"
import { Request } from "../../../index"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const uploadinput = ref()
    const state = reactive({
      loading: false,
      droparea: false,
      previewopen: false
    })

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    function downloadFile() {
      console.log(Request.downloadUrlFor(props.value))
      window.open(Request.downloadUrlFor(props.value))
    }

    function createBackgroundImage() {
      return Request.downloadUrlFor(props.value, false)
    }

    function uploadFile(file) {
      const filedata: Record<string, string> = {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size.toString()
      }
      return new Promise((resolve, reject) => {
        Request.securePost(`/${import.meta.env.VITE_DEFAULT_RENDERER || "vi"}/file/getUploadURL`, { dataObj: filedata })
          .then(async (resp) => {
            let uploadURLdata = await resp.json()
            fetch(uploadURLdata["values"]["uploadUrl"], {
              body: file,
              method: "POST",
              mode: "no-cors"
            })
              .then(async (uploadresp) => {
                const addData: Record<string, string> = {
                  key: uploadURLdata["values"]["uploadKey"],
                  node: undefined,
                  skelType: "leaf"
                }
                Request.securePost(`/${import.meta.env.VITE_DEFAULT_RENDERER || "vi"}/file/add`, { dataObj: addData })
                  .then(async (addresp) => {
                    let addData = await addresp.json()
                    if (addData["action"] === "addSuccess") {
                      resolve(addData["values"])
                    } else {
                      reject(addData)
                    }
                  })
                  .catch((error) => {
                    reject(error)
                  })
              })
              .catch((error) => {
                reject(error)
              })
          })
          .catch((error) => {
            reject(error)
          })
      })
    }

    async function handleUpload(event) {
      state.loading = true
      for (let file of event.target.files) {
        let fileresult = await uploadFile(file)
        context.emit("change", props.name, { dest: fileresult, rel: null }, props.lang, props.index)
      }
      state.loading = false
    }

    async function handleDrop(event) {
      state.loading = true
      state.droparea = false
      for (let file of event.dataTransfer.files) {
        let fileresult = await uploadFile(file)
        context.emit("change", props.name, { dest: fileresult, rel: null }, props.lang, props.index)
        break
      }
      state.loading = false
    }

    return {
      state,
      boneState,
      downloadFile,
      createBackgroundImage,
      handleUpload,
      uploadinput,
      handleDrop
    }
  }
})
</script>

<style scoped>
.box {
  display: flex;
  align-items: center;
  padding: 0 var(--sl-spacing-small) 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  border: 1px solid var(--sl-color-gray-500);
  border-radius: 5px;
  height: var(--sl-input-height-medium);
  background-color: transparent;
}

.preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--sl-input-height-medium);
  width: var(--sl-input-height-medium);
  aspect-ratio: 1;
  border-right: 1px solid var(--sl-color-gray-500);
  margin-right: var(--sl-spacing-small);
  background-image: /* tint image */
    linear-gradient(to right, rgba(255, 255, 255, 0.87), rgba(255, 255, 255, 0.87)),
    /* checkered effect */ linear-gradient(to right, black 50%, white 50%),
    linear-gradient(to bottom, black 50%, white 50%);
  background-blend-mode: normal, difference, normal;
  background-size: 0.65em 0.65em;

  &.has-preview {
    cursor: pointer;
  }

  & sl-icon {
    font-size: 1.1em;
    color: var(--sl-color-gray-400);
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.file-wrapper {
  width: 100%;
  display: flex;
  gap: 10px;
  position: relative;
}

.droparea {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 10;
  pointer-events: none;
  opacity: 0.9;
  border: 1px solid var(--sl-color-info-500);
  background-color: var(--sl-color-info-300);
  color: var(--sl-color-info-900);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  &::part(base) {
    aspect-ratio: 1;
  }
}

.delete-btn {
  &::part(base) {
    aspect-ratio: 1;
  }
}

.upload-btn {
  &::part(base) {
    aspect-ratio: 1;
  }
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.7);
}

.preview-overlay {
  &::part(panel) {
    width: auto;
    max-width: 1200px;
  }

  &::part(body) {
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: /* tint image */
      linear-gradient(to right, rgba(255, 255, 255, 0.87), rgba(255, 255, 255, 0.87)),
      /* checkered effect */ linear-gradient(to right, black 50%, white 50%),
      linear-gradient(to bottom, black 50%, white 50%);
    background-blend-mode: normal, difference, normal;
    background-size: 1.2em 1.2em;
    padding: 0;
  }

  & img {
    width: auto;
    height: auto;
  }
}
</style>
