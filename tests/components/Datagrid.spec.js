import APP from '#services/APP'
import Datagrid from '#components/Datagrid'
import { mount } from '@vue/test-utils'

describe('Datagrid.vue', () => {
  const wrapper = mount(Datagrid, {
    propsData: {
      records: [
        {id: '1', name: 'name', data: 10, value: true},
        {id: '2', name: 'name', data: 10, value: true},
        {id: '3', name: 'name', data: 10, value: true},
        {id: '4', name: 'name', data: 10, value: true},
        {id: '5', name: 'name', data: 10, value: true},
        {id: '6', name: 'name', data: 10, value: true},
        {id: '7', name: 'name', data: 10, value: true},
        {id: '8', name: 'name', data: 10, value: true},
        {id: '9', name: 'name', data: 10, value: true},
        {id: '10', name: 'name', data: 10, value: true},
        {id: '11', name: 'name', data: 10, value: true},
        {id: '12', name: 'name', data: 10, value: true},
        {id: '13', name: 'name', data: 10, value: true},
        {id: '14', name: 'name', data: 10, value: true},
        {id: '15', name: 'name', data: 10, value: true},
        {id: '16', name: 'name', data: 10, value: true},
        {id: '17', name: 'name', data: 10, value: true},
        {id: '18', name: 'name end', data: 10, value: true}
      ],
      cols: [
        {key: 'id', size: 50, sticky: 'left', label: 'Id'},
        {key: 'name', size: 200, sticky: false, label: 'Name'},
        {key: 'data', size: 200, sticky: false, label: 'Data'},
        {key: 'value', size: 90, sticky: 'right', label: 'Value'}
      ]
    }
  })
  beforeAll(async () => {
    await wrapper.vm.$nextTick()
  })
  it('have correct setup', async () => {
    // expect(wrapper.vm.prop).toBe(true)
  })
  it('initial state', async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
  it('change', async () => {
    wrapper.vm.cols.pop()
    await wrapper.vm.$nextTick()
    expect(wrapper.element).toMatchSnapshot()
  })
})
