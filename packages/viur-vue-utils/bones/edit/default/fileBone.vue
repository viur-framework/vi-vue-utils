<template>
  <div
    class="file-wrapper"
    @dragover.prevent="state.droparea = true"
    @dragleave="state.droparea = false"
    @drop.prevent="handleDrop"
  >
    <div class="droparea" v-if="state.droparea">Dateien hier hinziehen</div>
    <sl-button
      v-if="!boneState.readonly && (!value || state.loading)"
      @click="uploadinput.click()"
      :title="$t('bone.upload')"
      outline
      class="upload-btn"
    >
      <sl-icon name="upload"></sl-icon>
      <sl-spinner slot="suffix" v-if="state.loading"></sl-spinner>
    </sl-button>
    <input
      hidden
      type="file"
      ref="uploadinput"
      :multiple="boneState.multiple"
      @change="handleUpload"
    />
    <sl-button @click="downloadFile" v-if="value">
      <sl-icon name="download" slot="prefix"></sl-icon>
    </sl-button>
    <div class="box">
      <div
        class="preview"
        v-if="value?.['dest']?.['mimetype'].includes('image')"
        :style="{backgroundImage: `url(${createBackgroundImage()})`}"
      >
      </div>
      <div class="preview" v-else>
        <sl-icon v-if="value?.['dest']?.['name']" name="file-earmark"></sl-icon>
      </div>
      <div v-if="value?.['dest']?.['name']">
        {{ decodeURIComponent(value?.["dest"]?.["name"]) }}
        <img :src="createBackgroundImage()" alt="">
      </div>
    </div>
    <sl-button
      v-if="!boneState.multiple"
      variant="danger"
      outline
      @click="$emit('change', name, '', lang, index)"
      :title="$t('bone.del')"
      class="delete-btn"
    >
      <sl-icon name="x"></sl-icon>
    </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, ref } from "vue";
import { Request } from "../../../index";

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String,
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState");
    const uploadinput = ref();
    const state = reactive({
      loading: false,
      droparea: false,
    });

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index); //init
    });

    function downloadFile() {
      console.log(Request.downloadUrlFor(props.value))
      window.open(Request.downloadUrlFor(props.value));
    }

    function createBackgroundImage(){
      return Request.downloadUrlFor(props.value, false)
    }

    function uploadFile(file) {
      const filedata: Record<string, string> = {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size.toString(),
      };
      return new Promise((resolve, reject) => {
        Request.securePost("/vi/file/getUploadURL", { dataObj: filedata })
          .then(async (resp) => {
            let uploadURLdata = await resp.json();
            Request.post(uploadURLdata["values"]["uploadUrl"], {
              dataObj: file,
              mode: "no-cors",
            })
              .then(async (uploadresp) => {
                const addData: Record<string, string> = {
                  key: uploadURLdata["values"]["uploadKey"],
                  node: undefined,
                  skelType: "leaf",
                };
                Request.securePost("/vi/file/add", { dataObj: addData })
                  .then(async (addresp) => {
                    let addData = await addresp.json();
                    if (addData["action"] === "addSuccess") {
                      resolve(addData["values"]);
                    } else {
                      reject(addData);
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      });
    }

    async function handleUpload(event) {
      state.loading = true;
      for (let file of event.target.files) {
        let fileresult = await uploadFile(file);
        context.emit(
          "change",
          props.name,
          { dest: fileresult, rel: null },
          props.lang,
          props.index
        );
      }
      state.loading = false;
    }

    async function handleDrop(event) {
      state.loading = true;
      state.droparea = false;
      for (let file of event.dataTransfer.files) {
        let fileresult = await uploadFile(file);
        context.emit(
          "change",
          props.name,
          { dest: fileresult, rel: null },
          props.lang,
          props.index
        );
        break;
      }
      state.loading = false;
    }

    return {
      state,
      boneState,
      downloadFile,
      createBackgroundImage,
      handleUpload,
      uploadinput,
      handleDrop,
    };
  },
});
</script>

<style scoped lang="less">
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
  min-height: 40px;
}

.preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  aspect-ratio: 1;
  border-right: 1px solid var(--sl-color-gray-500);
  margin-right: var(--sl-spacing-small);
  background-position: center;
  background-size: cover;

  sl-icon {
    font-size: 1.1em;
    color: var(--sl-color-gray-400);
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

.upload-btn {
  &::part(base) {
    aspect-ratio: 1;
  }
}
</style>