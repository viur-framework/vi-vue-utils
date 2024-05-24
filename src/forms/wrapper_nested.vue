<template>
  <sl-alert
    v-if="!state.globalRegistration"
    open
    variant="danger"
  >
    In Order to use this Bone register the bone component globally in your main file
  </sl-alert>
  <div
    v-else
    class="form"
  >

    <template
        v-for="(group, key) in state.formGroups"
        :key="key"
      >
        <sl-details
          v-show="group['groupVisible']"
          :summary="group['name']"
          :open="group['groupOpen']"
        >
          <template
            v-for="bone in group['bones']"
            :key="bone['name']"
          >
            <bone
              :is="getBoneWidget(state.structure[bone['boneName']]['type'])"
              v-show="state.structure[bone['boneName']]['visible']"
              :name="bone['boneName']"
              :structure="state.structure"
              :skel="state.value"
              :errors="boneState.errors"
              :readonly="boneState.bonestructure['readonly'] ? true : undefined"
              @change-internal="changeEvent"
            >
            </bone>
          </template>
        </sl-details>
      </template>

    <!--
    <template v-for="(data, name) in state.structure">
      <bone
        :is="getBoneWidget(data['type'])"
        :name="name"
        :structure="state.structure"
        :skel="state.value"
        :errors="boneState.errors"
        :readonly="boneState.bonestructure['readonly'] ? true : undefined"
        @change-internal="changeEvent"
      >
      </bone>


    </template>-->
  </div>
</template>

<script>
import { reactive, defineComponent, onMounted, inject, computed, getCurrentInstance, watch } from "vue"
import { getBoneWidget } from "./index"

export default defineComponent({
  props: {
    name: String,
    value: null,
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object
  },
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      value: computed(() => props.value),
      structure: computed(() => {
        return structureToDict(boneState.bonestructure["using"])
      }),
      globalRegistration: false,
      formGroups: computed(() => {
        let groups = { default: { name: "Allgemein", bones: [], groupVisible: false, groupOpen: true } }
        for (const [boneName, bone] of Object.entries(state.structure)) {
          let category = "default"
          let boneStructure = state.structure[boneName]
          let boneValue = state.value?.[boneName]
          if (bone?.params?.category) {
            category = bone.params.category.toLowerCase()
          }

          if (Object.keys(groups).includes(category)) {
            groups[category]["bones"].push({
              boneName: boneName,
              boneStructure: boneStructure,
              boneValue: boneValue
            })
          } else {
            groups[category] = {
              name: bone.params.category,
              bones: [
                {
                  boneName: boneName,
                  boneStructure: boneStructure,
                  boneValue: boneValue
                }
              ]
            }
          }
          if (boneStructure["visible"] === true) {
            groups[category]["groupVisible"] = true
          }
        }
        let sortedGroups = {}
        Object.keys(groups)
          .sort()
          .forEach(function (key) {
            sortedGroups[key] = groups[key]
          })

        return sortedGroups
      }),
    })

    function changeEvent(val) {
      context.emit("change", val)
    }

    onMounted(() => {
      let app = getCurrentInstance().appContext
      if (app.components.Bone) {
        state.globalRegistration = true
      } else {
        state.globalRegistration = false
      }
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    function updateValue(e) {
      console.log(e)
    }

    function structureToDict(structure) {
      if (Array.isArray(structure)) {
        let struct = {}
        for (const idx in structure) {
          struct[structure[idx][0]] = structure[idx][1]
        }
        return struct
      } else {
        return structure
      }
    }

    return {
      state,
      boneState,
      getBoneWidget,
      structureToDict,
      changeEvent,
      updateValue
    }
  }
})
</script>

<style scoped>
.form {
  width: 100%;
}
</style>
