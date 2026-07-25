<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

interface Props {
  visible: boolean
  titulo: string
}

const props = defineProps<Props>()

const emit = defineEmits(['close', 'update:visible'])

// const emit = defineEmits<{
//   close: []
//   'update:visible': [value: boolean]
// }>()

function cerrar() {
  emit('update:visible', false)
  emit('close')
}

function onOverlayClick() {
  //cerrar()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') cerrar()
}

// Solo escuchamos "Escape" mientras el modal está abierto, para no dejar
// un listener global activo todo el tiempo que la app esté viva.
watch(
  () => props.visible,
  (esVisible) => {
    if (esVisible) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <!--
    Teleport saca este HTML del árbol del componente padre y lo pone
    directo en <body>. Esto evita bugs de z-index o "overflow: hidden"
    en algún contenedor padre que recorte el modal visualmente.
  -->
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="onOverlayClick">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modal-header">
          <h3>{{ titulo }}</h3>
          <button class="cerrar" @click="cerrar" aria-label="Cerrar">✕</button>
        </header>

        <div class="modal-body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  border-radius: 8px;
  min-width: 320px;
  max-width: 90vw;
  font-family: sans-serif;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.modal-body { padding: 1rem; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}
.cerrar { background: none; border: none; cursor: pointer; font-size: 1rem; }
</style>
