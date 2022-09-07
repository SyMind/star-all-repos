import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const html = fs.readFileSync(path.resolve(__dirname, '../website/index.html'), 'utf-8')

const url = `https://github.com/${process.env.REPO_OWNER}/star-all-repos/issues/new?assignees=&labels=&template=star.md&title=`
const result = html.replace('GITHUB_NEW_ISSUE_PAGE', JSON.stringify(url))

const dir = path.resolve(__dirname, '../output')
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
}

fs.writeFileSync(path.join(dir, 'index.html'), result, 'utf-8')
