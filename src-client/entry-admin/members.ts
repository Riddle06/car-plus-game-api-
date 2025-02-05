import { BasePage } from "./base.page";
import * as Vue from 'vue/dist/vue.common'

class MembersPage extends BasePage {
  async vueInit() {
    const _this = this;

    new Vue({
      el: '#app',
      data() {
        return {
          memberId: '',
          member: {},
          members: [],
          page: {
            index: 1,
            size: 10,
            dataAmount: 0,
          },

          blockForm: {
            carPlusMemberId: '',
            reason: '',
            adminUserName: '',
          },


          isDialogOpen: false,
          isBlockDialogOpen: false,
        }
      },
      watch: {
        isDialogOpen(bool) {
          if (!bool) this.member = {};
        },
        isBlockDialogOpen(bool) {
          if (!bool) {
            this.member = {};
            this.$refs.form.resetFields();
          }
        }
      },
      methods: {
        async getMembers(init = false) {
          if (init) this.page.index = 1;

          const ret = await _this.adminSvc.adminMember.getMembers({
            pageIndex: this.page.index,
            pageSize: this.page.size
          }, { shortId: this.memberId });

          if (!ret.success) {
            return;
          }

          this.members = ret.items;
          this.page = { ...this.page, ...ret.page };
        },

        async openMemberDetail(member) {
          _this.openLoader();
          const ret = await _this.adminSvc.adminMember.getMemberDetail(member.id);
          _this.closeLoader();
          if (!ret.success) {
            return;
          }

          this.member = ret.item;
          this.isDialogOpen = true;
        },

        openBlockDialog(member) {
          this.member = member;
          this.blockForm.carPlusMemberId = member.carPlusMemberId;
          this.isBlockDialogOpen = true;
        },

        async addBlockMember() {
          const isValid = await this.$refs.form.validate().catch(() => false);
          if (!isValid) {
            return;
          }
          const ret = await _this.adminSvc.adminMember.blockMember(this.blockForm);
          if (!ret.success) {
            return;
          }
          this.$notify({
            type: 'success',
            title: '封鎖成功'
          });
          this.isBlockDialogOpen = false;
        },

        exportExcel() {
          window.open(_this.adminSvc.adminExport.getExportMemberWithGameItems({
            token: _this.getAdminToken(),
            shortId: this.memberId,
          }))
        },

        getGameItemTypeName(type) {
          return _this.getGameItemTypeName(type);
        },

        handlePageChange(index) {
          this.page.index = index;
          this.getMembers();
        }
      },
      created() {
        this.getMembers();
      }
    })
  }

}

const membersPage = new MembersPage();
