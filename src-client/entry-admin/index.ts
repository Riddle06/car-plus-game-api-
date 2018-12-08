import { BasePage } from "./base.page";
import * as Vue from 'vue/dist/vue.common'

class IndexPage extends BasePage {
  async vueInit() {
    const _this = this;
    
    new Vue({
      el: '#app',
      data() {
        return {
          msg: 'hello world'
        }
      },
      created() {

      }
    })
  }

}

const indexPage = new IndexPage();
