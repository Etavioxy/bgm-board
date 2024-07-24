<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
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
