<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue';
import Icone from './Icone.vue';

interface ItemMenu {
  rotulo: string;
  href: string;
  atual?: boolean;
}

// Dois elementos na raiz (botão + gaveta): sem herdar atributos do Astro.
defineOptions({ inheritAttrs: false });

defineProps<{ links: ItemMenu[] }>();

const idGaveta = `menu-${useId()}`;
const dialogo = ref<HTMLDialogElement | null>(null);
const aberto = ref(false);

function abrir() {
  dialogo.value?.showModal();
  aberto.value = true;
}

function fechar() {
  dialogo.value?.close();
}

// Esc também fecha: o <dialog> avisa pelo evento "close".
function aoFechar() {
  aberto.value = false;
}

// Se a tela crescer até a largura do menu completo, a gaveta não faz mais sentido.
let largura: MediaQueryList | undefined;
function aoMudarLargura(evento: MediaQueryListEvent) {
  if (evento.matches) fechar();
}

onMounted(() => {
  largura = window.matchMedia('(min-width: 960px)');
  largura.addEventListener('change', aoMudarLargura);
});

onBeforeUnmount(() => {
  largura?.removeEventListener('change', aoMudarLargura);
});
</script>

<template>
  <button
    class="ros-menu-btn"
    type="button"
    :aria-controls="idGaveta"
    :aria-expanded="aberto"
    @click="abrir"
  >
    <Icone nome="menu" :tamanho="20" />
    <span class="ros-menu-btn__txt">Menu</span>
  </button>

  <dialog :id="idGaveta" ref="dialogo" class="ros-gaveta" aria-label="Menu" @close="aoFechar">
    <div class="ros-gaveta__topo">
      <span class="ros-gaveta__titulo">Menu</span>
      <button class="ros-gaveta__fechar" type="button" @click="fechar">
        <Icone nome="fechar" :tamanho="20" />
        Fechar
      </button>
    </div>
    <nav class="ros-gaveta__nav" aria-label="Principal">
      <ul class="ros-gaveta__lista">
        <li v-for="link in links" :key="link.href">
          <a :href="link.href" :aria-current="link.atual ? 'page' : undefined">{{ link.rotulo }}</a>
        </li>
      </ul>
    </nav>
  </dialog>
</template>
