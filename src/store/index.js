import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'
import * as types from './mutation-types'
import firebaseConfig from '../../config/firebase'

const firebaseApp = firebase.initializeApp(firebaseConfig)
const db = firebaseApp.database()
const articleRef = db.ref('articles')

Vue.use(Vuex)

const initActions = store => store.dispatch(types.BIND_ARTICLE)
const getKey = item => item['.key']

const state = {
  articleList: [],
  isReadyArticle: false
}

const getters = {
  articleList: state => state.articleList,
  articleStatus: state => key => state.articleList.find(article => article['.key'] === key),
  isReadyArticle: state => state.isReadyArticle
}

const actions = {
  [types.BIND_ARTICLE]: firebaseAction(({bindFirebaseRef, commit}) => {
    bindFirebaseRef('articleList', articleRef, {
      wait: true,
      readyCallback: () => commit(types.READY_ARTICLE, true)
    })
  }),
  [types.ADD_ARTICLE]: firebaseAction((commit, text) => {
    const now = new Date().getTime()
    articleRef.push({
      text: text,
      createdAt: now,
      updatedAt: now
    })
  }),
  [types.UPDATE_ARTICLE]: firebaseAction(({ commit }, { item, text }) => {
    articleRef.child(getKey(item)).update({
      text: text,
      updatedAt: new Date().getTime()
    })
  }),
  [types.REMOVE_ARTICLE]: firebaseAction(({ commit }, item) => {
    articleRef.child(getKey(item)).remove()
  })
}

const mutations = {
  ...firebaseMutations,
  [types.READY_ARTICLE] ({ state }, payload) {
    this.state.isReadyArticle = payload
  }
}

const plugins = [initActions]

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state,
  getters,
  mutations,
  actions,
  plugins
})

export default store
