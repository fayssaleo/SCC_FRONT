
import loading from './modules/Loading/loading'

import { createStore } from 'vuex'


const Store = createStore({
    modules: {

      loading: loading,
     
    },
    plugins: [],
  })


export default Store
