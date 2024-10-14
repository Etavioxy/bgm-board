<script setup lang="ts">
import Client from './client/index.vue'
import { ref, onMounted } from 'vue';

const data = ref('');

onMounted(() => {
  (async()=>{
    const res = await Promise.all([
      //fetch('https://api.bgm.tv/v0/users/z7z_Eta/collections?subject_type=2&type=2&limit=100&offset=0'),
      //fetch('https://api.bgm.tv/v0/users/z7z_Eta/collections?subject_type=2&type=2&limit=100&offset=100'),
      //fetch('https://api.bgm.tv/v0/users/z7z_Eta/collections?subject_type=2&type=2&limit=100&offset=200'),
    ]);
    if( res[0].status!==200 ) console.error('Failed to fetch data');
    const collections = (await Promise.all(res.map(x => x.json()))).map(x => x.data).reduce((x, y) => { return x.concat(y); } , []);
    data.value = collections.filter(x => x.rate >= 9);
    //data.value = collections;
  })();
});

const circleData = {
  m: [
    1.0, 0.0, 0.5,
  ],
  a: [
    1.0, 0.0, 0.5,
  ]
};

const update = function(){
  circleData.m[0] = Math.sin(Date.now() / 1000);
  circleData.m[1] = Math.cos(Date.now() / 1000);
  circleData.a[0] = Math.sin(Date.now() / 1000);
  circleData.a[1] = Math.cos(Date.now() / 1000);
};

import { Renderer } from './client/gl.ts';

onMounted(()=>{
  const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
  const renderer = new Renderer(canvas);
  
  const animate = function(){
    requestAnimationFrame(animate);

    // 渲染循环
    update();
    renderer.render(circleData);
  };

  animate();
  
  (function(){var script=document.createElement('script');script.onload=function(){var stats=new (window.Stats as any)();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//cdn.jsdelivr.net/gh/Kevnz/stats.js/build/stats.min.js';document.head.appendChild(script);})();
});

</script>

<template>
  <div>
    {{data.length}}

    <Client></Client>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
