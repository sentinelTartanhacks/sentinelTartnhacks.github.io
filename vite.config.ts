import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getBasePath() {
  const repository = process.env.GITHUB_REPOSITORY

  // Local builds and environments without GitHub metadata should use root.
  if (!repository) {
    return '/'
  }

  const [, repoName = ''] = repository.split('/')

  // User/org Pages repos are served at root: <account>.github.io
  if (repoName.endsWith('.github.io')) {
    return '/'
  }

  // Project Pages repos are served from /<repo-name>/
  return `/${repoName}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
})
