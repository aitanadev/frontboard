import Entity from '#services/Entity'

class Route {
  #path
  #parent
  #params
  #pathParamsKeys = []
  #pathParams = {}
  #regex
  #match
  #routes = []

  constructor(path, params = {}, parent) {
    const routeExist = router.indexes.get(path)
    if (routeExist) {
      Object.assign(routeExist.params, params)
      return routeExist
    }

    this.#path = path
    this.#params = params

    if (parent) {
      this.#parent = parent
    }

    if (path) {
      const pathElements = path.split('/')
      let cursor = router.root
      pathElements.forEach((pathElement, index) => {
        if (index + 1 === pathElements.length) {
          this.#parent = cursor
          router.indexes.set(path, this)
          cursor.addRoute(this)
        } else {
          const routePath = pathElements.slice(0, index + 1).join('/')
          const routeExist = router.indexes.get(routePath)
          const route = routeExist || new Route(routePath, {}, cursor)
          if (!cursor.routes.includes(route)) cursor.addRoute(routeExist)
          cursor = route
        }
      })

      this.#regex = new RegExp('^' + path.replace(/\/:[^/]*/gi, paramName => {
        this.#pathParamsKeys.push(paramName.replace(/^\/:/, ''))
        return '/([^/]*)'
      }) + '$')
    }
  }

  get path() {
    return this.#path
  }

  get parent() {
    return this.#parent
  }

  get params() {
    return this.#params
  }

  get pathParams() {
    return this.#pathParams
  }

  get regex() {
    return this.#regex
  }

  get routes() {
    return this.#routes
  }

  get isRoot() {
    return !this.#parent
  }

  get fullName() {
    return this.#path.split('/').pop()
  }

  get name() {
    return this.fullName.split('.')[0]
  }

  get label() {
    return this.#params.label || this.name.toSpaces().capitalize()
  }

  get ext() {
    const dotSplit = this.fullName.split('.')
    return dotSplit.length > 1 ? dotSplit.pop() : false
  }

  get match() {
    return this.#match
  }

  get isActive() {
    const current = router.current
    if (current) {
      let cursor = current
      while (cursor) {
        if (cursor === this) return true
        cursor = cursor.parent
      }
    }
  }

  addRoute(route) {
    this.#routes.push(route)
  }

  load(refresh) {
    router.to(this.path, refresh)
  }

  test(path) {
    this.#match = undefined
    const pathParams = this.#pathParams = {}
    const result = this.#regex.exec(path)
    if (result) {
      this.#pathParamsKeys.forEach((pathParamKey, index) => {
        const pathParamValue = result[index + 1]
        pathParams[pathParamKey] = pathParamValue
      })
      this.#match = path
      if (this.__ob__) this.__ob__.dep.notify()
      return pathParams
    }
  }
}

const router = {
  indexes: new Map(),
  current: undefined,
  Route,
  to(path, refresh) {
    /*
    if (Entity.isEntity(path)) {
      const entity = path
      path = entity.Class
    }
    */
    const exist = [...router.indexes.values()].find(route => route.test(path))
    if (exist) { // At some point nothing exist
      // console.log('router to: ', path, exist, refresh)
      const prevPath = router.current?.match || router.current?.path
      router.current = exist
      if (refresh && router.onChange) router.onChange(path, prevPath)
    } else {
      throw new Error('Path does not exist: ' + path)
    }
  }
}

router.root = new Route()
router.routes = router.root.routes

export default router
