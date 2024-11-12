<template>
  <div class="tce-accordion d-flex flex-wrap justify-center">
    <VExpansionPanels multiple>
      <AccordionItem
        v-for="it in elementData.items"
        :key="it.id"
        :item="it"
        :embeds="embedsByItem[it.id]"
        :is-disabled="isDisabled"
        :is-focused="isFocused"
        @save="saveItem"
        @delete="deleteItem"
      />
    </VExpansionPanels>
    <VBtn
      class="mt-4"
      color="primary-darken-3"
      prepend-icon="mdi-plus"
      variant="tonal"
      @click="add"
    >
      Accordion item
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { Element, ElementData } from '@tailor-cms/ce-accordion-manifest';
import { createId as cuid } from '@paralleldrive/cuid2';
import AccordionItem from './AccordionItem.vue';
import pick from 'lodash/pick';
import reduce from 'lodash/reduce';

const props = defineProps<{ element: Element; isFocused: boolean, isDisabled: boolean }>();
const emit = defineEmits(['save', 'link']);

const elementData = reactive<ElementData>(cloneDeep(props.element.data));

const embedsByItem = computed(() => {
  return reduce(elementData.items, (acc, item) => {
    acc[item.id] = pick(elementData.embeds, Object.keys(item.body));
    return acc;
  }, {} as any);
});

const add = () => {
  const id = cuid();
  elementData.items[id] = { id, header: 'Header', body: {} };
  emit('save', elementData);
};

const saveItem = ({ item, embeds = {} }: any) => {
  Object.assign(elementData.items, { [item.id]: item });
  Object.assign(elementData.embeds, embeds);
  emit('save', elementData);
};

const deleteItem = (itemId: string) => {
  Object.keys(elementData.items[itemId].body).forEach((embedId) => {
    delete elementData.embeds[embedId];
  });
  delete elementData.items[itemId];
  emit('save', elementData);
};
</script>

<style lang="scss" scoped>
.tce-accordion {
  text-align: left;
}
</style>
