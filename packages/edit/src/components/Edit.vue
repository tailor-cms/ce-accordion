<template>
  <VCard class="tce-accordion" color="grey-lighten-5">
    <VToolbar class="px-4" color="primary-darken-2" height="36">
      <VIcon
        :icon="manifest.ui.icon"
        color="secondary-lighten-2"
        size="18"
        start
      />
      <span class="text-subtitle-2">{{ manifest.name }}</span>
    </VToolbar>
    <div class="pa-6 text-center">
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
            :is-disabled="isReadonly"
            :is-expanded="expanded.includes(item.id)"
            :is-focused="isFocused"
            :item="item"
            @delete="deleteItem(item.id)"
            @expand="expanded.push(item.id)"
            @save="saveItem($event)"
          />
        </VExpandTransition>
      </VExpansionPanels>
      <VBtn
        v-if="!isReadonly"
        class="mt-6"
        color="primary-darken-4"
        prepend-icon="mdi-tab-plus"
        variant="text"
        @click="addAccordionItem"
      >
        Add Accordion Item
      </VBtn>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import {
  cloneDeep,
  isNumber,
  pick,
  pull,
  reduce,
  sortBy,
  uniqueId,
} from 'lodash-es';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import manifest, {
  Element,
  ElementData,
} from '@tailor-cms/ce-accordion-manifest';
import Sortable from 'sortablejs';
import { v4 as uuid } from 'uuid';

import AccordionItem from './AccordionItem.vue';

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();
const emit = defineEmits(['save']);

const expanded = ref<string[]>([]);
const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const panels = ref();
const sortable = ref();

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
    header: `Accordion Item Title`,
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

onMounted(() => {
  sortable.value = Sortable.create(panels.value.$el, {
    animation: 150,
    group: `dragDrop-${uniqueId()}`,
    handle: '.accordion-drag-handle',
    onEnd: ({ oldIndex, newIndex }) => {
      if (!isNumber(newIndex) || !isNumber(oldIndex)) return;
      const position = calculateNewPosition(oldIndex, newIndex);
      const currentItem = accordionItems.value[oldIndex];
      Object.assign(elementData.items[currentItem.id], { position });
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
}

:deep(.sortable-ghost) > * {
  visibility: hidden;
}
</style>
