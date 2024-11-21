<template>
  <div class="tce-accordion d-flex flex-column align-center text-center">
    <VExpansionPanels
      ref="panels"
      v-model="expanded"
      elevation="0"
      rounded="lg"
      multiple
    >
      <VExpandTransition v-if="elementData.items.length > 0" group>
        <AccordionItem
          v-for="(it, index) in elementData.items"
          :key="it.id"
          :embed-types="embedTypes"
          :embeds="embedsByItem[it.id]"
          :is-disabled="isDisabled"
          :is-expanded="expanded.includes(it.id)"
          :is-focused="isFocused"
          :item="element"
          @delete="deleteItem(it.id, index)"
          @save="saveItem($event, index)"
        />
      </VExpandTransition>
    </VExpansionPanels>
    <VAlert
      v-if="elementData.items.length === 0"
      class="w-100"
      color="primary-darken-2"
      icon="mdi-information-variant"
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { Element, ElementData } from '@tailor-cms/ce-accordion-manifest';
import cloneDeep from 'lodash/cloneDeep';
import isNumber from 'lodash/isNumber';
import pick from 'lodash/pick';
import pull from 'lodash/pull';
import reduce from 'lodash/reduce';
import Sortable from 'sortablejs';
import uniqueId from 'lodash/uniqueId';
import { v4 as uuid } from 'uuid';

import AccordionItem from './AccordionItem.vue';

const props = defineProps<{
  element: Element;
  embedTypes: string[];
  isFocused: boolean;
  isDisabled: boolean;
}>();
const emit = defineEmits(['save', 'link']);

const expanded = ref<string[]>([]);
const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const panels = ref();
const sortable = ref();

const embedsByItem = computed(() => {
  return reduce(
    elementData.items,
    (acc, item) => {
      acc[item.id] = pick(elementData.embeds, item.elementIds);
      return acc;
    },
    {} as any,
  );
});

const add = () => {
  const id = uuid();
  elementData.items.push({ id, elementIds: [] });
  expanded.value.push(id);
  emit('save', elementData);
};

const saveItem = ({ item, embeds = {} }: any, index: number) => {
  elementData.items[index] = item;
  Object.assign(elementData.embeds, embeds);
  emit('save', elementData);
};

const deleteItem = (id: string, index: number) => {
  const { elementIds } = elementData.items[index];
  elementIds.forEach((id) => delete elementData.embeds[id]);
  elementData.items.splice(index, 1);
  if (expanded.value.includes(id)) pull(expanded.value, id);
  emit('save', elementData);
};

onMounted(() => {
  sortable.value = Sortable.create(panels.value.$el, {
    animation: 150,
    group: `dragDrop-${uniqueId()}`,
    handle: '.accordion-drag-handle',
    onEnd: ({ oldIndex, newIndex }) => {
      if (!isNumber(newIndex) || !isNumber(oldIndex)) return;
      const [item] = elementData.items.splice(oldIndex, 1);
      elementData.items.splice(newIndex, 0, item);
      emit('save', elementData);
    },
  });
});

onBeforeUnmount(() => {
  sortable.value.destroy();
});
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
