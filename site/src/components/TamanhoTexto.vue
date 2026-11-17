<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

// Dois elementos na raiz (botão + aviso para leitor de tela): sem herdar atributos do Astro.
defineOptions({ inheritAttrs: false });

const CHAVE = 'rosario:tamanho-texto';
const NOMES = ['normal', 'grande', 'muito grande'] as const;

const nivel = ref(0);
const aviso = ref('');

const rotulo = computed(() => `Tamanho do texto: ${NOMES[nivel.value]}. Toque para mudar.`);

// O CSS (global.css) lê data-tamanho="1|2|3" no card da liturgia.
function aplicar(valor: number) {
  document
    .querySelectorAll('.ros-liturgia')
    .forEach((card) => card.setAttribute('data-tamanho', String(valor + 1)));
}

onMounted(() => {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === null) return;
    const valor = Number(salvo);
    if (Number.isInteger(valor) && valor >= 0 && valor < NOMES.length) {
      nivel.value = valor;
      aplicar(valor);
    }
  } catch {
    // sem armazenamento (navegação privada): o tamanho só vale nesta visita
  }
});

function alternar() {
  nivel.value = (nivel.value + 1) % NOMES.length;
  aplicar(nivel.value);
  aviso.value = `Tamanho do texto: ${NOMES[nivel.value]}.`;
  try {
    localStorage.setItem(CHAVE, String(nivel.value));
  } catch {
    // idem
  }
}
</script>

<template>
  <button class="ros-aa" type="button" :aria-label="rotulo" @click="alternar">Aa</button>
  <span class="sr-only" role="status">{{ aviso }}</span>
</template>
