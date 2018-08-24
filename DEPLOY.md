# DEPLOY

## Deploy with Docker

Our backend project is containerized and delivered via Docker. Thus lead it to a standard way of elastic distribution and expansion.

1. Follow the instructions to [install docker](https://docs.docker.com/install/) and [install docker-compose](https://docs.docker.com/compose/install/).

2. Login to private Docker Registry:
```bash
$ docker login --username=idvxlab registry.cn-hangzhou.aliyuncs.com
```

3. Build from source locally and push the app container to remote
```bash
$ docker build -t registry.cn-hangzhou.aliyuncs.com/smartvis/smartvis-backend:alpine .
$ docker push registry.cn-hangzhou.aliyuncs.com/smartvis/smartvis-backend:alpine
# Or do it better with docker-compose
$ docker-compose build
$ docker-compose push
```
Note that a CI/CD platform with git hooks would help with this automation.

4. Connect to the production environment via SSH ([Setup](https://confluence.atlassian.com/bitbucket/set-up-ssh-for-git-728138079.html))
```bash
# Only do it at the first time
# This would copy your public ssh keys to ~/.ssh/authorized_keys to allow SSH tunnelling without password configuration
$ ssh-copy-id smartvis@47.96.122.250

$ smartvis@47.96.122.250's password: (*******)
$ ssh smartvis@47.96.122.250
# Attach the tmux session only if you are familiar with it
$ tmux a
$ mkdir -p ~/smartvis/smartvis-backend
```

5. Copy the configs to remote
```bash
$ scp <the-project-/nginx-/config-docker-compose> smartvis@47.96.122.250:~/smartvis/smartvis-backend
```

6. Set up the services from the production environment
```bash
$ cd ~/smartvis/smartvis-backend
$ docker-compose pull && sudo docker-compose up -d
# Inspect container
## List running containers
$ docker ps
## Tail -f logs
$ docker-compose logs -f
## Enter container as root user
$ docker exec -i -t -u 0 <your-container-name> sh
```
