<template>
  <div
    class="actionbar"
    @dragover.prevent="state.droparea = true"
    @dragleave="state.droparea = false"
    @drop.prevent="handleDrop"
  >
    <sl-button
      v-if="boneState.multiple && !readonly"
      variant="danger"
      :title="$t('bone.del')"
      outline
      class="delete-btn"
      @click="openSelector()"
    >
      <sl-icon name="x"></sl-icon>
    </sl-button>

    <div
      v-if="state.droparea"
      class="droparea"
    >
      Dateien hier hinziehen
    </div>

    <input
      ref="uploadinput"
      hidden
      type="file"
      :multiple="boneState.multiple"
      @change="handleUpload"
    />
    <sl-button
      v-if="boneState.multiple && !readonly"
      outline
      :title="$t('bone.list')"
      class="add-btn"
      @click="addMultipleEntry(lang)"
    >
      <sl-icon name="plus"></sl-icon>
    </sl-button>

    <sl-button
      v-if="boneState.multiple && !readonly"
      variant="success"
      outline
      :title="$t('bone.upload')"
      class="upload-btn"
      @click="uploadinput.click()"
    >
      <sl-icon name="upload"></sl-icon>
      {{ $t("bone.upload") }}
      <sl-spinner
        v-if="state.loading"
        slot="suffix"
      ></sl-spinner>
    </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, ref, resolveComponent } from "vue"
import { Request } from "../../../index"

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const addMultipleEntry = inject("addMultipleEntry")
    const formatString = inject("formatString")
    const removeMultipleEntries = null
    const uploadinput = ref()
    const state = reactive({
      skels: {},
      uploadinput: null,
      loading: false,
      droparea: false
    })

    function uploadFile(file) {
      const filedata: Record<string, string> = {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size.toString()
      }
      return new Promise((resolve, reject) => {
        Request.securePost("/vi/file/getUploadURL", { dataObj: filedata })
          .then(async (resp) => {
            let uploadURLdata = await resp.json()
            console.log(uploadURLdata)
            Request.post(uploadURLdata["values"]["uploadUrl"], { dataObj: file, mode: "no-cors" })
              .then(async (uploadresp) => {
                const addData: Record<string, string> = {
                  key: uploadURLdata["values"]["uploadKey"],
                  node: undefined,
                  skelType: "leaf"
                }
                Request.securePost("/vi/file/add", { dataObj: addData })
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
        console.group(fileresult)
        addMultipleEntry(props.lang, { dest: fileresult, rel: null })
      }
      state.loading = false
    }

    async function handleDrop(event) {
      state.loading = true
      state.droparea = false
      for (let file of event.dataTransfer.files) {
        let fileresult = await uploadFile(file)
        console.group(fileresult)
        addMultipleEntry(props.lang, { dest: fileresult, rel: null })
      }
      state.loading = false
    }

    return {
      state,
      boneState,
      addMultipleEntry,
      removeMultipleEntries,
      uploadFile,
      uploadinput,
      handleUpload,
      handleDrop
    }
  }
})
</script>

<style scoped>
.actionbar {
  display: flex;
  position: relative;
  flex-wrap: nowrap;
}
sl-combobox {
  width: 100%;
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

.add-btn {
  margin-left: var(--sl-spacing-x-small);

  &::part(base) {
    aspect-ratio: 1;
  }
}

.upload-btn {
  margin-left: auto;

  & sl-icon {
    margin-right: var(--sl-spacing-x-small);
  }
}
</style>
