<template>
  <div class="docslayout">
    <table class="newdoctable">
      <tr>
        <td><input class="docname" v-model="name" @keydown.enter="create" type="text" placeholder="Doc Name"/></td>
        <td><div class="button" @click="create"><i class="fas fa-plus"></i></div></td>
      </tr>
    </table>
    <div class="doclist">
      <div v-for="doc in docs">
        <span class="deleteButton" @click.stop="deleteDoc(doc.id)"><i class="far fa-times-circle"></i> </span><span class="doclink" @click="getDoc(doc.id)">{{doc.title}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Docs',
  data () {
    return {
      name: ""
    }
  },
  computed: {
    docs() {
      return this.$store.getters.docs;
    }
  },
  methods: {
    create() {
      this.$store.dispatch('createDoc', {title:this.name, text:""});
      this.name = "";
    },
    getDoc(id) {
      console.log(id);
      this.$store.dispatch('getDoc', id);
    },
    deleteDoc(id) {
      console.log(id);
      this.$store.dispatch('deleteDoc', id);
    }
  },
  created() {
    this.$store.dispatch('getDocs');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.docslayout {
  min-width:200px;
  padding-right:1rem;
  padding-left:1rem;
  display: flex;
  flex-direction: column;
}

.newdoctable {
  border-collapse: collapse;
}

.newdoctable td {
  position: relative;
}

.newdoctable td input {
  width: 100%;
}

.newdoctable td .docname {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  padding-right: .5rem;
  margin-right: 0px;
  margin-top:1rem;
}

.newdoctable td .button {
  width: 100%;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  padding-left: 1rem;
  padding-right: 1rem;
  color: #261D1E;
  margin-left:0px;
  margin-top:1rem;
}

.doclist {
  padding:1rem;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.doclink {
  margin:.5rem;
  line-height: 3rem;
  text-decoration: underline;
  cursor:pointer;
  font-size:1.5rem;
}

.deleteButton {
  margin:.5rem;
  margin-right:0px;
  line-height: 3rem;
  text-decoration: none;
  cursor:pointer;
  font-size:1.5rem;
}
</style>
