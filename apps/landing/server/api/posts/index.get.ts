// server/api/posts/index.get.ts
import fs from 'fs/promises'
import path from 'path'
import grayMatter from 'gray-matter'

export default defineEventHandler(async () => {
  const postsDir = path.join(process.cwd(), 'content/blog')
  const filenames = await fs.readdir(postsDir)

  const posts = await Promise.all(
    filenames
      .filter(filename => filename.endsWith('.md'))
      .map(async filename => {
        const filePath = path.join(postsDir, filename)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const { data } = grayMatter(fileContent)
        return {
          slug: filename.replace(/\.md$/, ''),
          ...data
        }
      })
  )

  // Sort posts by date, newest first
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return posts
})