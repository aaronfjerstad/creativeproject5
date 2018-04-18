import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex);

const getAuthHeader = ()=>{
  return {
    headers: {
      'Authorization': localStorage.getItem('token')
    }
  };
}

export default new Vuex.Store({
  state: {
    auth: {
      successful:true,
      userid:'',
      email:'',
      token:'',
      existed:false,
      error:'',
      registererror:''
    },
    data: {
      docs: [],
      doc: {}
    }
  },
  getters: {
    successful:state=>state.auth.successful,
    userid:state=>state.auth.userid,
    email:state=>state.auth.email,
    token:state=>state.auth.token,
    existed:state=>state.auth.existed,
    error:state=>state.auth.error,
    registererror:state=>state.auth.registererror,
    loggedIn:state=>(state.auth.token!=""),
    docs:state=>state.data.docs,
    doc:state=>state.data.doc
  },
  mutations: {
    setAuth(state, auth) {
      if(auth.hasOwnProperty('error')) {
        state.auth.successful = false;
        state.auth.userid = "";
        state.auth.email = "";
        state.auth.token = "";
        state.auth.existed = false;
        state.auth.error = auth.error;

        localStorage.removeItem('token');
      }
      else {
        state.auth.successful = true;
        state.auth.userid = auth.user.id;
        state.auth.email = auth.user.email;
        state.auth.token = auth.token;
        state.auth.existed = auth.existed;
        state.auth.error = "";

        localStorage.setItem('token', auth.token);
      }
    },
    setRegisterError(state, registererror) {
      state.auth.registererror = registererror;
    },
    logout(state) {
      state.auth.successful = false;
      state.auth.userid = "";
      state.auth.email = "";
      state.auth.token = "";
      state.auth.existed = false;
      state.auth.error = "";

      localStorage.removeItem('token');
    },
    setDocs(state, docs) {
      state.data.docs = docs;
    },
    setDoc(state, doc) {
      state.data.doc = doc;
    }
  },
  actions: {
    login(context, credentials) {
      axios.post("/api/login", credentials).then(resp=>{
        context.commit('setAuth', resp.data);
      }).catch(error=>{
        console.log(error);
        context.commit('setAuth', error.response.data);
      });
    },
    register(context, credentials) {
      axios.post("/api/register", credentials).then(resp=>{
        console.log(resp);
        context.commit('setRegisterError', resp.data.error);
      }).catch(error=>{
        console.log(error.response);
        if(error.response.data && error.response.data.hasOwnProperty('error')) {
          context.commit('setRegisterError', error.response.data.error);
        }
      });
    },
    session(context) {
      if(localStorage.getItem('token') != undefined) {
        console.log("Getting session");
        axios.post("/api/session", {}, getAuthHeader()).then(resp=>{
          console.log(resp.data);
          context.commit('setAuth', resp.data);
        }).catch(error=>{
          console.log("No valid token.");
        });
      }
    },
    logout(context) {
      if(context.getters.loggedIn) {
        context.commit('logout');
      }
    },
    createDoc(context, doc) {
      console.log("Create action " + doc.title);
      if(doc.title && doc.title.trim().length > 0) {
        console.log("Creating doc");
        axios.post("/api/doc", doc, getAuthHeader()).then(resp=>{
          console.log("Created doc. Dispatching update.");
          context.dispatch('getDocs');
        }).catch(error=>{
          console.log("Create doc error");
        });
      }
    },
    getDoc(context, docid) {
      console.log("Getting doc.");
      axios.get("/api/doc/" + docid, getAuthHeader()).then(resp=>{
        console.log("Got doc");
        console.log(resp.data);
        context.commit('setDoc', resp.data);
      }).catch(error=>{
        console.log("Couldn't get doc " + docid);
        console.log(error);
      });
    },
    updateDoc(context, doc) {
      console.log("Updating doc.");
      axios.put("/api/doc", doc, getAuthHeader()).then(resp=>{
        console.log("Updated doc.");
      }).catch(error=>{
        console.log("Update doc error.");
      });
    },
    deleteDoc(context, id) {
      console.log("Deleting doc.");
      axios.delete("/api/doc/" + id, getAuthHeader()).then(resp=>{
        console.log("Deleted doc.");
        if(context.getters.doc.hasOwnProperty('id') && context.getters.doc.id === id) {
          context.commit('setDoc', {});
        }
        context.dispatch('getDocs');
      }).catch(error=>{
        console.log("Delete doc error.");
      });
    },
    getDocs(context) {
      console.log("Getting docs");
      axios.get("/api/docs", getAuthHeader()).then(resp=>{
        console.log("Got docs");
        console.log(resp);
        context.commit('setDocs',resp.data);
        if(!(context.getters.doc.id && context.getters.doc.id.length > 0) && resp.data.length > 0) {
            context.dispatch('getDoc', resp.data[0].id);
        }
      }).catch(error=>{
        console.log("Get docs error");
        console.log(error);
        context.commit('setDocs', []);
      });
    }
  }
});
