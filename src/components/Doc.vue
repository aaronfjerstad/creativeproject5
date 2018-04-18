<template>
  <div class="doclayout">
    <div :class="'text_body_layout' + (visible?'':' greyedout')">
      <div class="title">{{title}}</div>
      <textarea
        id="textarea"
        :class="'textarea' + (visible?'':' transparenttextarea')"
        ref="document"
        v-model="text"
        @keyup="onKeyUp">
      </textarea>
      <div class="footer">
        Copyright 2018 Aaron Fjerstad
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Doc',
  data () {
    return {
      title: "",
      text: "",
      debounceFlags: {}
    }
  },
  computed: {
    id() {
      let doc = this.$store.getters.doc;
      return doc.id;
    },
    visible() {
      let doc = this.$store.getters.doc;
      return doc.id && doc.id.length > 0;
    }
  },
  methods: {
    debounce(func, flag, time) {
      if(!this.debounceFlags.hasOwnProperty(flag)) {
        this.debounceFlags[flag] = false;
      }
      if(!this.debounceFlags[flag]) {
        this.debounceFlags[flag] = true;
        window.setTimeout(()=>{
          func();
          this.debounceFlags[flag] = false;
        },time);
      }
    },
    onKeyUp() {
      this.debounce(()=>{
        this.$store.dispatch('updateDoc', {id:this.id, text:this.text});
      },"keyup", 200);
    }
  },
  mounted() {
    this.title = this.$store.getters.doc.title || "";
    this.text = this.$store.getters.doc.text || "";
  },
  watch: {
    id() {
      let doc = this.$store.getters.doc;
      this.title = doc.title;
      this.text = doc.text;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.doclayout {
  /* background-color: lightblue; */
  width: 100%;
}
.text_body_layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.title {
  font-size:2rem;
  padding:1rem;
}
.textarea {
  resize: none;
  width: 100%;
  flex-grow:1;
  overflow-y: auto;
}
.transparenttextarea {
  opacity: 0;
}
.footer {
  text-align:center;
  font-size:2rem;
  line-height: 3rem;
}
</style>
