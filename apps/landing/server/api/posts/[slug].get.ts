// server/api/posts/[slug].get.ts
import fs from "fs/promises";
import path from "path";
import grayMatter from "gray-matter";
import { marked } from "marked";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const filePath = path.join(process.cwd(), "content/blog", `${slug}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data, content } = grayMatter(fileContent);

    const bodyHtml = await marked.parse(content);

    return {
      ...data,
      bodyHtml,
    };
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Post Not Found",
    });
  }
});
