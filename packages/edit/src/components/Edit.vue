<template>
  <div class="tce-accordion d-flex flex-column align-center text-center">
    <VExpansionPanels v-model="expanded" v-if="!isEmpty(elementData.items)" multiple>
      <VExpandTransition group>
        <AccordionItem
          v-for="(it, id, index) in elementData.items"
          :key="id"
          :item="it"
          :embeds="embedsByItem[id]"
          :is-disabled="isDisabled"
          :is-focused="isFocused"
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
import { computed, reactive, ref } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { Element, ElementData } from '@tailor-cms/ce-accordion-manifest';
import { createId as cuid } from '@paralleldrive/cuid2';
import AccordionItem from './AccordionItem.vue';
import pick from 'lodash/pick';
import reduce from 'lodash/reduce';
import isEmpty from 'lodash/isEmpty';
import pull from 'lodash/pull';

const props = defineProps<{ element: Element; isFocused: boolean, isDisabled: boolean }>();
const emit = defineEmits(['save', 'link']);

const expanded = ref<number[]>([]);
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

const deleteItem = (id: string, index: number) => {
  Object.keys(elementData.items[id].body).forEach((embedId) => {
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
}
</style>
