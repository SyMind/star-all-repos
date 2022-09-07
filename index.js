import { Octokit } from 'octokit'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

const repos = await octokit.request('GET /users/{username}/repos', {
    username: 'SyMind'
})

if (repos.status !== 200) {
    process.exit(-1)
}

const repo = repos.data[0]

octokit.request('PUT /user/starred/{owner}/{repo}', {
    owner: repo.owner.login,
    repo: repo.name
}).then(() => {
    console.log('⭐️ ' + repo.name)
})
