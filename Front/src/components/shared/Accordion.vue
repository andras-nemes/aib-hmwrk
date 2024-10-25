<template>
    <div class="accordion">
      <ul>
        <li v-for="item in items" :key="item.Id" class="accordion-item">
          <div @click="toggleItem(item.Id)" class="accordion-title">
            {{ item.Title }}
          </div>
          <div v-if="openItemId === item.Id" class="accordion-content">
            {{ item.Description }}
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  
  export default defineComponent({
    name: 'Accordion',
    props: {
      items: {
        type: Array as PropType<Array<{ Id: number; Title: string; Description: string }>>,
        required: true,
      },
    },
    setup(props) {
      const openItemId = ref<number | null>(null);
  
      const toggleItem = (itemId: number) => {
        openItemId.value = openItemId.value === itemId ? null : itemId;
      };
  
      return {
        openItemId,
        toggleItem,
      };
    },
  });
  </script>
  
  <style scoped>
  .accordion ul {
    list-style-type: none;
    padding: 0;
    margin: 10px;
  }
  .accordion-item {
    border-bottom: 1px solid #ddd;
  }
  .accordion-title {
    cursor: pointer;
    font-weight: bold;
    padding: 10px;
    background-color: #f7f7f7;
  }
  .accordion-content {
    padding: 10px;
    color: #555;
  }
  </style>