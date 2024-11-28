<template>
  <div class="tce-accordion d-flex flex-column align-center text-center">
    <VExpansionPanels
      ref="panels"
      v-model="expanded"
      elevation="0"
      rounded="lg"
      multiple
    >
      <VExpandTransition v-if="!!elementData.items.length" group>
        <AccordionItem
          v-for="(item, index) in elementData.items"
          :key="item.id"
          :embed-types="embedTypes"
          :embeds="embedsByItem[item.id]"
          :is-disabled="isDisabled"
          :is-expanded="expanded.includes(item.id)"
          :is-focused="isFocused"
          :item="item"
          @delete="deleteItem(item.id, index)"
          @expand="expanded.push(item.id)"
          @save="saveItem($event, index)"
        />
      </VExpandTransition>
    </VExpansionPanels>
    <ElementPlaceholder
      v-if="!elementData.items.length"
      :icon="manifest.ui.icon"
      :is-disabled="isDisabled"
      :is-focused="isFocused"
      :name="`${manifest.name} component`"
      active-icon="mdi-arrow-down"
      active-placeholder="Click the button below to create the first item"
    />
    <VBtn
      v-if="!isDisabled"
      class="mt-6"
      color="primary-darken-4"
      prepend-icon="mdi-plus"
      variant="text"
      @click="add"
    >
      Add accordion item
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import manifest, {
  Element,
  ElementData,
} from '@tailor-cms/ce-accordion-manifest';
import cloneDeep from 'lodash/cloneDeep';
import { ElementPlaceholder } from '@tailor-cms/core-components';
import isNumber from 'lodash/isNumber';
import pick from 'lodash/pick';
import pull from 'lodash/pull';
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

const embedsByItem = computed(() =>
  elementData.items.reduce((acc, item) => {
    acc[item.id] = pick(elementData.embeds, item.elementIds);
    return acc;
  }, {} as any),
);

const add = () => {
  const id = uuid();
  elementData.items.push({ id, elementIds: [] });
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
