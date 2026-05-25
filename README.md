# mirava-mirrors-sync
A script that syncs `https://miravaorg.ir/mirror.json` to mirava's uptime-kuma

## How to use
0. install [Bun](https://bun.com)
1. Install deps with `npm i`
2. Configure Env variables
3. Run it `bun .`
4. Manually configure the status page (Slug: default, add all mirrors, set mirava logo...)

## TODO
- Make status page automated
- Don't delete things that haven't changed
- Overall code cleanup