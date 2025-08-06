{{/*
Generate ClusterRoleBindings for all roles assigned to an app.

Expects a list with:
- app name (example: "api")
- context (example: .)
*/}}
{{- define "fastapicloud.resource.clusterrolebinding" -}}
{{- $key := index . 0 }}
{{- $ctx := index . 1 }}
{{- $app := index $ctx.Values $key }}
{{- $app = set $app "name" $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
{{- $appCtx = set $appCtx "App" $app }}
{{- range $role := (default $app.clusterRoles (list)) }}
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: {{ printf "%s-%s-binding" (include "fastapicloud.fullname" $appCtx) $role }}
subjects:
- kind: ServiceAccount
  name: {{ include "fastapicloud.serviceAccountName" $appCtx }}
  namespace: {{ default $appCtx.Release.Namespace $app.namespace }}
roleRef:
  kind: ClusterRole
  name: {{ $role }}
  apiGroup: rbac.authorization.k8s.io
---
{{- end }}
{{- end -}}
