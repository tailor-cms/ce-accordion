<template>
  <div class="tce-accordion text-center">
    <VExpansionPanels
      ref="panels"
      v-model="expanded"
      rounded="lg"
      flat
      multiple
    >
      <VExpandTransition v-if="!!accordionItemCount" group>
        <AccordionItem
          v-for="item in accordionItems"
          :key="item.id"
          :allow-deletion="accordionItemCount > 1"
          :embed-element-config="embedElementConfig"
          :embeds="embedsByItem[item.id]"
          :is-expanded="expanded.includes(item.id)"
          :is-focused="isFocused"
          :is-readonly="isReadonly"
          :item="item"
          class="text-left"
          @delete="deleteItem(item.id)"
          @save="saveItem($event)"
          @toggle="toggleItem(item.id)"
        />
      </VExpandTransition>
    </VExpansionPanels>
    <VBtn
      v-if="!isReadonly"
      class="mt-4"
      prepend-icon="mdi-plus"
      variant="text"
      @click="addAccordionItem"
    >
      Add Accordion Item
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import {
  cloneDeep,
  isEqual,
  isNumber,
  pick,
  pull,
  reduce,
  sortBy,
} from 'lodash-es';
import { computed, reactive, ref, watch } from 'vue';
import { Element, ElementData } from '@tailor-cms/ce-accordion-manifest';
import { useDraggable } from 'vue-draggable-plus';
import { v4 as uuid } from 'uuid';

import AccordionItem from './AccordionItem.vue';

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();
const emit = defineEmits<{
  save: [data: ElementData];
}>();

const expanded = ref<string[]>([]);
const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const panels = ref();

const accordionItems = computed(() => sortBy(elementData.items, 'position'));
const accordionItemCount = computed(() => accordionItems.value.length);
const embedsByItem = computed(() =>
  reduce(
    elementData.items,
    (acc, item) => {
      acc[item.id] = pick(elementData.embeds, Object.keys(item.body));
      return acc;
    },
    {} as any,
  ),
);

const toggleItem = (id: string) => {
  if (expanded.value.includes(id)) pull(expanded.value, id);
  else expanded.value.push(id);
};

const saveItem = ({ item, embeds = {} }: any) => {
  elementData.items[item.id] = item;
  Object.assign(elementData.embeds, embeds);
  emit('save', elementData);
};

const deleteItem = (id: string) => {
  const { body } = elementData.items[id];
  Object.keys(body).forEach((id) => delete elementData.embeds[id]);
  delete elementData.items[id];
  if (expanded.value.includes(id)) pull(expanded.value, id);
  emit('save', elementData);
};

const addAccordionItem = () => {
  const id = uuid();
  elementData.items[id] = {
    id,
    header: '',
    body: {},
    position: accordionItemCount.value + 1,
  };
  expanded.value.push(id);
  emit('save', elementData);
};

const calculateNewPosition = (oldIndex: number, newIndex: number) => {
  if (!newIndex) return accordionItems.value[newIndex].position / 2;
  if (newIndex + 1 === accordionItemCount.value) {
    return accordionItems.value[newIndex].position + 1;
  }
  const direction = oldIndex > newIndex ? -1 : 1;
  const prevPos = accordionItems.value[newIndex].position;
  const nextPos = accordionItems.value[newIndex + direction].position;
  return (nextPos + prevPos) / 2;
};

useDraggable(panels, {
  animation: 150,
  handle: '.accordion-drag-handle',
  onUpdate: ({ oldIndex, newIndex }) => {
    if (!isNumber(newIndex) || !isNumber(oldIndex)) return;
    const position = calculateNewPosition(oldIndex, newIndex);
    const currentItem = accordionItems.value[oldIndex];
    Object.assign(elementData.items[currentItem.id], { position });
    emit('save', elementData);
  },
});

watch(
  () => props.element.data,
  (data) => {
    if (isEqual(data, elementData)) return;
    Object.assign(elementData, cloneDeep(data));
  },
);
</script>

<style lang="scss" scoped>
:deep(.sortable-ghost) > * {
  visibility: hidden;
}
</style>
