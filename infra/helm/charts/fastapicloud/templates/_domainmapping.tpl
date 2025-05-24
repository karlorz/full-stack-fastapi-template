{{/*
Generate a DomainMapping resource.

Expects a list with:
- key of the application (example: "api")
- context (example: .)
*/}}
{{- define "fastapicloud.resource.domainmapping" -}}
{{- $key := index . 0 }}
{{- $ctx := index . 1 }}
{{- $app := index $ctx.Values $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
apiVersion: serving.knative.dev/v1beta1
kind: DomainMapping
metadata:
  name: {{ $app.name }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
  {{- with $app.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  ref:
    apiVersion: serving.knative.dev/v1
    kind: Service
    name: {{ printf "%s-%s" (include "fastapicloud.fullname" $appCtx) $key }}
    namespace: {{ default $ctx.Release.Namespace $app.namespace }}
{{- end }}
