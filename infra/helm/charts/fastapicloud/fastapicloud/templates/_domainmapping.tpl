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
{{- $app = set $app "name" $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
{{- $appCtx = set $appCtx "App" $app }}
apiVersion: serving.knative.dev/v1beta1
kind: DomainMapping
metadata:
  name: {{ $app.domainmapping.hostname }}
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
    name: {{ include "fastapicloud.fullname" $appCtx }}
    namespace: {{ default $appCtx.Release.Namespace $app.namespace }}
{{- end }}
