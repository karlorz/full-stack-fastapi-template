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
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
apiVersion: networking.internal.knative.dev/v1alpha1
kind: ClusterDomainClaim
metadata:
  name: {{ $app.name }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
spec:
  namespace: {{ default $ctx.Release.Namespace $app.namespace }}
{{- end }}
