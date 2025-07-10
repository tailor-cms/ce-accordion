<!-- eslint-disable vue/no-undef-components -->
<template>
  <div class="tce-accordion-root">
    <VExpansionPanels color="grey-lighten-5" variant="accordion" flat>
      <VExpandTransition group>
        <VExpansionPanel
          v-for="item in accordionItems"
          :key="item.id"
          class="border"
        >
          <VExpansionPanelTitle>{{ item.header }}</VExpansionPanelTitle>
          <VExpansionPanelText>
            <VAlert v-if="!embeds[item.id].length" type="info" variant="tonal">
              No content elements added to this item.
            </VAlert>
            <TailorEmbeddedContainer v-else :elements="embeds[item.id]" />
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpandTransition>
    </VExpansionPanels>
  </div>
</template>

<script setup lang="ts">
import { reduce, sortBy } from 'lodash-es';
import { computed } from 'vue';
import { Element } from '@tailor-cms/ce-accordion-manifest';

const props = defineProps<{ element: Element; userState: any }>();
defineEmits(['interaction']);

const accordionItems = computed(() =>
  sortBy(props.element.data.items, 'position'),
);

const embeds = computed(() => {
  const { items, embeds } = props.element.data;
  return reduce(
    items,
    (acc, item) => {
      const itemEmbeds = Object.keys(item.body).map((id) => embeds[id]);
      acc[item.id] = sortBy(itemEmbeds, 'position');
      return acc;
    },
    {} as Record<string, any[]>,
  );
});
</script>

<style lang="scss" scoped>
.tce-accordion-root {
}
</style>
