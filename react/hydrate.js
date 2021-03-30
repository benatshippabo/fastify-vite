function hydrate(app = {}, dataKey = '$data', globalDataKey = '$global') {
  window.$dataPath = () => `/-/data${document.location.pathname}`
  setupServerAPI()
  // To be used maybe in creating a React.Context
  // return {
  //   $api: setupServerAPI(window),
  //   [globalDataKey]: window[globalDataSymbol],
  //   [dataKey]: window[dataSymbol],
  //   $dataPath: () => `/-/data${document.location.pathname}`
  // };
}

function setupServerAPI() {
  window.$api = new Proxy(window[Symbol.for('fastify-vite-api')], { get: getFetchWrapper });
}

module.exports = { hydrate, setupServerAPI }

function getFetchWrapper(methods, method) {
  if (method in methods) {
    if (Array.isArray(!methods[method]) && typeof methods[method] === 'object') {
      return new Proxy(methods[method], { get: getFetchWrapper })
    }
    const hasParams = methods[method][1].match(/\/:(\w+)/)
    if (hasParams) {
      return async (params, options = {}) => {
        options.method = methods[method][0]
        // eslint-disable-next-line no-undef
        const response = await fetch(applyParams(methods[method][1], params), options)
        const body = await response.text()
        return {
          body,
          json: tryJSONParse(body),
          status: response.status,
          headers: response.headers
        }
      }
    } else {
      return async (options = {}) => {
        options.method = methods[method][0]
        // eslint-disable-next-line no-undef
        const response = await fetch(methods[method][1], options)
        const body = await response.text()
        return {
          body,
          json: tryJSONParse(body),
          status: response.status,
          headers: response.headers
        }
      }
    }
  }
}

function applyParams(template, params) {
  try {
    return template.replace(/:(\w+)/g, (_, m) => {
      if (params[m]) {
        return params[m]
      } else {
        // eslint-disable-next-line no-throw-literal
        throw null
      }
    })
  } catch (err) {
    return null
  }
}

function tryJSONParse(str) {
  try {
    return JSON.parse(str)
  } catch (_) {
    return undefined
  }
}
