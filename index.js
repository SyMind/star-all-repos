import fetch from 'node-fetch'
import { Octokit } from 'octokit'

// https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'post',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        client_id: 'e9547e631cc7b7bb1d6f',
        client_secret: process.env.CLIENT_SECRET,
        code: process.env.AUTH_CODE
    })
})
const {access_token} = await response.json()

const octokit = new Octokit({
    auth: access_token
})

console.log('Repository owner: ', process.env.REPO_OWNER)

const repos = await octokit.request('GET /users/{username}/repos', {
    username: process.env.REPO_OWNER,
    per_page: 100
})

if (repos.status !== 200) {
    process.exit(-1)
}

for (const repo of repos.data) {
    octokit.request('PUT /user/starred/{owner}/{repo}', {
        owner: repo.owner.login,
        repo: repo.name
    }).then(() => {
        console.log('⭐️ ' + repo.name)
    })
}
