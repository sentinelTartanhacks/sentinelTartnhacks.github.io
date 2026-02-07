import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getBasePath() {
  const repository = process.env.GITHUB_REPOSITORY

  // Local builds and environments without GitHub metadata should use root.
  if (!repository) {
    return '/'
  }

  const [owner = '', repoName = ''] = repository.split('/')
  const userSiteRepo = `${owner}.github.io`.toLowerCase()

  // User/org Pages repos are served at root only for exact <owner>.github.io.
  if (repoName.toLowerCase() === userSiteRepo) {
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
