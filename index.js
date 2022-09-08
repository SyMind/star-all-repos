import fetch from 'node-fetch'
import { Octokit } from 'octokit'

function getCustomUserName() {
    const result = /username=([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})/.exec(process.env.ISSUE_BODY)
    if (!result) {
        return null
    }
    return result[1]
}

const customUserName = getCustomUserName()
const username = customUserName || process.env.REPO_OWNER

console.log('Target user name: ', username)

const ownerOctokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

const text = username === process.env.REPO_OWNER ? '感谢你来 Star 我的项目！❤️ ' : `感谢你使用该工具 ❤️，你将 Star ${username} 的全部项目！`

const comment = `<p align="center"><b>${text}</b></p>
<p align="center"> 
  <kbd>
    <img src="https://github.com/SyMind/star-all-repos/blob/main/images/ikun.gif?raw=true">
  </kbd>
</p>`

ownerOctokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: process.env.REPO_OWNER,
    repo: 'star-all-repos',
    issue_number: Number(process.env.ISSUE_NUMBER),
    body: comment
})

// https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'post',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: process.env.AUTH_CODE
    })
})
const {access_token} = await response.json()

const userOctokit = new Octokit({
    auth: access_token
})

const repos = await userOctokit.request('GET /users/{username}/repos', {
    username,
    per_page: 100
})

if (repos.status !== 200) {
    process.exit(-1)
}

for (const repo of repos.data) {
    userOctokit.request('PUT /user/starred/{owner}/{repo}', {
        owner: repo.owner.login,
        repo: repo.name
    }).then(() => {
        console.log('⭐️ ' + repo.name)
    })
}
