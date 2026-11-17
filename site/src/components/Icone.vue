<script setup lang="ts">
import { computed } from 'vue';
import { ICONES, atributosIcone, type NomeIcone } from '../lib/icones';

// Versão Vue de Icone.astro: mesmos desenhos, mesmos atributos.
const props = defineProps<{
  nome: NomeIcone;
  /** Largura e altura em px. Sem isso, o tamanho vem do CSS de quem usa. */
  tamanho?: number;
}>();

const atributos = computed(() => atributosIcone(props.nome));
const corpo = computed(() => ICONES[props.nome].corpo);
</script>

<template>
  <!-- O conteúdo vem de constantes em lib/icones.ts, nunca de texto digitado por alguém. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg v-bind="atributos" :width="tamanho" :height="tamanho" v-html="corpo" />
</template>
