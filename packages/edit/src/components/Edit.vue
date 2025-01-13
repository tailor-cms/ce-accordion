<template>
  <VCard class="tce-accordion my-2" color="grey-lighten-5">
    <VToolbar class="px-4" color="primary-darken-3" height="36">
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
        <VExpandTransition v-if="!!itemCount" group>
          <AccordionItem
            v-for="(item, index) in elementData.items"
            :key="item.id"
            :allow-deletion="itemCount > 1"
            :embed-element-config="embedElementConfig"
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
      <VBtn
        v-if="!isDisabled"
        class="mt-6"
        color="primary-darken-4"
        prepend-icon="mdi-tab-plus"
        variant="text"
        @click="addItem"
      >
        Add Accordion Item
      </VBtn>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import manifest, {
  Element,
  ElementData,
} from '@tailor-cms/ce-accordion-manifest';
import cloneDeep from 'lodash/cloneDeep';
import isNumber from 'lodash/isNumber';
import pick from 'lodash/pick';
import pull from 'lodash/pull';
import Sortable from 'sortablejs';
import uniqueId from 'lodash/uniqueId';
import { v4 as uuid } from 'uuid';

import AccordionItem from './AccordionItem.vue';

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isFocused: boolean;
  isDisabled: boolean;
}>();
const emit = defineEmits(['save']);

const expanded = ref<string[]>([props.element.data.items[0].id]);
const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const panels = ref();
const sortable = ref();

const itemCount = computed(() => elementData.items.length);
const embedsByItem = computed(() =>
  elementData.items.reduce((acc, item) => {
    acc[item.id] = pick(elementData.embeds, item.elementIds);
    return acc;
  }, {} as any),
);

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

const addItem = () => {
  const id = uuid();
  elementData.items.push({
    id,
    title: `Accordion Item Title`,
    elementIds: [],
  });
  expanded.value.push(id);
  emit('save', elementData);
};

onBeforeUnmount(() => {
  sortable.value.destroy();
});
</script>

<style lang="scss" scoped>
.tce-accordion {
  text-align: left;
  margin: 1rem 0;
}

:deep(.sortable-ghost) > * {
  visibility: hidden;
}
</style>
