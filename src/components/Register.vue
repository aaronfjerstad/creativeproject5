<template>
  <div class="registerlayout">
    <div class="registerheader">Register</div>
    <credentials class="credentials" iconcolor="#261D1E" :error="registerError" @send="register($event)"></credentials>
  </div>
</template>

<script>
import Credentials from '@/components/Credentials'
export default {
  name: 'Register',
  data () {
    return {

    }
  },
  computed: {
    registerError() {
      return this.$store.getters.registererror;
    }
  },
  methods: {
    register(e) {
      console.log("Dispatching register");
      this.$store.dispatch('register', e);
    }
  },
  components: {
    Credentials
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.registerlayout {
  margin:1rem;
  text-align: center;
}
.registerheader {
  font-size: 1.5rem;
  margin:1rem;
}
.credentials {
  text-align: center;
  margin-left:50%;
  margin-right:50%;
  width:600px;
  transform:translate(-100px, 0px);
}
</style>
