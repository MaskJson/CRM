<template>
  <Card>
    <div>
      <SearchItem>
        <Select placeholder="请选择跟踪类型" v-model="searchData.type" class="w200" clearable>
          <Option :value="1">电话沟通</Option>
          <Option :value="2">顾问面试（内）</Option>
          <Option :value="3">顾问面试（外）</Option>
        </Select>
      </SearchItem>
      <SearchItem>
        <Button @click="search" type="primary">查询</Button>
      </SearchItem>
    </div>
    <ManagerView class="talent-manager" ref="manager" :del="false" :save="null" :columns="columns" :searchData="searchData" @on-success="successHandler" @on-error="errorHandler">
      <!--<Button type="primary" @click="finishRemind(1)">批量结束跟踪</Button>-->
    </ManagerView>
    <!--  添加跟踪记录 -->
    <ModalUtil ref="remind" title="添加跟踪记录" @reset="resetRemind" @on-ok="addRemind" :loading="show">
      <Form ref="addRemind" :model="remind" :rules="remindRule" :label-width="120">
        <FormItem label="本次跟踪类别" prop="type">
          <Select v-model="remind.type">
            <Option :value="1">电话</Option>
            <Option :value="2">顾问面试（内）</Option>
            <Option :value="3">顾问面试（外）</Option>
          </Select>
        </FormItem>
        <FormItem label="沟通记录" v-if="remind.type == 1" class="ivu-form-item-required">
          <Input type="textarea" :rows="3" v-model="remind.remark"/>
        </FormItem>
        <div v-if="remind.type == 2 || remind.type == 3">
          <FormItem label="候选人基本情况" class="ivu-form-item-required">
            <Input type="textarea" :rows="3" v-model="remind.situation"/>
          </FormItem>
          <FormItem label="求职方向及离职原因" class="ivu-form-item-required">
            <Input type="textarea" :rows="3" v-model="remind.cause"/>
          </FormItem>
          <FormItem label="薪资架构" class="ivu-form-item-required">
            <Input v-model="remind.salary"/>
          </FormItem>
        </div>
        <div v-if="remind.type == 3">
          <FormItem label="面试时间" class="ivu-form-item-required">
            <DatePicker type="datetime" placeholder="日期" v-model="remind.meetTime"></DatePicker>
          </FormItem>
          <FormItem label="面试地点" v-if="[2,3].indexOf(remind.type) > -1" class="ivu-form-item-required">
            <Input v-model="remind.meetAddress"/>
          </FormItem>
        </div>
        <!--<FormItem label="客户：" prop="customerId">-->
          <!--<Select placeholder="请选择客户" filterable clearable v-model="remind.customerId">-->
            <!--<Option v-for="(item, index) of customerList" :key="'customer' + index" :value="item.id">{{ item.name }}</Option>-->
          <!--</Select>-->
        <!--</FormItem>-->
        <FormItem label="人才状态：" prop="status">
          <Select v-model="remind.status">
            <Option v-for="(item, index) of talentStatus" :key="'status' + index" :value="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="下次跟踪类别">
          <Select v-model="remind.nextType">
            <Option :value="0">请选择</Option>
            <Option :value="1">电话</Option>
            <Option :value="2">顾问面试（内）</Option>
            <Option :value="3">顾问面试（外）</Option>
          </Select>
        </FormItem>
        <FormItem label="下次联系时间">
          <DatePicker type="datetime" placeholder="日期" v-model="remind.nextRemindTime"></DatePicker>
        </FormItem>
        <!--<FormItem label="提醒对象">-->
          <!--<Select v-model="remind.adviserId" placeholder="请选择">-->
            <!--<Option v-for="(user, index) of teamUserList" :value="user.id" :key="'user'+index">{{user.name}}</Option>-->
          <!--</Select>-->
        <!--</FormItem>-->
      </Form>
    </ModalUtil>
    <!--  推荐到项目  -->
    <ModalUtil ref="project" title="推荐项目" @reset="resetProjectTalent" @on-ok="addProjectTalent" :loading="show">
      <Form ref="projectTalent" :model="projectTalent" :rules="projectTalentRule" :label-width="100">
        <FormItem label="人才：">
          {{ talentName }}
        </FormItem>
        <FormItem label="推荐项目：" prop="projectId">
          <Select v-model="projectTalent.projectId" placeholder="请选择项目" clearable>
            <Option :disabled="talentProjects.indexOf(item.id) > -1" v-for="(item, index) of projects" :value="item.id" :key="'project' + index">
              {{ item.name }}{{`（${item.customerName}）`}}
              <span v-show="talentProjects.indexOf(item.id) > -1">{{`（已处于该项目进展中）`}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="推荐理由：" prop="remark">
          <Input placeholder="推荐理由" type="textarea" v-model="projectTalent.remark" :rows="3"/>
        </FormItem>
      </Form>
    </ModalUtil>
  </Card>
</template>

<script>
  import { talentStatus } from "../../../libs/constant";
  import { getUserId, getStatusRender, toggleShow, getDateTime, getRenderList, getUserInfoByKey, globalSearch } from "../../../libs/tools";
  import { talentPendingList } from "../../../api/count";
  import { getListByTableName } from "../../../api/common";
  import { addRemind, finishRemind } from "../../../api/talent";
  import { openByUserId, addProjectTalent } from "../../../api/project";

  export default {
    name: "TalentPending",
    data() {
      return {
        show: false,
        talentStatus: talentStatus,
        searchData: {
          userId: getUserId(),
          roleId: null,
          type: null
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            title: '人才名称',
            key: 'talentName',
            align: 'center',
            render: (h, params) => {
              return h('div', {
                class: {
                  talent: !!params.row.followUserId
                }
              }, [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small'
                  },
                  domProps: {
                    title: params.row.name
                  },
                  class: {
                    'cl-primary': true,
                  },
                  on: {
                    click: () => {
                      this.$router.push({ path: '/talent/talent-detail', query: {id: params.row.talentId}});
                    }
                  }
                }, params.row.name)
              ]);
            }
          },
          {
            title: '状态',
            align: 'center',
            render: (h, params) => {
              return getStatusRender(h, params.row.talentStatus);
            }
          },
          // {
          //   title: '本次跟踪状态',
          //   align: 'center',
          //   render: (h, params) => {
          //     return getStatusRender(h, params.row.status);
          //   }
          // },
          {
            title: '时间',
            align: 'center',
            render: (h, params) => {
              return h('span', getDateTime(params.row.createTime));
            }
          },
          // {
          //   title: '跟踪类型',
          //   align: 'center',
          //   render: (h, params) => {
          //     const v = params.row.type;
          //     return h('span', v == 1 ? '电话沟通' : v == 2 ? '顾问面试内' : '顾问面试外');
          //   }
          // },
          // {
          //   title: '跟踪内容',
          //   align: 'center',
          //   render: (h, params) => {
          //     let arr = [];
          //     switch (params.row.type) {
          //       case 1:
          //         arr = [`跟踪记录：${params.row.remark}`];
          //         break;
          //       case 2:
          //         arr = [`人才基本情况：${params.row.situation}`, `离职原因：${params.row.cause}`, `薪资架构：${params.row.salary}`];
          //         break;
          //       case 3:
          //         arr = [`面试时间：${getDateTime(params.row.meetTime)}`, `面试地点：${params.row.meetAddress}`, `人才基本情况：${params.row.situation}`, `离职原因：${params.row.cause}`, `薪资架构：${params.row.salary}`];
          //         break;
          //     }
          //     return getRenderList(h, JSON.stringify(arr));
          //   }
          // },
          // {
          //   title: '进展中项目数',
          //   align: 'center',
          //   key: 'projectCount'
          // },
          {
            title: '顾问',
            align: 'center',
            key: 'createUser'
          },
          {
            title: '操作',
            align: 'center',
            width: 150,
            render: (h, params) => {
              const followUserId = params.row.followUserId;
              return h('div', [
                h('Button', {
                  class: {
                    'mr-5': true
                  },
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: followUserId && followUserId != this.searchData.userId || !!params.row.progress
                  },
                  on: {
                    click: () => {
                      this.talentType = !!params.row.followUserId;
                      this.showRemindModal(params.row.talentId, params.row.id);
                    }
                  }
                }, '常规跟踪'),
                h('Button',{
                  props: {
                    size: 'small',
                    disabled: followUserId && followUserId != this.searchData.userId || !!params.row.offerCount
                  },
                  class: {
                    'ml-5': true
                  },
                  on: {
                    click: () => {
                      this.projectTalentIndex = params.row._index;
                      this.talentProjects = params.row.projects || [];
                      this.projectTalent.talentId = params.row.talentId;
                      this.talentName = params.row.name;
                      toggleShow(this, 'project');
                    }
                  }
                }, '推荐')
                // h('Button', {
                //   props: {
                //     type: 'warning',
                //     size: 'small'
                //   },
                //   on: {
                //     click: () => {
                //       this.finishId = params.row.id;
                //       this.finishRemind(2);
                //     }
                //   }
                // }, '结束跟进')
              ]);
            }
          }
        ],
        teamUserList: [],
        remind: { // 添加提醒条件
          type: null, // 本次跟踪类别
          status: null, // 人才状态
          remark: '', // 跟踪记录
          nextType: null, // 下次跟踪类别
          nextRemindTime: null, // 下次沟通时间
          situation: '', // 候选人基本情况
          cause: '', // 不离职原因
          salary: '', // 薪资架构
          meetTime: null, // 面试时间
          meetAddress: null, // 面试地点
          talentId: null,
          followRemindId: null,
          customerId: null
        },
        remindRule: {
          type: [
            { required: true, type: 'number', message: '请选择类型', trigger: 'change' }
          ],
          status: [
            { required: true, type: 'number', message: '请选择状态', trigger: 'change' }
          ],
          // customerId: [
          //   { required: true, type: 'number', message: '请选择客户', trigger: 'change' }
          // ],
        },
        finishId: null, // 结束跟进id
        customerList: [],
        talentType: null,
        // 推荐
        projectTalent: {
          createUserId: getUserId(),
          talentId: null,
          projectId: null,
          status: 0,
          type: 1,
          remark: null,
          roleId: getUserInfoByKey('roleId'),
        },
        projectTalentRule: {
          projectId: [
            { required: true, type: 'number', message: '请选择项目', trigger: 'change' }
          ],
          remark: [
            { required: true, type: 'string', message: '请填写推荐理由', trigger: 'blur' }
          ],
        },
        projectTalentIndex: null,
        projects: [], // 所有对当前用户开放的项目
        talentProjects: [], // 当前人才已关联的项目
        talentName: null,
      }
    },
    methods: {
      search() {
        globalSearch(this);
      },
      resetProjectTalent() {
        this.projectTalent = {
          createUserId: getUserId(),
          talentId: null,
          projectId: null,
          status: 0,
          type: 1,
          remark: null,
          roleId: getUserInfoByKey('roleId'),
        };
        this.$refs['projectTalent'].resetFields();
      },
      resetRemind() {
        this.remind = {
          type: null, // 本次跟踪类别
          status: null, // 人才状态
          remark: '', // 跟踪记录
          nextType: null, // 下次跟踪类别
          nextRemindTime: null, // 下次沟通时间
          situation: '', // 候选人基本情况
          cause: '', // 不离职原因
          salary: '', // 薪资架构
          meetTime: null, // 面试时间
          meetAddress: null, // 面试地点
          talentId: null,
          adviserId: null,
          followRemindId: null,
          customerId: null
        };
      },
      addProjectTalent() {
        this.$refs['projectTalent'].validate(valid => {
          if (valid) {
            this.show = true;
            this.projectTalent.createUserId = getUserId();
            addProjectTalent(this.projectTalent).then(data => {
              const obj = this.$refs['manager'].list[this.projectTalentIndex];
              obj.progress = (obj.progress || 0) + 1;
              obj.projects.push(this.projectTalent.projectId);
              this.show = false;
              toggleShow(this, 'project', false);
            }).catch(data => {this.show = false});
          }
        })
      },
      toggleShow(key, flag) {
        toggleShow(this, key, flag);
      },
      finishRemind(flag) {
        this.$Modal.confirm({
          title: '结束跟进确认',
          content: '您确认要结束跟进选择的跟踪记录吗?',
          onOk: () => {
            this.$refs['manager'].emitManagerHandler('finish', {
              params: flag == 1 ? null : [this.finishId],
              isBatch: flag == 1
            })
          }
        })
      },
      showRemindModal(talentId, id) {
        this.remind.talentId = talentId;
        this.remind.followRemindId = id;
        this.toggleShow('remind');
      },
      addRemind() {
        this.$refs['addRemind'].validate(valid => {
          if (valid) {
            const talentType = this.talentType;
            const params = this.remind;
            if (params.type == 1 && !params.remark) {
              this.$Message.warning('电话面试需要填写沟通记录');
              return false;
            }
            if (params.type == 2 && (!params.salary || !params.situation || !params.cause)) {
              this.$Message.warning('室内面试需要填写候选人基本情况、不离职原因和薪资架构');
              return false;
            }
            if (params.type == 3 && (!params.meetTime || !params.meetAddress || !params.salary || !params.situation || !params.cause)) {
              this.$Message.warning('室外面试需要填写面试时间、地点、基本情况、离职原因和薪资架构');
              return false;
            }
            if ((params.nextRemindTime || params.nextType) && (!params.nextRemindTime || !params.nextType)) {
              this.$Message.warning('设置下次跟踪，类别和时间需填写完整');
              return false;
            }
            if (talentType && (!params.nextType || !params.nextRemindTime)) {
              this.$Message.warning('专属人才必须选择下次跟踪类别和时间');
              return false;
            }
            params.createUserId = this.searchData.userId;
            this.$refs['manager'].emitManagerHandler('addRemind', {
              params
            });
          }
        })
      },
      successHandler() {
        this.show = false;
        toggleShow(this, 'remind', false);
      },
      errorHandler() {
        this.show = false;
      }
    },
    provide() {
      return {
        handlers: {
          search: talentPendingList,
          finish: finishRemind,
          addRemind: addRemind
        }
      }
    },
    created() {
      const {type, team} = this.$route.query;
      if (!!type) {
        this.searchData.type = Number(type);
      }
      if (team) {
        this.searchData.roleId = getUserInfoByKey('roleId');
      }
      getListByTableName({ type: 1 }).then(data => {
        this.customerList = data || [];
      }).catch(data => {});
      openByUserId({ userId: getUserId(), roleId: getUserInfoByKey('roleId') }).then(data => {
        this.projects = data || [];
      }).catch(data => {});
    },
  }
</script>

<style scoped>

</style>
