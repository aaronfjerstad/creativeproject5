<template>
  <div class="loginlayout">
    <table class="logintable control">
      <tr>
        <td colspan="2"><input v-model="emailfield" @keydown.enter="send" type="text" placeholder="Email"/></td>
      </tr>
      <tr>
        <td><input class="password" v-model="passwordfield" @keydown.enter="send" type="password" placeholder="Password"/></td>
        <td><div class="button" :style="'color:' + iconcolor + ';'" @click="send"><i class="fas fa-sign-in-alt"></i></div></td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="error overflow" v-if="hasError">{{error}}</div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Login',
  props: {
    error: String,
    iconcolor: String
  },
  data () {
    return {
      emailfield:"",
      passwordfield:""
    }
  },
  computed: {
    hasError() {
      return this.error !== undefined && this.error.length > 0;
    }
  },
  methods: {
    send() {
      this.$emit('send', {email:this.emailfield,password:this.passwordfield});
      this.emailfield = "";
      this.passwordfield = "";
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.logintable {
  border-collapse: collapse;
}

.logintable td {
  position: relative;
}

.logintable td input {
  width: 100%;
}

.logintable td .password {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  padding-right: .5rem;
  margin-right: 0px;
}

.logintable td .button {
  width: 100%;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-left:0px;
}
/*
.button {
  color: #261D1E;
} */

.error {
  margin-left:1rem;
  font-size:1.5rem;
  line-height: 2.5rem;
}

.overflow {
  max-width: 200px;
}
</style>
