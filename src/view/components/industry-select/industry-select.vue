<template>
  <div class="industry-select-wrap">
    <div class="industry-content" @click.self="showSelector">
      <div class="industry-tag" v-for="(item, index) in selectIndustry" :key="index">
        <span class="industry-text">
          {{ item }}
        </span>
        <Icon type="ios-close" @click.self="removeItem(index)"/>
      </div>
    </div>
    <div class="mask" v-show="isShowSelector" @click.self="hideSelector">
      <Card>
        <CheckboxGroup v-model="selectIndustry" style="height: 300px;margin-bottom: 20px;overflow: scroll;" @on-change="changeHandle">
          <div class="list" v-for="(industry, index) in industryList" :label="industry.name" :key="index">
            <span v-show="isShow[index].subList" @click="switchShowHandle(index)">
              <Icon v-show="!isShow[index].isShow" type="md-arrow-dropright"/>
              <Icon v-show="isShow[index].isShow" type="md-arrow-dropdown"/>
            </span>
            <Checkbox :label="industry.name">{{industry.name}}</Checkbox>
            <div class="sub-list" v-show="isShow[index].isShow">
              <Checkbox v-for="(subIndustry, index) in industry.industryList" :label="subIndustry.name" :key="index">{{ subIndustry.name }}</Checkbox>
            </div>
          </div>
        </CheckboxGroup>
        <Row>
          <Col><Button type="primary" @click="selectHandle">确定</Button></Col>
        </Row>
      </Card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'industry-select',
  props: {
    industryList: {
      type: Array,
      default: function () {
        return []
      }
    },
    model: {
      type: Array,
      default: function () {
        return []
      }
    },
  },
  data () {
    return {
      isShowSelector: false,
      selectIndustry: this.model
    }
  },
  computed: {
    isShow () {
      let data = {}
      let industryData = this.industryList
      for (let i = 0; i < industryData.length; i++) {
        let item = {}
        if (industryData[i].industryList) {
          item['subList'] = true
        } else {
          item['subList'] = false
        }
        item['isShow'] = false
        data[i] = item
      }
      return data
    }
  },
  methods: {
    showSelector () {
      this.isShowSelector = true
    },
    hideSelector () {
      this.isShowSelector = false
      this.$emit('input', this.selectIndustry)
      this.$emit('on-select', this.selectIndustry)
    },
    switchShowHandle (index) {
      this.$forceUpdate()
      this.$set(this.isShow[index], 'isShow', !this.isShow[index].isShow)
    },
    removeItem (index) {
      this.selectIndustry.splice(index, 1);
      this.$emit('input', this.selectIndustry)
      this.$emit('on-select', this.selectIndustry)
    },
    changeHandle (arr) {

    },
    selectHandle () {
      this.isShowSelector = false
      this.$emit('input', this.selectIndustry)
      this.$emit('on-select', this.selectIndustry)
    }
  },
  created () {},
  mounted () {
  },
  watch: {
    model(val) {
      this.selectIndustry = Array.isArray(val) ? val : [];
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../assets/css/_props";
.industry-select-wrap{
  width: @full;
  /*height: 32px;*/
  height: auto;
  .industry-content{
    display: block;
    box-sizing: content-box;
    min-height: 22px;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #dcdee2;
    .industry-tag{
      display: inline-block;
      padding: 0 8px;
      border: 1px solid #e8eaec;
      border-radius: 3px;
      margin: 0 4px 0 0;
      background: #f7f7f7;
      .ivu-icon{
        margin: 0 0 0 3px;
      }
    }
    .industry-text{
      background: #f7f7f7;
      color: #515a6e;
    }
  }
  .list{
    position: relative;
    padding-left: 20px;
    &>span{
      position: absolute;
      left: 0;
    }
    .sub-list{
      padding-left: 30px;
    }
  }
  .ivu-card{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
  }
  .mask{
    position: fixed;
    left: 0;
    top: 0;
    width: @full;
    height: @full;
    background: rgba(0,0,0,0.5);
    z-index: 900;
  }
}
</style>
