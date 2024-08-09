import APP from '#services/APP'
import router from '#services/router'
import StaticDB from '#services/StaticDB'
import i18n from '#services/i18n'

const Route = router.Route
const routes = {}

export default routes

router.exit = function() {
  const url = new URL(window.location)
  // const pathnameElements = url.pathname.split('frontboard')
  // const pathname = pathnameElements[0]
  // url.pathname = pathname
  url.searchParams.delete('frontboard')
  window.history.pushState({}, '', url)
}

router.onChange = function(path, prevPath) {
  const url = new URL(window.location)
  // const pathnameElements = url.pathname.split('frontboard')
  // const pathname = pathnameElements[0]
  // url.pathname = [pathname, 'frontboard', path].pathJoin(9)
  url.searchParams.set('frontboard', path)
  window.history.pushState({ prevPath }, '', url)
}

router.onPopstate = function(event) {
  // const route = event.state
  const url = new URL(window.location)
  // const pathnameElements = url.pathname.split('frontboard')
  // const pathname = pathnameElements[0]
  // const frontboardPath = pathnameElements[1]
  const path = url.searchParams.get('frontboard')
  if (path) {
    router.to(path)
  }
}

window.addEventListener('popstate', router.onPopstate)

router.initialize = function() {
  routes.docs = APP.docsContext ? getContextRoutes(APP.docsContext[0], APP.docsContext[1]) : false

  routes.api = Object.values(APP.Entity.models).filter(Class => Class.config.freeze).map(Class => {
    return [
      new Route('data/API/' + Class.name.toKebabCase(), {
        label: i18n(`Entity.${Class.name}`, 2, Class.plural.toSpaces()).capitalize(),
        dataset: Class
      }),
      new Route('data/API/' + Class.name.toKebabCase() + '/:id', {
        label: i18n(`Entity.${Class.name}`, 1, Class.name.toSpaces()).capitalize(),
        dataset: Class
      }),
      new Route('data/API/' + Class.name.toKebabCase() + '/:id/:view', {
        label: i18n(`Entity.${Class.name}`, 1, Class.name.toSpaces()).capitalize(),
        dataset: Class
      })
    ]
  })

  routes.entity = Object.values(StaticDB.entity.$datasets).toSorted(dataset => dataset.hidden ? 1 : -1).map(dataset => {
    return [
      new Route('data/entity/' + dataset.name.toKebabCase(), {
        label: i18n(`Entity.${dataset.Class.name}`, 2, dataset.Class.plural.toSpaces()).capitalize(),
        dataset
      }),
      new Route('data/entity/' + dataset.name.toKebabCase() + '/:id', {
        label: i18n(`Entity.${dataset.Class.name}`, 1, dataset.Class.name.toSpaces()).capitalize(),
        dataset
      }),
      new Route('data/entity/' + dataset.name.toKebabCase() + '/:id/:view', {
        label: i18n(`Entity.${dataset.Class.name}`, 1, dataset.Class.name.toSpaces()).capitalize(),
        dataset
      })
    ]
  })

  routes.palette = Object.values(StaticDB.palette.$datasets).toSorted(dataset => dataset.hidden ? 1 : -1).map(dataset => {
    return [
      new Route('data/palette/' + dataset.name.toKebabCase(), {
        label: i18n(`Entity.${dataset.Class.name}`, 2, dataset.Class.plural.toSpaces()).capitalize(),
        dataset
      }),
      new Route('data/palette/' + dataset.name.toKebabCase() + '/:id', {
        label: i18n(`Entity.${dataset.Class.name}`, 1, dataset.Class.name.toSpaces()).capitalize(),
        dataset
      }),
      new Route('data/palette/' + dataset.name.toKebabCase() + '/:id/:view', {
        label: i18n(`Entity.${dataset.Class.name}`, 1, dataset.Class.name.toSpaces()).capitalize(),
        dataset
      })
    ]
  })

  routes.translations = [
    new Route('data/translations', {
      single: true,
      label: i18n('Entity.Translation', 2, 'Translations').capitalize(),
      dataset: StaticDB.$databases.translations.$dataset
    }),
    new Route('data/translations/:id', {
      label: i18n('Entity.Translation', 1, 'Translation').capitalize(),
      dataset: StaticDB.$databases.translations.$dataset
    }),
    new Route('data/translations/:id/:view', {
      label: i18n('Entity.Translation', 1, 'Translation').capitalize(),
      dataset: StaticDB.$databases.translations.$dataset
    })
  ]

  routes.main = [
    new Route('data', {
      label: 'Appflow',
      component: 'Appflow'
    }),
    new Route('docs', {
      component: 'FileLoader'
    }),
    new Route('.whiteboard.md', {
      label: 'Whiteboard',
      component: 'FileLoader'
    })
  ]

  router.onPopstate()
}

function getContextRoutes (base, context) {
  return context.keys().map(contextPath => {
    const path = [base, contextPath].pathJoin()
    return new Route(path, {
      import: async () => {
        const module = await context(contextPath)
        return typeof module === 'string' ? module : module.default
      }
    })
  })
}

// const componentsRoutes = getContextRoutes('src/components', require.context('@/src/components?raw', { recursive: true, regExp: /\.vue$/, mode: 'lazy' }), ComponentViewer)
// const snapshotsRoutes = getContextRoutes('tests', require.context('@/tests', true, /\.snap$/, 'lazy'), FileLoader)

/*
{
  text: 'Examples',
  options: [
    {
      text: 'HomeStock',
      options: Object.values(StaticDB.databases.homeStock.all).toSorted(dataset => dataset.hidden ? 1 : -1)
    },
    ...Object.values(StaticDB.databases.examples.all).toSorted(dataset => dataset.hidden ? 1 : -1),
    ...Object.values(APP.models).filter(Class => Class.sqlite).map(Class => ({ Class, SQLite: true, id: Class.name, text: Class.name }))
  ]
},
*/
/*
return Object.values(StaticDB.databases).map(database => ({
  text: database.path, // review, grouped uses default 'text' accesor, multilevel uses 'name'. And bad current selection on load
  options: Object.values(database.all).toSorted(dataset => dataset.hidden ? 1 : -1)
}))
*/
