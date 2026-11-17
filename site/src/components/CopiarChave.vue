<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import type { NomeIcone } from '../lib/icones';
import Icone from './Icone.vue';

// Dois elementos na raiz (botão + aviso para leitor de tela): sem herdar atributos do Astro.
defineOptions({ inheritAttrs: false });

const props = defineProps<{ chave: string }>();

type Estado = 'ocioso' | 'copiado' | 'falhou';
const estado = ref<Estado>('ocioso');
let temporizador: ReturnType<typeof setTimeout> | undefined;

const icone = computed<NomeIcone>(() => (estado.value === 'copiado' ? 'confirmar' : 'copiar'));
const rotulo = computed(() =>
  estado.value === 'copiado'
    ? 'Chave copiada'
    : estado.value === 'falhou'
      ? 'Copie manualmente'
      : 'Copiar chave',
);
const anuncio = computed(() =>
  estado.value === 'copiado'
    ? 'Chave Pix copiada.'
    : estado.value === 'falhou'
      ? 'Não foi possível copiar. Selecione a chave ao lado e copie manualmente.'
      : '',
);

// Plano B para navegadores antigos ou páginas sem HTTPS.
function copiarPorSelecao(texto: string): boolean {
  const campo = document.createElement('textarea');
  campo.value = texto;
  campo.setAttribute('readonly', '');
  campo.style.position = 'fixed';
  campo.style.opacity = '0';
  document.body.append(campo);
  campo.select();
  let ok: boolean;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  campo.remove();
  return ok;
}

async function copiar() {
  let ok: boolean;
  try {
    await navigator.clipboard.writeText(props.chave);
    ok = true;
  } catch {
    ok = copiarPorSelecao(props.chave);
  }

  estado.value = ok ? 'copiado' : 'falhou';
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    estado.value = 'ocioso';
  }, 3000);
}

onBeforeUnmount(() => clearTimeout(temporizador));
</script>

<template>
  <button class="ros-btn ros-btn--primario" type="button" @click="copiar">
    <Icone :nome="icone" />
    {{ rotulo }}
  </button>
  <span class="sr-only" role="status">{{ anuncio }}</span>
</template>
