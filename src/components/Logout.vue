<template>
  <div class="logoutlayout">
    <div class="email">{{email}}</div>
    <div class="logout" v-if="loggedIn" @click="logout">Logout</div>
  </div>
</template>

<script>
export default {
  name: 'logout',
  data () {
    return {

    }
  },
  computed: {
    email() {
      return this.$store.getters.email;
    },
    loggedIn() {
      return this.$store.getters.loggedIn;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.logoutlayout {
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 2rem;
  display:flex;
  flex-direction: column;
}
.email {
  font-size: 2rem;
  font-style:normal;
}
.logout {
  cursor: pointer;
  font-style: italic;
  font-size:1.5rem;
}
</style>
