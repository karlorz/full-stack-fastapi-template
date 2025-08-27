# Development - Tilt (Work in Progress)

New cool development setup that allows you to develop directly in local Kubernetes cluster!

## Features

- Live-reload: files get automatically synchronized into the container, auto-reload is then done by `fastapi --reload` and `npm run dev`.
- Auto-rebuild: Full container rebuild automatically triggered on pyproject.toml/package.json file changes.
- HTTPS!
- Bugs: Included free of charge.
- Adminer: Automatically deployed at <https://adminer.localfastapicloud.space/>.
- Resource optimization: You can use Tilt UI buttons to disable services that will get undeployed (e.g. disable frontend service when developing locally with npm for faster hot-reload).

Tilt should also rebuild any services on the yaml changes, so if you tweak ENV variables, it should be automatically applied (keep watching Tilt logs).

## Installation

### MacOS arm64 (M series)

1. Install Docker for Mac: <https://docs.docker.com/desktop/setup/install/mac-install/>.
2. Install tooling: `brew install helm k3d tilt k9s`  # k9s is optional, but highly recommended for working with k8s.

### MacOS x86_64

(untested, but should be same as ARM version)

### Linux x86_64

1. Install Docker for Linux: <https://docs.docker.com/desktop/setup/install/linux/>.
2. Setup Docker as a non-root user: <https://docs.docker.com/engine/install/linux-postinstall/>
3. Install kubectl: <https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/>
4. Install k3d: <https://k3d.io/stable/#installation>
5. Install Helm: <https://helm.sh/docs/intro/install/#from-script>
6. Install Tilt:

   ```sh
   curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
   ```

### Linux arm64

(untested, TBD)

### Windows x86_64

(untested, TBD)

### Windows arm64

(untested, TBD)

After installing the tools, you can verify the Tilt version by running:

```sh
tilt version
```

## Usage

```sh
# create k8s cluster
scripts/setup-k3d.sh

# start tilt (this will do all the heavy lifting)
tilt up

# open http://localhost:10350 for tilt UI

# (optionally) use k8s TUI to see what's happening in k8s cluster
k9s

# once everything loads/deploys (automatically, see tilt logs), you just go to https://dashboard.localfastapicloud.com/ and/or https://api.localfastapicloud.com/docs
open https://dashboard.localfastapicloud.com/

# stop developing by ctrl+c (stop running tilt process) and deleting the k8s cluster
k3d cluster delete knative
```

Login credentials:

- E-mail: `(yourname)@fastapilabs.com` or `martin@fastapilabs.com`
- Password: `secretsecret`  (same for all seeded test accounts)

## Troubleshooting

### helm repo error

If you get helm repo error like this:

```sh
Error: no cached repo found. (try 'helm repo update'): open /Users/user/Library/Caches/helm/repository/localstack-repo-index.yaml: no such file or directory
```

That means you need to remove helm repos:

1. List helm repos: `helm repo list`.
2. Remove them `helm repo remove localstack-repo` (or name of the affected repo that you see in the log).
3. Retry the affected service in Tilt UI.

Tilt installs helm charts directly without caching helm repos locally by using `--repo <repourl>`, so these repos don't have to be added there.

### Any other issue

1. Check Tilt logs to see what service failed and why.
2. Retry failed services (mostly should work).
3. Try starting again with clean setup: `k3d cluster delete knative` and then start again (check Usage).

If it's still broken:

1. Keep Tilt running and in separate terminal run `tilt snapshot create > snapshot.json`.
2. Send `snapshot.json` file to Martin on Slack.
3. You can view the snapshot by running `tilt snapshot view snapshot.json`.

Tilt snapshots save all logs and services status, so I will see exactly what you see in Tilt UI!
