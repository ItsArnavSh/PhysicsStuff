// src/main-about.js
import About from './pages/Chaos.svelte';

const target = document.getElementById('app');
if (target) {
  new About({
    target,
  });
} else {
  console.error('Target element not found');
}