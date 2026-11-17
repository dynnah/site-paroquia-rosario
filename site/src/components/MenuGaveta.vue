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

  <dialog :id="idGaveta" ref="dialogo" class="gaveta" aria-label="Menu" @close="aoFechar">
    <div class="gaveta__topo">
      <span class="gaveta__titulo">Menu</span>
      <button class="gaveta__fechar" type="button" @click="fechar">
        <Icone nome="fechar" :tamanho="20" />
        Fechar
      </button>
    </div>
    <nav class="gaveta__nav" aria-label="Principal">
      <ul class="gaveta__lista">
        <li v-for="link in links" :key="link.href">
          <a :href="link.href" :aria-current="link.atual ? 'page' : undefined">{{ link.rotulo }}</a>
        </li>
      </ul>
    </nav>
  </dialog>
</template>

<style scoped>
.gaveta {
  position: fixed;
  inset: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--fundo-elevado);
  color: var(--texto);
}

.gaveta[open] {
  display: flex;
  flex-direction: column;
}

.gaveta::backdrop {
  background: transparent;
}

.gaveta__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-3);
  min-height: var(--espaco-16);
  padding: var(--espaco-2) var(--espaco-4);
  border-bottom: 1px solid var(--linha);
  box-sizing: border-box;
}

.gaveta__titulo {
  font-weight: 700;
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gaveta__fechar {
  font: inherit;
  font-weight: 700;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  gap: var(--espaco-2);
  min-height: var(--toque-min);
  padding: 0 var(--espaco-3);
  background: transparent;
  border: 1.5px solid var(--linha-forte);
  color: var(--texto);
  border-radius: var(--raio-m);
  cursor: pointer;
}

.gaveta__nav {
  flex: 1;
  overflow-y: auto;
}

.gaveta__lista {
  list-style: none;
  margin: 0;
  padding: var(--espaco-2) var(--espaco-4) var(--espaco-8);
}

.gaveta__lista li + li {
  border-top: 1px solid var(--linha);
}

.gaveta__lista a {
  display: flex;
  align-items: center;
  min-height: calc(var(--toque-min) + var(--espaco-3));
  padding: 0 var(--espaco-3);
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: var(--texto);
  text-decoration: none;
  border-radius: var(--raio-m);
}

.gaveta__lista a:hover,
.gaveta__lista a[aria-current='page'] {
  background: var(--fundo-afundado);
}

.gaveta__lista a[aria-current='page'] {
  box-shadow: inset 0 -2px 0 var(--ouro);
}
</style>
