<template>
  <div class="tce-accordion d-flex flex-column align-center text-center">
    <VExpansionPanels
      v-model="expanded"
      v-if="!isEmpty(elementData.items)"
      multiple
      elevation="0"
      rounded="lg"
    >
      <VExpandTransition group>
        <AccordionItem
          v-for="(it, id, index) in elementData.items"
          :key="id"
          :item="it"
          :embeds="embedsByItem[id]"
          :is-disabled="isDisabled"
          :is-focused="isFocused"
          :embed-types="embedTypes"
          @save="saveItem"
          @delete="deleteItem(id, index)"
        />
      </VExpandTransition>
    </VExpansionPanels>
    <VAlert
      v-else
      icon="mdi-information-variant"
      class="w-100"
      color="primary-darken-2"
      variant="tonal"
      prominent
    >
      <template v-if="isDisabled">No items added.</template>
      <template v-else>
        Click on the button below in order to create your first item.
      </template>
    </VAlert>
    <VBtn
      v-if="!isDisabled"
      class="mt-6"
      color="primary-darken-4"
      prepend-icon="mdi-plus"
      variant="text"
      @click="add"
    >
      Accordion item
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { Element, ElementData } from '@tailor-cms/ce-accordion-manifest';
import AccordionItem from './AccordionItem.vue';
import pick from 'lodash/pick';
import reduce from 'lodash/reduce';
import isEmpty from 'lodash/isEmpty';
import pull from 'lodash/pull';
import { v4 as uuid } from 'uuid';

const props = defineProps<{
  element: Element;
  embedTypes?: string[] | undefined;
  isFocused: boolean;
  isDisabled: boolean;
}>();
const emit = defineEmits(['save', 'link']);

const expanded = ref<number[]>([]);
const elementData = reactive<ElementData>(cloneDeep(props.element.data));

const embedsByItem = computed(() => {
  return reduce(elementData.items, (acc, item) => {
    acc[item.id] = pick(elementData.embeds, item.elementIds);
    return acc;
  }, {} as any);
});

const add = () => {
  const id = uuid();
  elementData.items[id] = { id, title: 'Title', elementIds: [] };
  emit('save', elementData);
};

const saveItem = ({ item, embeds = {} }: any) => {
  Object.assign(elementData.items, { [item.id]: item });
  Object.assign(elementData.embeds, embeds);
  emit('save', elementData);
};

const deleteItem = (id: string, index: number) => {
  elementData.items[id].elementIds.forEach((embedId) => {
    delete elementData.embeds[embedId];
  });
  delete elementData.items[id];
  if (expanded.value.includes(index)) pull(expanded.value, index);
  emit('save', elementData);
};
</script>

<style lang="scss" scoped>
.tce-accordion {
  text-align: left;
  margin: 1rem 0;

  :deep(.v-expansion-panel-text) {
    border-bottom-right-radius: inherit;
    border-bottom-left-radius: inherit;
    border: 2px solid rgb(var(--v-theme-primary-lighten-5));
    border-top: none !important;
  }
}
</style>
