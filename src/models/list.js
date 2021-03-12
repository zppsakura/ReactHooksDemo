import { getLists, listDelete, listAdd, listEdit } from '../services/List';
import { Message } from 'antd';
import { history } from 'umi';

export default {
  namespace: 'list',
  state: {
      todoLists: []
  },
  reducers: {
    overrideStateProps(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    // 更新某个对象状态的属性
    updateStateProps(state, { payload }) {
      const { name, value } = payload;
      return {
        ...state,
        ...{ [name]: { ...state[name], ...value } },
      };
    },
  },
  effects: {
    *getLists(_, { call, put }) {
      const user = sessionStorage.getItem('token');
      if (user) {
        const response = yield call(getLists);
        switch(response.code) {
            case 0:
                yield put({
                    type: 'overrideStateProps',
                    payload: {
                        todoLists: response.data,
                    },
                });
                return response.data;
            default:
                Message.error('列表获取失败');
                break;
        }  
      } else {
        Message.error('您还未登录，请先登录！');
        history.push('/login');
      }
    },
    *listAdd({ payload }, { call, put }) {
        console.log('payload', payload);
        const response = yield call(listAdd, payload);
        if (response.code === 0) {
            Message.success(response.msg);
            yield put({
                type: 'getLists',
            });
            return;
        }
        Message.error(response.msg);
    },
    *listEdit({ payload }, { call, put }) {
        if (!payload.title) {
            Message.error('输入框不得为空！');
        } else {
            const response = yield call(listEdit, payload);
            if (response.code === 0) {
                Message.success(response.msg);
                yield put({
                    type: 'getLists',
                });
                return;
            }
            Message.success(response.msg);
        }
        
    },
    *delete({ payload }, { call, put }) {
        const response = yield call(listDelete, payload);
        if (response.code === 0) {
            Message.success(response.msg);
            yield put({
                type: 'getLists',
            });
            return;
        }
        Message.error('删除失败！');
    }
  },
};
