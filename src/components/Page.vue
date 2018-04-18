<template>
  <div class="pagelayout">
    <div class="loggedout" v-if="!loggedIn">
      <app-header class="header"></app-header>
      <register class="register"></register>
    </div>
    <div class="loggedin" v-else>
      <app-header class="header"></app-header>
      <div class="panebody">
        <docs class="pane"></docs>
        <doc class="body"></doc>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader'
import Docs from '@/components/Docs'
import Doc from '@/components/Doc'
import Register from '@/components/Register'
export default {
  name: 'Page',
  data () {
    return {

    }
  },
  computed: {
    loggedIn() {
      return this.$store.getters.loggedIn;
    }
  },
  components: {
    AppHeader, Docs, Doc, Register
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pagelayout {
  position: absolute;
  top:0px;
  bottom:0px;
  left:0px;
  right:0px;
  overflow-y: auto;
  overflow-x:hidden;
}
.loggedin {
  position: absolute;
  top:0px;
  bottom:0px;
  left:0px;
  right:0px;
  overflow-y: auto;
  overflow-x:hidden;
  display:flex;
  flex-direction: column;
}
.panebody {
  width:100%;
  flex-grow:1;
  display: flex;
  flex-direction: row;
}
.pane {
  background-color: #eaa;
}
.body {
  flex-grow:1;
}
.register {
  text-align: center;
  margin-left:100%;
  margin-right:100%;
}
</style>
