{{/*
Generate a ClusterDomainClaim resource.

Expects a list with:
- key of the application (example: "api")
- context (example: .)
*/}}
{{- define "fastapicloud.resource.clusterdomainclaim" -}}
{{- $key := index . 0 }}
{{- $ctx := index . 1 }}
{{- $app := index $ctx.Values $key }}
{{- $app = set $app "name" $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
{{- $appCtx = set $appCtx "App" $app }}
apiVersion: networking.internal.knative.dev/v1alpha1
kind: ClusterDomainClaim
metadata:
  name: {{ $app.domainmapping.hostname }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
spec:
  namespace: {{ default $appCtx.Release.Namespace $app.namespace }}
{{- end }}
