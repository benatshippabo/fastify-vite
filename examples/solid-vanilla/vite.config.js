import { resolve, dirname } from 'path'
import viteSolid from 'vite-plugin-solid'
import viteFastify from 'fastify-vite/plugin'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  viteSolid({ ssr: true }),
  viteFastify(),
]

export default {
  root,
  plugins
}
