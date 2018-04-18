<template>
  <div class="headerlayout">
    <div class="logo">AutoSave</div>
    <div v-if="loggedIn">
      <logout></logout>
    </div>
    <div v-else>
      <credentials :error="error" @send="login($event)"></credentials>
    </div>
  </div>
</template>

<script>
import Credentials from '@/components/Credentials'
import Logout from '@/components/Logout'
export default {
  name: 'AppHeader',
  computed: {
    loggedIn() {
      return this.$store.getters.loggedIn;
    },
    error() {
      return this.$store.getters.error;
    }
  },
  methods: {
    login(e) {
      this.$store.dispatch('login', e);
    }
  },
  components: {
    Credentials,
    Logout
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.headerlayout {
  display:flex;
  flex-direction: row;
  background-color: #732F35;
  padding:.5rem;
  min-height: 4rem;
}
.logo {
  margin-left:1rem;
  font-size:3rem;
  flex-grow:1;
}
</style>
