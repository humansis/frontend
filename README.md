[![version](https://img.shields.io/badge/dynamic/json?color=blue&label=version&query=%24%5B0%5D.name&url=https%3A%2F%2Fgitlab-public.quanti.cz%2Fapi%2Fv4%2Fprojects%2F17%2Frepository%2Ftags)](https://gitlab-public.quanti.cz/humansis/web-platform/frontend-new/)

# Humansis FE

Vue JS Frontend application for Humansis project

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Known issues
- md4 algorithm is not available anymore in NodeJS 17+ (because of lib SSL 3). In vue config is silently replaced md4 by md5 algorithm to solve the problem with 
