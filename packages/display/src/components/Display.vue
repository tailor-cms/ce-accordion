<template>
  <div class="tce-root">
    <VExpansionPanels>
      <VExpansionPanel v-for="item in data.items" :key="item.id">
        <VExpansionPanelTitle>{{ item.header }}</VExpansionPanelTitle>
        <VExpansionPanelText>
          <VAlert v-if="!embeds[item.id].length" type="info" variant="tonal">
            No content elements added to this item.
          </VAlert>
          <EmbeddedContainer v-else :elements="embeds[item.id]" />
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>

<script setup lang="ts">
import { ElementData } from '@tailor-cms/ce-accordion-manifest';
import sortBy from 'lodash/sortBy';
import { computed } from 'vue';
import reduce from 'lodash/reduce';
import { filter } from 'lodash';

const props = defineProps<{ data: ElementData; userState: any }>();
defineEmits(['interaction']);

const embeds = computed(() => {
  const { items, embeds } = props.data;
  return reduce(items, (acc, item) => {
    const embedIds = Object.keys(item.body);
    const itemEmbeds = filter(embeds, (it) => embedIds.includes(it.id));
    acc[item.id] = sortBy(itemEmbeds, 'position');
    return acc;
  }, {} as Record<string, any[]>);
});
</script>

<style scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}
</style>
