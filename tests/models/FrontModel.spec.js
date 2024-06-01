import Scheme, { SchemeTest } from '#services/Scheme'

class Relation extends Scheme {
  constructor(data){
    return super().mount(data)
  }

  #value
  #history = []

  get value(){
    return this.#value
  }

  set value(value){
    this.#history.push(value)
    this.#value = value
  }

  get touchs(){
    return this.#history.length
  }

  get history(){
    return this.#history
  }

  static { this.initialize() }

  static schema() {
    return {
      'value': {default: 0, constructor: true}
    }
  }
}

class Dummy extends Scheme {
  constructor(data){
    return super().mount(data)
  }

  #private = 'secret'
  #ons = []

  get computedProp(){
    return '_' + this.code
  }

  set computedProp(value){
    this.code = ':' + value
  }

  get computedReadonly(){
    return 'readOnly!'
  }

  get checksum() {
    return this.#ons.join()
  }

  setPrivate(param){
    this.#private = param
  }

  getPrivate(){
    return this.#private
  }

  static { this.initialize() }

  static listeners = {
    onSetPrivate(){
      this.#ons.push('onSetPrivate')
    },
    onGetPrivate(){
      this.#ons.push('onGetPrivate')
    },
    onComputedProp(){
      this.#ons.push('onComputedProp')
    },
    onName(){
      this.#ons.push('onName')
    },
    onCode(){
      this.#ons.push('onCode')
    }
  }

  static schema() {
    return {
      'name': {default: 'Name'},
      'code': {default: () => 12345},
      'relation': {class: Relation, default: () => new Relation('one')},
      'memorizer': {}
    }
  }
}

describe('SchemeTest', () => {
  describe('Launch internal tests', () => {
    it('All internal test ok', () => {
      expect(!!SchemeTest.test(false)).toBeTruthy()
    })
  })

  describe('On Class initialization', () => {
    describe('is initialized and setup all internals correctly', () => {
      it('Computed props are recognized', () => {
        const computed = [
          'computedProp',
          'computedReadonly',
          'checksum'
        ]
        expect(Object.keys(Dummy.computed)).toMatchObject(computed)
        expect(Dummy.computed.checksum.key).toBe('checksum')
      })
      it('Methods are recognized', () => {
        const methods = [
          'setPrivate',
          'getPrivate'
        ]
        expect(Dummy.methods).toMatchObject(methods)
      })
      it('Relationships are recognized', () => {
        const relationships = [
          'relation'
        ]
        expect(Object.keys(Dummy.relationships)).toMatchObject(relationships)
      })
    })
  })

  describe('On Class Relation with constructor prop in schema initialization', () => {
    describe('is initialized correctly', () => {
      const value = 'testRelation'
      const relation = new Relation(value)
      
      it('constructor prop are used', () => {
        expect(relation.value).toBe(value)
        expect(relation.history).toMatchObject([value])
        expect(relation.touchs).toBe(1)
      })
      xit('parse method runs correctly', () => {
        console.log('---->', relation.parse(), '<-----')
        expect(relation.parse()).toMatchObject({value, type: 'relation'})
      })
      it('update constructor prop', () => {
        const newValue = 'testRelation2'
        relation.value = newValue
        expect(relation.value).toBe(newValue)
      })
    })
  })
})
