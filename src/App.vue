<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  created() {
    this.$store.dispatch('session');
  }
}
</script>

<style>
* {
  padding: 0px;
  margin: 0px;
}
*:focus {
    outline: none;
}
#app {
  font-family: 'Gentium Book Basic', serif;
  /* font-family: 'Varela Round', sans-serif; */
  color: #261D1E;
  position: absolute;
  top:0px;
  bottom:0px;
  left:0px;
  right:0px;
}
input, .button {
  background-color: rgba(255,255,255,.2);
  box-sizing: border-box;
  border:none;
  border-radius:1.5rem;
  padding-left:1.5rem;
  padding-right:1.5rem;
  margin-bottom: .25rem;
  height:3rem;
}
input::placeholder {
  color: #261D1E;
}
.button {
  background-color: rgba(0,0,0,0.4);
  color: #8C7B86;
  cursor: pointer;
  padding:1rem;
}
</style>
